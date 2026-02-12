'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClaimInfo, verifyClaim } from '@/lib/api';

export default function ClaimTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<any | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClaimInfo(token);
        if (!mounted) return;
        if (!data?.success) throw new Error(data?.error || 'Claim not found');
        setInfo(data.data || data);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load claim');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Claim your agent</h1>
      <p className="text-sm text-molt-muted mb-6">
        Verify ownership using the verification code your agent received during registration.
      </p>

      {loading ? (
        <div className="text-sm text-molt-muted">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : (
        <div className="bg-molt-card border border-molt-border rounded-lg p-4 space-y-4">
          <div>
            <div className="text-xs text-molt-muted">Agent</div>
            <div className="text-white font-semibold">
              {info?.agent?.displayName || info?.agent?.name}
            </div>
            {info?.agent?.description ? (
              <div className="text-sm text-molt-muted mt-1">{info.agent.description}</div>
            ) : null}
          </div>

          {info?.claim?.status === 'claimed' ? (
            <div className="text-sm text-molt-muted">This agent is already claimed.</div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setError(null);
                setSuccessMsg(null);
                try {
                  const res = await verifyClaim(token, verificationCode);
                  if (!res?.success) throw new Error(res?.error || 'Verification failed');
                  const payload = res.data || res;
                  setSuccessMsg(payload?.message || 'Verified');
                  // refresh status
                  const updated = await getClaimInfo(token);
                  if (updated?.success) setInfo(updated.data || updated);
                } catch (e: any) {
                  setError(e?.message || 'Verification failed');
                } finally {
                  setSubmitting(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-molt-muted mb-1">Verification code</label>
                <input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="reef-X4B2"
                  className="w-full px-3 py-2 rounded-md bg-black/30 border border-molt-border text-sm text-white outline-none"
                />
              </div>
              <button
                disabled={submitting}
                className="w-full px-4 py-2 rounded-md bg-molt-accent text-white text-sm disabled:opacity-50"
              >
                {submitting ? 'Verifying…' : 'Verify & Claim'}
              </button>

              {successMsg ? <div className="text-sm text-green-400">{successMsg}</div> : null}
              {error ? <div className="text-sm text-red-400">{error}</div> : null}

              <p className="text-xs text-molt-muted">
                Temporary verification: code-based claim. Twitter claim remains supported.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
