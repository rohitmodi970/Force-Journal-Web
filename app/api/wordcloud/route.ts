import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

interface WordData {
  text: string;
  value: number;
}

function generateWordCloud(
  ctx: CanvasRenderingContext2D,
  words: WordData[],
  width: number,
  height: number
) {
  if (words.length === 0) return;
  // Sort words by value (frequency)
  const sortedWords = [...words].sort((a, b) => b.value - a.value);
  
  // Calculate max and min values for scaling
  const maxValue = Math.max(...words.map(w => w.value));
  const minValue = Math.min(...words.map(w => w.value));
  
  // Font size range
  const minFontSize = 20;
  const maxFontSize = 80;
  
  // Center point
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Spiral parameters
  let angle = 0;
  const angleStep = 0.2;
  const radiusStep = 2;
  
  // Track placed words
  const placedWords: { x: number; y: number; width: number; height: number }[] = [];
  
  // Place each word
  for (const word of sortedWords) {
    // Calculate font size based on value
    let fontSize = minFontSize;
    if (maxValue !== minValue) {
      fontSize = minFontSize + (word.value - minValue) * (maxFontSize - minFontSize) / (maxValue - minValue);
    }
    ctx.font = `${fontSize}px Arial`;
    
    // Measure text
    const metrics = ctx.measureText(word.text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // Try to place the word
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      // Calculate position using spiral
      const radius = radiusStep * angle;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Check if word fits and doesn't overlap
      const wordBox = {
        x: x - textWidth / 2,
        y: y - textHeight / 2,
        width: textWidth,
        height: textHeight
      };
      
      const overlaps = placedWords.some(placed => {
        return !(
          wordBox.x + wordBox.width < placed.x ||
          wordBox.x > placed.x + placed.width ||
          wordBox.y + wordBox.height < placed.y ||
          wordBox.y > placed.y + placed.height
        );
      });
      
      if (!overlaps && 
          wordBox.x >= 0 && 
          wordBox.x + wordBox.width <= width &&
          wordBox.y >= 0 && 
          wordBox.y + wordBox.height <= height) {
        // Place the word
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word.text, 0, 0);
        ctx.restore();
        
        placedWords.push(wordBox);
        placed = true;
      }
      
      angle += angleStep;
      attempts++;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { words } = await request.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'No words available to generate word cloud' }, { status: 400 });
    }

    // Create word frequency data
    const wordFreq = words.reduce((acc: Record<string, number>, word: string) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format
    const wordData: WordData[] = Object.entries(wordFreq).map(([text, value]) => ({
      text,
      value: Math.max(1, Number(value) * 10) // Scale up the values
    }));

    // Create canvas
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Generate word cloud
    generateWordCloud(ctx, wordData, width, height);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Return the image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Word cloud generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate word cloud' },
      { status: 500 }
    );
  }
} 