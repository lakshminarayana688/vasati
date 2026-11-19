import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, Check, Clock, RefreshCw, MessageSquare, ShieldCheck } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  receiver_id?: string;
  message: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
}

interface ChatModalProps {
  propertyId: string;
  propertyName: string;
  hostName?: string;
  customerId?: string;
  customerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  propertyId,
  propertyName,
  hostName = 'Host',
  customerId = 'usr_cust_1',
  customerName = 'Lakshminarayana G',
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [resolvedHostName, setResolvedHostName] = useState(hostName);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Focus input on desktop
      setTimeout(() => inputRef.current?.focus(), 200);
      // Polling for incoming host messages while open
      const interval = setInterval(() => {
        pollMessages();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, propertyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setNetworkError(null);
      const res = await fetch(`/api/conversations?propertyId=${encodeURIComponent(propertyId)}&customerId=${encodeURIComponent(customerId)}`);
      if (!res.ok) throw new Error('Failed to fetch conversation history');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.property?.owner_name) {
          setResolvedHostName(data.property.owner_name);
        }
      } else {
        setNetworkError(data.error || 'Failed to load messages');
      }
    } catch (err: any) {
      console.warn('Chat load error:', err);
      setNetworkError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async () => {
    try {
      const res = await fetch(`/api/conversations?propertyId=${encodeURIComponent(propertyId)}&customerId=${encodeURIComponent(customerId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(prev => {
            // Merge newly arrived messages
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMsgs.length > 0) {
              return [...prev, ...newMsgs];
            }
            return prev;
          });
        }
      }
    } catch (_) {}
  };

  const handleSendMessage = async (retryMsg?: ChatMessage) => {
    const textToSend = retryMsg ? retryMsg.message : inputText.trim();
    if (!textToSend) return;

    const tempId = retryMsg ? retryMsg.id : `temp_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!retryMsg) {
      // Optimistic message append
      const optimisticMsg: ChatMessage = {
        id: tempId,
        sender_id: customerId,
        sender_name: customerName,
        sender_role: 'customer',
        message: textToSend,
        created_at: timestamp,
        status: 'sending',
      };
      setMessages(prev => [...prev, optimisticMsg]);
      setInputText('');
    } else {
      // Update retry status to sending
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: 'sending' } : m))
      );
    }

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          sender_id: customerId,
          message: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        // Mark as sent
        setMessages(prev =>
          prev.map(m =>
            m.id === tempId
              ? {
                  ...data.message,
                  status: 'sent',
                  created_at: timestamp,
                }
              : m
          )
        );

        // If automated reply was triggered, append it after a brief natural typing delay
        if (data.autoReply) {
          setTimeout(() => {
            setMessages(prev => [...prev, data.autoReply]);
          }, 1200);
        }
      } else {
        // Mark as failed
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
      }
    } catch (err) {
      console.error('Send message failed:', err);
      // Mark as failed with retry action
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Responsive Container: Full screen on mobile, floating elegant card on desktop */}
      <div className="bg-white w-full h-[92vh] sm:h-[580px] sm:max-w-md sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in border border-purple-100">
        {/* 1. Purple Chat Header matching reference design */}
        <div className="px-5 py-4 bg-gradient-to-r from-vasati-royal via-vasati-purple to-vasati-purple-vibrant text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-sm border border-white/30">
                {resolvedHostName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-vasati-purple" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight leading-tight">
                {propertyName} Host
              </h3>
              <p className="text-[11px] text-purple-200 font-medium">
                {resolvedHostName} • VASATI Masked In-App Channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Chat Message Thread Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F3FF] text-xs">
          {/* Privacy Protection Banner */}
          <div className="bg-white/80 backdrop-blur-sm border border-purple-200/70 p-3 rounded-2xl text-vasati-dark text-[11px] shadow-sm flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-vasati-purple shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>🔒 Privacy Protected:</strong> Personal phone numbers are masked. Conversations are safeguarded by VASATI Anti-Bypass & Stay Protection.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-7 h-7 border-3 border-vasati-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-vasati-secondary">Connecting to secure host channel...</p>
            </div>
          ) : networkError ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center my-6">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-amber-800">{networkError}</p>
              <button
                onClick={loadMessages}
                className="mt-2.5 px-4 py-1.5 rounded-full bg-vasati-purple text-white text-[11px] font-bold"
              >
                Retry Loading
              </button>
            </div>
          ) : messages.length === 0 ? (
            /* Empty state */
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-vasati-purple border border-purple-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-vasati-dark text-sm">Send a Message to the Host</h4>
              <p className="text-[11px] text-vasati-secondary mt-1 max-w-xs mx-auto">
                Ask about room availability, amenities, food schedule, or schedule a physical visit.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isOutgoing = m.sender_id === customerId || m.sender_role === 'customer';
              const formattedTime = m.created_at.includes(' ')
                ? m.created_at.split(' ')[1].substring(0, 5)
                : m.created_at;

              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl shadow-sm text-xs relative ${
                      isOutgoing
                        ? 'bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant text-white rounded-br-xs'
                        : 'bg-white text-vasati-dark border border-purple-100 rounded-bl-xs'
                    }`}
                  >
                    {!isOutgoing && (
                      <p className="font-extrabold text-[10px] text-vasati-purple mb-0.5">
                        {m.sender_name || `${propertyName} Host`}
                      </p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{m.message}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                        isOutgoing ? 'text-purple-200' : 'text-gray-400'
                      }`}
                    >
                      <span>{formattedTime}</span>
                      {isOutgoing && (
                        <span>
                          {m.status === 'sending' ? (
                            <Clock className="w-2.5 h-2.5 animate-pulse inline" />
                          ) : m.status === 'failed' ? (
                            <button
                              onClick={() => handleSendMessage(m)}
                              className="text-amber-300 font-bold hover:underline inline-flex items-center gap-0.5"
                              title="Click to retry sending"
                            >
                              <AlertCircle className="w-2.5 h-2.5 inline" /> Failed • Retry
                            </button>
                          ) : (
                            <Check className="w-3 h-3 text-emerald-300 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Sticky Message Input Field matching reference screenshot */}
        <div className="p-3.5 bg-white border-t border-purple-100 flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to the host..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl text-xs text-vasati-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vasati-purple/30 focus:border-vasati-purple transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
              inputText.trim()
                ? 'bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant text-white shadow-md shadow-vasati-purple/20 hover:scale-105 active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
