
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  forceSimulation, 
  forceLink, 
  forceManyBody, 
  forceCenter,
  select,
  hierarchy,
  cluster,
  line,
  curveBundle,
  scaleOrdinal,
  schemeCategory10,
  drag,
  arc,
  pie
} from 'd3';
import { RepoData, Node, Link, VisualizationType, NodeFilterType } from '@/types';

interface NetworkGraphProps {
  repoData: RepoData | null;
  visualizationType: VisualizationType;
  nodeFilter: NodeFilterType;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ repoData, visualizationType, nodeFilter }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter nodes based on nodeFilter
  const getFilteredData = () => {
    if (!repoData) return { nodes: [], links: [] };
    
    if (nodeFilter === 'all') {
      return repoData;
    }
    
    const filteredNodes = repoData.nodes.filter(node => node.type === nodeFilter);
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    
    const filteredLinks = repoData.links.filter(
      link => nodeIds.has(link.source.id) && nodeIds.has(link.target.id)
    );
    
    return { nodes: filteredNodes, links: filteredLinks };
  };

  useEffect(() => {
    if (!repoData || !svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const filteredData = getFilteredData();
    const colorScale = scaleOrdinal(schemeCategory10);

    switch (visualizationType) {
      case 'network':
        renderNetworkGraph(svg, filteredData, width, height, colorScale);
        break;
      case 'hierarchical':
        renderHierarchicalBundling(svg, filteredData, width, height, colorScale);
        break;
      case 'arc':
        renderArcDiagram(svg, filteredData, width, height, colorScale);
        break;
      default:
        break;
    }
  }, [repoData, dimensions, visualizationType, nodeFilter]);

  const renderNetworkGraph = (svg: any, data: any, width: number, height: number, colorScale: any) => {
    const g = svg.append('g');

    // Add zoom functionality
    svg.call(
      drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
    );

    function dragStarted(event: any) {
      g.raise();
      g.attr('cursor', 'grabbing');
    }

    function dragged(event: any) {
      g.attr('transform', `translate(${event.x}, ${event.y})`);
    }

    function dragEnded(event: any) {
      g.attr('cursor', 'grab');
    }

    // Create links
    const links = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-width', (d: Link) => Math.sqrt(d.value));

    // Create nodes
    const nodes = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 8)
      .attr('fill', (d: Node) => colorScale(d.type))
      .call(
        drag()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add labels to nodes
    const labels = g
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .text((d: Node) => d.name)
      .attr('font-size', '10px')
      .attr('dx', 12)
      .attr('dy', 4);

    // Add tooltips
    nodes.append('title').text((d: Node) => `${d.name} (${d.type})`);

    // Create force simulation
    const simulation = forceSimulation(data.nodes)
      .force(
        'link',
        forceLink(data.links).id((d: any) => d.id).distance(100)
      )
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2));

    // Update positions on tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodes.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

      labels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });
  };

  const renderHierarchicalBundling = (svg: any, data: any, width: number, height: number, colorScale: any) => {
    const diameter = Math.min(width, height);
    const radius = diameter / 2;
    const innerRadius = radius - 120;

    // Define line curve generator first
    const lineGenerator = line()
      .curve(curveBundle.beta(0.85))
      .x((d: any) => d.x = Math.cos(d.x * Math.PI / 180) * d.y)
      .y((d: any) => d.y = Math.sin(d.x * Math.PI / 180) * d.y);

    // Convert the flat node data to a hierarchical structure
    // This is a simplified conversion for demonstration
    const root = hierarchy({
      name: 'root',
      children: data.nodes.map((node: Node) => ({ 
        name: node.name, 
        type: node.type,
        id: node.id,
        imports: data.links
          .filter((link: Link) => link.source.id === node.id)
          .map((link: Link) => link.target.id)
      }))
    });

    // Use cluster layout
    const clusterLayout = cluster()
      .size([360, innerRadius]);
    
    clusterLayout(root);

    // Create group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Add links
    const linkData: any[] = [];
    root.leaves().forEach((leaf: any) => {
      if (leaf.data.imports) {
        leaf.data.imports.forEach((importId: string) => {
          const target = root.leaves().find(d => d.data.id === importId);
          if (target) {
            linkData.push({
              source: leaf,
              target: target
            });
          }
        });
      }
    });

    g.selectAll('.link')
      .data(linkData)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => lineGenerator([d.source, d.target]))
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .attr('fill', 'none');

    // Add nodes
    const node = g.selectAll('.node')
      .data(root.leaves())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `rotate(${d.x - 90}) translate(${d.y}, 0) rotate(${90 - d.x})`)
      .attr('fill', (d: any) => colorScale(d.data.type));

    node.append('circle')
      .attr('r', 5);

    node.append('text')
      .attr('dy', '.31em')
      .attr('x', (d: any) => d.x < 180 ? 8 : -8)
      .style('text-anchor', (d: any) => d.x < 180 ? 'start' : 'end')
      .attr('transform', (d: any) => d.x < 180 ? null : 'rotate(180)')
      .text((d: any) => d.data.name)
      .attr('font-size', '10px');
  };

  const renderArcDiagram = (svg: any, data: any, width: number, height: number, colorScale: any) => {
    // Create a linear layout for nodes along the x-axis
    const nodePositions = new Map();
    const padding = 20;
    const availableWidth = width - padding * 2;
    const step = availableWidth / (data.nodes.length - 1 || 1);
    
    data.nodes.forEach((node: Node, i: number) => {
      nodePositions.set(node.id, {
        x: padding + i * step,
        y: height / 2
      });
    });

    // Calculate arc paths for links
    const arcGenerator = arc()
      .innerRadius(0)
      .outerRadius((d: any) => {
        const sourcePos = nodePositions.get(d.source.id);
        const targetPos = nodePositions.get(d.target.id);
        return Math.abs(targetPos.x - sourcePos.x) / 2;
      })
      .startAngle(0)
      .endAngle(Math.PI);

    // Draw links as arcs
    svg.append('g')
      .selectAll('path')
      .data(data.links)
      .enter()
      .append('path')
      .attr('d', (d: any) => {
        const sourcePos = nodePositions.get(d.source.id);
        const targetPos = nodePositions.get(d.target.id);
        const midX = (sourcePos.x + targetPos.x) / 2;
        
        // Calculate height of the arc based on distance
        const distance = Math.abs(targetPos.x - sourcePos.x);
        const arcHeight = distance * 0.3;
        
        // Draw a quadratic curve
        return `M ${sourcePos.x} ${sourcePos.y} 
                Q ${midX} ${sourcePos.y - arcHeight} ${targetPos.x} ${targetPos.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    // Draw nodes
    const nodes = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => nodePositions.get(d.id).x)
      .attr('cy', (d: any) => nodePositions.get(d.id).y)
      .attr('r', 6)
      .attr('fill', (d: any) => colorScale(d.type));

    // Add labels for nodes
    svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('x', (d: any) => nodePositions.get(d.id).x)
      .attr('y', (d: any) => nodePositions.get(d.id).y + 20)
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px');
  };

  return (
    <Card className="h-full shadow-lg border-2 border-ubs-gray" ref={containerRef}>
      <CardContent className="p-0 h-full">
        {repoData ? (
          <div className="w-full h-full network-graph">
            <svg ref={svgRef} width="100%" height="100%"></svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Please load a repository to visualize its structure
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkGraph;
