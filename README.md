# 🤖 LangChain Agent API

This project is an AI Agent API built using LangChain and OpenAI.  
The agent can work with various tools and keeps chat history with users.

## ✨ Features

- 🧠 Works with **OpenAI GPT models**
- 🔧 **Tool system** – perform different tasks
- 💾 Stores chat history via **Redis**
- 🌐 **RESTful API** for easy integration
- 🏗️ **Clean Architecture** – clear and extensible code
- 📊 **Token usage tracking** – monitor costs

## 🛠️ Available Tools

1. **⏰ Time Tool** – get the current time  
2. **🔍 ChromaDB Search** – semantic search in PDF documents  
3. **🌐 DuckDuckGo Search** – internet search  
4. **📚 Wikipedia Search** – search on Wikipedia  
5. **📡 Web Scraper** – fetch data from URLs  
6. **🧮 Calculator** – perform mathematical operations  

## 🚀 Installation & Running

### Requirements

- Node.js 18+
- Redis server
- OpenAI API key

### 1. Clone the repository

```bash
git clone <repository-url>
cd langchain-agent-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add the following:

```env
# Basic settings
PORT=3000
NODE_ENV=development

# API keys
OPENAI_API_KEY="your-openai-api-key"

# Redis
REDIS_URL=redis://localhost:6379

# Agent settings
CHAT_HISTORY_TTL=604800
MODEL=gpt-4o-mini-2024-07-18
TEMPERATURE=0.7
```

### 4. Start Redis

```bash
# With Docker
docker run -d -p 6379:6379 redis:alpine

# Or locally
redis-server
```

### 5. Run the project

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Or with production environment
npm run start:prod
```

### 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t langchain-agent-api .

# Run with Docker
docker run -p 3000:3000 --env-file .env langchain-agent-api

# Or use Docker Compose
docker-compose up -d
```

## 📋 API Endpoints

### Chat Endpoints

#### Simple Chat
```http
POST /ai/chat-with-memory/chat
Content-Type: application/json

{
  "userId": "user123",
  "input": "Hello, how can I help you?"
}
```

#### Chat with Agent (with Tools)
```http
POST /ai/chat-with-memory/agent
Content-Type: application/json

{
  "userId": "user123",
  "input": "Tell me today’s weather",
  "agentType": "openai_tools",
  "enabledTools": ["duckduckgo_search", "get_current_time"]
}
```

### Tool Management

#### List all tools
```http
GET /ai/chat-with-memory/tools
```

#### Enable/Disable a tool
```http
PUT /ai/chat-with-memory/tools/duckduckgo_search
Content-Type: application/json

{
  "enabled": true
}
```

### History Management

#### Clear user history
```http
DELETE /ai/chat-with-memory/history/user123
```

## 🏗️ Project Structure

```
src/
├── agents/                     # Agents and tools
│   ├── tools/                  # Tool system
│   │   ├── base/               # Core interfaces
│   │   ├── implementations/    # Tool implementations
│   │   └── tool-registry.ts    # Tool registry
│   └── chat-with-memory/       # Chat agent
│       ├── controllers/        # HTTP controllers
│       ├── services/           # Business logic
│       ├── routes/             # API routes
│       ├── dto/                # Data transfer objects
│       └── storage/            # Data storage
├── common/                     # Common utilities
├── config/                     # Configuration
├── v1/                         # API version
├── app.ts                      # Express application
├── server.ts                   # Server entry point
└── index.ts                    # Main file
```

## 🔧 Creating a Tool

To create a new tool:

1. Create a new file in `src/agents/tools/implementations/`  
2. Implement the `IToolService` interface  
3. Register it in `ToolRegistry`  

Example:

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { IToolService } from "../base/tool.interface.js";

export class MyCustomToolService implements IToolService {
  readonly name = "my_custom_tool";
  readonly description = "My custom tool";

  createTool() {
    return tool(
      async (input: { param: string }): Promise<string> => {
        // Tool logic
        return `Result: ${input.param}`;
      },
      {
        name: this.name,
        description: this.description,
        schema: z.object({
          param: z.string()
        }),
      }
    );
  }
}
```

## 🐛 Debugging & Monitoring

### Logs

The project provides debug information via console logs:

- 🚀 Server status  
- 🤖 Agent requests  
- 🔧 Tool activity  
- 📊 Token statistics  
- ❌ Errors  

### Environment Variables

Extra debugging options:

```env
AGENT_VERBOSE=true          # Agent debug logs
NODE_ENV=development        # Development mode
```

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/new-feature`)  
3. Commit your changes (`git commit -am 'Added new feature'`)  
4. Push the branch (`git push origin feature/new-feature`)  
5. Open a Pull Request  

## 📄 License

This project is distributed under the MIT License.

## 🆘 Help

If you have questions or need help:

1. Create an issue on GitHub  
2. Carefully read the documentation  
3. Check the logs  

---

**Happy coding! 🎉**
