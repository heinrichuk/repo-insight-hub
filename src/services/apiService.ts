
import { RepoData } from '@/types';

const API_BASE_URL = 'http://localhost:8000';

export async function analyzeRepo(repoUrl: string): Promise<RepoData> {
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
    throw error;
  }
}

export async function uploadRepoZip(file: File): Promise<RepoData> {
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
    throw error;
  }
}

export async function askQuestion(query: string, repoData: RepoData): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, repoData }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to get answer:', error);
    throw error;
  }
}
