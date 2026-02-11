'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

// Icons
const GlobeIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const CheckIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Initial Theme Check
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(prefersDark.matches);
        if (prefersDark.matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        const handleThemeChange = (e: MediaQueryListEvent) => {
            setDarkMode(e.matches);
            document.body.classList.toggle('dark', e.matches);
        };
        prefersDark.addEventListener('change', handleThemeChange);

        // Check if user is already logged in
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/');
            }
        };
        checkSession();

        return () => {
            prefersDark.removeEventListener('change', handleThemeChange);
        };
    }, [router]);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.body.classList.toggle('dark', newDarkMode);
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleAuth = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
                    }
                });
                if (error) throw error;
                setMessage('Account created! Please check your email to confirm.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/'); // Redirect to home on success
            }
        } catch (error: any) {
            console.error(error);
            setError(error.error_description || error.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '20px',
            position: 'relative' // For absolute positioning of toggle
        }}>
            {/* Theme Toggle */}
            <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '10px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                }}
            >
                {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <div style={{
                background: 'var(--bg-secondary)',
                padding: '48px',
                maxWidth: '440px',
                width: '100%',
                textAlign: 'center',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)'
            }}>
                {/* Header Section */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        boxShadow: 'var(--shadow-lg)',
                        color: 'white'
                    }}>
                        <GlobeIcon />
                    </div>
                    <h1 style={{
                        margin: '0 0 12px 0',
                        fontSize: '32px',
                        fontWeight: 800,
                        color: 'var(--text-primary)'
                    }}>
                        {isSignUp ? 'Create Account' : 'Welcome'}
                    </h1>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '16px',
                        fontWeight: 500
                    }}>
                        {isSignUp ? 'Start your journey around the world' : 'Sign in to continue'}
                    </p>
                </div>

                {!message ? (
                    <form onSubmit={handleAuth}>
                        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '16px 18px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-tertiary)',
                                    fontSize: '16px',
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.2s ease',
                                    marginBottom: '16px',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent-primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {error && (
                                <div style={{
                                    color: 'var(--error)',
                                    marginBottom: '16px',
                                    fontSize: '14px',
                                    padding: '8px 12px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '8px',
                                    textAlign: 'left',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '16px 18px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-tertiary)',
                                    fontSize: '16px',
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent-primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '16px'
                            }}
                        >
                            {loading ? (
                                <div className="spinner" style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white'
                                }}></div>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                                    <ArrowRightIcon />
                                </>
                            )}
                        </button>

                        <div style={{ marginTop: '28px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setError(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                >
                                    {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
                                </button>
                            </div>

                            {!isSignUp && (
                                <div>
                                    <a
                                        href="/reset-password"
                                        style={{
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            transition: 'color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                            )}
                        </div>
                    </form>
                ) : (
                    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'var(--success)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <CheckIcon />
                        </div>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '22px',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                        }}>
                            Check your email
                        </h3>
                        <p style={{
                            margin: 0,
                            color: 'var(--text-secondary)',
                            fontSize: '15px',
                            lineHeight: '1.6'
                        }}>
                            {message}
                        </p>
                        <button
                            onClick={() => setMessage(null)}
                            className="btn btn-secondary"
                            style={{
                                marginTop: '28px',
                                width: '100%'
                            }}
                        >
                            Back to start
                        </button>
                    </div>
                )}
            </div>

            <div style={{
                position: 'absolute',
                bottom: '32px',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
                fontWeight: 500
            }}>
                Travel Tracker © 2026
            </div>
        </div>
    );
}
