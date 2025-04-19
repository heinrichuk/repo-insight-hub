
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
from azure.identity import DefaultAzureCredential
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

@app.post("/chat")
async def chat_with_repo(request: ChatRequest):
    try:
        # Validate inputs
        if not AZURE_ENDPOINT or not AZURE_API_KEY or not AZURE_DEPLOYMENT:
            raise HTTPException(status_code=500, detail="Azure OpenAI configuration missing")

        # Prepare the chat context
        context = f"""
        Repository Name: {request.repo_data.get('name', 'Unknown Repository')}
        Total Nodes: {len(request.repo_data.get('nodes', []))}
        Total Links: {len(request.repo_data.get('links', []))}
        """

        # Prepare the full prompt
        full_prompt = f"{context}\n\nUser Query: {request.query}\n\nProvide a comprehensive and helpful answer based on the repository context."

        # In a real-world scenario, you'd use Azure OpenAI's chat completion
        # For now, we'll simulate a response
        response = f"Analyzing repository for query: {request.query}. Context includes {len(request.repo_data.get('nodes', []))} nodes."

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
