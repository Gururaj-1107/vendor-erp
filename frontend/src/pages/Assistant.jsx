import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Paperclip, Bot, User, 
  FileText, CheckSquare, BarChart3, Users, 
  ShoppingCart, RefreshCw 
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { GlowingEffect } from '../components/ui/GlowingEffect';
import toast from 'react-hot-toast';

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);
  const adjustHeight = useCallback((reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }
    textarea.style.height = `${minHeight}px`;
    const newHeight = Math.max(
      minHeight,
      Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
    );
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export default function Assistant() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('assistant_chats');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I am **Ruixen AI**, your dedicated B2B procurement assistant. I can help you write RFQs, evaluate quotations, audit approvals, or analyze monthly spending trends. Ask me anything!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('assistant_chats', JSON.stringify(messages));
  }, [messages]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 120
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const currentMessage = textToSend || message;
    if (!currentMessage.trim() || loading) return;

    // Add user message to history
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) {
      setMessage('');
      adjustHeight(true);
    }
    
    setLoading(true);
    
    try {
      const res = await aiAPI.chat({ message: currentMessage });
      const replyText = res.data?.response || 'Sorry, I did not receive a response.';
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      toast.error('Could not connect to AI service. Using mock fallback.');
      
      // Fallback local matching
      let mockReply = 'I am here to help you manage your procurement operations. You can ask me to write an RFQ description, compare vendor pricing, or analyze spend trends!';
      const msgLower = currentMessage.toLowerCase();
      if (msgLower.includes('rfq')) {
        mockReply = 'To create a new RFQ, go to the RFQs tab, enter a title, category, deadline, description, and list your line items. I can help generate descriptions for these RFQs!';
      } else if (msgLower.includes('vendor') || msgLower.includes('supplier')) {
        mockReply = 'You can manage your suppliers in the Vendors tab. We currently have 28 vendors registered. You can add new suppliers, check profiles, verify GST numbers, or block underperforming suppliers.';
      } else if (msgLower.includes('approv')) {
        mockReply = 'We currently have 5 approvals pending in L1 and L2 review stages. You can approve or reject them in the Approvals panel with custom feedback remarks.';
      } else if (msgLower.includes('po') || msgLower.includes('invoice') || msgLower.includes('order')) {
        mockReply = 'Purchase Orders are auto-generated once a quotation comparison gets L2 approval. You can view, print, or email the generated POs and Invoices in the PO & Invoice screen.';
      } else if (msgLower.includes('report') || msgLower.includes('spend') || msgLower.includes('trend')) {
        mockReply = 'Total spend this month is ₹12.4L. Most of the budget went into IT hardware (₹4.5L) followed by Operations (₹2.05L). I recommend negotiating with TechCore Ltd for volume discounts.';
      }
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Generate RFQ Description', prompt: 'Generate a professional RFQ description for "IT Core Infrastructure Upgrade" under "IT" category', icon: <FileText size={14} /> },
    { label: 'Summarize Approvals', prompt: 'List active approval status in the system and L1/L2 pending reviews summary', icon: <CheckSquare size={14} /> },
    { label: 'Analyze Monthly Spend', prompt: 'Analyze last month\'s procurement spending trends and recommend cost savings', icon: <BarChart3 size={14} /> },
    { label: 'Vendor Status Review', prompt: 'Check vendor status ratios (Active vs Pending vs Blocked) and metrics', icon: <Users size={14} /> }
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: '24px 28px 12px' }}>
      
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} className="text-primary-light" /> Ruixen AI Assistant
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            AI-powered procurement agent · Real-time ERP actions
          </p>
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setMessages(prev => [prev[0]])}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={13} /> Clear Chat
        </button>
      </div>

      {/* ── Chat Messages Container ── */}
      <div 
        className="glass-card" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          marginBottom: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          position: 'relative'
        }}
      >
        <GlowingEffect disabled={false} glow={true} spread={50} blur={2} borderWidth={1} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '78%',
                    flexDirection: isAssistant ? 'row' : 'row-reverse'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: isAssistant 
                        ? 'linear-gradient(135deg, #1E40AF, #06B6D4)' 
                        : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isAssistant ? '#3B82F644' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isAssistant ? <Bot size={18} color="white" /> : <User size={16} color="var(--text-secondary)" />}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div
                      style={{
                        background: isAssistant ? 'rgba(30,58,138,0.18)' : '#0F172A',
                        border: `1px solid ${isAssistant ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`,
                        borderRadius: isAssistant ? '0 16px 16px 16px' : '16px 0 16px 16px',
                        padding: '12px 16px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {/* Simple markdown parsing for bold text */}
                      {msg.content.split('**').map((chunk, i) => 
                        i % 2 === 1 ? <strong key={i} style={{ color: '#3B82F6', fontWeight: 700 }}>{chunk}</strong> : chunk
                      )}
                    </div>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        color: 'var(--text-muted)', 
                        marginTop: '4px', 
                        display: 'block',
                        textAlign: isAssistant ? 'left' : 'right'
                      }}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Loading typing indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  alignSelf: 'flex-start',
                  maxWidth: '78%'
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E40AF, #06B6D4)',
                    border: '1px solid #3B82F644',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} color="white" />
                </div>
                <div
                  style={{
                    background: 'rgba(30,58,138,0.18)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '0 16px 16px 16px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        background: '#3B82F6',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'bounce 1.4s infinite ease-in-out both',
                        animationDelay: `${i * 0.16}s`
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Quick Action Buttons ── */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '8px', 
          marginBottom: '8px',
          flexShrink: 0 
        }}
      >
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.prompt)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '20px',
              background: '#0F172A',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6';
              e.currentTarget.style.color = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* ── Input Box Section ── */}
      <div style={{ flexShrink: 0, marginBottom: '12px' }}>
        <div 
          style={{ 
            position: 'relative', 
            background: 'rgba(10, 10, 26, 0.85)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            padding: '8px'
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI assistant for help..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '14px',
              fontFamily: 'inherit',
              padding: '8px 12px',
              resize: 'none',
              overflowY: 'hidden',
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ padding: '6px' }}
              onClick={() => toast.success('Upload attachment feature coming soon')}
            >
              <Paperclip size={16} color="var(--text-secondary)" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!message.trim() || loading}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 12px', minWidth: '40px', justifyContent: 'center' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bounce keyframe style */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
