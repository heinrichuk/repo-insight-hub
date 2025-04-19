
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Node {
  id: string;
  name: string;
  type: 'file' | 'class' | 'function' | 'module';
  index: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: Node;
  target: Node;
  value: number;
  index: number;
}

export interface RepoData {
  name: string;
  nodes: Node[];
  links: Link[];
}

export type VisualizationType = 'network' | 'hierarchical' | 'arc';
export type NodeFilterType = 'all' | 'file' | 'class' | 'function' | 'module';
