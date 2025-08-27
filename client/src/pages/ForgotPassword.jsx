// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // your axios instance

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const safeEncode = (v) => encodeURIComponent(v);

  // Step 1: request OTP
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage({ type: 'danger', text: 'Please enter an email.' });
    setLoading(true);
    try {
      await api.get(`/verifyEmail/${safeEncode(email)}`);
      setMessage({ type: 'success', text: 'If the email exists, an OTP was sent. Check your inbox.' });
      setStep(2);
    } catch (err) {
      console.error('verifyEmail error:', err?.response || err);
      const text = err?.response?.data?.message || 'Failed to request OTP. Try again.';
      setMessage({ type: 'danger', text });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!otp) return setMessage({ type: 'danger', text: 'Please enter the OTP.' });
    setLoading(true);
    try {
      await api.get(`/verifyOTP/${safeEncode(email)}/${safeEncode(otp)}`);
      setMessage({ type: 'success', text: 'OTP verified. Enter your new password below.' });
      setStep(3);
    } catch (err) {
      console.error('verifyOTP error:', err?.response || err);
      const text = err?.response?.data?.message || 'OTP verification failed. Check OTP and try again.';
      setMessage({ type: 'danger', text });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!password || !password2) return setMessage({ type: 'danger', text: 'Fill both password fields.' });
    if (password !== password2) return setMessage({ type: 'danger', text: 'Passwords do not match.' });

    setLoading(true);
    try {
      await api.get(`/passwordReset/${safeEncode(email)}/${safeEncode(otp)}/${safeEncode(password)}`);
      setMessage({ type: 'success', text: 'Password reset successful. Redirecting to login...' });

      // Redirect after short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('passwordReset error:', err?.response || err);
      const text = err?.response?.data?.message || 'Password reset failed. Try again.';
      setMessage({ type: 'danger', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 560 }}>
      <h3>Forgot Password</h3>

      {message && (
        <div className={`alert alert-${message.type === 'danger' ? 'danger' : 'success'}`} role="alert">
          {message.text}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleVerifyEmail}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-3">
            <label className="form-label">OTP</label>
            <input
              type="text"
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setStep(1);
                setOtp('');
              }}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label className="form-label">New password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm password</label>
            <input
              type="password"
              className="form-control"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-success" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setStep(2)}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
