'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, Search, ShieldCheck, Play, ArrowRight, MousePointer2,
  BrainCircuit, Globe2, Video, Database, Terminal, Layout,
  AlertTriangle, RefreshCw, Layers, CheckCircle2, FlaskConical,
  Activity, Lock, Shield, Plus, Globe, BarChart3, Clock, MoreVertical,
  ChevronRight, ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Dashboard from '../components/Dashboard';

export default function HomePage() {
  const { user, loading } = useAuth();

  const [chaosActive, setChaosActive] = useState(false);
  const [monitors, setMonitors] = useState([
    { id: 1, name: 'Prod Checkout', url: 'autoaegis.io/cart', status: 'active', uptime: '99.9%', latency: '240ms', lat: 13.0827, lon: 80.2707 },
    { id: 2, name: 'API Gateway', url: 'api.autoaegis.io', status: 'active', uptime: '100%', latency: '45ms', lat: 40.7128, lon: -74.0060 },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '' });

  const dashboardRef = useRef(null);

  if (loading) return null;
  if (user) return <Dashboard />;

  const triggerChaos = () => {
    setChaosActive(true);
    setTimeout(() => setChaosActive(false), 3000);
  };

  const handleCreateMonitor = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to create a monitor.', {
        icon: '🔒',
        style: { background: '#111827', color: '#fff', borderRadius: '1rem' }
      });
      return;
    }
    if (!newMonitor.name || !newMonitor.url) return;

    // Add some random lat/lon for variety in the globe
    const monitor = {
      id: Date.now(),
      ...newMonitor,
      status: 'active',
      uptime: '100%',
      latency: '--',
      lat: (Math.random() * 140) - 70, // Random lat -70 to 70
      lon: (Math.random() * 360) - 180  // Random lon -180 to 180
    };
    setMonitors([monitor, ...monitors]);
    setNewMonitor({ name: '', url: '' });
    setIsCreating(false);
    toast.success('Bhoomi Globe Protocol Deployed!');
  };

  return (
    <main className="min-h-screen bg-white page-enter selection:bg-violet-100 selection:text-violet-900">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-[120px] -mr-64 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] -ml-64 -mb-32" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-black uppercase tracking-widest animate-fade-in">
            <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-pulse" />
            Catch what others miss
          </div>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-gray-900 leading-[0.9] text-balance">
            Stop Guessing If Your <br />
            <span className="text-violet-600">Checkout Actually Works.</span>
          </h1>

          <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-3xl mx-auto">
            Traditional monitors check if your server is "Up." We check if your users can actually complete a purchase. Catch "silent" bugs with AI-powered synthetic journeys.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              className="h-16 px-10 rounded-[2rem] text-sm group"
              onClick={() => dashboardRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started for Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
            <button className="flex items-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 rounded-[2rem] transition-all">
              <div className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                <Play size={14} className="text-violet-600 fill-current" />
              </div>
              Watch AI Recorder in Action
            </button>
          </div>
        </div>
      </section>

      {/* 2. The Integrated Dashboard Section */}
      <section ref={dashboardRef} id="dashboard" className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Live Control Center</h2>
            <p className="text-gray-500 font-medium">Manage your protocol monitors and system health in real-time.</p>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row h-[700px]">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 border-r border-gray-100 bg-gray-50/30 flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={16} /> Create Monitor
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                <div className="px-2 mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Monitors ({monitors.length})</span>
                </div>
                {monitors.map((m) => (
                  <div key={m.id} className="group p-4 bg-white border border-gray-100 rounded-2xl hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 transition-all cursor-pointer relative overflow-hidden">
                    {m.status === 'active' && <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black text-gray-900 truncate pr-4">{m.name}</h4>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium truncate mb-3">{m.url}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Uptime</span>
                        <span className="text-[11px] font-black text-emerald-600">{m.uptime}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Latency</span>
                        <span className="text-[11px] font-black text-gray-900">{m.latency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Dashboard Area */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 no-scrollbar relative">
              {/* Header Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Global Uptime", value: "99.98%", icon: <Globe className="text-emerald-500" /> },
                  { label: "Avg Response", value: "142ms", icon: <Clock className="text-violet-500" /> },
                  { label: "Total Probes", value: "1.2M", icon: <BarChart3 className="text-fuchsia-500" /> }
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                        {stat.icon}
                      </div>
                      <MoreVertical size={16} className="text-gray-300" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Visual Placeholder Space */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Active Monitor Globes</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Sync Alpha</span>
                    <Activity size={14} className="text-emerald-500 animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {monitors.map((m) => (
                    <div key={m.id} className="aspect-[16/10] h-[350px] bg-gray-900 rounded-[2rem] flex items-center justify-center border border-gray-800 relative overflow-hidden">
                      <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-full" />
                      <div className="text-center relative z-10 space-y-4">
                        <Globe size={48} className="text-violet-500/50 mx-auto" />
                        <p className="text-zinc-500 text-sm font-medium">3D Protocol Visualization</p>
                      </div>
                    </div>
                  ))}
                  {/* Empty state or hint if no monitors */}
                  {monitors.length === 0 && (
                    <div className="col-span-full aspect-[21/9] bg-gray-50 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-10">
                      <Globe size={48} className="text-gray-200 mb-4" />
                      <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No active globes discovered</p>
                      <p className="text-xs font-medium text-gray-400 mt-2">Deploy a new protocol to initialize spatial monitoring.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Incident Feed */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">System Events</h3>
                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden">
                  {[
                    { status: 'success', event: 'New Monitor Created', time: '2 min ago', desc: 'Precision Workstation monitor is now active.' },
                    { status: 'warning', event: 'Latency Detected', time: '14 min ago', desc: 'Slight delay in US-East response times.' },
                    { status: 'success', event: 'Health Check Passed', time: '1 hour ago', desc: 'All systems operational across 24 nodes.' }
                  ].map((evt, i) => (
                    <div key={i} className={`p-6 flex items-center gap-6 ${i !== 2 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${evt.status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                        {evt.status === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-xs font-black text-gray-900 uppercase tracking-tight">{evt.event}</h5>
                          <span className="text-[10px] font-bold text-gray-400">{evt.time}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500">{evt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Monitor Modal Overlay */}
              {isCreating && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-md border border-gray-100 shadow-2xl rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">New Protocol</h3>
                    <p className="text-gray-500 text-sm mb-8 font-medium">Define the parameters for your next monitor.</p>

                    <form onSubmit={handleCreateMonitor} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monitor Name</label>
                        <input
                          type="text"
                          placeholder="Ex: Main Checkout Flow"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 outline-none transition-all"
                          value={newMonitor.name}
                          onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endpoint URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 outline-none transition-all"
                          value={newMonitor.url}
                          onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsCreating(false)}
                          className="flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-violet-200"
                        >
                          Deploy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* 3. The Problem Section */}
      <section className="py-32 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center border border-red-100">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h2 className="text-5xl font-black tracking-tight text-gray-900 leading-tight">
                "Everything is Green, <br />
                <span className="text-red-500 underline decoration-red-100 decoration-8 underline-offset-8">but Sales are Zero."</span>
              </h2>
              <div className="space-y-6 text-gray-500 text-lg font-medium">
                <p>
                  Most monitoring tools look at CPU and RAM. They don't see the broken JavaScript button or the CSS overlay blocking your "Buy" button.
                </p>
                <div className="p-8 bg-white rounded-[2.5rem] border border-red-50 shadow-sm">
                  <p className="italic text-gray-900 leading-relaxed font-medium">
                    "We call this the <span className="text-red-600 font-black">Watermelon Effect</span>: Green on the outside, but your user experience is bleeding red."
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-emerald-500 rounded-full" />
                    <div className="h-4 w-full bg-gray-100 rounded-full" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-2/3 flex items-center justify-center font-black">
                    <div className="w-full max-w-[200px] aspect-square bg-red-500 rounded-full flex flex-col items-center justify-center p-8 text-center shadow-2xl shadow-red-200 animate-pulse">
                      <span className="text-white text-4xl mb-2">ERROR</span>
                      <span className="text-red-100 text-[10px] uppercase tracking-widest">Broken Funnel</span>
                    </div>
                  </div>
                  <div className="text-center font-black">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Real User Reality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-4">3 Steps to Total Coverage</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm underline decoration-violet-200 decoration-4 underline-offset-8">JS Recorder → LLM → Playwright</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {[
            { icon: <MousePointer2 />, title: "Record Real Intent", desc: "Drop our 1KB script into your app. It captures the CSS selectors and routes real users take." },
            { icon: <BrainCircuit />, title: "AI-Generated Resilience", desc: "Our LLM cleans the logs, removes noise, and writes Playwright scripts that don't break when your UI changes." },
            { icon: <Globe2 />, title: "Global Simulation", desc: "We run your 'Golden Paths' every 5 minutes from 20+ global regions. If it breaks, you get the proof instantly." }
          ].map((step, idx) => (
            <div key={idx} className="group p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:shadow-violet-200/40">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
                {step.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Evidence Vault Section */}
      <section className="py-32 bg-gray-900 text-white rounded-[4rem] mx-4 sm:mx-8 px-8 sm:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-24">
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter leading-none">Don't just get an alert. <br /><span className="text-violet-400">Get a solution.</span></h2>
              <p className="text-gray-400 text-lg font-medium max-w-xl">Everything you need to fix the bug at lightning speed.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Video Replays", desc: "Watch exactly where the bot got stuck.", icon: <Video /> },
              { title: "Network Waterfalls", desc: "See the specific API failure or latency spike.", icon: <Layers /> },
              { title: "DOM Snapshots", desc: "Inspect the HTML state at the exact millisecond.", icon: <Layout /> },
              { title: "Console Log Sync", desc: "View browser errors side-by-side with visual proof.", icon: <Terminal /> }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="text-violet-400 mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h4 className="text-lg font-black mb-3">{f.title}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Social Proof & Trust Section */}
      <section className="py-32 mb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-24">Built for Modern Engineering Teams.</h2>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { icon: <Lock className="text-violet-600" />, title: "Zero PII Leakage", desc: "We automatically mask sensitive inputs like passwords and credit cards." },
              { icon: <RefreshCw className="text-emerald-600" />, title: "CI/CD Integration", desc: "Block bad deployments by running synthetic tests in your pipeline." },
              { icon: <Shield className="text-fuchsia-600" />, title: "Smart Alerting", desc: "No more 3 AM wake-up calls. We only alert on confirmed failures." }
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center space-y-6 group text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gray-50 group-hover:-translate-y-2 transition-transform duration-500">
                  {t.icon}
                </div>
                <h4 className="text-xl font-black text-gray-900">{t.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-gray-100 text-center bg-gray-50/20">
        <div className="flex justify-center gap-12 mb-12 flex-wrap px-4">
          {['Status', 'Docs', 'API', 'Security', 'Privacy'].map(link => (
            <button key={link} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-violet-600 transition-colors">{link}</button>
          ))}
        </div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">&copy; 2024 AUTOAEGIS SYSTEMS INC.</p>
      </footer>
    </main>
  );
}
