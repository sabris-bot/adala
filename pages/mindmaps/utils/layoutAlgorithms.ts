import { Node, Edge, MarkerType } from '@xyflow/react';
import { MindMapLayoutType } from '../../../types';

interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Calculates mathematical layout coordinates for different MindMap / Diagram styles
 * (Tree View, Flowchart, Timeline, Radial Map, Org Chart)
 */
export const applyAutoLayout = (
  nodes: Node[], 
  edges: Edge[], 
  layoutType: MindMapLayoutType,
  isRtl: boolean = true
): LayoutResult => {
  if (!nodes || nodes.length === 0) return { nodes, edges };

  // Find root node or fallback to first
  const targetRootId = nodes.find(n => !edges.some(e => e.target === n.id))?.id || nodes[0].id;
  
  // Build adjacency graph
  const childrenMap: Record<string, string[]> = {};
  const parentMap: Record<string, string> = {};

  nodes.forEach(n => {
    childrenMap[n.id] = [];
  });

  edges.forEach(e => {
    if (childrenMap[e.source]) {
      childrenMap[e.source].push(e.target);
    }
    parentMap[e.target] = e.source;
  });

  const nodeMap = new Map<string, Node>(nodes.map(n => [n.id, { ...n }]));

  let styledEdges: Edge[] = edges.map(e => {
    let strokeColor = '#c19a5b';
    let strokeWidth = 2.5;
    let edgeType = 'smoothstep';

    if (layoutType === MindMapLayoutType.TIMELINE) {
      strokeColor = '#0284c7';
      strokeWidth = 3;
      edgeType = 'smoothstep';
    } else if (layoutType === MindMapLayoutType.FLOWCHART_HORIZONTAL || layoutType === MindMapLayoutType.FLOWCHART_VERTICAL) {
      strokeColor = '#059669';
      strokeWidth = 2.5;
      edgeType = 'smoothstep';
    } else if (layoutType === MindMapLayoutType.RADIAL || layoutType === MindMapLayoutType.MINDMAP) {
      strokeColor = '#d97706';
      strokeWidth = 2.5;
      edgeType = 'default'; // bezier for smooth radial branches
    }

    return {
      ...e,
      type: edgeType,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
      style: { strokeWidth, stroke: strokeColor }
    };
  });

  switch (layoutType) {
    case MindMapLayoutType.RADIAL:
    case MindMapLayoutType.MINDMAP:
      return layoutRadialOrMindMap(nodeMap, childrenMap, targetRootId, styledEdges);

    case MindMapLayoutType.ORGANIZATION_CHART:
    case MindMapLayoutType.FLOWCHART_VERTICAL:
      return layoutTopDownHierarchy(nodeMap, childrenMap, targetRootId, styledEdges);

    case MindMapLayoutType.FLOWCHART_HORIZONTAL:
      return layoutFlowchartHorizontal(nodeMap, childrenMap, targetRootId, styledEdges, isRtl);

    case MindMapLayoutType.TREE_HORIZONTAL:
    case MindMapLayoutType.DECISION_TREE:
      return layoutDecisionTree(nodeMap, childrenMap, targetRootId, styledEdges, isRtl);

    case MindMapLayoutType.TIMELINE:
      return layoutTimeline(nodeMap, nodes, styledEdges, isRtl);

    default:
      return layoutDecisionTree(nodeMap, childrenMap, targetRootId, styledEdges, isRtl);
  }
};

/**
 * Radial / Central Mind Map Layout (360 degrees harmonic distribution)
 */
function layoutRadialOrMindMap(
  nodeMap: Map<string, Node>,
  childrenMap: Record<string, string[]>,
  rootId: string,
  edges: Edge[]
): LayoutResult {
  const rootNode = nodeMap.get(rootId);
  if (!rootNode) return { nodes: Array.from(nodeMap.values()), edges };

  rootNode.position = { x: 0, y: 0 };
  const rootChildren = childrenMap[rootId] || [];

  if (rootChildren.length === 0) {
    // If no explicit edges, arrange nodes in a circle around root
    const otherNodes = Array.from(nodeMap.values()).filter(n => n.id !== rootId);
    const count = otherNodes.length;
    const radius = 380;
    otherNodes.forEach((node, idx) => {
      const angle = (2 * Math.PI * idx) / Math.max(1, count);
      node.position = {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius)
      };
    });
    return { nodes: Array.from(nodeMap.values()), edges };
  }

  // Multi-level radial branching
  const levelRadius = [0, 420, 800, 1180, 1560];

  const placeBranches = (
    currentId: string, 
    startAngle: number, 
    endAngle: number, 
    level: number
  ) => {
    const children = childrenMap[currentId] || [];
    if (children.length === 0) return;

    const angleStep = (endAngle - startAngle) / children.length;
    const r = levelRadius[Math.min(level, levelRadius.length - 1)] || (level * 400);

    children.forEach((childId, idx) => {
      const childAngle = startAngle + angleStep * (idx + 0.5);
      const childNode = nodeMap.get(childId);
      if (childNode) {
        childNode.position = {
          x: Math.round(Math.cos(childAngle) * r),
          y: Math.round(Math.sin(childAngle) * r)
        };
        const nextStart = startAngle + angleStep * idx;
        const nextEnd = nextStart + angleStep;
        placeBranches(childId, nextStart, nextEnd, level + 1);
      }
    });
  };

  placeBranches(rootId, 0, 2 * Math.PI, 1);

  return { nodes: Array.from(nodeMap.values()), edges };
}

/**
 * Top-Down Organizational Chart & Vertical Flowchart
 */
function layoutTopDownHierarchy(
  nodeMap: Map<string, Node>,
  childrenMap: Record<string, string[]>,
  rootId: string,
  edges: Edge[]
): LayoutResult {
  const NODE_WIDTH = 340;
  const LEVEL_SPACING = 260;
  const SIBLING_SPACING = 60;

  const subtreeWidths: Record<string, number> = {};

  const computeSubtreeWidth = (id: string): number => {
    const children = childrenMap[id] || [];
    if (children.length === 0) {
      subtreeWidths[id] = NODE_WIDTH;
      return NODE_WIDTH;
    }
    let total = 0;
    children.forEach((childId, idx) => {
      total += computeSubtreeWidth(childId);
      if (idx > 0) total += SIBLING_SPACING;
    });
    subtreeWidths[id] = Math.max(NODE_WIDTH, total);
    return subtreeWidths[id];
  };

  computeSubtreeWidth(rootId);

  const placeNode = (id: string, x: number, y: number) => {
    const node = nodeMap.get(id);
    if (!node) return;

    node.position = { x, y };
    const children = childrenMap[id] || [];
    if (children.length === 0) return;

    const totalWidth = subtreeWidths[id] || NODE_WIDTH;
    let currentX = x - totalWidth / 2;

    children.forEach(childId => {
      const childWidth = subtreeWidths[childId] || NODE_WIDTH;
      const childCenterX = currentX + childWidth / 2;
      placeNode(childId, childCenterX, y + LEVEL_SPACING);
      currentX += childWidth + SIBLING_SPACING;
    });
  };

  placeNode(rootId, 450, 60);

  return { nodes: Array.from(nodeMap.values()), edges };
}

/**
 * Horizontal Flowchart (Process Stages with branching & converging paths)
 */
function layoutFlowchartHorizontal(
  nodeMap: Map<string, Node>,
  childrenMap: Record<string, string[]>,
  rootId: string,
  edges: Edge[],
  isRtl: boolean
): LayoutResult {
  const LEVEL_SPACING = isRtl ? -420 : 420;
  const NODE_HEIGHT = 180;
  const SIBLING_SPACING = 40;

  const subtreeHeights: Record<string, number> = {};

  const computeSubtreeHeight = (id: string): number => {
    const children = childrenMap[id] || [];
    if (children.length === 0) {
      subtreeHeights[id] = NODE_HEIGHT;
      return NODE_HEIGHT;
    }
    let total = 0;
    children.forEach((childId, idx) => {
      total += computeSubtreeHeight(childId);
      if (idx > 0) total += SIBLING_SPACING;
    });
    subtreeHeights[id] = Math.max(NODE_HEIGHT, total);
    return subtreeHeights[id];
  };

  computeSubtreeHeight(rootId);

  const placeNode = (id: string, x: number, y: number) => {
    const node = nodeMap.get(id);
    if (!node) return;

    node.position = { x, y };
    const children = childrenMap[id] || [];
    if (children.length === 0) return;

    const totalHeight = subtreeHeights[id] || NODE_HEIGHT;
    let currentY = y - totalHeight / 2 + NODE_HEIGHT / 2;

    children.forEach(childId => {
      const childHeight = subtreeHeights[childId] || NODE_HEIGHT;
      const childCenterY = currentY + childHeight / 2 - NODE_HEIGHT / 2;
      placeNode(childId, x + LEVEL_SPACING, childCenterY);
      currentY += childHeight + SIBLING_SPACING;
    });
  };

  placeNode(rootId, isRtl ? 950 : 100, 300);

  return { nodes: Array.from(nodeMap.values()), edges };
}

/**
 * Timeline Layout (Sequential Linear Progression with Staggered Top/Bottom Cards)
 */
function layoutTimeline(
  nodeMap: Map<string, Node>,
  allNodes: Node[],
  edges: Edge[],
  isRtl: boolean
): LayoutResult {
  const STEP_SPACING = 400;
  const startX = isRtl ? 1000 : 100;
  const direction = isRtl ? -1 : 1;

  allNodes.forEach((node, index) => {
    const x = startX + index * STEP_SPACING * direction;
    // Stagger alternate nodes top/bottom for clear chronological timeline readability
    const y = index % 2 === 0 ? 110 : 380;
    
    const targetNode = nodeMap.get(node.id);
    if (targetNode) {
      targetNode.position = { x, y };
    }
  });

  return { nodes: Array.from(nodeMap.values()), edges };
}

/**
 * Decision Tree Layout with Condition Branches (Yes / No / Substantive / Formal Defenses)
 */
function layoutDecisionTree(
  nodeMap: Map<string, Node>,
  childrenMap: Record<string, string[]>,
  rootId: string,
  edges: Edge[],
  isRtl: boolean
): LayoutResult {
  const LEVEL_SPACING = isRtl ? -420 : 420;
  const VERTICAL_BRANCH_GAP = 240;

  const placeNode = (id: string, x: number, y: number, depth: number) => {
    const node = nodeMap.get(id);
    if (!node) return;

    node.position = { x, y };
    const children = childrenMap[id] || [];
    if (children.length === 0) return;

    if (children.length === 1) {
      placeNode(children[0], x + LEVEL_SPACING, y, depth + 1);
    } else if (children.length === 2) {
      placeNode(children[0], x + LEVEL_SPACING, y - VERTICAL_BRANCH_GAP / 2, depth + 1);
      placeNode(children[1], x + LEVEL_SPACING, y + VERTICAL_BRANCH_GAP / 2, depth + 1);
    } else {
      const totalSpan = (children.length - 1) * VERTICAL_BRANCH_GAP;
      children.forEach((childId, idx) => {
        const childY = y - totalSpan / 2 + idx * VERTICAL_BRANCH_GAP;
        placeNode(childId, x + LEVEL_SPACING, childY, depth + 1);
      });
    }
  };

  placeNode(rootId, isRtl ? 900 : 100, 320, 0);

  return { nodes: Array.from(nodeMap.values()), edges };
}

