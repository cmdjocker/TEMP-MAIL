
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
  Edit2,
  Zap
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

  // Theme-specific colors
  const themeClasses = {
    bg: theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-gray-800',
    sidebar: theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200',
    header: theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-200',
    card: theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300 shadow-sm',
    input: theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900',
    itemHover: theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100',
    selected: theme === 'dark' ? 'bg-slate-800/80' : 'bg-indigo-50',
    mutedText: theme === 'dark' ? 'text-slate-400' : 'text-gray-500',
    border: theme === 'dark' ? 'border-slate-800' : 'border-gray-200',
    iconBtn: theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500',
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${themeClasses.bg}`}>
      {/* Sidebar */}
      <aside className={`w-72 border-r flex flex-col hidden md:flex transition-colors ${themeClasses.sidebar}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">GhostMail</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${themeClasses.iconBtn}`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Inbox className="w-5 h-5" />
            Inbox
            <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
              {emails.filter(e => !e.isRead).length}
            </span>
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${themeClasses.mutedText} ${themeClasses.itemHover}`}>
            <Star className="w-5 h-5" />
            Starred
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${themeClasses.mutedText} ${themeClasses.itemHover}`}>
            <Zap className="w-5 h-5" />
            High Priority
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${themeClasses.mutedText} ${themeClasses.itemHover}`}>
            <Clock className="w-5 h-5" />
            History
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${themeClasses.mutedText} ${themeClasses.itemHover}`}>
            <Trash2 className="w-5 h-5" />
            Trash
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'} rounded-xl p-4`}>
            <div className={`text-xs ${themeClasses.mutedText} mb-3 uppercase font-semibold tracking-wider flex items-center justify-between`}>
              Premium Domain
              <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px] scale-90">VIP</span>
            </div>
            <select 
              value={domain}
              onChange={(e) => setDomain(e.target.value as Domain)}
              className={`w-full rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              {AVAILABLE_DOMAINS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <p className="mt-2 text-[10px] text-slate-500 leading-tight">These domains are optimized for major services like Netflix and social platforms.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header / Email Control */}
        <header className={`border-b p-4 md:p-6 backdrop-blur-md z-10 transition-colors ${themeClasses.header}`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Disposable Identity</h2>
                <p className={`${themeClasses.mutedText} text-sm flex items-center gap-1.5`}>
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  Enhanced privacy protection active
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-300 hover:bg-gray-50 shadow-sm'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={generateNewAddress}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Generate Random
                </button>
              </div>
            </div>

            <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 rounded-2xl border transition-all ${themeClasses.card}`}>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="relative flex-1 min-w-0 group">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input 
                        autoFocus
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                        className={`w-full px-3 py-1.5 font-mono text-lg rounded-lg outline-none ring-2 ring-indigo-500 transition-colors ${theme === 'dark' ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}
                        placeholder="enter custom name"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div 
                        onClick={() => setIsEditing(true)}
                        className={`px-3 py-1.5 font-mono text-lg rounded-lg cursor-text transition-colors flex items-center gap-2 min-w-0 ${theme === 'dark' ? 'text-indigo-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        <span className="truncate">{address}</span>
                        <Edit2 className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                      </div>
                      <span className={`text-lg font-mono ${themeClasses.mutedText}`}>@{domain}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    copied 
                    ? 'bg-green-500 text-white border-green-400' 
                    : theme === 'dark' 
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'COPIED' : 'COPY EMAIL'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Email Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* List View */}
          <div className={`flex-1 flex flex-col border-r transition-colors ${themeClasses.border} ${selectedEmailId ? 'hidden lg:flex' : 'flex'}`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-100/50 border-gray-200'}`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                <input 
                  type="text" 
                  placeholder="Filter inbox..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${themeClasses.input}`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredEmails.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full ${themeClasses.mutedText} p-8 text-center`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`}>
                    <Mail className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-semibold mb-1">No messages yet</p>
                  <p className="text-sm max-w-[180px]">Your premium inbox is ready and waiting for incoming traffic.</p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-200'}`}>
                  {filteredEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => {
                        setSelectedEmailId(email.id);
                        markAsRead(email.id);
                      }}
                      className={`w-full text-left p-5 transition-all relative group border-l-4 ${
                        selectedEmailId === email.id 
                          ? `border-l-indigo-500 ${themeClasses.selected}` 
                          : `border-l-transparent ${themeClasses.itemHover}`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-bold truncate ${email.isRead ? themeClasses.mutedText : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {email.senderName}
                        </span>
                        <span className={`text-[10px] font-medium uppercase tracking-wider ${themeClasses.mutedText}`}>
                          {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`text-sm mb-1 truncate ${email.isRead ? themeClasses.mutedText : theme === 'dark' ? 'text-slate-200 font-semibold' : 'text-gray-800 font-semibold'}`}>
                        {email.subject}
                      </div>
                      <p className={`text-xs line-clamp-1 ${themeClasses.mutedText}`}>
                        {email.body.replace(/[#*`]/g, '')}
                      </p>
                      {!email.isRead && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className={`flex-[1.8] flex flex-col transition-colors ${theme === 'dark' ? 'bg-slate-900/20' : 'bg-white'} ${selectedEmailId ? 'flex' : 'hidden lg:flex'}`}>
            {selectedEmail ? (
              <>
                <div className={`p-4 md:p-6 border-b flex items-center justify-between transition-colors ${themeClasses.border}`}>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedEmailId(null)}
                      className={`lg:hidden p-2 rounded-full transition-colors ${themeClasses.iconBtn}`}
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-xl font-bold text-indigo-500 border border-indigo-500/20">
                      {selectedEmail.senderName[0]}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedEmail.senderName}</h3>
                      <p className={`${themeClasses.mutedText} text-xs font-mono`}>{selectedEmail.senderEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`p-2.5 rounded-xl transition-colors ${themeClasses.iconBtn}`}>
                      <Star className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteEmail(selectedEmail.id)}
                      className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                  <div className="max-w-3xl mx-auto">
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-8 border-b transition-colors ${themeClasses.border}`}>
                      <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedEmail.subject}</h1>
                      <div className="md:text-right flex-shrink-0">
                        <p className={`text-[10px] uppercase tracking-widest font-black mb-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Time Received</p>
                        <p className={`text-sm font-medium ${themeClasses.mutedText}`}>{new Date(selectedEmail.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className={`prose max-w-none transition-colors whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'prose-invert text-slate-300' : 'text-gray-700'}`}>
                      {selectedEmail.body}
                    </div>

                    <div className={`mt-16 p-6 rounded-2xl border flex items-start gap-4 transition-colors ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="text-sm">
                        <p className={`font-bold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>Security Protocol Active</p>
                        <p className={themeClasses.mutedText}>
                          GhostMail has filtered this message for potential threats. This mailbox will expire in 24 hours. 
                          For permanent storage, please upgrade to a pro account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 transition-colors ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100 shadow-inner'}`}>
                  <Shield className="w-14 h-14 text-indigo-500 opacity-40" />
                </div>
                <h3 className={`text-2xl font-black mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-800'}`}>Secure Viewer</h3>
                <p className={`max-w-xs mx-auto text-sm leading-relaxed ${themeClasses.mutedText}`}>
                  Your temporary identity is active. Select a message to decrypt its contents in this safe sandboxed environment.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action for Mobile Refresh */}
      <button 
        onClick={handleRefresh}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/50 active:scale-90 transition-all z-50 text-white"
      >
        <RefreshCw className={`w-7 h-7 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#1e293b' : '#e2e8f0'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? '#334155' : '#cbd5e1'};
        }
        ::selection {
          background-color: #6366f1;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default App;
