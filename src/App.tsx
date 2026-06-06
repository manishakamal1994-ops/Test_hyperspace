import { useState, useRef, useEffect } from "react";
import {
  Terminal,
  Grid,
  Github,
  ChevronRight,
  Copy,
  Check,
  Settings,
  BookOpen,
  Cpu,
  Layers,
  ExternalLink,
  Send,
  HelpCircle,
  RefreshCw,
  Sliders,
  Sparkles,
  Code2,
  Cloud,
  FileCode,
  Globe,
  Monitor,
  User,
  ArrowRight
} from "lucide-react";
import { BOILERPLATE_FILES, INITIAL_CHECKLIST, ARCHITECTURE_NODES } from "./data";
import { FileTemplate, ChecklistItem, ChatMessage, ArchitectureNode } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Scaffolding variables
  const [files, setFiles] = useState<FileTemplate[]>(BOILERPLATE_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>("vercel-json");
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  // Framework configurator adjustments
  const [userName, setUserName] = useState<string>("Traveler");
  const [defaultPort, setDefaultPort] = useState<number>(3000);

  // Checklist tracking State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  // Architecture Nodes State
  const [nodes, setNodes] = useState<ArchitectureNode[]>(ARCHITECTURE_NODES);
  const [activeNodeId, setActiveNodeId] = useState<string>("node-codespaces");

  // Gemini chat tracking
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! I am your N2S Dev Architect. I see you have GitHub repository 'Test_hyperspace' ready and a Vercel hosting account. How can we configure or deploy your Node-to-Serverless app today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiLoading]);

  // Handle template custom variable rendering dynamically
  const getRenderedContent = (file: FileTemplate): string => {
    let text = file.content;
    if (file.id === "api-hello") {
      text = text.replace('const { name = "Hyperspace Traveler" }', `const { name = "${userName}" }`);
    } else if (file.id === "devcontainer") {
      text = text.replace('"forwardPorts": [3000]', `"forwardPorts": [${defaultPort}]`);
    }
    return text;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFileId(id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) => {
        if (item.id === id) {
          const updated = !item.isCompleted;
          // Synchronize related architecture node statuses when completing steps
          if (id === "step-codespaces") {
            updateNodeStatus("node-codespaces", updated ? "active" : "pending");
          } else if (id === "step-files") {
            updateNodeStatus("node-github", updated ? "active" : "ready");
          } else if (id === "step-vercel-link") {
            updateNodeStatus("node-n2s", updated ? "active" : "ready");
          } else if (id === "step-deploy") {
            updateNodeStatus("node-vercel", updated ? "active" : "pending");
          }
          return { ...item, isCompleted: updated };
        }
        return item;
      })
    );
  };

  const updateNodeStatus = (nodeId: string, status: "pending" | "ready" | "active") => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n.id === nodeId ? { ...n, status } : n))
    );
  };

  // Chat request function using server side API
  const handleSendMessage = async (customPrompt?: string | null) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim() || isAiLoading) return;

    // Add user message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMessage]);
    if (!customPrompt) setUserInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            selectedFile: files.find((f) => f.id === selectedFileId)?.path,
            configuredName: userName,
            configuredPort: defaultPort,
            currentCompletedSteps: checklist.filter((c) => c.isCompleted).map((c) => c.title)
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            sender: "ai",
            text: data.text || "I processed your request, let me know how I can assist further.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || "Failed stream fetch");
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai-error`,
          sender: "ai",
          text: `⚠️ API Connection Error: Ensure GEMINI_API_KEY is defined. (${err.message}). For now, write boilerplates and follow the Codespaces setup checklist on the left side!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick suggestions for the chat Assistant
  const SUGGESTIONS = [
    { title: "Explain v4 routing", prompt: "How does the route handling mechanism work in vercel.json file?" },
    { title: "Node to Edge conversion", prompt: "How can I transform a simple Express route to Vercel/N2S serverless handoff?" },
    { title: "Configure Env Vars", prompt: "How do I secure and register Secret Env variables securely in Vercel & Codespaces?" }
  ];

  const currentFile = files.find((f) => f.id === selectedFileId) || files[0];

  return (
    <div className="min-h-screen bg-slate-950 font-sans p-3 md:p-6 text-slate-100 flex flex-col justify-between" id="app_root">
      
      {/* Top Banner & Title Area */}
      <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md" id="app_header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl shadow-xl shadow-cyan-900/20">
            <Layers className="h-6 w-6 text-cyan-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl tracking-tight text-white">N2S Developer Suite</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 rounded">
                Active Environment
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cloud orchestration dashboard for scaffolded config management in <span className="text-white font-semibold">GitHub Codespaces</span>, building <span className="text-white font-semibold">Test_hyperspace</span>, and publishing directly onto <span className="text-white font-semibold flex-inline items-center bg-zinc-900 rounded px-1">Vercel Serverless Edge</span>.
            </p>
          </div>
        </div>

        {/* Real-time Environment Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Github className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono text-cyan-400 font-medium">Test_hyperspace</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-mono text-slate-300">Vercel: Joined</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-500/20 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono">Codespaces Cloud Workspace Ready</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-grow mb-6" id="app_main">
        
        {/* Left Column (xl:col-span-4): Deployment pipeline checklist & visual status */}
        <section className="xl:col-span-4 flex flex-col gap-6" id="left_column">
          
          {/* Section: Architecture Pipeline visual */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-48">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Pipeline Stream
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">Live Mapping</span>
            </div>

            <div className="grid grid-cols-4 gap-1 relative py-1">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
              {nodes.map((node, index) => {
                const isActive = activeNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`relative z-10 p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isActive 
                        ? "bg-cyan-950/80 border border-cyan-500 shadow-lg shadow-cyan-950/60 scale-105" 
                        : "bg-slate-900 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      node.status === "active" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : node.status === "ready" 
                        ? "bg-indigo-950 text-indigo-400 border border-indigo-500/20" 
                        : "bg-slate-950 text-slate-600 border border-slate-800"
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-[9px] font-mono font-medium truncate max-w-full text-slate-300 mt-1.5 block">
                      {node.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Node explanation box */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 min-h-12 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0"></div>
              <p>
                <strong className="text-slate-200">
                  {nodes.find(n => n.id === activeNodeId)?.label}:
                </strong>{" "}
                {nodes.find(n => n.id === activeNodeId)?.description}
              </p>
            </div>
          </div>

          {/* Section: 6-Step Setup Tracker */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex-grow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-450 text-slate-300 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  Orchestration Checklist
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  {checklist.filter((c) => c.isCompleted).length} / {checklist.length} Complete
                </span>
              </div>

              {/* Steps checklist wrapper */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      item.isCompleted
                        ? "bg-indigo-950/10 border-indigo-500/15 text-slate-400"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          item.isCompleted
                            ? "bg-cyan-500/10 border-cyan-400 text-cyan-400"
                            : "border-slate-700 hover:border-slate-500 text-transparent"
                        }`}
                        id={`check-${item.id}`}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-zinc-500">{item.step}</span>
                          {item.isCompleted && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-950/30 text-cyan-400 border border-cyan-500/10 font-mono scale-95 origin-right">
                              Verified
                            </span>
                          )}
                        </div>
                        <h4 className={`text-xs font-semibold mt-0.5 ${item.isCompleted ? "text-slate-450 line-through text-slate-500" : "text-slate-200"}`}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Action Card inside checklist footer */}
            <div className="mt-5 p-3.5 bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                <p className="font-semibold text-slate-300">Need immediate help?</p>
                <p className="text-[10px] text-slate-500">Ask Gemini about the active step.</p>
              </div>
              <button
                onClick={() => {
                  const currentIncomplete = checklist.find(c => !c.isCompleted);
                  if (currentIncomplete) {
                    handleSendMessage(`How do I complete: "${currentIncomplete.title}" in my Test_hyperspace workspace?`);
                  } else {
                    handleSendMessage("What are the next optimization steps after successful deployment?");
                  }
                }}
                className="px-3 py-1.5 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 rounded-lg border border-cyan-500/20 font-medium transition-all text-[11px] flex items-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Query Step
              </button>
            </div>

          </div>
        </section>

        {/* Center Column (xl:col-span-4): File Scaffold Explorer & Live Previews */}
        <section className="xl:col-span-5 flex flex-col gap-6" id="center_column">
          
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-full">
            <div>
              {/* Box Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-350 text-slate-300 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-cyan-400" />
                    File Scaffolding Studio
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">boilerplate templates prepared for push to Github Codespace</p>
                </div>
                
                {/* Micro-Parameters box */}
                <div className="flex gap-2 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <Monitor className="h-3 w-3 text-cyan-400" />
                    <span className="text-[10px] text-slate-400">Port:</span>
                    <input
                      type="number"
                      value={defaultPort}
                      onChange={(e) => setDefaultPort(Number(e.target.value))}
                      className="w-10 bg-slate-900 border border-slate-700/60 rounded text-center text-[10px] font-mono text-cyan-45 w-12 font-semibold text-slate-205 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Scaffold file selector buttons (horizontal tabs) */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {files.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  let categoryBadgeColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/10";
                  if (file.category === "config") categoryBadgeColor = "text-sky-400 bg-sky-500/10 border-sky-500/10";
                  if (file.category === "codespace") categoryBadgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/10";
                  if (file.category === "readme") categoryBadgeColor = "text-zinc-300 bg-zinc-500/10 border-zinc-500/10";

                  return (
                    <button
                      key={file.id}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        // Also auto focus pipeline map items
                        if (file.category === "codespace") setActiveNodeId("node-codespaces");
                        if (file.category === "config") setActiveNodeId("node-n2s");
                        if (file.category === "readme") setActiveNodeId("node-github");
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected 
                          ? "bg-cyan-950/60 border-cyan-500 text-cyan-300" 
                          : "bg-slate-950/60 border-slate-850 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[130px]">{file.path.split("/").pop()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Configurator block for current selected file */}
              {selectedFileId === "api-hello" && (
                <div className="mb-4 bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20 text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-indigo-300 font-semibold">Customize Greeting Name</span>
                      <p className="text-[10px] text-slate-400">Updates live inside api/hello.ts handler</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-slate-950 font-semibold border border-indigo-500/40 outline-none rounded-md px-3 py-1 text-xs w-36 text-indigo-300 text-center focus:ring-1 focus:ring-indigo-400"
                    placeholder="E.g. Explorer"
                  />
                </div>
              )}

              {/* Main Code Viewer with Copy Action */}
              <div className="relative">
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                    {currentFile.language}
                  </span>
                  <button
                    onClick={() => copyToClipboard(getRenderedContent(currentFile), currentFile.id)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Copy full script block"
                  >
                    {copiedFileId === currentFile.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/30 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-red-500/40"></span>
                    <span className="h-2 w-2 rounded-full bg-yellow-500/40"></span>
                    <span className="h-2 w-2 rounded-full bg-green-500/40"></span>
                    <span className="ml-2 font-semibold text-slate-300">{currentFile.path}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto max-h-[320px] font-mono text-xs text-slate-300 leading-relaxed text-left selection:bg-cyan-500/20">
                    <code>{getRenderedContent(currentFile)}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Description overlay */}
            <div className="mt-4 p-3 bg-slate-950 border border-slate-850 rounded-xl flex gap-2.5 items-start">
              <BookOpen className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">File Context & Purpose</span>
                <p className="text-[11px] text-slate-350 leading-relaxed text-slate-300">
                  {currentFile.description}
                </p>
              </div>
            </div>
            
          </div>
        </section>

        {/* Right Column (xl:col-span-4): Gemini Architect Assistant & Cheat Sheet */}
        <section className="xl:col-span-3 flex flex-col gap-6" id="right_column">
          
          {/* Section: Gemini Chatbot Widget */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex-grow h-[410px] flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between">
              
              {/* Chat Panel Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-950 text-cyan-400 rounded-lg border border-cyan-500/20">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">N2S Architect AI</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Powered by gemini-3.5-flash</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        id: "welcome-reset",
                        sender: "ai",
                        text: "Console reset. Let me know your questions regarding Test_hyperspace setup or N2S code config!",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className="p-1 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded transition-all cursor-pointer"
                  title="Reset conversation"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              {/* Message thread body */}
              <div className="flex-grow overflow-y-auto pr-1 space-y-3 mb-3 max-h-[220px]" id="chat_thread">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1 mb-1 text-[9px] font-mono text-zinc-500">
                      {msg.sender === "user" ? (
                        <>
                          <span className="text-cyan-400">You</span>
                          <span className="text-[8px]">•</span>
                          <span>{msg.timestamp}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-purple-400 font-bold">N2S AI</span>
                          <span className="text-[8px]">•</span>
                          <span>{msg.timestamp}</span>
                        </>
                      )}
                    </div>
                    <div
                      className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap text-left ${
                        msg.sender === "user"
                          ? "bg-cyan-950/50 text-cyan-200 border border-cyan-800/50"
                          : "bg-slate-950 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs text-slate-400">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-slate-500 font-mono">Synthesizing N2S advice...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Dynamic Suggestions (clickable chips) */}
              <div className="mb-3">
                <span className="text-[9px] font-mono text-zinc-500 tracking-wider block mb-1">RECOMMENDED QUERIES</span>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTIONS.map((s, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(s.prompt)}
                      className="text-[9px] bg-slate-955/60 bg-slate-950 hover:bg-slate-850 px-2 py-1 rounded border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono transition-all text-left truncate cursor-pointer"
                    >
                      + {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about Codespaces config..."
                  className="flex-grow bg-slate-950 text-xs text-white border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 font-mono placeholder:text-zinc-650 placeholder:text-slate-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || isAiLoading}
                  className="px-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 disabled:bg-slate-800 disabled:text-slate-550 rounded-xl transition-all cursor-pointer flex items-center justify-center inline-block"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Section: Codespace Terminals command helper */}
          <div className="bg-slate-900/50 border border-slate-855 border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-4.5 w-4.5 text-emerald-400" />
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300">
                Codespaces Cheat Sheet
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-1">
                  <span>1. BOOT COMPILERS</span>
                  <button 
                    onClick={() => copyToClipboard("npm install && npm run dev", "clip-boot")}
                    className="hover:text-cyan-400 font-bold"
                  >
                    Copy
                  </button>
                </div>
                <code className="text-emerald-400 font-mono text-[11px] block">
                  npm install && npm run dev
                </code>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-1">
                  <span>2. PUSH CODESPACE CHANGES</span>
                  <button 
                    onClick={() => copyToClipboard("git add . && git commit -m 'Configure N2S configs' && git push origin main", "clip-git")} 
                    className="hover:text-cyan-400 font-bold"
                  >
                    Copy
                  </button>
                </div>
                <code className="text-indigo-400 font-mono text-[10px] block leading-snug">
                  git add . && git commit -m 'N2S config' && git push
                </code>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-1">
                  <span>3. VERIFY VERCEL CLI</span>
                  <button 
                    onClick={() => copyToClipboard("vercel link", "clip-vercel")}
                    className="hover:text-cyan-400 font-bold"
                  >
                    Copy
                  </button>
                </div>
                <code className="text-cyan-400 font-mono text-[11px] block text-left">
                  npx vercel link
                </code>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Area with clear branding & dynamic credentials */}
      <footer className="text-center py-4 border-t border-slate-900 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2 font-mono">
        <div>
          🌌 Orchestrating <span className="text-cyan-400 font-semibold font-sans">MANISHAKAMAL1994@gmail.com</span> on Github workspace sandbox.
        </div>
        <div>
          N2S Hyperspace Control Center &copy; {new Date().getFullYear()} • Validated Cloud Run Deployment
        </div>
      </footer>

    </div>
  );
}
