'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

// Icons
const KeyIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
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

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

        // Check session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setMessage({
                    type: 'error',
                    text: 'Invalid or expired link. Please request a new password reset.',
                });
            }
        };
        checkSession();

        return () => {
            prefersDark.removeEventListener('change', handleThemeChange);
        };
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.body.classList.toggle('dark', newDarkMode);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 6 characters long',
            });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Password updated successfully!',
            });

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Error updating password',
            });
        } finally {
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
            position: 'relative'
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
                        <KeyIcon />
                    </div>
                    <h1 style={{
                        margin: '0 0 12px 0',
                        fontSize: '32px',
                        fontWeight: 800,
                        color: 'var(--text-primary)'
                    }}>
                        Set New Password
                    </h1>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '16px',
                        fontWeight: 500
                    }}>
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword}>
                    <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
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

                        {message && (
                            <div style={{
                                color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                                marginBottom: '16px',
                                fontSize: '14px',
                                padding: '12px',
                                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                textAlign: 'left',
                                border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                            }}>
                                {message.type === 'success' ? '✅ ' : '⚠️ '} {message.text}
                            </div>
                        )}
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
                                <span>Update Password</span>
                                <ArrowRightIcon />
                            </>
                        )}
                    </button>
                </form>
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
