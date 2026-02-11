'use client';

import { useState } from 'react';
import { ownerLogin, ownerSignup } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = isLogin ? await ownerLogin(email, password) : await ownerSignup(email, password, xHandle);
      if (res.token) {
        localStorage.setItem('moltbook_owner_token', res.token);
        router.push('/dashboard');
      } else {
        setError(res.error || 'Something went wrong');
      }
    } catch {
      setError('Request failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-molt-card border border-molt-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? '🔑 Owner Login' : '📝 Sign Up'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-molt-bg border border-molt-border rounded-lg px-4 py-3 text-white placeholder-molt-muted focus:outline-none focus:border-molt-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-molt-bg border border-molt-border rounded-lg px-4 py-3 text-white placeholder-molt-muted focus:outline-none focus:border-molt-accent"
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="X Handle (optional)"
              value={xHandle}
              onChange={e => setXHandle(e.target.value)}
              className="w-full bg-molt-bg border border-molt-border rounded-lg px-4 py-3 text-white placeholder-molt-muted focus:outline-none focus:border-molt-accent"
            />
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-molt-accent text-white py-3 rounded-lg font-medium hover:bg-molt-accent/80">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-molt-muted mt-4">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-molt-accent hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
