import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import RepositoryInput from "@/components/RepositoryInput";
import ChatInterface from "@/components/ChatInterface";
import NetworkGraph from "@/components/NetworkGraph";
import VisualizationControls from "@/components/VisualizationControls";
import { RepoData, VisualizationType, NodeFilterType } from '@/types';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('network');
  const [nodeFilter, setNodeFilter] = useState<NodeFilterType>('all');
  const { toast } = useToast();

  // Calculate available node types and their counts
  const availableNodeTypes = React.useMemo(() => {
    if (!repoData) {
      return [
        { type: 'file' as NodeFilterType, count: 0 },
        { type: 'class' as NodeFilterType, count: 0 },
        { type: 'function' as NodeFilterType, count: 0 },
        { type: 'module' as NodeFilterType, count: 0 }
      ];
    }

    const typeCounts = repoData.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { type: 'file', count: typeCounts['file'] || 0 },
      { type: 'class', count: typeCounts['class'] || 0 },
      { type: 'function', count: typeCounts['function'] || 0 },
      { type: 'module', count: typeCounts['module'] || 0 }
    ];
  }, [repoData]);

  const handleRepoAnalyzed = (data: RepoData) => {
    setRepoData(data);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        {!repoData ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-ubs-blue">Talk2Code</h1>
            <p className="text-center mb-8 text-gray-600">
              Explore your codebase through visualization and conversation
            </p>
            <RepositoryInput onRepoAnalyzed={handleRepoAnalyzed} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-ubs-blue mb-2">
                  Repository: {repoData.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {repoData.nodes.length} nodes and {repoData.links.length} connections
                </p>
              </div>
              
              <div className="h-[500px]">
                <NetworkGraph 
                  repoData={repoData} 
                  visualizationType={visualizationType} 
                  nodeFilter={nodeFilter} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <VisualizationControls 
                    visualizationType={visualizationType}
                    setVisualizationType={setVisualizationType}
                    nodeFilter={nodeFilter}
                    setNodeFilter={setNodeFilter}
                    availableNodeTypes={availableNodeTypes}
                  />
                </div>
                <div className="md:col-span-3">
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="font-semibold mb-2 text-ubs-blue">Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#1f77b4] mr-2"></div>
                        <span className="text-sm">Files</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#ff7f0e] mr-2"></div>
                        <span className="text-sm">Classes</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#2ca02c] mr-2"></div>
                        <span className="text-sm">Functions</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#d62728] mr-2"></div>
                        <span className="text-sm">Modules</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-[calc(100vh-180px)]">
              <ChatInterface repoData={repoData} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-ubs-blue text-white py-4 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; {new Date().getFullYear()} Talk2Code. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm hover:underline">Documentation</a>
              <a href="#" className="text-sm hover:underline">GitHub</a>
              <a href="#" className="text-sm hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
