'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

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

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: any) => {
        e.preventDefault();
        setLoading(true);
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
            }
        } catch (error: any) {
            console.error(error);
            alert(error.error_description || error.message);
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
            padding: '20px'
        }}>
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
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-primary)',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    transition: 'opacity 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
                            </button>
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
