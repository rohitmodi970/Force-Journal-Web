import numpy as np
from typing import Dict, Any, Optional
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Emotion lexicon (expand as needed)
EMOTION_KEYWORDS = {
    'joy': ['joy', 'happy', 'excited', 'delight', 'pleased', 'thrilled', 'ecstatic', 'elated'],
    'sadness': ['sad', 'unhappy', 'disappointed', 'grief', 'sorry', 'depressed', 'heartbroken', 'miserable', 'sorrow', 'down', 'blue'],
    'fear': ['fear', 'scared', 'afraid', 'worried', 'anxious', 'terrified', 'nervous', 'dread', 'panic', 'frightened', 'intimidated'],
    'anger': ['angry', 'mad', 'frustrated', 'annoyed', 'upset', 'irritated', 'furious', 'outraged', 'enraged', 'fuming'],
    'surprise': ['surprised', 'amazed', 'shocked', 'unexpected', 'astonished', 'astounded', 'stunned', 'bewildered'],
    'shame': ['ashamed', 'embarrassed', 'guilty', 'regret', 'humiliated', 'remorseful', 'mortified'],
    'envy': ['envious', 'jealous', 'covet', 'resentful', 'bitter', 'green-eyed'],
    'pride': ['proud', 'accomplished', 'achieved', 'successful', 'triumphant', 'confident', 'dignified'],
    'frustration': ['frustrated', 'annoyed', 'irritated', 'exasperated', 'aggravated', 'bothered'],
    'gratitude': ['thankful', 'grateful', 'appreciative', 'indebted', 'obliged', 'blessed']
}

# Add sentiment-based emotion weights
EMOTION_WEIGHTS = {
    'joy': {'positive': 1.2, 'negative': 0.3},
    'sadness': {'positive': 0.3, 'negative': 1.2},
    'fear': {'positive': 0.4, 'negative': 1.1},
    'anger': {'positive': 0.2, 'negative': 1.3},
    'surprise': {'positive': 0.9, 'negative': 0.9},
    'shame': {'positive': 0.3, 'negative': 1.2},
    'envy': {'positive': 0.4, 'negative': 1.1},
    'pride': {'positive': 1.2, 'negative': 0.3},
    'frustration': {'positive': 0.3, 'negative': 1.2},
    'gratitude': {'positive': 1.3, 'negative': 0.2}
}

def analyze_sentiment(text: str, image: Optional[np.ndarray] = None) -> Dict[str, Any]:
    """
    Analyze sentiment of text and optionally image.
    Returns a dictionary with detailed sentiment analysis.
    """
    # Initialize sentiment analyzer
    sia = SentimentIntensityAnalyzer()
    sentiment_scores = sia.polarity_scores(text)
    compound_score = sentiment_scores['compound']
    pos_score = sentiment_scores['pos']
    neu_score = sentiment_scores['neu']
    neg_score = sentiment_scores['neg']

    # Extract key phrases (simple implementation)
    words = word_tokenize(text.lower())
    stop_words = set(stopwords.words('english'))
    key_phrases = [word for word in words if word not in stop_words and len(word) > 3]
    key_phrases = list(set(key_phrases))[:5]  # Get top 5 unique phrases

    # Sentiment label with more granularity
    if compound_score >= 0.6:
        sentiment_label = "Very Positive"
    elif compound_score >= 0.2:
        sentiment_label = "Positive"
    elif compound_score > -0.2:
        sentiment_label = "Neutral"
    elif compound_score > -0.6:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Very Negative"

    # Magnitude and confidence
    magnitude = abs(compound_score)
    confidence = max(pos_score, neg_score, neu_score)

    # Enhanced emotion detection
    emotion_counts = {emotion: 0.0 for emotion in EMOTION_KEYWORDS}
    
    # Count emotion words with sentiment-based weighting
    for word in words:
        for emotion, keywords in EMOTION_KEYWORDS.items():
            if word in keywords:
                # Apply sentiment-based weighting
                if compound_score > 0:
                    weight = EMOTION_WEIGHTS[emotion]['positive']
                else:
                    weight = EMOTION_WEIGHTS[emotion]['negative']
                emotion_counts[emotion] += weight

    # Normalize emotion scores with a minimum threshold
    total_emotion_score = sum(emotion_counts.values())
    if total_emotion_score > 0:
        # Apply softmax-like normalization
        max_score = max(emotion_counts.values())
        emotion_scores = {
            k: (v / max_score) * (v / total_emotion_score) 
            for k, v in emotion_counts.items()
        }
    else:
        # If no emotions detected, use sentiment to infer primary emotion
        if compound_score > 0.2:
            emotion_scores = {'joy': 0.6, 'gratitude': 0.4}
        elif compound_score < -0.2:
            emotion_scores = {'sadness': 0.6, 'frustration': 0.4}
        else:
            emotion_scores = {'neutral': 1.0}

    # Primary and secondary emotions with minimum threshold
    threshold = 0.1  # Minimum score to be considered an emotion
    sorted_emotions = [(e, s) for e, s in emotion_scores.items() if s >= threshold]
    sorted_emotions.sort(key=lambda x: x[1], reverse=True)
    
    primary_emotion = sorted_emotions[0][0] if sorted_emotions else 'neutral'
    secondary_emotions = [e[0] for e in sorted_emotions[1:4] if e[1] >= threshold]

    # If no secondary emotions meet threshold, add some based on sentiment
    if not secondary_emotions and primary_emotion != 'neutral':
        if compound_score > 0:
            secondary_emotions = ['gratitude', 'pride']
        else:
            secondary_emotions = ['frustration', 'sadness']

    return {
        "sentiment_score": compound_score,
        "sentiment_label": sentiment_label,
        "magnitude": magnitude,
        "confidence": confidence,
        "probabilities": {
            "positive": pos_score,
            "neutral": neu_score,
            "negative": neg_score
        },
        "primary_emotion": primary_emotion,
        "secondary_emotions": secondary_emotions,
        "emotion_scores": emotion_scores,
        "key_phrases": key_phrases
    } 