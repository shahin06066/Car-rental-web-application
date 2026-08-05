'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import AuthShell from '@/components/AuthShell';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@vanguard.com');
  const [password, setPassword] = useState('demo123');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      sub="Sign in to manage your reservations and saved vehicles."
      footer={<>New to Vanguard? <Link href="/register" className="text-accent-600 hover:text-accent-700 font-medium">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-3.5">
        <label className="block">
          <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" />
        </label>
        <label className="block">
          <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1.5" />
        </label>

        {err && <p role="alert" className="text-[0.8125rem] text-red-400">{err}</p>}

        <button disabled={busy} className="btn btn-primary w-full !mt-6">
          {busy ? 'Signing in…' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="mt-5 rounded-xl border border-line bg-white/[0.03] px-4 py-3">
        <div className="text-[0.625rem] tracking-[0.18em] uppercase text-accent-600 mb-1">Demo account</div>
        <p className="text-[0.75rem] text-ink-700 num">demo@vanguard.com · demo123 (admin)</p>
      </div>
    </AuthShell>
  );
}
