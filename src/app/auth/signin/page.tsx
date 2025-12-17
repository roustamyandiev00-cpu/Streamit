'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FadeIn, SlideIn, ScaleIn } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push('/');
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#09090b] via-[#1a1a1f] to-[#09090b] relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

            <FadeIn className="w-full max-w-md relative z-10">
                <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="p-8 pb-4 text-center border-b border-white/5 bg-white/[0.02]">
                        <ScaleIn delay={0.2} duration={0.6}>
                            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </ScaleIn>
                        <SlideIn direction="down" delay={0.3}>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Streamit</h1>
                            <p className="text-gray-400 text-sm">Sign in to manage your streams</p>
                        </SlideIn>
                    </div>

                    <div className="p-8 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <SlideIn direction="up" delay={0.4} className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                    className="glass-input h-11 bg-black/20 focus:bg-black/40 border-white/10 focus:border-primary/60 text-white placeholder:text-gray-600"
                                />
                            </SlideIn>

                            <SlideIn direction="up" delay={0.5} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                                    <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                    className="glass-input h-11 bg-black/20 focus:bg-black/40 border-white/10 focus:border-primary/60 text-white placeholder:text-gray-600"
                                />
                            </SlideIn>

                            {error && (
                                <SlideIn direction="up" className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                                    {error}
                                </SlideIn>
                            )}

                            <SlideIn direction="up" delay={0.6}>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium shadow-lg shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </SlideIn>
                        </form>

                        <div className="my-8 relative text-center">
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                            <span className="relative bg-[#1a1a1f] px-3 text-xs text-gray-500 uppercase tracking-wider rounded-full">
                                Demo Access
                            </span>
                        </div>

                        <div className="text-center bg-white/5 rounded-lg p-4 border border-white/5">
                            <p className="text-gray-400 text-sm">
                                Use password: <strong className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">demo123</strong>
                            </p>
                        </div>

                        <div className="mt-8 text-center">
                            <Link
                                href="/"
                                className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
