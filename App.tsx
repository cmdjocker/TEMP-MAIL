
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Inbox, 
  RefreshCw, 
  Trash2, 
  Shield, 
  Copy, 
  Check, 
  Plus, 
  Mail, 
  Clock, 
  ChevronRight,
  Star,
  Search,
  AlertCircle,
  Sun,
  Moon,
  Edit3,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Email, Domain } from './types';
import { AVAILABLE_DOMAINS, INITIAL_EMAILS } from './constants';
import { generateIncomingEmails } from './services/geminiService';

const App: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [domain, setDomain] = useState<Domain>(AVAILABLE_DOMAINS[0]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isEditing, setIsEditing] = useState(false);

  const generateRandomName = () => Math.random().toString(36).substring(2, 10);

  const generateNewAddress = useCallback(() => {
    setAddress(generateRandomName());
    setEmails([...INITIAL_EMAILS]);
    setSelectedEmailId(null);
    setIsEditing(false);
  }, []);

  useEffect(() => {
    generateNewAddress();
  }, [generateNewAddress]);

  const fullEmail = useMemo(() => `${address}@${domain}`, [address, domain]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const newMails = await generateIncomingEmails(fullEmail, emails.length);
      if (newMails.length > 0) {
        setEmails(prev => [...newMails, ...prev]);
      }
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmailId === id) setSelectedEmailId(null);
  };

  const markAsRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
  };

  const filteredEmails = emails.filter(e => 
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  // Dynamic theme mapping
  const colors = {
    bg: theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50',
    text: theme === 'dark' ? 'text-slate-200' : 'text-gray-800',
    sidebar: theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-gray-200 shadow-xl',
    header: theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200 shadow-sm',
    card: theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300 shadow-md',
    item: theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100',
    selected: theme === 'dark' ? 'bg-slate-800 border-l-indigo-500' : 'bg-indigo-50 border-l-indigo-600',
    muted: theme === 'dark' ? 'text-slate-400' : 'text-gray-500',
    border: theme === 'dark' ? 'border-slate-800' : 'border-gray-200',
    input: theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300',
    btnSecondary: theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-300 hover:bg-gray-50'
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-500 ${colors.bg} ${colors.text}`}>
      {/* Sidebar */}
      <aside className={`w-72 border-r flex flex-col hidden md:flex z-20 transition-all ${colors.sidebar}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>GhostMail</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-gray-100 text-indigo-600'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5">
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${theme === 'dark' ? 'bg-indigo-600/15 text-indigo-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}>
            <Inbox className="w-5 h-5" />
            Inbox
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white'}`}>
              {emails.filter(e => !e.isRead).length}
            </span>
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors.muted} ${colors.item}`}>
            <Star className="w-5 h-5" />
            Starred
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors.muted} ${colors.item}`}>
            <Zap className="w-5 h-5" />
            High Priority
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors.muted} ${colors.item}`}>
            <Trash2 className="w-5 h-5" />
            Trash
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-100'} rounded-2xl p-4 border ${colors.border}`}>
            <div className={`text-[10px] ${colors.muted} mb-3 uppercase font-black tracking-widest flex items-center justify-between`}>
              Premium Domain
              <div className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="w-3 h-3" />
                ACTIVE
              </div>
            </div>
            <select 
              value={domain}
              onChange={(e) => setDomain(e.target.value as Domain)}
              className={`w-full rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all border ${colors.input} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {AVAILABLE_DOMAINS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p className={`mt-3 text-[10px] leading-relaxed ${colors.muted}`}>Optimized for Netflix, Disney+, and major auth servers.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className={`border-b p-4 md:p-8 backdrop-blur-xl z-10 transition-all ${colors.header}`}>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Private Identity</h2>
                <p className={`${colors.muted} text-sm flex items-center gap-2`}>
                  <Shield className="w-4 h-4 text-emerald-500" />
                  High-reputation disposability active
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 border ${colors.btnSecondary}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Checking...' : 'Refresh'}
                </button>
                <button 
                  onClick={generateNewAddress}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  New Random
                </button>
              </div>
            </div>

            <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 rounded-2xl border transition-all ${colors.card}`}>
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="p-3 bg-indigo-600/10 rounded-xl">
                  <Mail className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input 
                        autoFocus
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                        className={`w-full max-w-xs px-3 py-1 font-mono text-xl rounded-lg outline-none ring-2 ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}
                      />
                    ) : (
                      <div 
                        onClick={() => setIsEditing(true)}
                        className={`font-mono text-xl md:text-2xl font-bold cursor-text transition-all flex items-center gap-3 hover:opacity-80 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}
                      >
                        <span className="truncate">{address}</span>
                        {/* Fix: changed Edit2 to Edit3 to match the imported icon */}
                        <Edit3 className="w-4 h-4 opacity-40 flex-shrink-0" />
                      </div>
                    )}
                    <span className={`text-xl font-mono font-medium truncate ${colors.muted}`}>@{domain}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={copyToClipboard}
                className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-sm font-black transition-all border shadow-lg ${
                  copied 
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                  : theme === 'dark' 
                    ? 'bg-white text-slate-900 border-white hover:bg-slate-100' 
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'COPIED' : 'COPY ADDRESS'}
              </button>
            </div>
          </div>
        </header>

        {/* Viewport Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className={`flex-1 flex flex-col border-r transition-all ${colors.border} ${selectedEmailId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-800/10">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.muted}`} />
                <input 
                  type="text" 
                  placeholder="Filter inbox..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${colors.input} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredEmails.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full ${colors.muted} p-12 text-center`}>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all ${theme === 'dark' ? 'bg-slate-900 shadow-inner' : 'bg-gray-100 shadow-inner'}`}>
                    <Mail className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>No Messages</h3>
                  <p className="text-sm max-w-[220px] mx-auto opacity-70">Your private inbox is listening for incoming validation traffic.</p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-100'}`}>
                  {filteredEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => {
                        setSelectedEmailId(email.id);
                        markAsRead(email.id);
                      }}
                      className={`w-full text-left p-6 transition-all relative group border-l-4 ${
                        selectedEmailId === email.id 
                          ? `${colors.selected}` 
                          : `border-l-transparent ${colors.item}`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-bold truncate ${email.isRead ? colors.muted : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {email.senderName}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${colors.muted}`}>
                          {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`text-sm mb-1 truncate ${email.isRead ? colors.muted : theme === 'dark' ? 'text-slate-200 font-bold' : 'text-slate-800 font-bold'}`}>
                        {email.subject}
                      </div>
                      <p className={`text-xs line-clamp-1 opacity-60 ${colors.muted}`}>
                        {email.body.replace(/[#*`]/g, '')}
                      </p>
                      {!email.isRead && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Viewer */}
          <div className={`flex-[1.8] flex flex-col transition-all ${theme === 'dark' ? 'bg-slate-900/20' : 'bg-white'} ${selectedEmailId ? 'flex' : 'hidden lg:flex'}`}>
            {selectedEmail ? (
              <>
                <div className={`p-4 md:p-8 border-b flex items-center justify-between transition-all ${colors.border}`}>
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setSelectedEmailId(null)}
                      className={`lg:hidden p-3 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                    >
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-2xl font-black text-indigo-500 border border-indigo-500/20 shadow-sm">
                      {selectedEmail.senderName[0]}
                    </div>
                    <div>
                      <h3 className={`font-black text-xl leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEmail.senderName}</h3>
                      <p className={`${colors.muted} text-xs font-mono font-medium`}>{selectedEmail.senderEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className={`p-3 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                      <Star className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => deleteEmail(selectedEmail.id)}
                      className={`p-3 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                  <div className="max-w-4xl mx-auto">
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b transition-all ${colors.border}`}>
                      <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedEmail.subject}</h1>
                      <div className="md:text-right flex-shrink-0">
                        <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Arrival Timestamp</p>
                        <p className={`text-sm font-bold ${colors.muted}`}>{new Date(selectedEmail.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className={`prose prose-lg max-w-none transition-all whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'prose-invert text-slate-300' : 'text-slate-700'}`}>
                      {selectedEmail.body}
                    </div>

                    <div className={`mt-20 p-8 rounded-3xl border flex items-start gap-5 transition-all ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800/50' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                      <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <AlertCircle className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="text-sm">
                        <p className={`font-black text-base mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Security Protocol Active</p>
                        <p className={`leading-relaxed opacity-80 ${colors.muted}`}>
                          GhostMail's sandbox has verified this sender's metadata. 
                          External trackers and malicious scripts have been stripped. 
                          This session will expire in 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className={`w-40 h-40 rounded-[3rem] flex items-center justify-center mb-10 transition-all ${theme === 'dark' ? 'bg-slate-900 shadow-2xl' : 'bg-gray-100 shadow-inner'}`}>
                  <Shield className="w-16 h-16 text-indigo-500 opacity-20" />
                </div>
                <h3 className={`text-3xl font-black mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Secure Viewer</h3>
                <p className={`max-w-xs mx-auto text-base leading-relaxed opacity-60 ${colors.muted}`}>
                  Select a message to initiate secure decryption and preview.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Refresh for Mobile */}
      <button 
        onClick={handleRefresh}
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/50 active:scale-90 transition-all z-50 text-white"
      >
        <RefreshCw className={`w-8 h-8 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      <style>{`
        ::selection {
          background-color: #6366f1;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default App;
