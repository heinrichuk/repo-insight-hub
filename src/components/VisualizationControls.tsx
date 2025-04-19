
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  VisualizationType, 
  NodeFilterType 
} from '@/types';

interface VisualizationControlsProps {
  visualizationType: VisualizationType;
  setVisualizationType: (type: VisualizationType) => void;
  nodeFilter: NodeFilterType;
  setNodeFilter: (filter: NodeFilterType) => void;
  availableNodeTypes: { type: NodeFilterType; count: number }[];
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  visualizationType,
  setVisualizationType,
  nodeFilter,
  setNodeFilter,
  availableNodeTypes
}) => {
  return (
    <Card className="shadow-lg border-2 border-ubs-gray">
      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-ubs-blue">Visualization Type</h3>
          <RadioGroup
            value={visualizationType}
            onValueChange={(val) => setVisualizationType(val as VisualizationType)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="network" id="network" />
              <Label htmlFor="network" className="cursor-pointer">Network Graph</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hierarchical" id="hierarchical" />
              <Label htmlFor="hierarchical" className="cursor-pointer">Hierarchical Edge Bundling</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="arc" id="arc" />
              <Label htmlFor="arc" className="cursor-pointer">Arc Diagram</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-ubs-blue">Filter Nodes</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="all" 
                checked={nodeFilter === 'all'} 
                onCheckedChange={() => setNodeFilter('all')} 
              />
              <Label htmlFor="all" className="cursor-pointer">All</Label>
            </div>
            
            {availableNodeTypes
              .filter(item => item.type !== 'all')
              .map(item => (
                <div key={item.type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.type} 
                    checked={nodeFilter === item.type} 
                    onCheckedChange={() => setNodeFilter(item.type)}
                    disabled={item.count === 0}
                  />
                  <Label 
                    htmlFor={item.type} 
                    className={`cursor-pointer ${item.count === 0 ? 'text-gray-400' : ''}`}
                  >
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}s 
                    <span className="text-xs text-gray-500 ml-1">({item.count})</span>
                  </Label>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualizationControls;
