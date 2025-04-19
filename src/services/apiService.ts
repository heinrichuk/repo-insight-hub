
import { RepoData } from '@/types';

const API_BASE_URL = 'http://localhost:8000';

// Sample mock data when the actual API isn't available
const mockRepoData: RepoData = {
  name: "Sample Repository",
  nodes: [
    { id: "1", name: "index.js", type: "file", index: 0 },
    { id: "2", name: "App", type: "class", index: 1 },
    { id: "3", name: "renderComponent", type: "function", index: 2 },
    { id: "4", name: "utils", type: "module", index: 3 },
    { id: "5", name: "components", type: "module", index: 4 },
    { id: "6", name: "styles.css", type: "file", index: 5 },
    { id: "7", name: "api.js", type: "file", index: 6 },
    { id: "8", name: "Button", type: "class", index: 7 },
    { id: "9", name: "fetchData", type: "function", index: 8 }
  ],
  links: [
    { source: { id: "1", name: "index.js", type: "file", index: 0 }, target: { id: "2", name: "App", type: "class", index: 1 }, value: 1, index: 0 },
    { source: { id: "2", name: "App", type: "class", index: 1 }, target: { id: "3", name: "renderComponent", type: "function", index: 2 }, value: 1, index: 1 },
    { source: { id: "1", name: "index.js", type: "file", index: 0 }, target: { id: "4", name: "utils", type: "module", index: 3 }, value: 1, index: 2 },
    { source: { id: "4", name: "utils", type: "module", index: 3 }, target: { id: "9", name: "fetchData", type: "function", index: 8 }, value: 1, index: 3 },
    { source: { id: "2", name: "App", type: "class", index: 1 }, target: { id: "5", name: "components", type: "module", index: 4 }, value: 1, index: 4 },
    { source: { id: "5", name: "components", type: "module", index: 4 }, target: { id: "8", name: "Button", type: "class", index: 7 }, value: 1, index: 5 },
    { source: { id: "2", name: "App", type: "class", index: 1 }, target: { id: "6", name: "styles.css", type: "file", index: 5 }, value: 1, index: 6 },
    { source: { id: "7", name: "api.js", type: "file", index: 6 }, target: { id: "9", name: "fetchData", type: "function", index: 8 }, value: 1, index: 7 }
  ]
};

// Check if the API is actually available
let backendAvailable = false;

// Function to check if the backend is available
export async function checkBackendAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    backendAvailable = response.ok;
    console.log(`Backend is ${backendAvailable ? 'available' : 'not available'}`);
    return backendAvailable;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    backendAvailable = false;
    return false;
  }
}

// Call this once when the application starts
checkBackendAvailability();

export async function analyzeRepo(repoUrl: string): Promise<RepoData> {
  if (!backendAvailable) {
    console.log('Using mock data (backend unavailable)');
    // Return mock data after a small delay to simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ...mockRepoData,
          name: `Sample of ${repoUrl.split('/').pop() || 'Repository'}`
        });
      }, 1500);
    });
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-repo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: repoUrl }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to analyze repository:', error);
    // Fallback to mock data if the API call fails
    return {
      ...mockRepoData,
      name: `Sample of ${repoUrl.split('/').pop() || 'Repository'} (Fallback)`
    };
  }
}

export async function uploadRepoZip(file: File): Promise<RepoData> {
  if (!backendAvailable) {
    console.log('Using mock data (backend unavailable)');
    // Return mock data after a small delay to simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ...mockRepoData,
          name: `Uploaded ${file.name.replace('.zip', '')}`
        });
      }, 1500);
    });
  }
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/analyze-repo`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to upload repository:', error);
    // Fallback to mock data if the API call fails
    return {
      ...mockRepoData,
      name: `Uploaded ${file.name.replace('.zip', '')} (Fallback)`
    };
  }
}

export async function askQuestion(query: string, repoData: RepoData): Promise<string> {
  if (!backendAvailable) {
    console.log('Using mock data (backend unavailable)');
    // Return a mock response based on the query
    return new Promise(resolve => {
      setTimeout(() => {
        const responses = [
          `I've analyzed the repository and found that ${query} relates to several components in the codebase.`,
          `Based on the repository structure, ${query} appears to be implemented in the main module.`,
          `The repository contains code related to ${query} in the file structure.`,
          `Looking at the codebase, I can see that ${query} is connected to multiple functions.`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        resolve(randomResponse);
      }, 2000);
    });
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, repo_data: repoData }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to get answer:', error);
    // Fallback to a generic response if the API call fails
    return `I'm having trouble analyzing your query about "${query}". The backend service might be unavailable. Please try again later.`;
  }
}
