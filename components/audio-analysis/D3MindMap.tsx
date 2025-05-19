import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

interface MindMapNode {
  id: string;
  label: string;
  group: string;
  value: number;
  color: string;
  details: {
    description: string;
    keyPoints: string[];
    relevance: number;
    sentiment: string;
    connections: string[];
    color: string;
  };
}

interface MindMapLink {
  source: string;
  target: string;
  strength: number;
}

interface D3MindMapProps {
  nodes: MindMapNode[];
  links: MindMapLink[];
  insights: string;
  actionSuggestion: string;
}

export default function D3MindMap({ nodes, links, insights, actionSuggestion }: D3MindMapProps) {
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);

  useEffect(() => {
    d3.select('#d3-mind-map-container').selectAll('*').remove();
    if (!nodes || nodes.length === 0) return;

    // Build a hierarchy from the flat node list
    const nodeMap: Record<string, any> = {};
    nodes.forEach(n => {
      nodeMap[n.id] = { ...n, children: [] };
    });
    links.forEach(l => {
      if (nodeMap[l.source] && nodeMap[l.target]) {
        nodeMap[l.source].children = nodeMap[l.source].children || [];
        nodeMap[l.source].children.push(nodeMap[l.target]);
      }
    });
    // Find root (node not targeted by any link)
    const targetIds = new Set(links.map(l => l.target));
    const rootNode = nodes.find(n => !targetIds.has(n.id)) || nodes[0];
    const hierarchy = d3.hierarchy(nodeMap[rootNode.id])
      .sum(d => d.value);

    // D3 cluster layout
    const width = 900;
    const height = 700;
    const radius = Math.min(width, height) / 2 - 80;
    const cluster = d3.cluster().size([360, radius]);
    const root = cluster(hierarchy);

    const svg = d3.select('#d3-mind-map-container')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto; background: radial-gradient(circle at 50% 50%, #f0f4ff 60%, #e0e7ff 100%);');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => {
        return `M${d.target.y * Math.cos((d.target.x - 90) * Math.PI / 180)},
                 ${d.target.y * Math.sin((d.target.x - 90) * Math.PI / 180)}
                 C${(d.source.y + d.target.y) / 2 * Math.cos((d.target.x - 90) * Math.PI / 180)},
                 ${(d.source.y + d.target.y) / 2 * Math.sin((d.target.x - 90) * Math.PI / 180)}
                 ${(d.source.y + d.target.y) / 2 * Math.cos((d.source.x - 90) * Math.PI / 180)},
                 ${(d.source.y + d.target.y) / 2 * Math.sin((d.source.x - 90) * Math.PI / 180)}
                 ${d.source.y * Math.cos((d.source.x - 90) * Math.PI / 180)},
                 ${d.source.y * Math.sin((d.source.x - 90) * Math.PI / 180)}`;
      })
      .style('fill', 'none')
      .style('stroke', '#a5b4fc')
      .style('stroke-width', d => Math.max(2, d.target.data.value / 18))
      .style('filter', 'url(#link-glow)');

    // Add SVG filter for glowing links
    svg.append('defs').append('filter')
      .attr('id', 'link-glow')
      .html('<feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>');

    // Color palette for nodes
    const palette = [
      '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#F43F5E', '#A21CAF', '#F472B6', '#FBBF24', '#22D3EE', '#84CC16', '#E11D48'
    ];

    // Draw nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => {
        return `translate(${d.y * Math.cos((d.x - 90) * Math.PI / 180)},
                           ${d.y * Math.sin((d.x - 90) * Math.PI / 180)})`;
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.data);
      });

    node.append('circle')
      .attr('r', d => Math.max(18, d.data.value / 4))
      .style('fill', (d, i) => palette[i % palette.length])
      .style('stroke', '#fff')
      .style('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 0 12px #818cf8)')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 38)
          .style('filter', 'drop-shadow(0 0 24px #6366f1)');
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d => Math.max(18, d.__data__.data.value / 4))
          .style('filter', 'drop-shadow(0 0 12px #818cf8)');
      });

    node.append('text')
      .attr('dy', d => d.x < 180 ? '1.5em' : '-0.5em')
      .attr('dx', d => d.x < 180 ? 16 : -16)
      .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
      .text(d => d.data.label)
      .style('font-size', '1.1em')
      .style('font-family', 'Poppins, sans-serif')
      .style('font-weight', 600)
      .style('fill', '#312e81')
      .style('cursor', 'pointer')
      .style('text-shadow', '0 2px 8px #e0e7ff');

    svg.on('click', () => {
      setSelectedNode(null);
    });

    return () => {
      // Cleanup
    };
  }, [nodes, links]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-900">Mind Map Analysis</h2>
        <div className="text-sm text-gray-500">Click nodes to explore connections</div>
      </div>
      <div id="d3-mind-map-container" className="w-full h-80 mb-6" />
      {selectedNode && (
        <div className="bg-indigo-50 p-4 rounded-lg mb-4 transition-all duration-300 ease-in-out">
          <h3 className="font-bold text-lg text-indigo-800">{selectedNode.label}</h3>
          {selectedNode.details?.description && (
            <p className="text-gray-700 mt-2">{selectedNode.details.description}</p>
          )}
          {selectedNode.details?.keyPoints && selectedNode.details.keyPoints.length > 0 && (
            <ul className="list-disc list-inside text-gray-700 mt-2">
              {selectedNode.details.keyPoints.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${selectedNode.value}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{selectedNode.value}%</span>
          </div>
        </div>
      )}
      <div className="mt-4">
        <h3 className="font-medium text-gray-800 mb-2">Mind Map Insights</h3>
        <p className="text-gray-600">{insights}</p>
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
          <strong>Action Suggestion:</strong> {actionSuggestion}
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Export Mind Map
        </button>
        <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
          Track Mental Changes
        </button>
      </div>
    </div>
  );
} 