import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const AiAssistant = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  if (!user) return null;

  const isAdmin = user.role === 'Admin';

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const payloadMessages = [...messages, { role: 'user', content: text }];
    setMessages(payloadMessages);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { messages: payloadMessages });
      if (data.success) {
        setMessages([...payloadMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([
          ...payloadMessages,
          { role: 'assistant', content: data.error?.message || 'No response from assistant.' },
        ]);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Request failed.';
      setMessages([...payloadMessages, { role: 'assistant', content: `Sorry — ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open placement assistant"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4843d1] text-white shadow-lg transition hover:bg-[#3d38b8] hover:scale-105 md:bottom-8 md:right-8 ${open ? 'pointer-events-none opacity-0' : ''}`}
      >
        <MessageCircle className="h-7 w-7" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm md:items-end md:justify-end md:bg-slate-900/20"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="mt-auto flex h-[min(92vh,640px)] w-full max-w-md flex-col rounded-t-3xl border border-slate-200 bg-white shadow-2xl md:mb-8 md:mr-8 md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Placement assistant chat"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Placement assistant</h2>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? 'Campus-wide data (read-only)' : 'Your applications & open drives'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
                  {isAdmin ? (
                    <>
                      Ask about shortlists, applications by company, round pipeline, or overall placement stats.
                      Answers use a <strong>live snapshot</strong> from the database (not arbitrary web knowledge).
                    </>
                  ) : (
                    <>
                      Ask things like <strong>&quot;Which round is my Google software engineer application in?&quot;</strong>{' '}
                      or whether you already applied to a company. Only <strong>your</strong> rows and open job listings are sent to the model.
                    </>
                  )}
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-100 p-3">
              <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={isAdmin ? 'Ask about your placement data…' : 'Ask about your applications…'}
                  className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="self-end rounded-xl bg-primary-600 p-3 text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 px-1 text-[10px] text-slate-400">
                Powered by Google Gemini. Do not paste secrets. If the server has no API key, you will see a configuration message.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
