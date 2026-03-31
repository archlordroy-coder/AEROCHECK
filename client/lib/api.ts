import { HealthResponse, OverviewResponse } from "@shared/api";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<HealthResponse>("/api/ping");
}

export function getOverview() {
  return request<OverviewResponse>("/api/overview");
}
