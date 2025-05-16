import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface FlowDiagramProps {
  flowData: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      data: Record<string, unknown>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
    }>;
  };
}

// Custom node styles
const nodeStyles = {
  emotion: {
    background: '#f0f9ff',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '10px',
    width: 150,
  },
  factor: {
    background: '#f0fdf4',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    padding: '10px',
    width: 150,
  },
};

const FlowDiagram: React.FC<FlowDiagramProps> = ({ flowData }) => {
  const [nodes, , onNodesChange] = useNodesState(
    flowData.nodes.map(node => ({
      id: node.id,
      data: { 
        label: node.label,
        ...node.data,
        style: nodeStyles[node.type as keyof typeof nodeStyles] || nodeStyles.emotion
      },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'default',
    }))
  );

  const [edges, , onEdgesChange] = useEdgesState(
    flowData.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: '#2563eb' },
      labelStyle: { fill: '#2563eb', fontWeight: 600 },
    }))
  );

  return (
    <div style={{ height: 500, width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default FlowDiagram; 