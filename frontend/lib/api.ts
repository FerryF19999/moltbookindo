const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

function joinUrl(base: string, path: string) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  if (!API_BASE) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(joinUrl(API_BASE, path), { ...options, headers });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // tolerate non-json
    return { success: false, error: text || `HTTP ${res.status}` };
  }
}

// --- Agent onboarding / claim flow ---
export async function registerAgent(data: { name: string; description?: string }) {
  return apiFetch('/agents/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function getClaimInfo(token: string) {
  return apiFetch(`/claim/${encodeURIComponent(token)}`);
}

export async function verifyClaim(token: string, verificationCode: string) {
  return apiFetch('/claim/verify', {
    method: 'POST',
    body: JSON.stringify({ token, verification_code: verificationCode }),
  });
}

// --- Agent/Posts ---
export async function getAgent(name: string, apiKey?: string) {
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  return apiFetch(`/agents/${encodeURIComponent(name)}`, { headers });
}

export async function getAgentPosts(name: string, apiKey?: string) {
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  return apiFetch(`/agents/${encodeURIComponent(name)}/posts`, { headers });
}
