
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
import json
from azure.identity import DefaultAzureCredential, AzureCliCredential
from azure.ai.generative.client import GenerativeClient

app = FastAPI()

# CORS configuration to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Azure OpenAI Configuration
AZURE_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AZURE_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY")
AZURE_DEPLOYMENT = os.environ.get("AZURE_OPENAI_DEPLOYMENT")

class ChatRequest(BaseModel):
    query: str
    repo_data: Dict

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Talk2Code Backend"}

@app.post("/chat")
async def chat_with_repo(request: ChatRequest):
    try:
        # Validate inputs
        if not AZURE_ENDPOINT or not AZURE_API_KEY or not AZURE_DEPLOYMENT:
            raise HTTPException(status_code=500, detail="Azure OpenAI configuration missing")

        # Prepare node and link information for context
        nodes_info = []
        for node in request.repo_data.get("nodes", []):
            nodes_info.append(f"- {node['name']} (Type: {node['type']})")
            
        links_info = []
        for link in request.repo_data.get("links", []):
            links_info.append(f"- {link['source']['name']} connects to {link['target']['name']}")

        # Prepare the chat context
        context = f"""
        You are analyzing a code repository with the following structure:
        
        Repository Name: {request.repo_data.get('name', 'Unknown Repository')}
        
        Nodes ({len(request.repo_data.get('nodes', []))}):
        {chr(10).join(nodes_info[:20])}
        {f"...and {len(nodes_info) - 20} more" if len(nodes_info) > 20 else ""}
        
        Connections ({len(request.repo_data.get('links', []))}):
        {chr(10).join(links_info[:15])}
        {f"...and {len(links_info) - 15} more" if len(links_info) > 15 else ""}
        """

        # Initialize the Azure OpenAI client
        if AZURE_API_KEY:
            # Using API key authentication
            client = GenerativeClient(
                endpoint=AZURE_ENDPOINT,
                api_key=AZURE_API_KEY
            )
        else:
            # Using DefaultAzureCredential (for managed identities, etc.)
            credential = DefaultAzureCredential()
            client = GenerativeClient(endpoint=AZURE_ENDPOINT, credential=credential)
        
        # Build the messages for the chat completion
        messages = [
            {"role": "system", "content": context},
            {"role": "user", "content": request.query}
        ]

        # Call Azure OpenAI
        chat_completion = client.chat.completions.create(
            model=AZURE_DEPLOYMENT,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )

        # Extract the response
        if chat_completion and chat_completion.choices:
            response = chat_completion.choices[0].message.content
        else:
            response = "I couldn't analyze the repository. Please try again with a different query."

        return {"response": response}

    except Exception as e:
        print(f"Error in chat_with_repo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/analyze-repo")
async def analyze_repo(request: Request):
    """
    This endpoint will eventually analyze a GitHub repository URL or uploaded zip file.
    Currently returns a simple response.
    """
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request (GitHub URL)
            data = await request.json()
            repo_url = data.get("url")
            if not repo_url:
                raise HTTPException(status_code=400, detail="Repository URL is required")
                
            # For now, return mock data
            return {
                "name": f"Analysis of {repo_url.split('/')[-1]}",
                "nodes": [
                    {"id": "1", "name": "index.js", "type": "file", "index": 0},
                    {"id": "2", "name": "App", "type": "class", "index": 1},
                    {"id": "3", "name": "components/", "type": "module", "index": 2}
                ],
                "links": [
                    {"source": {"id": "1", "name": "index.js", "type": "file", "index": 0}, 
                     "target": {"id": "2", "name": "App", "type": "class", "index": 1}, 
                     "value": 1, "index": 0}
                ]
            }
        
        elif "multipart/form-data" in content_type:
            # Handle form data (zip file)
            # This will be implemented later
            return {
                "name": "Uploaded Repository",
                "nodes": [
                    {"id": "1", "name": "main.py", "type": "file", "index": 0},
                    {"id": "2", "name": "utils.py", "type": "file", "index": 1}
                ],
                "links": [
                    {"source": {"id": "1", "name": "main.py", "type": "file", "index": 0}, 
                     "target": {"id": "2", "name": "utils.py", "type": "file", "index": 1}, 
                     "value": 1, "index": 0}
                ]
            }
        
        else:
            raise HTTPException(status_code=415, detail="Unsupported media type")
            
    except Exception as e:
        print(f"Error analyzing repo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing repository: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
