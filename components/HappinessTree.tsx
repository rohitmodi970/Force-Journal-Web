import React from 'react';

interface HappinessSource {
  source: string;
  strength: number;
  moments: string[];
  quote: string;
  color: string;
}

const defaultSources: HappinessSource[] = [
  {
    source: "Spiritual Connection",
    strength: 9,
    moments: [
      "Sitting under the tree where Swami Vivekanand gained knowledge",
      "Yoga and meditation at the ashram",
      "Feeling the pure energy in Pithoragarh",
      "Planning the 60-day chakra meditation journey"
    ],
    quote: "The energy here feels pure. And I feel as if I'm getting purified here.",
    color: "#9C27B0"
  },
  {
    source: "Nature Immersion",
    strength: 8.5,
    moments: [
      "Sitting on the swing in the garden by the poppies",
      "Boxing during golden hour with sun hitting your face",
      "Mountain views after the rain with potential snow",
      "Watching the moon rise during sunset on Holi"
    ],
    quote: "The way nature takes care of me is unbeatable. The sun, the moon, bees, flowers, mountains and the blue, blue sky.",
    color: "#4CAF50"
  },
  {
    source: "Physical Vitality",
    strength: 8,
    moments: [
      "Daily boxing training that gives you joy and energy",
      "Feeling your body getting stronger through consistent practice",
      "Approaching your peak physical form",
      "The energy from boxing during sunset"
    ],
    quote: "The training gives me so much joy & energy.",
    color: "#2196F3"
  },
  {
    source: "Authentic Connection",
    strength: 7.5,
    moments: [
      "Family gathering for Holi after 10 years",
      "Deep conversations with mother and friends",
      "Moments of feeling genuinely seen and appreciated",
      "Time with your Guruji and the ashram community"
    ],
    quote: "That feeling of looking at someone & seeing them smile because of you. !!PRICELESS!!",
    color: "#E91E63"
  },
  {
    source: "Creative Purpose",
    strength: 7,
    moments: [
      "Building the Force webapp",
      "Mentoring interns on project development",
      "Channeling your creativity through colors during Holi",
      "Planning new features for your community platform"
    ],
    quote: "I'm really happy with myself that I'm able to do all these things & stick to the routine.",
    color: "#FF9800"
  },
  {
    source: "Inner Harmony",
    strength: 6.5,
    moments: [
      "Moments of blissful state and feeling taken care of",
      "Finding peace in simple routines",
      "Feeling invincible when your mind is clear",
      "The experience of flow state while working"
    ],
    quote: "I'm feeling loved & taken care of and because I'm provided for I can not help but feel invincible that I can do anything that I put my mind to.",
    color: "#00BCD4"
  }
];

const clusterPositions = [
  // These are example positions for up to 6 sources, adjust as needed
  { x: 300, y: 130, labelX: 300, labelY: 70, anchor: 'middle', rotation: 0 }, // Top (Spiritual)
  { x: 240, y: 150, labelX: 180, labelY: 150, anchor: 'end', rotation: -30 }, // Left (Nature)
  { x: 360, y: 150, labelX: 420, labelY: 150, anchor: 'start', rotation: 30 }, // Right (Physical)
  { x: 250, y: 220, labelX: 170, labelY: 230, anchor: 'end', rotation: -15 }, // Lower left (Connection)
  { x: 350, y: 220, labelX: 430, labelY: 230, anchor: 'start', rotation: 15 }, // Lower right (Creative)
  { x: 300, y: 200, labelX: 300, labelY: 230, anchor: 'middle', rotation: 0 }, // Center (Harmony)
];

const HappinessTree = ({ sources }: { sources?: HappinessSource[] }) => {
  const happinessSources = sources && sources.length > 0 ? sources : defaultSources;

  // Interface for TreeLeaf component props
  interface TreeLeafProps {
    x: number;
    y: number;
    color: string;
    rotation: number;
    pulse: boolean;
  }

  // Custom tree leaf component
  const TreeLeaf = ({ x, y, color, rotation, pulse }: TreeLeafProps) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <path
        d="M0,0 C5,-10 15,-10 20,0 C25,10 15,20 0,20 C-15,20 -25,10 -20,0 C-15,-10 -5,-10 0,0"
        fill={color}
        opacity={0.9}
        style={pulse ? {
          animation: 'pulse 3s infinite',
          transformOrigin: 'center'
        } : {}}
      />
    </g>
  );

  // Custom styles for animation
  const styles = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .happiness-card { animation: fadeIn 0.6s ease-out; transition: transform 0.3s ease-out; }
    .happiness-card:hover { transform: translateY(-4px); }
  `;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <style>{styles}</style>
      <h2 className="text-3xl font-bold mb-6 text-center">Where Your Happiness Lies</h2>
      <p className="text-center text-gray-600 mb-8">Analysis of joy sources from your journal</p>
      <div className="flex justify-center mb-8">
        <svg width="600" height="500" viewBox="0 0 600 500">
          {/* Tree trunk and roots */}
          <path d="M300,400 C290,350 290,300 300,250 C310,300 310,350 300,400 Z" fill="#795548" />
          <path d="M300,250 C290,220 288,170 300,130 C312,170 310,220 300,250 Z" fill="#8D6E63" />
          <path d="M300,400 C280,420 250,430 220,435 C260,425 290,415 300,400 Z" fill="#5D4037" />
          <path d="M300,400 C320,420 350,430 380,435 C340,425 310,415 300,400 Z" fill="#5D4037" />
          {/* Dynamic clusters for each happiness source */}
          {happinessSources.map((source, i) => {
            const pos = clusterPositions[i] || { x: 300, y: 130, labelX: 300, labelY: 70, anchor: 'middle', rotation: 0 };
            return (
              <g key={source.source}>
                <TreeLeaf x={pos.x} y={pos.y} color={source.color} rotation={pos.rotation} pulse={true} />
                <TreeLeaf x={pos.x + 20} y={pos.y - 20} color={source.color} rotation={pos.rotation + 20} pulse={false} />
                <TreeLeaf x={pos.x - 20} y={pos.y - 20} color={source.color} rotation={pos.rotation - 20} pulse={false} />
                <TreeLeaf x={pos.x} y={pos.y - 40} color={source.color} rotation={pos.rotation} pulse={false} />
                <text x={pos.labelX} y={pos.labelY} textAnchor={pos.anchor} fill={source.color} fontWeight="bold">{source.source}</text>
              </g>
            );
          })}
          {/* Ground */}
          <ellipse cx="300" cy="435" rx="200" ry="20" fill="#A1887F" opacity="0.5" />
          {/* Your roots text */}
          <text x="300" y="470" textAnchor="middle" className="text-lg font-medium">
            Your Happiness Tree
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {happinessSources.map((source, index) => (
          <div
            key={index}
            className="happiness-card p-4 rounded-lg shadow-md border-l-4"
            style={{ borderLeftColor: source.color }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg" style={{ color: source.color }}>{source.source}</h3>
              <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                Strength: <span className="font-medium">{source.strength}/10</span>
              </div>
            </div>
            <p className="italic text-gray-600 mb-3 text-sm">"{source.quote}"</p>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Moments of joy:</p>
              <ul className="space-y-1 text-sm">
                {source.moments.map((moment, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 mt-1" style={{ color: source.color }}>•</span>
                    <span>{moment}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 p-5 rounded-lg">
        <h3 className="font-bold text-lg mb-3">Your Happiness Formula</h3>
        <p className="mb-3">
          {happinessSources.length > 0
            ? `Your journal reveals that your deepest happiness comes from a harmonious balance of ${happinessSources.map(s => s.source).join(', ')}.`
            : 'Your journal reveals that your deepest happiness comes from a harmonious balance of spiritual growth, connection with nature, physical vitality, authentic relationships, creative work, and inner peace.'}
        </p>
        <p className="mb-3">
          {happinessSources.length > 0
            ? `When these elements align—as they did during moments like ${happinessSources[0].moments[0] || 'special moments'}—you experience your highest states of contentment and joy.`
            : 'When these elements align—as they did during moments like boxing at sunset, sitting in your garden, or practicing meditation—you experience your highest states of contentment and joy.'}
        </p>
        <p>
          The visualization above represents these sources as a "happiness tree" with roots in balance and branches extending into different domains of well-being that your journal identifies as most meaningful to you.
        </p>
      </div>
      <div className="text-sm text-gray-500 mt-8 text-center">
        <p className="italic">Based on qualitative analysis of your journal entries</p>
      </div>
    </div>
  );
};

export default HappinessTree; 