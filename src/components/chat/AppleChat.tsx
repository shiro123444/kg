'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
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

// 建议问题数组
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
  // 判断是否处于欢迎状态
  const isWelcomeState = messages.length === 0 && !isLoading;
  
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

  // 处理建议问题点击
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
    // 可选：自动提交问题
    // setTimeout(() => {
    //   handleSubmit(new Event('submit') as any);
    // }, 100);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <AnimatePresence mode="wait">
        {isWelcomeState ? (
          /* 欢迎状态：显示标题和问题建议 */
          <motion.div 
            key="welcome"
            className="flex flex-col items-center justify-center w-full h-full"
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            {/* 标题区域 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-16"
            >
              <motion.h1 
                className="text-6xl md:text-7xl font-semibold text-gray-900 mb-3"
              >
                Thinking Quantum
              </motion.h1>
              <div className="text-center text-gray-500 text-lg">
                可以随时问我关于人工智能导论课程的问题
              </div>
            </motion.div>
            
            {/* 建议问题区域 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
                {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    title={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-6 py-3 text-left rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-200/50 hover:bg-blue-50/50 transition-all duration-200 group w-full"
                  >
                    <div className="text-gray-900 font-medium group-hover:text-blue-600">
                      {suggestion}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* 对话状态：显示消息内容 */
          <motion.div 
            key="chat"
            className="flex flex-col w-full h-full py-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 聊天消息区域 */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto mb-6 px-2"
            >
              <div className="space-y-6 pt-12">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%]`}>
                      <div
                        className={`px-5 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 shadow-sm text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-[16px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      {message.context && message.role === 'assistant' && (
                        <div className="mt-1 px-2 text-xs text-gray-500">
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
                    <div className="px-5 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 shadow-sm">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入区域 - 固定在底部 */}
      <div className={`w-full ${isWelcomeState ? 'mt-auto' : 'mt-4'}`}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 p-1 rounded-[2rem] bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm">
            <button 
              type="button"
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isLoading}
              title="附件"
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
              className="apple-chat-textarea flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-[16px] px-2 py-3 max-h-48"
              style={{ minHeight: '48px' }}
            />
            
            <button 
              type="button"
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isLoading}
              title="语音输入"
            >
              <Mic className="h-5 w-5 text-gray-500" />
            </button>
            
            {isLoading ? (
              <button
                type="button"
                onClick={() => {/* TODO: Implement stop */}}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                title="停止生成"
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
                title="发送消息"
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
  );
}
