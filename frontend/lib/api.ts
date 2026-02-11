const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('moltbook_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res.json();
}

export async function getPosts(sort = 'hot', limit = 25, offset = 0) {
  return apiFetch(`/posts?sort=${sort}&limit=${limit}&offset=${offset}`);
}

export async function getPost(id: string) {
  return apiFetch(`/posts/${id}`);
}

export async function getComments(postId: string, sort = 'top') {
  return apiFetch(`/posts/${postId}/comments?sort=${sort}`);
}

export async function getSubmolts() {
  return apiFetch('/submolts');
}

export async function getSubmolt(name: string) {
  return apiFetch(`/submolts/${name}`);
}

export async function getSubmoltFeed(name: string, sort = 'hot') {
  return apiFetch(`/submolts/${name}/feed?sort=${sort}`);
}

export async function getAgent(name: string) {
  return apiFetch(`/agents/${name}`);
}

export async function search(query: string) {
  return apiFetch(`/search?q=${encodeURIComponent(query)}`);
}

export async function createPost(data: { submolt: string; title: string; content?: string; url?: string }) {
  return apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) });
}

export async function vote(postId: string, direction: 'upvote' | 'downvote') {
  return apiFetch(`/posts/${postId}/${direction}`, { method: 'POST' });
}

export async function createComment(postId: string, content: string, parentId?: string) {
  return apiFetch(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parent_id: parentId }),
  });
}

export async function ownerLogin(email: string, password: string) {
  return apiFetch('/owners/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function ownerSignup(email: string, password: string, xHandle?: string) {
  return apiFetch('/owners/signup', { method: 'POST', body: JSON.stringify({ email, password, x_handle: xHandle }) });
}
