const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export type GenerateContentRequest = {
  idea: string;
  platform: string;
  tone: string;
  language?: string;
  project_id?: string | null;
};

export type StoryboardItem = {
  scene: number;
  visual: string;
  voice_over: string;
  editing_note: string;
};

export type GenerationResponse = {
  id: string;
  project_id: string | null;
  idea: string;
  platform: string;
  tone: string;
  title: string | null;
  hook: string | null;
  script: string | null;
  storyboard: StoryboardItem[] | null;
  visual_prompts: string[] | null;
  caption: string | null;
  hashtags: string[] | null;
  editing_checklist: string[] | null;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  description?: string | null;
  platform?: string | null;
  status?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type DashboardStats = {
  total_projects: number;
  scripts_generated: number;
  storyboards_created: number;
  content_scheduled: number;
  best_performing_tone: string;
  recommended_upload_time: string;
  weekly_focus: string;
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (data.detail) message = JSON.stringify(data.detail);
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  health: () => request<{ status: string; service?: string }>("/health"),
  getStats: () => request<DashboardStats>("/dashboard/stats"),
  getProjects: () => request<Project[]>("/projects"),
  getGenerations: () => request<GenerationResponse[]>("/ai/generations"),
  createProject: (data: { title: string; description?: string; platform?: string; status?: string }) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateContent: (data: GenerateContentRequest) =>
    request<GenerationResponse>("/ai/generate-content", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
