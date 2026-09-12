import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Lock, Mail, ArrowRight, ArrowLeft, X, Zap } from 'lucide-react';
import { api } from '../api/client';
import { AuthResponse } from '../types';
import { playClickSound } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onGoBack?: () => void;
  onAuthSuccess: (authData: AuthResponse) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onGoBack, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    playClickSound();

    try {
      let res: AuthResponse;
      if (mode === 'register') {
        // 1. Create the account
        await api.register(username, email, password);
        // 2. Automatically log them in right behind the scenes to grab the token
        res = await api.login(email, password);
      } else {
        res = await api.login(email, password);
      }
      onAuthSuccess(res);
      if (onClose) onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };
  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    playClickSound();

    try {
      const res = await api.loginAsDemo();
      onAuthSuccess(res);
      if (onClose) onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Ensure the back button always has a fallback action to close the modal
  const handleBack = () => {
    if (onGoBack) onGoBack();
    else if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBack}
          className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Glowing Border Wrapper */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/5 rounded-3xl blur-md -z-10" />
          
          <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
            
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBack}
                type="button"
                className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all group px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  type="button"
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Header */}
            <motion.div layout className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Shield className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Welcome Back' : 'Forge Your Legacy'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Secure access powered by Neon DB
              </p>
            </motion.div>

            {/* 1-Click Demo Action */}
            <motion.div layout className="mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Play as Ayutayam
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Level 5 • 420 Gold • Active Streaks
                  </div>
                </div>
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-orange-500/25 flex-shrink-0 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Instant
                  </span>
                </button>
              </div>
            </motion.div>

            <motion.div layout className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                Or {mode === 'login' ? 'Sign In' : 'Register'}
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </motion.div>

            <AnimatePresence mode="popLayout">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm rounded-xl font-medium text-center shadow-sm"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Hero Name</label>
                    <div className="relative group">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                      <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., Ayutayam"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </motion.div>

              <motion.div layout>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </motion.div>

              <motion.button layout type="submit" disabled={loading}
                className="w-full mt-2 py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In Securely' : 'Create Account'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </form>

            <motion.div layout className="mt-6 text-center">
              {mode === 'login' ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  New to Life RPG?{' '}
                  <button type="button" onClick={() => { setErrorMsg(null); setMode('register'); }} className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold transition-colors">
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setErrorMsg(null); setMode('login'); }} className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold transition-colors">
                    Sign in here
                  </button>
                </p>
              )}
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};