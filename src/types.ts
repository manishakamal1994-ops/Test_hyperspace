export interface FileTemplate {
  id: string;
  path: string;
  description: string;
  category: "config" | "api" | "page" | "codespace" | "readme";
  language: string;
  content: string;
}

export interface ChecklistItem {
  id: string;
  step: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resourceLinks?: { label: string; url: string }[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  description: string;
  status: "pending" | "ready" | "active";
}
