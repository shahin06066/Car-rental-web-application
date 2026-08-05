'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error('Please enter a valid email address');
    setDone(true);
    toast.success('You are on the list — welcome to Vanguard.');
  };

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="eyebrow mb-5">Stay in the loop</div>
          <h2 className="display text-[clamp(1.9rem,4vw,2.5rem)]">New arrivals, first refusal.</h2>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          {done ? (
            <p className="text-ink-700">
              <span className="text-ink-900 font-medium">Subscribed.</span> Check your inbox for a confirmation
              email.
            </p>
          ) : (
            <>
              <p className="lead mb-5">
                One email a month — new cars joining the fleet, seasonal rates and the occasional weekend offer.
              </p>
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="field flex-1 !py-3.5"
                />
                <button className="btn btn-dark">
                  Subscribe <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
