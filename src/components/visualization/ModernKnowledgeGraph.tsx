'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Filter, Network } from 'lucide-react';
import { motion } from 'framer-motion';

interface GraphNode {
  id: string;
  type: string;
  description?: string;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface ModernKnowledgeGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
}

export function ModernKnowledgeGraph({ data, onNodeClick }: ModernKnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Create zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior as any);

    // Create main container
    const container = svg.append("g");

    // Create gradient definitions
    const defs = svg.append("defs");

    // Create gradients for different node types
    const gradients = {
      Concept: { from: "#3b82f6", to: "#60a5fa" },
      Technology: { from: "#10b981", to: "#34d399" },
      Application: { from: "#f59e0b", to: "#fbbf24" },
      Algorithm: { from: "#ef4444", to: "#f87171" },
      default: { from: "#6b7280", to: "#9ca3af" }
    };

    Object.entries(gradients).forEach(([type, colors]) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${type}`)
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "100%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colors.from);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colors.to);
    });

    // Create shadow filter
    const filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");

    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("result", "offsetBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create links
    const link = container.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create link labels
    const linkLabel = container.append("g")
      .selectAll("text")
      .data(data.links)
      .join("text")
      .text(d => d.type)
      .attr("font-size", 10)
      .attr("fill", "#6b7280")
      .attr("text-anchor", "middle")
      .attr("dy", -5);

    // Create nodes container
    const nodeGroup = container.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add node circles
    nodeGroup.append("circle")
      .attr("r", 24)
      .attr("fill", d => `url(#gradient-${d.type || 'default'})`)
      .attr("filter", "url(#drop-shadow)")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3);

    // Add node icons based on type
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#ffffff")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(d => {
        switch (d.type) {
          case 'Concept': return '概';
          case 'Technology': return '技';
          case 'Application': return '应';
          case 'Algorithm': return '算';
          default: return '知';
        }
      });

    // Add node labels
    nodeGroup.append("text")
      .text(d => d.id)
      .attr("font-size", 12)
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#374151");

    // Add hover effect
    nodeGroup
      .on("mouseover", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 28);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 24);
      })
      .on("click", (event, d) => {
        setSelectedNode(d as GraphNode);
        if (onNodeClick) {
          onNodeClick(d as GraphNode);
        }
      });

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      linkLabel
        .attr("x", d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", d => ((d.source as any).y + (d.target as any).y) / 2);

      nodeGroup.attr("transform", d => `translate(${(d as any).x},${(d as any).y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height: width * 0.75 });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom().scaleTo as any,
        zoom * 1.3
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom().scaleTo as any,
        zoom * 0.7
      );
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom().transform as any,
        d3.zoomIdentity
      );
      setSelectedNode(null);
    }
  };

  return (
    <div className="relative">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height={dimensions.height}
          className="bg-gradient-to-br from-gray-50 to-gray-100"
        />

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedNode.id}</h3>
                <p className="text-sm text-gray-500">类型: {selectedNode.type}</p>
                {selectedNode.description && (
                  <p className="mt-2 text-sm text-gray-600">{selectedNode.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="ml-4"
              >
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {[
          { type: 'Concept', colors: { from: '#3b82f6', to: '#60a5fa' }},
          { type: 'Technology', colors: { from: '#10b981', to: '#34d399' }},
          { type: 'Application', colors: { from: '#f59e0b', to: '#fbbf24' }},
          { type: 'Algorithm', colors: { from: '#ef4444', to: '#f87171' }}
        ].map(({ type, colors }) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ background: `linear-gradient(to right, ${colors.from}, ${colors.to})` }}
            />
            <span className="text-sm text-gray-600">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
