const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export type GenerateContentPayload = {
  idea: string;
  platform: string;
  tone: string;
  language?: string;
  project_id?: string;
};

export async function generateContent(payload: GenerateContentPayload) {
  const response = await fetch(`${API_URL}/ai/generate-content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "Indonesian", ...payload }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getProjects() {
  const response = await fetch(`${API_URL}/projects`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/dashboard/stats`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
