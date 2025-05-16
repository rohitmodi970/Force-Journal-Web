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
    'joy': ['joy', 'happy', 'excited', 'proud', 'delight', 'pleased', 'thrilled', 'ecstatic', 'elated', 'love'],
    'sadness': ['sad', 'unhappy', 'disappointed', 'grief', 'sorry', 'depressed', 'heartbroken', 'miserable', 'sorrow'],
    'fear': ['fear', 'scared', 'afraid', 'worried', 'anxious', 'terrified', 'nervous', 'dread', 'panic'],
    'anger': ['angry', 'mad', 'frustrated', 'annoyed', 'upset', 'irritated', 'furious', 'outraged'],
    'surprise': ['surprised', 'amazed', 'shocked', 'unexpected', 'astonished', 'astounded', 'stunned'],
    'shame': ['ashamed', 'embarrassed', 'guilty', 'regret', 'humiliated', 'remorseful'],
    'envy': ['envious', 'jealous', 'covet', 'resentful', 'bitter'],
    'pride': ['proud', 'accomplished', 'achieved', 'successful', 'triumphant', 'confident'],
    'frustration': ['frustrated', 'annoyed', 'irritated', 'exasperated', 'aggravated'],
    'gratitude': ['thankful', 'grateful', 'appreciative', 'indebted', 'obliged']
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

    # Emotion detection
    emotion_counts = {emotion: 0 for emotion in EMOTION_KEYWORDS}
    for word in words:
        for emotion, keywords in EMOTION_KEYWORDS.items():
            if word in keywords:
                emotion_counts[emotion] += 1

    total_emotion_words = sum(emotion_counts.values())
    emotion_scores = {k: (v / total_emotion_words if total_emotion_words > 0 else 0) for k, v in emotion_counts.items()}

    # Primary and secondary emotions
    sorted_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)
    primary_emotion = sorted_emotions[0][0] if sorted_emotions and sorted_emotions[0][1] > 0 else None
    secondary_emotions = [e[0] for e in sorted_emotions[1:4] if e[1] > 0]

    return {
        "sentiment_score": compound_score,  # -1 to 1, nuanced
        "sentiment_label": sentiment_label,
        "magnitude": magnitude,             # Strength of sentiment
        "confidence": confidence,           # Highest probability
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