import pandas as pd
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline, CLIPProcessor, CLIPModel
import torch
import torch.nn as nn
import pytorch_lightning as pl
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import VotingClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
import nltk
import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import matplotlib.pyplot as plt
import seaborn as sns
import logging
from tqdm import tqdm
from textblob import TextBlob
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from collections import Counter
from sklearn.utils.class_weight import compute_class_weight
import gc
import gradio as gr
from PIL import Image
import cv2
import joblib

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Download required NLTK data with error handling
def download_nltk_data():
    try:
        logger.info("Downloading required NLTK data...")
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        nltk.download('averaged_perceptron_tagger', quiet=True)
        logger.info("NLTK data downloaded successfully")
    except Exception as e:
        logger.error(f"Error downloading NLTK data: {str(e)}")
        try:
            nltk.download('punkt_tab', quiet=True)
            logger.info("Successfully downloaded punkt_tab")
        except Exception as e2:
            logger.error(f"Failed to download punkt_tab: {str(e2)}")
            pass
        raise

# Download NLTK data
download_nltk_data()

# Load spaCy model
logger.info("Loading spaCy model...")
nlp = spacy.load('en_core_web_sm')

# Load the dataset
logger.info("Loading dataset...")
df = pd.read_csv('Reviews.csv')

# Initialize models
logger.info("Loading models...")
# RoBERTa for sentiment and emotion analysis
roberta_tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
roberta_model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
roberta_sentiment = pipeline("sentiment-analysis", model=roberta_model, tokenizer=roberta_tokenizer)

# Sentence transformer for embeddings
sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')

# Enhanced emotion keywords
EMOTION_KEYWORDS = {
    'joy': ['joy', 'happy', 'excited', 'proud', 'great', 'wonderful', 'amazing', 'delight', 'pleased', 'thrilled', 'ecstatic', 'elated'],
    'sadness': ['sad', 'unhappy', 'disappointed', 'grief', 'sorry', 'depressed', 'heartbroken', 'miserable', 'sorrow', 'unfortunate'],
    'fear': ['fear', 'scared', 'afraid', 'worried', 'anxious', 'terrified', 'nervous', 'apprehensive', 'dread', 'panic'],
    'anger': ['angry', 'mad', 'frustrated', 'annoyed', 'upset', 'irritated', 'furious', 'outraged', 'enraged', 'resentful'],
    'surprise': ['surprised', 'amazed', 'shocked', 'unexpected', 'astonished', 'astounded', 'stunned', 'startled'],
    'shame': ['ashamed', 'embarrassed', 'guilty', 'regret', 'humiliated', 'mortified', 'disgraced', 'remorseful'],
    'envy': ['envious', 'jealous', 'covet', 'resentful', 'bitter', 'green-eyed'],
    'pride': ['proud', 'accomplished', 'achieved', 'successful', 'triumphant', 'confident'],
    'frustration': ['frustrated', 'annoyed', 'irritated', 'exasperated', 'aggravated', 'bothered'],
    'gratitude': ['thankful', 'grateful', 'appreciative', 'indebted', 'obliged']
}

def preprocess_text(text):
    """Enhanced text preprocessing function with better error handling"""
    try:
        if not isinstance(text, str):
            return ""
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove special characters and numbers but keep punctuation
        text = re.sub(r'[^a-zA-Z\s.,!?]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove stopwords with error handling
        try:
            stop_words = set(stopwords.words('english'))
            words = word_tokenize(text)
            text = ' '.join([word for word in words if word.lower() not in stop_words])
        except Exception as e:
            logger.warning(f"Error in stopword removal: {str(e)}. Continuing without stopword removal.")
        
        return text
    except Exception as e:
        logger.error(f"Error in preprocessing text: {str(e)}")
        return ""

def get_emotion_features(text):
    """Extract enhanced emotion-related features with intensity scoring"""
    doc = nlp(text)
    
    # Initialize base features
    features = {
        'exclamation_count': text.count('!'),
        'question_count': text.count('?'),
        'capital_count': sum(1 for c in text if c.isupper()),
        'word_count': len(text.split()),
        'avg_word_length': np.mean([len(word) for word in text.split()]),
        'sentiment_polarity': TextBlob(text).sentiment.polarity,
        'sentiment_subjectivity': TextBlob(text).sentiment.subjectivity,
        'emotion_intensity': 0.0,
        'emotion_diversity': 0.0
    }
    
    # Initialize emotion scores
    emotion_scores = {emotion: 0.0 for emotion in EMOTION_KEYWORDS.keys()}
    total_emotion_words = 0
    
    # Count emotion keywords with intensity
    for token in doc:
        for emotion, keywords in EMOTION_KEYWORDS.items():
            if token.text.lower() in keywords:
                emotion_scores[emotion] += 1
                total_emotion_words += 1
    
    # Calculate normalized emotion scores
    if total_emotion_words > 0:
        for emotion in emotion_scores:
            emotion_scores[emotion] = emotion_scores[emotion] / total_emotion_words
    
    # Add individual emotion features
    for emotion, score in emotion_scores.items():
        features[f'emotion_{emotion}'] = score
    
    # Calculate overall emotion metrics
    if total_emotion_words > 0:
        features['emotion_intensity'] = sum(emotion_scores.values())
        features['emotion_diversity'] = len([s for s in emotion_scores.values() if s > 0]) / len(EMOTION_KEYWORDS)
    
    return features

def get_roberta_sentiment(text):
    """Get RoBERTa sentiment with error handling"""
    try:
        text = preprocess_text(text)
        max_length = 512
        truncated_text = text[:max_length]
        result = roberta_sentiment(truncated_text)[0]
        
        sentiment_map = {
            'LABEL_2': 'positive',
            'LABEL_1': 'neutral',
            'LABEL_0': 'negative'
        }
        return sentiment_map[result['label']]
    except Exception as e:
        logger.error(f"Error in RoBERTa sentiment analysis: {str(e)}")
        return 'neutral'

def get_emotions(text):
    """Get detailed emotions from text using enhanced detection and scoring"""
    try:
        text = preprocess_text(text)
        doc = nlp(text)
        
        # Get primary emotion from RoBERTa
        result = roberta_sentiment(text[:512])[0]
        primary_emotion = 'positive' if result['label'] == 'LABEL_2' else 'negative' if result['label'] == 'LABEL_0' else 'neutral'
        
        # Enhanced emotion detection with scoring
        emotion_scores = {}
        for token in doc:
            for emotion, keywords in EMOTION_KEYWORDS.items():
                if token.text.lower() in keywords:
                    if emotion not in emotion_scores:
                        emotion_scores[emotion] = 0
                    emotion_scores[emotion] += 1
        
        # Normalize emotion scores
        total_emotion_words = sum(emotion_scores.values())
        if total_emotion_words > 0:
            for emotion in emotion_scores:
                emotion_scores[emotion] = emotion_scores[emotion] / total_emotion_words
        
        # Get top 3 secondary emotions with scores
        top_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        secondary_emotions = [emotion for emotion, _ in top_emotions]
        
        # If no secondary emotions found, use context-based inference
        if not secondary_emotions:
            if primary_emotion == 'positive':
                secondary_emotions = ['joy', 'pride', 'gratitude']
                emotion_scores.update({emotion: 0.3 for emotion in secondary_emotions})
            elif primary_emotion == 'negative':
                secondary_emotions = ['sadness', 'anger', 'frustration']
                emotion_scores.update({emotion: 0.3 for emotion in secondary_emotions})
            else:
                secondary_emotions = ['neutral']
                emotion_scores['neutral'] = 1.0
        
        return {
            'primary_emotion': primary_emotion,
            'secondary_emotions': secondary_emotions,
            'emotion_scores': emotion_scores
        }
    except Exception as e:
        logger.error(f"Error in emotion analysis: {str(e)}")
        return {
            'primary_emotion': 'neutral',
            'secondary_emotions': ['neutral'],
            'emotion_scores': {'neutral': 1.0}
        }

def get_sentence_embeddings(text):
    """Get sentence embeddings using sentence transformer"""
    try:
        text = preprocess_text(text)
        return sentence_transformer.encode(text)
    except Exception as e:
        logger.error(f"Error in getting sentence embeddings: {str(e)}")
        return np.zeros(384)

# Sample a smaller subset of the data for testing
sample_size = 300  # Further reduced from 500
df_sample = df.sample(n=min(sample_size, len(df)), random_state=42)

logger.info("Extracting features...")
# Extract features
df_sample['roberta_sentiment'] = df_sample['Text'].apply(get_roberta_sentiment)
df_sample['emotions'] = df_sample['Text'].apply(get_emotions)
df_sample['embeddings'] = df_sample['Text'].apply(get_sentence_embeddings)
df_sample['emotion_features'] = df_sample['Text'].apply(get_emotion_features)

# Prepare features for ensemble model with reduced dimensionality
X = np.array([np.concatenate([
    np.array([
        features['exclamation_count'],
        features['question_count'],
        features['capital_count'],
        features['word_count'],
        features['avg_word_length'],
        features['sentiment_polarity'],
        features['sentiment_subjectivity'],
        features['emotion_intensity'],
        features['emotion_diversity']
    ] + [features[f'emotion_{emotion}'] for emotion in EMOTION_KEYWORDS.keys()]),
    embeddings[:32]  # Further reduced from 64
]) for features, embeddings in zip(df_sample['emotion_features'], df_sample['embeddings'])])

# Scale features
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Prepare labels with numeric encoding
label_map = {'negative': 0, 'neutral': 1, 'positive': 2}
label_map_reverse = {0: 'negative', 1: 'neutral', 2: 'positive'}
y = df_sample['Score'].map({1: 'negative', 2: 'negative', 3: 'neutral', 4: 'positive', 5: 'positive'})
y_numeric = y.map(label_map)

# Calculate class weights to handle imbalance
class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(y_numeric),
    y=y_numeric
)
class_weight_dict = dict(zip(np.unique(y_numeric), class_weights))

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y_numeric, test_size=0.2, random_state=42)

# Enhanced hyperparameter tuning
param_dist = {
    'svc__C': [0.1, 1, 10, 100],
    'svc__gamma': ['scale', 'auto', 0.1, 0.01],
    'rf__n_estimators': [100, 200, 300],
    'rf__max_depth': [10, 20, None],
    'rf__min_samples_split': [2, 5, 10],
    'rf__min_samples_leaf': [1, 2, 4],
    'xgb__max_depth': [3, 5, 7],
    'xgb__learning_rate': [0.01, 0.05, 0.1],
    'xgb__n_estimators': [100, 200, 300],
    'xgb__subsample': [0.8, 0.9, 1.0],
    'xgb__colsample_bytree': [0.8, 0.9, 1.0],
    'gb__n_estimators': [100, 200, 300],
    'gb__learning_rate': [0.01, 0.05, 0.1],
    'gb__max_depth': [3, 5, 7],
    'gb__subsample': [0.8, 0.9, 1.0]
}

# Create base models with enhanced parameters and memory optimization
base_models = [
    ('svc', SVC(
        probability=True,
        kernel='rbf',
        class_weight=class_weight_dict,
        cache_size=2000,
        max_iter=1000
    )),
    ('rf', RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=5,
        min_samples_leaf=2,
        n_jobs=1,
        class_weight=class_weight_dict,
        random_state=42
    )),
    ('xgb', XGBClassifier(
        max_depth=5,
        learning_rate=0.05,
        n_estimators=200,
        subsample=0.9,
        colsample_bytree=0.9,
        n_jobs=1,
        random_state=42
    )),
    ('gb', GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.9,
        random_state=42
    ))
]

# Create ensemble with dynamic weights based on model performance
ensemble = VotingClassifier(
    estimators=base_models,
    voting='soft',
    weights=[1, 1, 1, 1],
    n_jobs=1
)

# Use RandomizedSearchCV with enhanced memory optimization
random_search = RandomizedSearchCV(
    ensemble,
    param_distributions=param_dist,
    n_iter=50,  # Increased iterations for better optimization
    cv=5,  # Increased cross-validation folds
    scoring='accuracy',
    n_jobs=1,
    random_state=42,
    verbose=1,
    pre_dispatch='2*n_jobs',
    error_score='raise'
)

# Memory optimization
def optimize_memory():
    """Optimize memory usage"""
    gc.collect()
    torch.cuda.empty_cache() if torch.cuda.is_available() else None
    return True

# Train model with memory optimization
logger.info("Training ensemble model with memory optimization...")
optimize_memory()
random_search.fit(X_train, y_train)

# Get best model and parameters
best_ensemble = random_search.best_estimator_
best_params = random_search.best_params_

# Calculate model weights based on individual performance
model_weights = []
for name, model in base_models:
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    model_weights.append(score)

# Normalize weights
model_weights = np.array(model_weights) / sum(model_weights)

# Create final ensemble with optimized weights
final_ensemble = VotingClassifier(
    estimators=base_models,
    voting='soft',
    weights=model_weights,
    n_jobs=1
)

# Train final ensemble
logger.info("Training final ensemble with optimized weights...")
optimize_memory()
final_ensemble.fit(X_train, y_train)

# Evaluate final model
y_pred = final_ensemble.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

logger.info("\nFinal Model Performance:")
logger.info(f"Best Parameters: {best_params}")
logger.info(f"Model Weights: {dict(zip([name for name, _ in base_models], model_weights))}")
logger.info(f"Ensemble Model Accuracy: {accuracy:.4f}")
logger.info("\nClassification Report:")
logger.info(report)

# Save model and results
joblib.dump(final_ensemble, 'sentiment_model.joblib')
joblib.dump(scaler, 'feature_scaler.joblib')

# Save detailed results
results = pd.DataFrame({
    'Text': df_sample['Text'].iloc[:len(y_pred)],  # Match the length of predictions
    'Score': df_sample['Score'].iloc[:len(y_pred)],
    'Predicted_Sentiment': [label_map_reverse[pred] for pred in y_pred],  # Convert numeric back to string
    'RoBERTa_Sentiment': df_sample['roberta_sentiment'].iloc[:len(y_pred)],
    'Primary_Emotion': df_sample['emotions'].iloc[:len(y_pred)].apply(lambda x: x['primary_emotion']),
    'Secondary_Emotions': df_sample['emotions'].iloc[:len(y_pred)].apply(lambda x: x['secondary_emotions']),
    'Emotion_Scores': df_sample['emotions'].iloc[:len(y_pred)].apply(lambda x: x['emotion_scores'])
})

# Enhanced visualization and evaluation
def plot_feature_importance(model, feature_names):
    """Plot feature importance with enhanced visualization"""
    if hasattr(model.named_estimators_['rf'], 'feature_importances_'):
        importance = model.named_estimators_['rf'].feature_importances_
        indices = np.argsort(importance)[::-1]
        
        plt.figure(figsize=(15, 8))
        plt.title('Feature Importance Analysis')
        plt.bar(range(len(importance)), importance[indices], align='center')
        plt.xticks(range(len(importance)), [feature_names[i] for i in indices], rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
        plt.close()

def plot_confusion_matrix(y_true, y_pred, classes):
    """Plot confusion matrix with enhanced visualization"""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=classes, yticklabels=classes)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.close()

def plot_emotion_distribution(df, title):
    """Plot emotion distribution with enhanced visualization"""
    # Primary emotions
    primary_emotions = df['emotions'].apply(lambda x: x['primary_emotion']).value_counts()
    plt.figure(figsize=(15, 8))
    sns.barplot(x=primary_emotions.index, y=primary_emotions.values, palette='viridis')
    plt.title(f'{title} - Primary Emotions')
    plt.xlabel('Emotion')
    plt.ylabel('Count')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'{title.replace(" ", "_")}_primary_emotions.png', dpi=300, bbox_inches='tight')
    plt.close()

    # Secondary emotions
    secondary_emotions = []
    for emotions in df['emotions']:
        secondary_emotions.extend(emotions['secondary_emotions'])
    secondary_counts = Counter(secondary_emotions)
    
    plt.figure(figsize=(15, 8))
    sns.barplot(x=list(secondary_counts.keys()), y=list(secondary_counts.values()), palette='magma')
    plt.title('Secondary Emotions Distribution')
    plt.xlabel('Emotion')
    plt.ylabel('Count')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('secondary_emotions_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()

def plot_sentiment_distribution(df):
    """Plot sentiment distribution with enhanced visualization"""
    plt.figure(figsize=(12, 6))
    sentiment_counts = df['Predicted_Sentiment'].value_counts()
    sns.barplot(x=sentiment_counts.index, y=sentiment_counts.values, palette='coolwarm')
    plt.title('Sentiment Distribution')
    plt.xlabel('Sentiment')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig('sentiment_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()

# Generate feature names for visualization
feature_names = (
    ['exclamation_count', 'question_count', 'capital_count', 'word_count',
     'avg_word_length', 'sentiment_polarity', 'sentiment_subjectivity',
     'emotion_intensity', 'emotion_diversity'] +
    [f'emotion_{emotion}' for emotion in EMOTION_KEYWORDS.keys()] +
    [f'text_embed_{i}' for i in range(32)] +
    [f'image_embed_{i}' for i in range(32)]
)

# Generate visualizations
logger.info("Generating visualizations...")
plot_feature_importance(final_ensemble, feature_names)
plot_confusion_matrix(y_test, y_pred, classes=['negative', 'neutral', 'positive'])
plot_emotion_distribution(df_sample, 'Primary Emotions Distribution')
plot_sentiment_distribution(results)

# Save evaluation metrics
evaluation_metrics = {
    'accuracy': accuracy,
    'classification_report': report,
    'best_parameters': best_params,
    'model_weights': dict(zip([name for name, _ in base_models], model_weights))
}

import json
with open('evaluation_metrics.json', 'w') as f:
    json.dump(evaluation_metrics, f, indent=4)

logger.info("Visualizations and evaluation metrics saved successfully")

# PyTorch Lightning Model for Multimodal Sentiment Analysis
class MultimodalSentimentModel(pl.LightningModule):
    def __init__(self, text_encoder, image_encoder, num_classes=3):
        super().__init__()
        self.text_encoder = text_encoder
        self.image_encoder = image_encoder
        self.classifier = nn.Sequential(
            nn.Linear(768 + 512, 512),  # Combined text and image features
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, text_features, image_features):
        combined = torch.cat([text_features, image_features], dim=1)
        return self.classifier(combined)
    
    def training_step(self, batch, batch_idx):
        text_features, image_features, labels = batch
        logits = self(text_features, image_features)
        loss = nn.CrossEntropyLoss()(logits, labels)
        self.log('train_loss', loss)
        return loss
    
    def validation_step(self, batch, batch_idx):
        text_features, image_features, labels = batch
        logits = self(text_features, image_features)
        loss = nn.CrossEntropyLoss()(logits, labels)
        self.log('val_loss', loss)
        return loss
    
    def configure_optimizers(self):
        return torch.optim.AdamW(self.parameters(), lr=1e-4)

# Initialize CLIP model
logger.info("Loading CLIP model...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def get_clip_features(text, image=None):
    """Get CLIP features for text and optional image"""
    try:
        if image is not None:
            # Process image
            image = Image.fromarray(image)
            inputs = clip_processor(text=[text], images=image, return_tensors="pt", padding=True)
            outputs = clip_model(**inputs)
            return outputs.text_embeds, outputs.image_embeds
        else:
            # Process text only
            inputs = clip_processor(text=[text], return_tensors="pt", padding=True)
            outputs = clip_model(**inputs)
            return outputs.text_embeds, None
    except Exception as e:
        logger.error(f"Error in CLIP feature extraction: {str(e)}")
        return None, None

# Update the analyze_sentiment function to handle numeric predictions
def analyze_sentiment(text, image=None):
    """Analyze sentiment from text and optional image"""
    try:
        # Get CLIP features
        text_embeds, image_embeds = get_clip_features(text, image)
        
        # Get RoBERTa sentiment
        roberta_sent = get_roberta_sentiment(text)
        
        # Get emotions
        emotions = get_emotions(text)
        
        # Get emotion features
        emotion_features = get_emotion_features(text)
        
        # Combine features with the same dimensions as training data
        features = np.concatenate([
            np.array([
                emotion_features['exclamation_count'],
                emotion_features['question_count'],
                emotion_features['capital_count'],
                emotion_features['word_count'],
                emotion_features['avg_word_length'],
                emotion_features['sentiment_polarity'],
                emotion_features['sentiment_subjectivity'],
                emotion_features['emotion_intensity'],
                emotion_features['emotion_diversity']
            ] + [emotion_features[f'emotion_{emotion}'] for emotion in EMOTION_KEYWORDS.keys()]),
            text_embeds.detach().numpy().flatten()[:32] if text_embeds is not None else np.zeros(32)
        ])
        
        # Ensure features match training dimensions
        if len(features) != X.shape[1]:
            logger.warning(f"Feature dimension mismatch. Expected {X.shape[1]}, got {len(features)}")
            # Pad or truncate to match training dimensions
            if len(features) > X.shape[1]:
                features = features[:X.shape[1]]
            else:
                features = np.pad(features, (0, X.shape[1] - len(features)))
        
        # Scale features
        features = scaler.transform(features.reshape(1, -1))
        
        # Get ensemble prediction
        sentiment_numeric = final_ensemble.predict(features)[0]
        sentiment = {0: 'negative', 1: 'neutral', 2: 'positive'}[sentiment_numeric]
        
        return {
            'sentiment': sentiment,
            'roberta_sentiment': roberta_sent,
            'primary_emotion': emotions['primary_emotion'],
            'secondary_emotions': emotions['secondary_emotions'],
            'emotion_scores': emotions['emotion_scores']
        }
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        return {
            'sentiment': 'neutral',
            'roberta_sentiment': 'neutral',
            'primary_emotion': 'neutral',
            'secondary_emotions': ['neutral'],
            'emotion_scores': {'neutral': 1.0}
        }

# Create Gradio interface
interface = gr.Interface(
    fn=analyze_sentiment,
    inputs=[
        gr.Textbox(label="Text Input"),
        gr.Image(label="Optional Image Input", type="numpy")
    ],
    outputs=[
        gr.JSON(label="Analysis Results")
    ],
    title="Multimodal Sentiment Analysis",
    description="Analyze sentiment from text and optional image input"
)

# Launch Gradio interface
interface.launch()

results.to_csv('detailed_sentiment_results.csv', index=False)
logger.info("\nModel and results saved successfully") 