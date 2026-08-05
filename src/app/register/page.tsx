'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import AuthShell from '@/components/AuthShell';

export default function RegisterPage() {
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account created — welcome to Vanguard');
      router.push('/dashboard');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      sub="Book faster, save favourites and track every rental in one place."
      footer={<>Already registered? <Link href="/login" className="text-accent-600 hover:text-accent-700 font-medium">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-3.5">
        <label className="block">
          <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Full name</span>
          <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Alex Rivera" className="field mt-1.5" />
        </label>
        <label className="block">
          <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Email</span>
          <input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="alex@example.com" className="field mt-1.5" />
        </label>
        <label className="block">
          <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Password</span>
          <input type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="At least 6 characters" className="field mt-1.5" />
        </label>

        {err && <p role="alert" className="text-[0.8125rem] text-red-400">{err}</p>}

        <button disabled={busy} className="btn btn-primary w-full !mt-6">
          {busy ? 'Creating…' : <>Create account <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
