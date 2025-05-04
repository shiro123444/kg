'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Bot, 
  User, 
  Search, 
  Lightbulb,
  BrainCircuit,
  ArrowUp,
  Command,
  CornerDownLeft,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: any;
}

const PROMPT_SUGGESTIONS = [
  "什么是人工智能？",
  "机器学习和深度学习有什么区别？",
  "解释一下神经网络的工作原理",
  "介绍一下自然语言处理技术",
  "什么是计算机视觉？",
  "人工智能伦理问题有哪些？"
];

export function ModernChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setShowSuggestions(false);

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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full max-w-5xl mx-auto">
      {/* Glass morphism background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-xl rounded-3xl border border-gray-200/50" />
      
      <div className="relative h-full flex flex-col p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">AI 导论智能助手</h1>
            <p className="text-sm text-gray-600">基于知识图谱的智能问答系统</p>
          </div>
        </motion.div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 pr-4 mb-6" ref={scrollRef}>
          <AnimatePresence mode="wait">
            {messages.length === 0 && showSuggestions ? (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
              >
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl mb-8">
                  <Network className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    探索人工智能世界
                  </h2>
                  <p className="text-gray-600">
                    我可以帮助您理解人工智能的各种概念和技术
                  </p>
                </div>

                <div className="w-full max-w-2xl">
                  <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    推荐问题
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-4 text-left rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                      >
                        <span className="text-gray-700 group-hover:text-blue-600">
                          {suggestion}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 py-4"
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className={`flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      <AvatarFallback className="text-white">
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div 
                      className={`flex-1 px-6 py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className={`whitespace-pre-wrap ${
                        message.role === 'user' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {message.content}
                      </p>
                      
                      {message.context && message.role === 'assistant' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Search className="h-4 w-4" />
                            <span>基于 {message.context.entities.length} 个知识实体</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <Avatar className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500">
                      <AvatarFallback className="text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span className="text-gray-500">思考中...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Input Area */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="relative"
        >
          <div className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              disabled={isLoading}
              className="h-14 pr-28 pl-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
            />
            
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="mr-2">发送</span>
                    <Send className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="absolute -bottom-6 left-0 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <CornerDownLeft className="h-3 w-3" />
              <span>发送</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <span>上一条</span>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
