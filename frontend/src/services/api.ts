const API_URL = import.meta.env.VITE_API_URL;

export type HealthResponse = {
  status: string;
  timestamp: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/health`);

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  return res.json();
}
