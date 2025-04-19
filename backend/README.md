
# Talk2Code Backend

This is the backend service for Talk2Code, a tool that helps you visualize and chat with your codebase.

## Setup

1. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables for Azure OpenAI:
   ```
   export AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
   export AZURE_OPENAI_API_KEY="your-api-key"
   export AZURE_OPENAI_DEPLOYMENT="your-deployment-name"
   ```

3. Run the server:
   ```
   uvicorn main:app --reload
   ```
   
   The server will start on http://localhost:8000

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of the service.

### Chat with Repository
```
POST /chat
```
Send a query about the repository and get an AI-generated response.

Example request:
```json
{
  "query": "How does the auth system work?",
  "repo_data": {
    "name": "My Repository",
    "nodes": [...],
    "links": [...]
  }
}
```

### Analyze Repository
```
POST /analyze-repo
```
Analyze a repository from a GitHub URL or uploaded ZIP file.

For GitHub URL:
```json
{
  "url": "https://github.com/username/repo"
}
```

For ZIP file:
- Send as multipart/form-data with a field named "file"
