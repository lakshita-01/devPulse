import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BarChart3, Users, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track team performance in real-time' },
    { icon: Users, title: 'Team Collaboration', desc: 'Work together seamlessly' },
    { icon: Zap, title: 'AI-Powered', desc: 'Smart task generation with AI' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(0,86%,86%)] to-[hsl(177,100%,65%)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-[hsl(0,86%,56%)] to-[hsl(177,100%,45%)] bg-clip-text text-transparent">
              DevPulse
            </span>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="font-semibold"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(0,86%,56%)]" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI-Powered Project Management</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
              Manage Projects with
              <br />
              <span className="bg-gradient-to-r from-[hsl(0,86%,56%)] to-[hsl(177,100%,45%)] bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Streamline your workflow with AI-driven task management, real-time collaboration, and powerful analytics.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white shadow-lg hover:shadow-xl transition-all text-lg px-8"
              >
                Try it Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => document.getElementById('preview').scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="text-lg px-8"
              >
                See Preview
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[hsl(0,86%,96%)] to-[hsl(177,100%,95%)] dark:from-[hsl(0,86%,20%)] dark:to-[hsl(177,100%,20%)] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[hsl(0,86%,56%)] dark:text-[hsl(177,100%,55%)]" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="py-20 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              See DevPulse in Action
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Everything you need to manage projects efficiently
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-700"
          >
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop"
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
              <div className="text-white">
                <h3 className="font-display font-bold text-2xl mb-2">Powerful Dashboard</h3>
                <p className="text-white/90">Track everything in one place</p>
              </div>
            </div>
          </motion.div>

          {/* Feature List */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {[
              'Real-time collaboration',
              'AI-powered task generation',
              'Advanced analytics',
              'Team management',
              'Kanban boards',
              'Dark mode support',
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[hsl(0,86%,96%)] to-[hsl(177,100%,95%)] dark:from-[hsl(0,86%,20%)] dark:to-[hsl(177,100%,20%)] p-12 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Ready to boost your productivity?
            </h2>
            <p className="text-xl text-slate-700 dark:text-slate-300 mb-8">
              Join teams already using DevPulse to manage their projects
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white shadow-lg hover:shadow-xl transition-all text-lg px-12"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>© 2024 DevPulse. Built with ❤️ for productivity.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
