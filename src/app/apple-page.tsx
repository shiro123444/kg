'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleChat } from '@/components/chat/AppleChat';
import { ModernKnowledgeGraph } from '@/components/visualization/ModernKnowledgeGraph';
import { 
  Brain, 
  Network, 
  MessageSquare,
  Compass,
  Grid,
  Loader2
} from 'lucide-react';

export default function ApplePage() {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'graph'>('chat');

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/graph');
      if (!response.ok) {
        throw new Error('Failed to fetch graph data');
      }
      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      setError('无法加载知识图谱数据');
      console.error('Error fetching graph data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Navigation - Apple style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Brain className="h-6 w-6 text-gray-900" />
                <span className="font-medium text-gray-900">AI Explorer</span>
              </motion.div>
              
              <div className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`text-sm ${activeTab === 'chat' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                >
                  问答
                </button>
                <button 
                  onClick={() => setActiveTab('graph')}
                  className={`text-sm ${activeTab === 'graph' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                >
                  图谱
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                概览
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                开发者
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                支持
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Grid className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - with generous padding */}
      <main className="pt-12">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section with Large Title */}
              <div className="px-6 py-16 text-center">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-7xl font-semibold text-gray-900 mb-6"
                >
                  AI 智能助手
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto"
                >
                  基于先进的知识图谱技术，为您提供准确、深入的人工智能领域解答
                </motion.p>
              </div>

              <AppleChat />
            </motion.div>
          ) : (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section for Graph */}
              <div className="px-6 py-16 text-center">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-7xl font-semibold text-gray-900 mb-6"
                >
                  知识图谱
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto"
                >
                  探索人工智能概念之间的关联，直观理解知识结构
                </motion.p>
              </div>

              <div className="max-w-[1400px] mx-auto px-6 pb-24">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[600px]">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-[600px]">
                    <div className="text-center">
                      <p className="text-red-500 mb-4">{error}</p>
                      <button 
                        onClick={fetchGraphData}
                        className="px-6 py-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        重试
                      </button>
                    </div>
                  </div>
                ) : graphData ? (
                  <ModernKnowledgeGraph 
                    data={graphData} 
                    onNodeClick={(node) => console.log('Node clicked:', node)}
                  />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Tab Bar - iOS style */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:hidden">
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${
              activeTab === 'chat' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">问答</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${
              activeTab === 'graph' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Network className="h-4 w-4" />
            <span className="text-sm font-medium">图谱</span>
          </button>
        </div>
      </div>
    </div>
  );
}
