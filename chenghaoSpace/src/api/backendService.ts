const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function chat(query: string, topK = 3) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK })
  });
  return res.json();
}

export async function search(query: string, topK = 3) {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK })
  });
  return res.json();
}

export async function embed(texts: string[]) {
  const res = await fetch(`${API_BASE}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  });
  return res.json();
}
