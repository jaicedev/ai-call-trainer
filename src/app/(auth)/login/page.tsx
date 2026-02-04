'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';

type Step = 'email' | 'verify' | 'password' | 'login';

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className="h-8 w-8 text-zinc-800" />
            <CardTitle className="text-2xl font-bold tracking-tight">
              <span className="italic">Talk</span>
              <span className="text-zinc-600">MCA</span>
            </CardTitle>
          </div>
          <p className="text-xs text-zinc-500 tracking-wide uppercase mb-2">Master the Art of Sales</p>
          <CardDescription>
            {step === 'email' && 'Enter your company email to get started'}
            {step === 'verify' && 'Enter the verification code sent to your email'}
            {step === 'password' && 'Create a password for your account'}
            {step === 'login' && 'Enter your password to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@ccapsolution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be a @ccapsolution.com email address
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the 6-digit code
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
              >
                Use a different email
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setPassword('');
                }}
              >
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
