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
  Terminal,
  Bot,
  Settings,
  Menu,
  X,
  Layers,
  Wand2
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', desc: 'OpenRouter ($0.27/M)', badge: '⚡ DeepSeek' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', desc: 'Penalaran Logika / Reasoning', badge: '🧠 R1 Reason' },
  { id: 'openai-direct:gpt-4o', name: 'GPT-4o (Direct)', desc: 'Resmi API OpenAI Anda', badge: '🌟 OpenAI Key' },
  { id: 'openai-direct:gpt-4o-mini', name: 'GPT-4o Mini (Direct)', desc: 'Resmi API OpenAI Cepat', badge: '⚡ OpenAI Key' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Raja Coding & Arsitektur', badge: '👑 Pro' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', desc: 'Open Weights Cepat', badge: '🚀 Open' },
];

const AI_ROLES = [
  {
    id: 'general',
    name: 'General Assistant',
    icon: Sparkles,
    badge: 'Universal',
    prompt: 'You are Seii AI, a highly versatile personal assistant. You provide clear, accurate, and direct answers in Indonesian or English.',
  },
  {
    id: 'director',
    name: 'Director AI Video & Visual',
    icon: Film,
    badge: 'Kling / Runway / Flux',
    prompt: `You are an elite Hollywood-grade AI Cinematographer & Visual Prompt Engineer. 
When asked to create visual/video projects or prompts:
1. Provide production-ready, hyper-detailed prompts for Midjourney v6, Flux.1, Kling AI, Runway Gen-3, or Luma Dream Machine.
2. Specify exact camera gear (e.g. ARRI Alexa LF, 35mm Anamorphic, f/1.8), cinematic lighting (Rembrandt, volumetric haze, golden hour, cyberpunk neon), color grading (teal & orange, Kodachrome), and motion descriptions (slow push-in, dynamic orbit, handheld whip pan).
3. If writing a video concept, output shot lists with: Shot #, Timing, Camera Angle, Subject Action, and Exact Generation Prompt.`,
  },
  {
    id: 'architect',
    name: 'Lead Developer & Architect',
    icon: Code,
    badge: 'Fullstack Dev',
    prompt: `You are a Principal Software Architect and Fullstack Engineer.
Always write clean, production-ready code with complete logic (avoid placeholders like '// TODO').
Explain technical decisions clearly with pros/cons. Provide robust error handling, security practices, and optimal file structures. Format all code neatly in markdown.`,
  },
  {
    id: 'reasoner',
    name: 'Deep Logician (R1 Mode)',
    icon: Brain,
    badge: 'Problem Solver',
    prompt: `You are an analytical reasoning engine. 
Break down every complex problem into first principles. Silently audit edge cases, challenge invalid assumptions, and think through the solution step-by-step before delivering the definitive answer.`,
  },
];

const QUICK_IDEAS = [
  {
    title: '🎬 Prompt Video Sinematik',
    prompt: 'Buatkan prompt sinematik ultra-detail untuk Kling AI / Runway Gen-3 dengan tema: Cyberpunk Jakarta malam hari di bawah hujan lebat, kamera anamorphic 35mm low-angle.',
  },
  {
    title: '🎨 Prompt Foto Flux / Midjourney',
    prompt: 'Buatkan 3 variasi prompt foto hyper-realistic untuk Midjourney v6: Karakter futuristik bertopeng neon di pasar tradisional, lighting moody volumetric, detail 8K.',
  },
  {
    title: '💻 Rancang Arsitektur Web App',
    prompt: 'Rancang arsitektur lengkap aplikasi web SaaS modern menggunakan Next.js App Router, Tailwind, TypeScript, dan SQLite/PostgreSQL beserta struktur folder lengkap.',
  },
  {
    title: '🧠 Analisis & Pecahkan Masalah Rumit',
    prompt: 'Bantu saya analisis rencana bisnis platform AI multi-agent: apa saja kelemahan utama, potensi bottleneck biaya token, dan strategi monetisasinya?',
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isStreaming) return;

    setInputMessage('');

    const currentRole = AI_ROLES.find((r) => r.id === selectedRole) || AI_ROLES[0];
    const userMessage: Message = { role: 'user', content: textToSend };

    const updatedMessages = [...(activeSession?.messages || []), userMessage];

    // Set auto title from first prompt
    let newTitle = activeSession?.title;
    if (activeSession?.messages.length === 0) {
      newTitle = textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '');
    }

    // Update session state
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

  // Login Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1422]/90 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl glow-cyan text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">SEII AI HUB</h1>
          <p className="text-gray-400 text-sm mb-6">
            Pusat Komando AI Pribadi (DeepSeek, Claude, & Multi-Agent)
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
                SEII AI <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">v1.0</span>
              </h2>
              <p className="text-[11px] text-gray-400">Personal AI Workspace</p>
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
        <header className="h-16 border-b border-gray-800/80 bg-[#0b0e18]/90 backdrop-blur-md px-4 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-gray-800/70 text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Selector */}
            <div className="flex items-center gap-2 bg-[#101524] border border-gray-700/70 rounded-xl px-3 py-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#101524] text-white">
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Persona / Role Selector */}
            <div className="flex items-center gap-2 bg-[#101524] border border-gray-700/70 rounded-xl px-3 py-1.5">
              <ActiveRoleIcon className="w-4 h-4 text-indigo-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              >
                {AI_ROLES.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#101524] text-white">
                    Divisi: {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              OpenRouter Connected
            </span>
          </div>
        </header>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeSession.messages.length === 0 ? (
            /* Welcome Screen / Quick Launch */
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center py-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20 glow-cyan">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-3 tracking-wide">
                Halo, Seiichh! Siap Garap Project?
              </h1>
              <p className="text-gray-400 text-sm max-w-lg mb-8 leading-relaxed">
                Pilih peran AI di atas (Video/Visual Director, Fullstack Dev, atau R1 Reasoner), lalu beri instruksi.
              </p>

              {/* Quick Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
                {QUICK_IDEAS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-2xl bg-[#0f1424]/80 border border-gray-800 hover:border-cyan-500/40 hover:bg-[#131a30] transition text-left group"
                  >
                    <p className="text-xs font-bold text-cyan-300 mb-1.5 flex items-center justify-between">
                      {item.title}
                      <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-cyan-400" />
                    </p>
                    <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto space-y-6 pb-6">
              {activeSession.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`relative group max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md'
                        : 'bg-[#101524] border border-gray-800 text-gray-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
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
                                  <pre className="p-3.5 overflow-x-auto text-[12px] font-mono leading-relaxed text-gray-200">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              ) : (
                                <code className="bg-gray-800/80 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[12px]" {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {msg.content || '...'}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {msg.role === 'assistant' && msg.content && (
                      <button
                        onClick={() => copyToClipboard(msg.content, index)}
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

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gray-700 flex items-center justify-center shrink-0 text-xs font-bold text-gray-200">
                      S
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-4 bg-[#0a0d16]/95 border-t border-gray-800/80">
          <div className="max-w-3xl mx-auto relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#121727] border border-gray-700/80 focus-within:border-cyan-500 rounded-2xl p-2 pl-4 transition shadow-lg shadow-black/40"
            >
              <input
                type="text"
                placeholder={`Tanya ${activeRoleData.name} atau masukkan brief project...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isStreaming}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:hover:from-cyan-500 text-white transition shadow-md shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-1">
              <span>Model aktif: <strong className="text-gray-400">{AI_MODELS.find(m => m.id === selectedModel)?.name}</strong></span>
              <span>Tekan Enter untuk kirim • Password: <code className="text-gray-400">seii2026</code></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
