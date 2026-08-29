import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { modalBackdropVariants, modalContentVariants } from '../../constants/motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password, displayName.trim() || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes('popup-closed-by-user')) {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none"
          onClick={onClose}
        >
          <motion.div
            variants={modalContentVariants}
            className="w-full max-w-md bg-[#1C1B1B] border border-[#282828] rounded-[8px] shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-[#E8BDB3]/50 hover:text-white rounded-[4px] p-1 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#FF3B00] rounded-[2px] flex items-center justify-center font-bold text-black text-xs">
                  D
                </div>
                <span className="text-[11px] font-bold tracking-[0.1em] text-[#E8BDB3]/60 uppercase">
                  Dissonant Cloud
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#E5E2E1]">
                {mode === 'signin' ? 'Sign In to Workspace' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-[#E8BDB3]/60 mt-1">
                {mode === 'signin'
                  ? 'Access your private music projects, folders, and tracks.'
                  : 'Start organizing your music projects, folders, and songs with secure cloud sync.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[#282828] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                  mode === 'signin'
                    ? 'border-[#FF3B00] text-white'
                    : 'border-transparent text-[#E8BDB3]/50 hover:text-[#E5E2E1]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                  mode === 'signup'
                    ? 'border-[#FF3B00] text-white'
                    : 'border-transparent text-[#E8BDB3]/50 hover:text-[#E5E2E1]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-[#351107] border border-[#5E3F38] rounded-[4px] flex items-start gap-2.5 text-xs text-[#FF8E75]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-[#1C1B1B] hover:bg-[#2A2A2A] border border-[#282828] text-[#E5E2E1] font-medium py-2.5 px-4 rounded-[4px] flex items-center justify-center gap-3 text-xs tracking-wide transition-all cursor-pointer disabled:opacity-50 mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </motion.button>

            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-[#282828] w-full" />
              <span className="bg-[#131313] px-2 text-[10px] text-[#E8BDB3]/40 tracking-wider uppercase font-semibold">
                Or with email
              </span>
              <div className="border-t border-[#282828] w-full" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-[#E8BDB3]/70 uppercase mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E8BDB3]/40" />
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#1C1B1B] border border-[#282828] focus:border-[#FF3B00] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#E5E2E1] outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#E8BDB3]/70 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E8BDB3]/40" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C1B1B] border border-[#282828] focus:border-[#FF3B00] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#E5E2E1] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-[#E8BDB3]/70 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E8BDB3]/40" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1C1B1B] border border-[#282828] focus:border-[#FF3B00] rounded-[4px] pl-9 pr-3 py-2 text-xs text-[#E5E2E1] outline-none transition-colors"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#E5E2E1] hover:bg-white text-black font-bold py-2.5 px-4 rounded-[4px] flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
