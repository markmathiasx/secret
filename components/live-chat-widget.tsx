/**
 * Live Chat Widget Component (2026)
 * Modern floating chat widget with AI support
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender_type: 'customer' | 'ai' | 'support_agent';
  message: string;
  created_at: Date;
  is_ai_generated?: boolean;
}

export function LiveChatWidget({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [supportStatus, setSupportStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check support status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/chat?action=status');
        const data = await res.json();
        setSupportStatus(data);
      } catch (error) {
        console.error('Failed to check support status:', error);
      }
    };

    checkStatus();
  }, []);

  // Initialize chat
  const startChat = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          user_id: userId,
          subject: 'Customer Inquiry',
          priority: 'normal'
        })
      });

      const session = await res.json();
      setThreadId(session.id);
      setMessages([]);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim() || !threadId || !userId) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender_type: 'customer',
        message: userMessage,
        created_at: new Date()
      }
    ]);

    try {
      setLoading(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          user_id: userId,
          thread_id: threadId,
          message: userMessage
        })
      });

      if (res.ok) {
        // Fetch updated chat
        const chatRes = await fetch(`/api/chat?thread_id=${threadId}`);
        const chat = await chatRes.json();
        setMessages(chat.messages || []);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={startChat}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">MDH Support</h3>
              <p className="text-xs opacity-90">
                {supportStatus?.available ? 'Always here to help' : 'We\'re offline'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>How can we help you?</p>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_type === 'customer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  {msg.is_ai_generated && (
                    <p className="text-xs opacity-75 mt-1">🤖 AI Response</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <Loader size={16} className="animate-spin text-gray-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LiveChatWidget;
