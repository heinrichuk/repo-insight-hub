
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { analyzeRepo, uploadRepoZip } from '@/services/apiService';
import { RepoData } from '@/types';
import { toast } from 'sonner';

interface RepositoryInputProps {
  onRepoAnalyzed: (data: RepoData) => void;
}

const RepositoryInput: React.FC<RepositoryInputProps> = ({ onRepoAnalyzed }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    try {
      const data = await analyzeRepo(repoUrl);
      onRepoAnalyzed(data);
      toast.success('Repository analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze repository. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      toast.error('Please upload a ZIP file');
      return;
    }

    setIsLoading(true);
    try {
      const data = await uploadRepoZip(file);
      onRepoAnalyzed(data);
      toast.success('Repository analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze repository. Please check the file and try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="shadow-lg border-2 border-ubs-gray animate-fade-in">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-ubs-blue">Repository Input</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Option 1: GitHub URL</h3>
            <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-ubs-blue hover:bg-ubs-lightblue"
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-ubs-darkgray">Or</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Option 2: Upload ZIP</h3>
            <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md border-gray-300 bg-gray-50">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-500">
                  {isLoading ? 'Uploading...' : 'Click to upload ZIP file'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepositoryInput;
