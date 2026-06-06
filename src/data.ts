import { FileTemplate, ChecklistItem, ArchitectureNode } from "./types";

export const BOILERPLATE_FILES: FileTemplate[] = [
  {
    id: "devcontainer",
    path: ".devcontainer/devcontainer.json",
    description: "Configures the cloud development container inside GitHub Codespaces",
    category: "codespace",
    language: "json",
    content: `{
  "name": "N2S Hyperspace Dev Container",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "cnanderson.vscode-vercel"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  },
  "postCreateCommand": "npm install",
  "forwardPorts": [3000]
}`
  },
  {
    id: "package-json",
    path: "package.json",
    description: "Project metadata, scripts, and dependencies for N2S + Vercel deployment",
    category: "config",
    language: "json",
    content: `{
  "name": "test-hyperspace",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "build": "vite build",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "lucide-react": "^0.300.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vercel": "^32.5.0"
  }
}`
  },
  {
    id: "vercel-json",
    path: "vercel.json",
    description: "Crucial routing configuration mapping serverless endpoints to static assets on Vercel",
    category: "config",
    language: "json",
    content: `{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate"
      }
    }
  ]
}`
  },
  {
    id: "api-hello",
    path: "api/hello.ts",
    description: "A fast, lightweight serverless API endpoint deployed on the Vercel Edge network",
    category: "api",
    language: "typescript",
    content: `import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { name = "Hyperspace Traveler" } = request.query;
  
  return response.status(200).json({
    status: "success",
    message: \`Welcome to Hyperspace, \${name}!\`,
    framework: "N2S (Node to Serverless)",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
}`
  },
  {
    id: "index-html",
    path: "index.html",
    description: "Main HTML entry point for the frontend single page app built using Vite",
    category: "page",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test Hyperspace | N2S</title>
    <style>
      body {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        background: #090d16;
        color: #f1f5f9;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }
      .card {
        padding: 2.5rem;
        background: #111827;
        border-radius: 12px;
        border: 1px solid #1e293b;
        text-align: center;
        max-width: 450px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      }
      h1 { color: #38bdf8; margin-top: 0; }
      p { color: #94a3b8; line-height: 1.5; }
      .tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #1e1b4b;
        color: #818cf8;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 1rem;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="tag">N2S Framework</div>
      <h1>Test Hyperspace is Online</h1>
      <p>This page was served statically, and your backend handles serverless computation seamlessly on Vercel edge functions.</p>
    </div>
  </body>
</html>`
  },
  {
    id: "readme",
    path: "README.md",
    description: "Detailed walkthrough for syncing, developer commands, and continuous deployment workflows",
    category: "readme",
    language: "markdown",
    content: `# Test Hyperspace 🌌

This project is configured with the N2S (Node to Serverless) framework, designed for seamless development in GitHub Codespaces and direct deployment onto Vercel.

## 🚀 Getting Started

### 1. Run in GitHub Codespaces
1. Open this repository in a Codespace container.
2. The preconfigured \`.devcontainer\` automatically sets up Node.js and installs dependencies.
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### 2. Live API Testing
- The API is available locally at \`http://localhost:3000/api/hello?name=Traveler\`
- This endpoint runs serverless on Vercel without requiring a dedicated server package!

## 📦 Project Structures
- \`/api\`: Dynamic serverless endpoints mapping to Vercel Edge/Serverless runtimes.
- \`index.html\`: Fast, static responsive UI entry point.
- \`vercel.json\`: Essential router declaring routing redirects and output formats.
`
  }
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: "step-repo",
    step: "Step 1",
    title: "Verify Test_hyperspace GitHub Repo",
    description: "Ensure your repository `Test_hyperspace` is set up on your GitHub account. This repo will act as the source of truth for your Codespace workspace and Vercel CD integration.",
    isCompleted: true
  },
  {
    id: "step-codespaces",
    step: "Step 2",
    title: "Initialize GitHub Codespaces",
    description: "Click the 'Code' dropdown in your Git repository, select the 'Codespaces' tab, and create a new master/main Codespace. This boots a high-speed cloud sandbox container.",
    isCompleted: false
  },
  {
    id: "step-files",
    step: "Step 3",
    title: "Apply Framework Scaffolding",
    description: "Copy and place the generated configs (like `vercel.json` and `.devcontainer.json`) into your Codespace file system. Push them to the primary GitHub branch.",
    isCompleted: false
  },
  {
    id: "step-dependencies",
    step: "Step 4",
    title: "Install Node Dependencies",
    description: "Inside the Codespace terminal, run `npm install` to secure packages, or let the devcontainer feature install them automatically on boot.",
    isCompleted: false
  },
  {
    id: "step-vercel-link",
    step: "Step 5",
    title: "Link GitHub to Vercel account",
    description: "Navigate to your Vercel dashboard, click 'Add New Project', choose 'Import from Git', and select your `Test_hyperspace` repository. This syncs commit events.",
    isCompleted: false
  },
  {
    id: "step-deploy",
    step: "Step 6",
    title: "Auto-Deploy to Serverless Edge",
    description: "Every git push to `main` will trigger a Vercel compilation. The static views and dynamic Edge APIs are built inside serverless VMs instantly.",
    isCompleted: false
  }
];

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: "node-codespaces",
    label: "Codespaces Cloud IDE",
    description: "Provides full-featured in-browser Terminal and VSCode compilation matching identical container states.",
    status: "active"
  },
  {
    id: "node-github",
    label: "Test_hyperspace Repo",
    description: "Houses core scripts and triggers Vercel webhooks upon code commits.",
    status: "ready"
  },
  {
    id: "node-n2s",
    label: "N2S Serverless Config",
    description: "Splits server APIs and client-side builds dynamically via Vercel configurations.",
    status: "ready"
  },
  {
    id: "node-vercel",
    label: "Vercel Edge Deploy",
    description: "Hosts client static assets and provisions low-latency serverless api instances globally.",
    status: "pending"
  }
];
