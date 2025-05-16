import { JournalEntry } from '@/components/Journal/types';

export interface FlowNode {
  id: string;
  label: string;
  type: string;
  data: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface GeminiAnalytics {
  keywords: { text: string; value: number }[];
  metrics: { energy: number; productivity: number }[];
  moodInfluencers: { influencer: string; impact: number }[];
  emotionDistribution: Record<string, number>[];
  topicHierarchy: string[];
  flowData: FlowData;
  healthMetrics: { sentiment: number; physicalWellness: number; mentalResilience: number }[];
  progressMetrics: { health: number; resilience: number; academic: number; research: number };
}

function transformTextToFlowData(text: string): FlowData {
  // Extract emotions and factors from the text
  const emotions = new Set<string>();
  const factors = new Set<string>();
  
  // Extract emotions (positive and negative)
  const emotionMatches = text.match(/(?:positive|negative) emotions? \(([^)]+)\)/gi);
  if (emotionMatches) {
    emotionMatches.forEach(match => {
      const emotionsList = match.match(/\(([^)]+)\)/)?.[1].split(',').map(e => e.trim());
      emotionsList?.forEach(e => emotions.add(e));
    });
  }

  // Extract factors (external and internal)
  const factorMatches = text.match(/(?:external|internal) factors? like ([^,.]+)/gi);
  if (factorMatches) {
    factorMatches.forEach(match => {
      const factorsList = match.split('like ')[1].split(',').map(f => f.trim());
      factorsList.forEach(f => factors.add(f));
    });
  }

  // Create nodes
  const nodes: FlowNode[] = [
    ...Array.from(emotions).map((emotion, index) => ({
      id: `emotion-${index}`,
      label: emotion,
      type: 'emotion',
      data: { category: emotion.includes('positive') ? 'positive' : 'negative' }
    })),
    ...Array.from(factors).map((factor, index) => ({
      id: `factor-${index}`,
      label: factor,
      type: 'factor',
      data: { category: factor.includes('external') ? 'external' : 'internal' }
    }))
  ];

  // Create edges between factors and emotions
  const edges: FlowEdge[] = [];
  let edgeId = 0;

  factors.forEach((factor, factorIndex) => {
    emotions.forEach((emotion, emotionIndex) => {
      // Create bidirectional relationships
      edges.push({
        id: `edge-${edgeId++}`,
        source: `factor-${factorIndex}`,
        target: `emotion-${emotionIndex}`,
        label: 'influences'
      });
    });
  });

  return { nodes, edges };
}

export async function fetchGeminiAnalytics(entries: JournalEntry[]): Promise<GeminiAnalytics | null> {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: JSON.stringify(entries),
        provider: 'gemini',
        options: {
          includeWordCloud: true,
          includeMoodDistribution: true,
          includeGoals: true,
          includeSocialInteractions: true,
          includeFlowData: true
        },
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch Gemini analytics');
    const data = await response.json();
    console.log('Gemini raw response:', data.text);
    
    let analyticsRaw;
    try {
      // Clean the response text by removing markdown code block formatting
      const cleanedText = data.text.replace(/```json\n?|\n?```/g, '').trim();
      analyticsRaw = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse Gemini analytics JSON:', e, data.text);
      return null;
    }

    // Validate and transform keywords to {text, value}[]
    let keywordsArr = analyticsRaw.keywords;
    console.log('Raw keywords from Gemini:', keywordsArr);
    
    if (Array.isArray(keywordsArr) && typeof keywordsArr[0] === 'string') {
      // Count frequency
      const freq: Record<string, number> = {};
      keywordsArr.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
      });
      keywordsArr = Object.entries(freq).map(([text, value]) => ({ text, value }));
      console.log('Transformed keywords:', keywordsArr);
    } else if (Array.isArray(keywordsArr) && typeof keywordsArr[0] === 'object' && 'text' in keywordsArr[0]) {
      // Already in correct format
      console.log('Keywords already in correct format:', keywordsArr);
    } else {
      console.error('Gemini keywords field is malformed:', keywordsArr);
      return null;
    }

    // Transform flow data from text to structured format
    let flowData: FlowData;
    if (typeof analyticsRaw.flowData === 'string') {
      flowData = transformTextToFlowData(analyticsRaw.flowData);
    } else if (analyticsRaw.flowData && Array.isArray(analyticsRaw.flowData.nodes) && Array.isArray(analyticsRaw.flowData.edges)) {
      flowData = analyticsRaw.flowData;
    } else {
      flowData = { nodes: [], edges: [] };
    }

    // Validate other fields (basic check)
    if (!Array.isArray(analyticsRaw.metrics) || 
        !Array.isArray(analyticsRaw.moodInfluencers) || 
        !Array.isArray(analyticsRaw.emotionDistribution) || 
        !Array.isArray(analyticsRaw.topicHierarchy) || 
        !Array.isArray(analyticsRaw.healthMetrics) || 
        typeof analyticsRaw.progressMetrics !== 'object') {
      console.error('Gemini analytics missing or malformed fields:', analyticsRaw);
      return null;
    }

    // Return in the expected format
    return {
      keywords: keywordsArr,
      metrics: analyticsRaw.metrics,
      moodInfluencers: analyticsRaw.moodInfluencers,
      emotionDistribution: analyticsRaw.emotionDistribution,
      topicHierarchy: analyticsRaw.topicHierarchy,
      flowData,
      healthMetrics: analyticsRaw.healthMetrics,
      progressMetrics: analyticsRaw.progressMetrics,
    };
  } catch (error) {
    console.error('Error fetching Gemini analytics:', error);
    return null;
  }
} 