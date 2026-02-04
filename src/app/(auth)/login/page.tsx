'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Phone, ArrowRight, Mic, Brain, TrendingUp } from 'lucide-react';

type Step = 'email' | 'verify' | 'password' | 'login';

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setIsNewUser(data.isNewUser);
      setStep('verify');
      toast.success('Verification code sent to your email');
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setTempToken(data.tempToken);

      if (data.isNewUser) {
        setStep('password');
      } else {
        setStep('login');
      }
    } catch {
      toast.error('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tempToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Account created successfully!');
      router.push('/');
    } catch {
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Welcome back!');
      router.push('/');
    } catch {
      toast.error('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-50/80 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-zinc-800" />
            <span className="text-lg font-semibold tracking-tight">
              <span className="italic">Talk</span>
              <span className="text-zinc-500">MCA</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row items-center justify-center gap-16 py-12">

            {/* Left: Value Prop */}
            <div className="flex-1 max-w-xl">
              <p className="text-sm font-medium text-zinc-500 tracking-wide uppercase mb-4">
                Sales Training Platform
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.1] mb-6">
                Practice sales calls.<br />
                <span className="text-zinc-400">Without the awkwardness.</span>
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                Talk to AI prospects that push back, ask tough questions, and make you earn the sale.
                Get scored on what matters. Improve before it counts.
              </p>

              {/* Quick Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 rounded-md bg-zinc-900 text-white">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">Real voice conversations</p>
                    <p className="text-sm text-zinc-500">Not chatbots. Actual calls with AI that listens and responds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 rounded-md bg-zinc-900 text-white">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">20+ AI personas</p>
                    <p className="text-sm text-zinc-500">From Skeptical Steve to Busy Barbara. Each one a different challenge.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 rounded-md bg-zinc-900 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">Instant scoring</p>
                    <p className="text-sm text-zinc-500">Tone, objection handling, rapport, closing. Know where you stand.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Auth Form */}
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900">
                    {step === 'email' && 'Get started'}
                    {step === 'verify' && 'Check your email'}
                    {step === 'password' && 'Create password'}
                    {step === 'login' && 'Welcome back'}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {step === 'email' && 'Enter your company email'}
                    {step === 'verify' && 'Enter the 6-digit code we sent'}
                    {step === 'password' && 'Set up your account'}
                    {step === 'login' && 'Enter your password'}
                  </p>
                </div>

                {step === 'email' && (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@ccapsolution.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                      <p className="text-xs text-zinc-400">
                        @ccapsolution.com emails only
                      </p>
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Sending...' : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {step === 'verify' && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-zinc-700">Verification Code</Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-11 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-sm text-zinc-500 hover:text-zinc-700"
                      onClick={() => setStep('email')}
                    >
                      Use a different email
                    </button>
                  </form>
                )}

                {step === 'password' && (
                  <form onSubmit={handleSetupPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-zinc-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-zinc-700">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                )}

                {step === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword" className="text-zinc-700">Password</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-sm text-zinc-500 hover:text-zinc-700"
                      onClick={() => {
                        setStep('email');
                        setPassword('');
                      }}
                    >
                      Use a different email
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm text-zinc-400 text-center">
            Built for the CCAP Solutions sales team
          </p>
        </div>
      </footer>
    </div>
  );
}
