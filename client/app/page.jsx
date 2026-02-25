'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, Search, ShieldCheck, Play, ArrowRight, MousePointer2,
  BrainCircuit, Globe2, Video, Database, Terminal, Layout,
  AlertTriangle, RefreshCw, Layers, CheckCircle2, FlaskConical,
  Activity, Lock, Shield, Plus, Globe, BarChart3, Clock, MoreVertical,
  ChevronRight, ExternalLink, FileSearch, Brain, Radar, Cpu,
  HeartPulse, Fingerprint, ScanEye, BadgeCheck
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
        style: { background: '#1a1a2e', color: '#e2e8f0', borderRadius: '1rem', border: '1px solid rgba(139,92,246,0.2)' }
      });
      return;
    }
    if (!newMonitor.name || !newMonitor.url) return;

    const monitor = {
      id: Date.now(),
      ...newMonitor,
      status: 'active',
      uptime: '100%',
      latency: '--',
      lat: (Math.random() * 140) - 70,
      lon: (Math.random() * 360) - 180
    };
    setMonitors([monitor, ...monitors]);
    setNewMonitor({ name: '', url: '' });
    setIsCreating(false);
    toast.success('Bhoomi Globe Protocol Deployed!');
  };

  return (
    <main className="min-h-screen bg-[#0a0a14] page-enter selection:bg-violet-500/30 selection:text-white">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-hero-gradient">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] -mr-64 -mt-32 animate-glow-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-800/8 rounded-full blur-[120px] -ml-64 -mb-32 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest animate-fade-in">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Shadow Recording · AI Diagnostics · Self-Healing
          </div>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-white leading-[0.9] text-balance">
            Stop Monitoring Servers. <br />
            <span className="text-gradient-purple">Start Validating Journeys.</span>
          </h1>

          <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-3xl mx-auto">
            Traditional monitors check if your heart is beating. We check if you can actually run. AutoAegis uses <span className="text-violet-400 font-bold">Shadow Recording</span> and <span className="text-violet-400 font-bold">AI-Diagnostics</span> to catch the 'Silent Red' inside your 'Green' dashboards.
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
            <a
              href="https://www.npmjs.com/package/aegis_auto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 rounded-[2rem] transition-all"
            >
              <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 780 250" className="w-5 h-5"><path fill="#e2e8f0" d="M240,250h100v-50h100V0H240V250z M340,50h50v100h-50V50z M480,0v200h100V50h50v150h50V50h50v150h50V0H480z M0,200h100V50h50v150h50V0H0V200z"></path></svg>
              </div>
              Read the Docs
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. LIVE CONTROL CENTER + AVOCADO GRADE
      ═══════════════════════════════════════════════════════════ */}
      <section ref={dashboardRef} id="dashboard" className="py-24 bg-section-gradient border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight">Live Control Center</h2>
            <p className="text-gray-500 font-medium">Manage your protocol monitors and system health in real-time.</p>
          </div>

          <div className="glass-card rounded-[3rem] overflow-hidden flex flex-col lg:flex-row h-[700px]">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 border-r border-white/5 bg-[#0e0e1a]/50 flex flex-col">
              <div className="p-6 border-b border-white/5">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/30"
                >
                  <Plus size={16} /> Create Monitor
                </button>
              </div>

              {/* Avocado Grade Card */}
              <div className="p-4 border-b border-white/5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-violet-500/10 border border-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeCheck size={16} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">Avocado Grade</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-emerald-400">98%</span>
                      <span className="text-[10px] font-bold text-emerald-400/60 mb-1">Journey Integrity</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium mt-2 leading-relaxed">
                      Going beyond uptime. Measures the health of your 'Golden Paths' — ensuring the internal core is as solid as the surface.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                <div className="px-2 mb-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Monitors ({monitors.length})</span>
                </div>
                {monitors.map((m) => (
                  <div key={m.id} className="group p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer relative overflow-hidden">
                    {m.status === 'active' && <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black text-white truncate pr-4">{m.name}</h4>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-green" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium truncate mb-3">{m.url}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Uptime</span>
                        <span className="text-[11px] font-black text-emerald-400">{m.uptime}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Latency</span>
                        <span className="text-[11px] font-black text-white">{m.latency}</span>
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
                  { label: "Global Uptime", value: "99.98%", icon: <Globe className="text-emerald-400" /> },
                  { label: "Avg Response", value: "142ms", icon: <Clock className="text-violet-400" /> },
                  { label: "Total Probes", value: "1.2M", icon: <BarChart3 className="text-fuchsia-400" /> }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                        {stat.icon}
                      </div>
                      <MoreVertical size={16} className="text-gray-600" />
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <span className="text-2xl font-black text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Globe Visualization Area */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Monitor Globes</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Sync Alpha</span>
                    <Activity size={14} className="text-emerald-400 animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {monitors.map((m) => (
                    <div key={m.id} className="aspect-[16/10] h-[350px] bg-[#0a0a14] rounded-[2rem] border border-white/5 relative overflow-hidden group">
                      <img
                        src="/fxVE.gif"
                        alt={`${m.name} — Live Protocol Visualization`}
                        className="absolute inset-0 w-full h-full object-cover rounded-[2rem] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse glow-green" />
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{m.name} — Live</span>
                      </div>
                    </div>
                  ))}
                  {monitors.length === 0 && (
                    <div className="col-span-full aspect-[21/9] bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center p-10">
                      <Globe size={48} className="text-gray-700 mb-4" />
                      <p className="text-sm font-black text-gray-600 uppercase tracking-widest">No active globes discovered</p>
                      <p className="text-xs font-medium text-gray-600 mt-2">Deploy a new protocol to initialize spatial monitoring.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* System Events */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">System Events</h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                  {[
                    { status: 'success', event: 'Journey Integrity Verified', time: '2 min ago', desc: 'Checkout flow passed all 14 assertions. Avocado Grade: 98%.' },
                    { status: 'warning', event: 'Silent Red Detected', time: '14 min ago', desc: 'API returns 200 OK but response body missing "order_id" — journey incomplete.' },
                    { status: 'success', event: 'Self-Healing Applied', time: '1 hour ago', desc: 'LLM updated 3 CSS selectors after UI deployment. Zero manual intervention.' }
                  ].map((evt, i) => (
                    <div key={i} className={`p-6 flex items-center gap-6 ${i !== 2 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${evt.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {evt.status === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-xs font-black text-white uppercase tracking-tight">{evt.event}</h5>
                          <span className="text-[10px] font-bold text-gray-600">{evt.time}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500">{evt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Monitor Modal */}
              {isCreating && (
                <div className="absolute inset-0 z-20 bg-[#0a0a14]/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
                  <div className="glass-card w-full max-w-md shadow-2xl shadow-purple-900/20 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500">
                    <h3 className="text-2xl font-black text-white mb-2">New Protocol</h3>
                    <p className="text-gray-500 text-sm mb-8 font-medium">Define the parameters for your next monitor.</p>
                    <form onSubmit={handleCreateMonitor} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Monitor Name</label>
                        <input type="text" placeholder="Ex: Main Checkout Flow" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-gray-600 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500/30 outline-none transition-all" value={newMonitor.name} onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Endpoint URL</label>
                        <input type="url" placeholder="https://example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-gray-600 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500/30 outline-none transition-all" value={newMonitor.url} onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })} required />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-900/30">Deploy</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. THE WATERMELON PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-section-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
              <h2 className="text-5xl font-black tracking-tight text-white leading-tight">
                "Everything is Green, <br />
                <span className="text-red-400 underline decoration-red-500/20 decoration-8 underline-offset-8">but Sales are Zero."</span>
              </h2>
              <div className="space-y-6 text-gray-400 text-lg font-medium">
                <p>
                  Most monitoring tools look at CPU and RAM. They don't see the broken JavaScript button or the CSS overlay blocking your "Buy" button.
                </p>
                <div className="p-8 glass-card rounded-[2.5rem]">
                  <p className="italic text-gray-300 leading-relaxed font-medium">
                    "We call this the <span className="text-red-400 font-black">Watermelon Effect</span>: Green on the outside, but your user experience is bleeding red."
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-[#12121e] rounded-[3rem] p-12 border border-white/5 shadow-2xl shadow-black/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <div className="h-6 w-32 bg-emerald-500/30 rounded-full" />
                    <div className="h-4 w-full bg-white/5 rounded-full" />
                    <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                  </div>
                  <div className="h-2/3 flex items-center justify-center font-black">
                    <div className="w-full max-w-[200px] aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-full flex flex-col items-center justify-center p-8 text-center shadow-2xl shadow-red-900/40 animate-pulse">
                      <span className="text-white text-4xl mb-2">ERROR</span>
                      <span className="text-red-200/60 text-[10px] uppercase tracking-widest">Broken Funnel</span>
                    </div>
                  </div>
                  <div className="text-center font-black">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">Real User Reality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. HOW IT WORKS — 3 STEPS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#0a0a14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl font-black tracking-tight text-white mb-4">3 Steps to Self-Diagnostic Immunity</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm underline decoration-violet-500/30 decoration-4 underline-offset-8">Shadow → Stress-Test → Diagnose</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Fingerprint />,
              step: "01",
              title: "Shadow & Learn",
              time: "0–30s",
              desc: "Just interact with your site. Our Shadow Recorder maps your 'Healthy DNA' — capturing selectors, network baselines, and human timing."
            },
            {
              icon: <Radar />,
              step: "02",
              title: "Stress-Test Simulation",
              time: "Every 5min",
              desc: "Our Guardian Fleet executes your journey from 20+ regions, looking for performance decay and silent API failures."
            },
            {
              icon: <Brain />,
              step: "03",
              title: "Autonomous Diagnosis",
              time: "Instant",
              desc: "If a journey breaks, we don't just alert you. We diagnose the root cause and push the full forensic package to your dashboard."
            }
          ].map((step, idx) => (
            <div key={idx} className="group p-10 glass-card rounded-[2.5rem] hover:border-violet-500/30 transition-all hover:shadow-2xl hover:shadow-purple-900/20 relative">
              <div className="absolute top-6 right-8 text-[10px] font-black text-violet-500/30 uppercase tracking-widest">{step.step}</div>
              <div className="w-16 h-16 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500 border border-violet-500/20">
                {step.icon}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-black text-white">{step.title}</h3>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">{step.time}</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. EVIDENCE LOCKER + AI ROOT CAUSE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#12121e] text-white rounded-[4rem] mx-4 sm:mx-8 px-8 sm:px-12 border border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-24">
            <div className="space-y-6">
              <h2 className="text-5xl font-black tracking-tighter leading-none">Don't just get an alert. <br /><span className="text-gradient-purple">Get the full forensic package.</span></h2>
              <p className="text-gray-400 text-lg font-medium max-w-xl">Every failure comes with a complete <span className="text-violet-400 font-bold">Diagnostic Package</span> — so you fix bugs at lightning speed, not debugging speed.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { title: "Video Replays", desc: "Watch exactly where the bot got stuck — frame by frame.", icon: <Video /> },
              { title: "HAR Network Receipts", desc: "Full HTTP Archive (HAR 1.2) capturing every request, response, and timing.", icon: <Layers /> },
              { title: "DOM Snapshots", desc: "Inspect the HTML state at the exact millisecond of failure.", icon: <Layout /> },
              { title: "Console Log Sync", desc: "View browser errors and warnings side-by-side with visual proof.", icon: <Terminal /> }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all group">
                <div className="text-violet-400 mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h4 className="text-lg font-black mb-3">{f.title}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Root-Cause Analysis Feature */}
          <div className="glass-card rounded-[2.5rem] p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-10">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center border border-violet-500/20 flex-shrink-0">
                <Brain size={36} className="text-violet-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-white">AI Root-Cause Analysis</h3>
                  <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">Virtual SRE</span>
                </div>
                <p className="text-gray-400 text-base font-medium leading-relaxed max-w-2xl">
                  Our Virtual SRE analyzes the technical wreckage — HAR files, console logs, and step-by-step traces — to tell you exactly <span className="text-white font-bold italic">why</span> it failed in plain English. No more digging through 500-line stack traces at 3 AM.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Causal Chain Analysis
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Plain English Reports
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Fix Suggestions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. TECHNICAL TRANSPARENCY TABLE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#0a0a14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black tracking-tight text-white">Technical Transparency</h2>
            <p className="text-gray-500 font-medium text-lg">The AutoAegis Advantage — no hidden complexity.</p>
          </div>

          <div className="glass-card rounded-[2.5rem] overflow-hidden">
            {[
              { feature: "Setup Time", icon: <Clock size={20} className="text-violet-400" />, advantage: "30 Seconds.", detail: "Just use your app; we 'shadow' your DNA." },
              { feature: "Error Detection", icon: <ScanEye size={20} className="text-amber-400" />, advantage: "Silent Sentinel.", detail: "Intercepts 500-errors hidden behind 'Green' buttons." },
              { feature: "Maintenance", icon: <Cpu size={20} className="text-emerald-400" />, advantage: "Self-Healing AI.", detail: "LLM updates scripts when your CSS classes change." },
              { feature: "Evidence", icon: <FileSearch size={20} className="text-fuchsia-400" />, advantage: "Forensic-Grade.", detail: "HAR 1.2, Trace-Logs, and Causal Chain analysis." }
            ].map((row, i) => (
              <div key={i} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-8 ${i !== 3 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 flex-shrink-0">
                  {row.icon}
                </div>
                <div className="flex-shrink-0 w-40">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{row.feature}</span>
                </div>
                <div className="flex-1">
                  <span className="text-white font-black">{row.advantage}</span>
                  <span className="text-gray-400 font-medium ml-2">{row.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. TRUST & ENGINEERING
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black tracking-tight text-white mb-24">Built for Modern Engineering Teams.</h2>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { icon: <Lock className="text-violet-400" />, title: "Zero PII Leakage", desc: "We automatically mask sensitive inputs like passwords and credit cards." },
              { icon: <RefreshCw className="text-emerald-400" />, title: "CI/CD Integration", desc: "Block bad deployments by running synthetic tests in your pipeline." },
              { icon: <Shield className="text-fuchsia-400" />, title: "Smart Alerting", desc: "No more 3 AM wake-up calls. We only alert on confirmed failures." }
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center space-y-6 group text-center">
                <div className="w-20 h-20 bg-[#12121e] rounded-3xl flex items-center justify-center shadow-lg shadow-black/20 border border-white/5 group-hover:-translate-y-2 transition-transform duration-500">
                  {t.icon}
                </div>
                <h4 className="text-xl font-black text-white">{t.title}</h4>
                <p className="text-gray-400 font-medium leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. MIC DROP CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 mx-4 sm:mx-8">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-[3rem] p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-[60px]" />
          <div className="relative z-10 space-y-8">
            <HeartPulse size={40} className="text-violet-400 mx-auto" />
            <blockquote className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              "We aren't just watching your business; <br />
              <span className="text-gradient-purple">we're protecting its ability to function."</span>
            </blockquote>
            <Button
              variant="primary"
              size="lg"
              className="h-16 px-12 rounded-[2rem] text-sm group mx-auto"
              onClick={() => dashboardRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Protecting Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="py-24 border-t border-white/5 text-center bg-[#0a0a14]">
        <div className="flex justify-center gap-12 mb-12 flex-wrap px-4">
          {['Status', 'Docs', 'API', 'Security', 'Privacy'].map(link => (
            <button key={link} className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-violet-400 transition-colors">{link}</button>
          ))}
        </div>
        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">&copy; 2024 AUTOAEGIS SYSTEMS INC.</p>
      </footer>
    </main>
  );
}
