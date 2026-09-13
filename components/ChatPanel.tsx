'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NSBadge } from './NSBadge';
import { apiUrl } from '@/lib/api';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';

export function ChatPanel({
  isOpen,
  onClose,
  habitsSummary,
}: {
  isOpen: boolean;
  onClose: () => void;
  habitsSummary: string;
}) {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          habitsSummary,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Chat failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== 'assistant' || last.content !== '') return prev;
        return [...prev.slice(0, -1), { ...last, content: 'Something went wrong. Try again.' }];
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="glass"
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(8,10,20,0.97)', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '56px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <NSBadge size={32} />
              <div>
                <p style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '16px', color: '#fff', margin: 0, lineHeight: 1 }}>Monte OS</p>
                <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.28)', margin: 0, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Brain Chat</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', color: 'rgba(255,255,255,0.5)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </motion.button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontFamily: FONT_SYNE, fontSize: '15px', color: 'rgba(255,255,255,0.3)', margin: '0 0 6px' }}>What do you need, Demonte?</p>
                <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>Ask about habits, revenue, strategy, mindset</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>
                    <span style={{ fontFamily: 'serif', fontSize: '9px', fontWeight: 900, color: '#000' }}>NS</span>
                  </div>
                )}
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'assistant' ? '1px solid rgba(6,182,212,0.2)' : 'none',
                  boxShadow: msg.role === 'user' ? '0 4px 20px rgba(251,191,36,0.25)' : 'none',
                }}>
                  <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.content}
                    {msg.role === 'assistant' && streaming && i === messages.length - 1 && msg.content === '' && (
                      <span style={{ opacity: 0.5 }}>thinking…</span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}

            {streaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content !== '' && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '30px' }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: '14px', color: '#fbbf24', animation: 'skeleton-pulse 0.8s ease-in-out infinite' }}>▋</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom,0px))', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask anything…"
                rows={1}
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '12px 14px', color: '#fff', fontFamily: FONT_MONO, fontSize: '13px', resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: '120px' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: input.trim() && !streaming ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0,
                  boxShadow: input.trim() && !streaming ? '0 4px 16px rgba(251,191,36,0.35)' : 'none',
                }}
              >
                {streaming ? '⏳' : '↑'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
