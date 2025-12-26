'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);

    // Form States
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // OTP States
    const [otpStep, setOtpStep] = useState(1); // 1: Input Details/Request, 2: Verify & Submit
    const [otp, setOtp] = useState('');

    // UI States
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (isReset) {
                // Reset Flow
                const identifier = email || phone;

                if (otpStep === 1) {
                    // Send OTP for Reset
                    if (!identifier) throw new Error('Please enter Email or Phone');

                    const res = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'send-otp', type: 'reset', identifier }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setSuccess('OTP sent for password reset. Check console.');
                    setOtpStep(2);

                } else {
                    // Reset Password
                    if (!password) throw new Error('Please enter new password');

                    const res = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reset-password', identifier, otp, password }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setSuccess('Password reset successfully! Please login.');
                    setTimeout(() => toggleMode('login'), 2000);
                }

            } else if (!isLogin) {
                // Registration Flow
                const identifier = email || phone;

                if (otpStep === 1) {
                    // Send OTP for Registration
                    if (!identifier) throw new Error('Please enter Email or Phone');
                    if (!username || !password) throw new Error('Please fill all fields');

                    const res = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'send-otp', type: 'register', identifier }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setSuccess('OTP sent for verification. Check console.');
                    setOtpStep(2);
                } else {
                    // Verify OTP & Register
                    const res = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'register',
                            username,
                            password,
                            email,
                            phone,
                            otp
                        }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setSuccess('Account created successfully! Logging you in...');
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setTimeout(() => router.push('/dashboard'), 1500);
                }
            } else {
                // Login Flow
                const res = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', username, password }),
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = (mode) => {
        setError('');
        setSuccess('');
        setPassword('');
        setOtp('');
        setOtpStep(1);
        setIsLoading(false);

        if (mode === 'reset') {
            setIsReset(true);
            setIsLogin(false);
        } else if (mode === 'login') {
            setIsReset(false);
            setIsLogin(true);
        } else {
            setIsReset(false);
            setIsLogin(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass-panel login-card">
                <h1 className="login-title">
                    {isReset ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                </h1>
                <p className="login-subtitle">
                    {isReset
                        ? (otpStep === 1 ? 'Enter Email/Phone to receive OTP' : 'Verify OTP & Set Password')
                        : (isLogin
                            ? 'Login to access your tasks'
                            : (otpStep === 1 ? 'Register to start organizing' : 'Verify OTP to complete registration')
                        )
                    }
                </p>

                <form onSubmit={handleSubmit} className="login-form">

                    {/* Login ONLY: Username & Password */}
                    {isLogin && (
                        <>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </>
                    )}

                    {/* Registration Step 1 */}
                    {!isLogin && !isReset && otpStep === 1 && (
                        <>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Email (*)</label>
                                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required={!phone} />
                            </div>
                            <div className="form-group">
                                <label>Phone (*)</label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter phone (10 digits)"
                                    maxLength={10}
                                    pattern="\d{10}"
                                    title="Please enter a valid 10-digit phone number"
                                    required={!email}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </>
                    )}

                    {/* Reset Step 1 */}
                    {isReset && otpStep === 1 && (
                        <>
                            <div className="form-group">
                                <label>Email (*)</label>
                                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required={!phone} />
                            </div>
                            <div className="form-group">
                                <label>Phone (*)</label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter phone (10 digits)"
                                    maxLength={10}
                                    pattern="\d{10}"
                                    title="Please enter a valid 10-digit phone number"
                                    required={!email}
                                />
                            </div>
                        </>
                    )}

                    {/* OTP Step (Both Register & Reset) */}
                    {otpStep === 2 && (
                        <>
                            <div className="form-group">
                                <label>OTP Code</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                                    placeholder="6-digit OTP"
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="[0-9]{6}"
                                    title="Please enter the 6-digit OTP code"
                                    required
                                />
                            </div>
                            {isReset && (
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            )}
                        </>
                    )}

                    {error && <div className="error-msg">{error}</div>}
                    {success && <div className="success-msg" style={{ color: '#10b981', marginBottom: '10px', textAlign: 'center' }}>{success}</div>}

                    <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (
                            isReset
                                ? (otpStep === 1 ? 'Send OTP' : 'Reset Password')
                                : (isLogin
                                    ? 'Login'
                                    : (otpStep === 1 ? 'Sign Up' : 'Verify & Register')
                                )
                        )}
                    </button>
                </form>

                <div className="toggle-box">
                    {isReset ? (
                        <p>
                            Remember password?
                            <span onClick={() => toggleMode('login')} className="toggle-link">
                                {' Login'}
                            </span>
                        </p>
                    ) : (
                        <>
                            <p>
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <span onClick={() => toggleMode(isLogin ? 'register' : 'login')} className="toggle-link">
                                    {isLogin ? ' Sign Up' : ' Login'}
                                </span>
                            </p>
                            {isLogin && (
                                <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                                    <span onClick={() => toggleMode('reset')} className="toggle-link">
                                        Forgot Password?
                                    </span>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
