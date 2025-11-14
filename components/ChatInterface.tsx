'use client';

import { useState, useRef, useEffect } from 'react';
import VegaChart from './VegaChart';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history on mount
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.created_at,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const extractVegaLiteSpec = (content: string) => {
    const codeBlockRegex = /```vega-lite\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
      try {
        const spec = JSON.parse(matches[0][1]);
        return { spec, cleanContent: content.replace(codeBlockRegex, '').trim() };
      } catch (error) {
        console.error('Error parsing Vega-Lite spec:', error);
      }
    }

    return { spec: null, cleanContent: content };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          includeHistory: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-lg">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-semibold mb-2">Welcome to your Health Assistant!</p>
            <p>Ask me anything about your Oura data, such as:</p>
            <ul className="mt-2 text-sm space-y-1">
              <li>&quot;How has my sleep been this week?&quot;</li>
              <li>&quot;Show me my activity trends&quot;</li>
              <li>&quot;What&apos;s my average readiness score?&quot;</li>
            </ul>
          </div>
        )}

        {messages.map((message, index) => {
          const { spec, cleanContent } = extractVegaLiteSpec(message.content);

          return (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{cleanContent}</div>
                {spec && (
                  <div className="mt-3 bg-white rounded p-2">
                    <VegaChart spec={spec} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-300 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your health data..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
