'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  ChevronUp,
  Mic,
  Paperclip,
  StopCircle
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: any;
}

const PROMPT_SUGGESTIONS = [
  "什么是机器学习？",
  "介绍神经网络的基本原理",
  "深度学习与传统机器学习的区别",
  "自然语言处理的应用"
];

export function AppleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });

      const data = await response.json();
      
      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
          context: data.context
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，处理您的问题时出现了错误。请稍后再试。'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-12"
      >
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 mb-8"
              >
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              </motion.div>
              
              <h2 className="text-4xl font-semibold text-gray-900 mb-4">
                AI 助手随时为您服务
              </h2>
              <p className="text-xl text-gray-500 mb-12 max-w-lg">
                询问任何关于人工智能的问题，我会基于知识图谱为您解答
              </p>

              <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-6 py-4 text-left rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-200/50 hover:bg-blue-50/50 transition-all duration-200 group"
                    >
                      <div className="text-gray-900 font-medium group-hover:text-blue-600">
                        {suggestion}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8 pb-8">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-6 py-4 rounded-3xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="text-[17px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.context && message.role === 'assistant' && (
                      <div className="mt-2 px-4 text-sm text-gray-500">
                        基于 {message.context.entities.length} 个知识实体
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-6 py-4 rounded-3xl rounded-bl-md bg-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 p-1 rounded-[2rem] bg-gray-100/80 border border-gray-200/50">
              <button 
                type="button"
                className="p-3 rounded-full hover:bg-gray-200/80 transition-colors"
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="给 AI 发送消息"
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-[17px] px-2 py-3 max-h-48"
                style={{ minHeight: '48px' }}
              />
              
              <button 
                type="button"
                className="p-3 rounded-full hover:bg-gray-200/80 transition-colors"
                disabled={isLoading}
              >
                <Mic className="h-5 w-5 text-gray-500" />
              </button>
              
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => {/* TODO: Implement stop */}}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <StopCircle className="h-5 w-5 text-white" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-3 rounded-full transition-colors ${
                    input.trim()
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                >
                  <ChevronUp className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          </form>
          <div className="text-center mt-2 text-xs text-gray-400">
            AI 可能会犯错。请核查重要信息。
          </div>
        </div>
      </div>
    </div>
  );
}
