import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(0,86%,86%)] to-[hsl(177,100%,65%)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-[hsl(0,86%,56%)] to-[hsl(177,100%,45%)] bg-clip-text text-transparent">
                DevPulse
              </span>
            </div>
            
            <h1 className="font-display font-bold text-5xl text-slate-900 leading-tight">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-[hsl(0,86%,56%)] to-[hsl(177,100%,45%)] bg-clip-text text-transparent">
                Project Management
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              Streamline your workflow with intelligent task management, real-time collaboration,
              and AI-driven productivity insights.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
                <div className="text-3xl font-bold text-[hsl(0,86%,56%)] mb-1">10x</div>
                <div className="text-sm text-slate-600">Faster Task Creation</div>
              </div>
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
                <div className="text-3xl font-bold text-[hsl(177,100%,45%)] mb-1">24/7</div>
                <div className="text-sm text-slate-600">AI Assistance</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200">
            <div className="mb-8">
              <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">
                {isLogin ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="text-slate-600">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-11 h-12 bg-white border-slate-300 focus:border-primary"
                      required={!isLogin}
                      data-testid="auth-name-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-11 h-12 bg-white border-slate-300 focus:border-primary"
                    required
                    data-testid="auth-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 h-12 bg-white border-slate-300 focus:border-primary"
                    required
                    data-testid="auth-password-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] hover:from-[hsl(0,86%,56%)] hover:to-[hsl(177,100%,45%)] text-white font-semibold rounded-xl shadow-lg shadow-[hsl(0,86%,66%)]/25 transition-all"
                data-testid="auth-submit-btn"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-600 hover:text-[hsl(0,86%,56%)] transition-colors"
                data-testid="auth-toggle-btn"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-semibold">{isLogin ? 'Sign up' : 'Sign in'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
