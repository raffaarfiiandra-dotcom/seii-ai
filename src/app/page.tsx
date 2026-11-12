'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Send,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Check,
  Code,
  Film,
  Brain,
  Bot,
  Menu,
  X,
  Globe,
  Camera,
  Image as ImageIcon,
  Smartphone,
  Database,
  TrendingUp,
  BookOpen,
  Wrench
} from 'lucide-react';

interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: 'user' | 'assistant';
  content: string | ContentPart[];
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  roleId: string;
  messages: Message[];
  createdAt: number;
}

const AI_MODELS = [
  { id: 'groq:openai/gpt-oss-120b', name: 'GPT-OSS 120B (Groq)', desc: '120 Miliar Parameter, Kilat 0.2s & Limit Reset 1 Menit', badge: '⚡ Groq 120B' },
  { id: 'groq:qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Groq)', desc: 'Super Cepat, Logika Tajam & Gratis', badge: '⚡ Groq Qwen' },
  { id: 'cohere:command-r-plus-08-2024', name: 'Cohere Command R+', desc: 'Flagship RAG & Multilingual (1.000 Call/Bulan Gratis)', badge: '💎 Cohere Pro' },
  { id: 'cohere:c4ai-aya-vision-32b', name: 'Cohere Aya Vision 32B', desc: 'Analisis Foto & Tugas Sekolah (Gratis)', badge: '📷 Free Vision' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', desc: 'Sangat Cepat & Super Hemat ($0.27/M)', badge: '⚡ DeepSeek' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', desc: 'Raja Penalaran Logika & Coding (Setara o1)', badge: '🧠 R1 Reason' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nvidia Nemotron 550B (FREE)', desc: 'Model Raksasa 550 Miliar Parameter Gratis', badge: '🚀 Nvidia 550B' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'Nvidia Omni Reasoning (FREE)', desc: 'Penalaran Logika Gratis Reset Tiap Hari', badge: '🧩 Free Reason' },
  { id: 'baidu/ernie-5.5-flash-preview:free', name: 'Baidu ERNIE Flash (FREE)', desc: 'AI Unggulan China Gratis Reset Tiap Hari', badge: '🇨🇳 Baidu AI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Raja Coding & Arsitektur (OpenRouter)', badge: '👑 Pro Code' },
  { id: 'openai-direct:gpt-4o', name: 'GPT-4o (Direct)', desc: 'Kunci OpenAI Anda', badge: '🌟 OpenAI' },
];

const AI_ROLES = [
  {
    id: 'general',
    name: 'General Assistant',
    icon: Sparkles,
    badge: 'Universal',
    prompt: 'You are Seii AI, a highly versatile personal AI assistant. You provide direct, accurate, and concise answers in Indonesian or English.',
  },
  {
    id: 'market_analyst',
    name: 'Analyst Kripto & Saham (Live)',
    icon: TrendingUp,
    badge: 'Live Data',
    prompt: `You are an elite Financial Markets & Crypto Intelligence Analyst.
Analyze live crypto prices, stock market movements (IHSG, US Stocks), on-chain metrics, and market sentiment.
Always distinguish between factual historical data and speculative projection.
Explain macro trends, key support/resistance, and risk management clearly in Indonesian.`,
  },
  {
    id: 'tutor_vision',
    name: 'Tutor Soal & PR (Vision OCR)',
    icon: BookOpen,
    badge: 'Tugas & Pelajaran',
    prompt: `You are an expert academic tutor across STEM (Math, Physics, Chemistry, Biology) and Humanities.
When shown photos of handwritten or printed questions/homework:
1. First, clearly transcribe what the question is asking.
2. Provide step-by-step reasoning so the student understands the underlying concepts.
3. Highlight the final answer clearly with formulas in markdown.`,
  },
  {
    id: 'frontend_dev',
    name: 'Frontend UI & Web Developer',
    icon: Code,
    badge: 'Next.js & React',
    prompt: `You are an expert Frontend Developer specializing in Next.js App Router, React 19, Tailwind CSS, Glassmorphism, responsive mobile-first UI, and smooth animations. Write complete, ready-to-run code without placeholders.`,
  },
  {
    id: 'backend_dev',
    name: 'Backend & Database Architect',
    icon: Database,
    badge: 'API & SQL',
    prompt: `You are a Principal Backend Engineer specializing in REST/GraphQL APIs, SQLite, PostgreSQL, server authentication, background jobs, and microservices architecture. Prioritize security, performance, and clean schema design.`,
  },
  {
    id: 'mobile_capacitor',
    name: 'Mobile & Audio App Specialist',
    icon: Smartphone,
    badge: 'Capacitor & Android',
    prompt: `You are a Mobile App Engineer specializing in Capacitor, Cordova, Android builds, background audio playback, lock-screen controls, and offline storage.`,
  },
  {
    id: 'bug_fixer',
    name: 'Bug Fixer & QA Debugger',
    icon: Wrench,
    badge: 'Troubleshooter',
    prompt: `You are a Senior Debugging Specialist. When given error logs, code snippets, or buggy behavior, diagnose the exact root cause first, explain why it happened, and provide the definitive fix.`,
  },
  {
    id: 'director',
    name: 'Director AI Video & Visual',
    icon: Film,
    badge: 'Kling & Midjourney',
    prompt: `You are an elite Hollywood-grade AI Cinematographer & Visual Prompt Engineer.
Provide production-ready, hyper-detailed prompts for Midjourney v6, Flux.1, Kling AI, Runway Gen-3, or Luma Dream Machine with camera gear, lighting, color grading, and shot lists.`,
  },
  {
    id: 'reasoner',
    name: 'Deep Logician (R1 Mode)',
    icon: Brain,
    badge: 'Problem Solver',
    prompt: `You are a rigorous analytical reasoning engine. Break down every complex problem into first principles. Silently audit edge cases and think through the solution step-by-step.`,
  },
];

const QUICK_IDEAS = [
  {
    title: '📈 Analisis Saham & Kripto Terkini',
    prompt: 'Berapa harga Bitcoin dan Ethereum sekarang? Bagaimana tren pasar kripto dan sentimen hari ini? Berikan analisis ringkas.',
    needWeb: true,
  },
  {
    title: '📚 Kerjakan Soal dari Foto Tugas',
    prompt: 'Tolong bantu jelaskan langkah pengerjaan soal ini dari foto yang saya lampirkan secara bertahap dan mudah dipahami.',
    needWeb: false,
  },
  {
    title: '🎬 Buat Prompt Video Sinematik',
    prompt: 'Buatkan prompt video ultra-detail untuk Kling AI / Runway Gen-3: Drone shot meluncur di atas kota cyberpunk malam hari dengan pantulan lampu neon di genangan air, kamera 35mm anamorphic.',
    needWeb: false,
  },
  {
    title: '💻 Rancang Fitur Aplikasi Baru',
    prompt: 'Saya mau bikin fitur autentikasi dan payment gateway di Next.js App Router. Bagaimana alur kode dan skema databasenya?',
    needWeb: false,
  },
];

export default function SeiiAIHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
  const [selectedRole, setSelectedRole] = useState<string>(AI_ROLES[0].id);

  const [inputMessage, setInputMessage] = useState('');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load auth & sessions from localStorage
  useEffect(() => {
    const savedPass = localStorage.getItem('seii_auth_pwd');
    if (savedPass === 'seii2026') {
      setIsAuthenticated(true);
    }

    const savedSessions = localStorage.getItem('seii_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setSelectedModel(parsed[0].model || AI_MODELS[0].id);
          setSelectedRole(parsed[0].roleId || AI_ROLES[0].id);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default session
    const newId = Date.now().toString();
    const defaultSession: ChatSession = {
      id: newId,
      title: 'Obrolan Baru',
      model: AI_MODELS[0].id,
      roleId: AI_ROLES[0].id,
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([defaultSession]);
    setActiveSessionId(newId);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('seii_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isStreaming]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'seii2026') {
      localStorage.setItem('seii_auth_pwd', 'seii2026');
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Password salah! Masukkan password pemilik.');
    }
  };

  const handleCreateNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'Obrolan Baru',
      model: selectedModel,
      roleId: selectedRole,
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      const freshId = Date.now().toString();
      const fresh: ChatSession = {
        id: freshId,
        title: 'Obrolan Baru',
        model: selectedModel,
        roleId: selectedRole,
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([fresh]);
      setActiveSessionId(freshId);
    } else {
      setSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 8MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
      // Auto select a vision model if current model doesn't support vision
      if (!selectedModel.includes('vision') && !selectedModel.includes('gpt-4o') && !selectedModel.includes('claude')) {
        setSelectedModel('meta-llama/llama-3.2-11b-vision-instruct:free');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customPrompt?: string, forceWeb?: boolean) => {
    const textToSend = customPrompt || inputMessage.trim();
    if ((!textToSend && !attachedImage) || isStreaming) return;

    setInputMessage('');
    const imageToSend = attachedImage;
    setAttachedImage(null);

    const currentRole = AI_ROLES.find((r) => r.id === selectedRole) || AI_ROLES[0];

    let userContent: string | ContentPart[] = textToSend;
    if (imageToSend) {
      userContent = [
        { type: 'text', text: textToSend || 'Analisis dan jelaskan gambar/soal ini.' },
        { type: 'image_url', image_url: { url: imageToSend } },
      ];
    }

    const userMessage: Message = { role: 'user', content: userContent };
    const updatedMessages = [...(activeSession?.messages || []), userMessage];

    let newTitle = activeSession?.title;
    if (activeSession?.messages.length === 0) {
      newTitle = textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '');
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: newTitle,
              model: selectedModel,
              roleId: selectedRole,
              messages: [...updatedMessages, { role: 'assistant', content: '' }],
            }
          : s
      )
    );

    setIsStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
          systemPrompt: currentRole.prompt,
          password: 'seii2026',
          enableWebSearch: forceWeb !== undefined ? forceWeb : enableWebSearch,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ error: 'Gagal menghubungi server' }));
        throw new Error(errorJson.error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error('Tidak ada respons body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              assistantReply += delta;

              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== activeSessionId) return s;
                  const msgs = [...s.messages];
                  msgs[msgs.length - 1] = {
                    role: 'assistant',
                    content: assistantReply,
                  };
                  return { ...s, messages: msgs };
                })
              );
            } catch (err) {
              // ignore partial json
            }
          }
        }
      }
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = {
            role: 'assistant',
            content: `⚠️ **Terjadi Kendala:** ${err?.message || 'Gagal memproses pesan.'}`,
          };
          return { ...s, messages: msgs };
        })
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1422]/90 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl glow-cyan text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">SEII AI HUB</h1>
          <p className="text-gray-400 text-sm mb-6">
            Pusat Komando AI Pribadi (Live Web, Vision & Multi-Team)
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan Password Akses..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0d17] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
              {passwordError && <p className="text-red-400 text-xs mt-2">{passwordError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg transition duration-200"
            >
              Buka Kunci Akses
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-6">Sistem Terproteksi Sandi Pribadi</p>
        </div>
      </div>
    );
  }

  const activeRoleData = AI_ROLES.find((r) => r.id === selectedRole) || AI_ROLES[0];
  const ActiveRoleIcon = activeRoleData.icon;

  return (
    <div className="flex h-screen bg-[#080a10] text-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0c101c] border-r border-gray-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                SEII AI <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">v2.0</span>
              </h2>
              <p className="text-[11px] text-gray-400">Autonomous AI Hub</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleCreateNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Proyek / Chat Baru
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1.5 py-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
            Riwayat Obrolan
          </p>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setActiveSessionId(s.id);
                setSelectedModel(s.model || AI_MODELS[0].id);
                setSelectedRole(s.roleId || AI_ROLES[0].id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition ${
                s.id === activeSessionId
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
              }`}
            >
              <span className="truncate pr-2 font-medium">{s.title}</span>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition"
                title="Hapus obrolan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-gray-800/80 bg-[#090d18] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-300 font-medium">Owner: seiichh</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('seii_auth_pwd');
              setIsAuthenticated(false);
            }}
            className="hover:text-red-400 flex items-center gap-1 text-[11px]"
            title="Keluar / Kunci"
          >
            <Unlock className="w-3.5 h-3.5" /> Kunci
          </button>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Header / Control Bar */}
        <header className="h-16 border-b border-gray-800/80 bg-[#0b0e18]/90 backdrop-blur-md px-3 md:px-4 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto py-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-gray-800/70 text-gray-300 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Selector */}
            <div className="flex items-center gap-1.5 bg-[#101524] border border-gray-700/70 rounded-xl px-2.5 py-1.5 shrink-0">
              <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 max-w-[140px] sm:max-w-none truncate"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#101524] text-white">
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Persona / Role Selector */}
            <div className="flex items-center gap-1.5 bg-[#101524] border border-gray-700/70 rounded-xl px-2.5 py-1.5 shrink-0">
              <ActiveRoleIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 max-w-[150px] sm:max-w-none truncate"
              >
                {AI_ROLES.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#101524] text-white">
                    Tim: {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Web Search Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEnableWebSearch(!enableWebSearch)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                enableWebSearch
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:text-gray-200'
              }`}
              title="Toggle Live Web Browsing (Saham, Kripto, Berita)"
            >
              <Globe className={`w-3.5 h-3.5 ${enableWebSearch ? 'text-cyan-400 animate-spin-slow' : ''}`} />
              <span className="hidden sm:inline">Live Web:</span> {enableWebSearch ? 'ON' : 'OFF'}
            </button>
          </div>
        </header>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeSession.messages.length === 0 ? (
            /* Welcome Screen / Quick Launch */
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center py-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center mb-5 shadow-xl shadow-cyan-500/20 glow-cyan">
                <ActiveRoleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-wide">
                SEII AI HUB • Tim Spesialis Siap
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
                Tanya harga saham/koin terkini, kirim foto PR dari HP, atau rancang project koding & video sinematik.
              </p>

              {/* Quick Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {QUICK_IDEAS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt, item.needWeb)}
                    className="p-3.5 rounded-2xl bg-[#0f1424]/80 border border-gray-800 hover:border-cyan-500/40 hover:bg-[#131a30] transition text-left group"
                  >
                    <p className="text-xs font-bold text-cyan-300 mb-1 flex items-center justify-between">
                      {item.title}
                      <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-cyan-400" />
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto space-y-5 pb-6">
              {activeSession.messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                let textContent = '';
                let imageUrl: string | null = null;

                if (typeof msg.content === 'string') {
                  textContent = msg.content;
                } else if (Array.isArray(msg.content)) {
                  for (const part of msg.content) {
                    if (part.type === 'text') textContent += part.text;
                    if (part.type === 'image_url') imageUrl = part.image_url?.url || null;
                  }
                }

                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      !isAssistant ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`relative group max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm leading-relaxed ${
                        !isAssistant
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md'
                          : 'bg-[#101524] border border-gray-800 text-gray-200 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {/* Attached Image if any */}
                      {imageUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-w-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt="Uploaded attachment" className="w-full h-auto object-cover max-h-60" />
                        </div>
                      )}

                      {isAssistant ? (
                        <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeText = String(children).replace(/\n$/, '');
                                return !inline ? (
                                  <div className="relative my-3 rounded-xl overflow-hidden border border-gray-700/80 bg-[#070a12]">
                                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e1322] border-b border-gray-800 text-[11px] text-gray-400">
                                      <span className="font-mono text-cyan-400 font-semibold uppercase">
                                        {match ? match[1] : 'code'}
                                      </span>
                                      <button
                                        onClick={() => copyToClipboard(codeText, index)}
                                        className="flex items-center gap-1 hover:text-white transition"
                                      >
                                        {copiedIndex === index ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" /> Salin Kode
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="p-3.5 overflow-x-auto text-[11px] sm:text-[12px] font-mono leading-relaxed text-gray-200">
                                      <code>{children}</code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="bg-gray-800/80 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px] sm:text-[12px]" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {textContent || '...'}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{textContent}</p>
                      )}

                      {isAssistant && textContent && (
                        <button
                          onClick={() => copyToClipboard(textContent, index)}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition text-xs flex items-center gap-1"
                          title="Salin jawaban"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-gray-700 flex items-center justify-center shrink-0 text-xs font-bold text-gray-200">
                        S
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-3 sm:p-4 bg-[#0a0d16]/95 border-t border-gray-800/80">
          <div className="max-w-3xl mx-auto relative">
            {/* Attached Image Preview */}
            {attachedImage && (
              <div className="mb-2 inline-flex items-center gap-2 p-1.5 bg-[#141a2c] border border-cyan-500/40 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
                <span className="text-[11px] text-cyan-200 font-medium">Foto Terlampir</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 hover:text-red-400 text-gray-400 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#121727] border border-gray-700/80 focus-within:border-cyan-500 rounded-2xl p-2 pl-3 transition shadow-lg shadow-black/40"
            >
              {/* File Input for Camera / Photos */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-gray-800/60 transition"
                title="Kirim Foto / Jepret Soal dari HP"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={
                  attachedImage
                    ? 'Tanyakan apa yang perlu dijelaskan dari foto ini...'
                    : `Tanya ${activeRoleData.name} atau berita live...`
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !attachedImage) || isStreaming}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:hover:from-cyan-500 text-white transition shadow-md shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 mt-2 px-1">
              <span>Model: <strong className="text-gray-400">{AI_MODELS.find(m => m.id === selectedModel)?.name}</strong></span>
              <span className="truncate max-w-[200px] sm:max-w-none">
                {enableWebSearch ? '🌐 Live Web Search Aktif' : 'Mode Offline Database'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
