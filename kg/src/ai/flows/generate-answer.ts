// src/ai/flows/generate-answer.ts
'use server';

/**
 * @fileOverview 使用 DeepSeek API 生成答案和知识图谱的服务
 */

import { callDeepSeekAPI, DeepSeekInput, DeepSeekOutput } from '../services/deepseek-service';

// 导出与原实现兼容的类型，方便页面组件集成
export type GenerateAnswerInput = DeepSeekInput;
export type GenerateAnswerOutput = DeepSeekOutput;

/**
 * 生成答案和知识图谱
 * @param input 输入问题
 * @returns 包含答案和知识图谱的响应
 */
export async function generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  try {
    // 直接调用 DeepSeek API 服务
    const result = await callDeepSeekAPI(input);
    
    // 验证节点和边的有效性
    const validatedOutput: GenerateAnswerOutput = {
      answer: result.answer,
      nodes: result.nodes || [],
      edges: result.edges || [],
    };

    // 基本验证/清理（可选）
    // 确保节点ID唯一
    const nodeIds = new Set<string>();
    validatedOutput.nodes = validatedOutput.nodes.filter(node => {
      if (!node.id || nodeIds.has(node.id)) return false;
      nodeIds.add(node.id);
      return true;
    });

    // 确保边连接到存在的节点且边ID唯一
    const edgeIds = new Set<string>();
    validatedOutput.edges = validatedOutput.edges.filter(edge => {
      if (!edge.id || edgeIds.has(edge.id) || !nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return false;
      edgeIds.add(edge.id);
      return true;
    });

    return validatedOutput;
  } catch (error) {
    console.error('Error generating answer:', error);
    return {
      answer: '抱歉，生成答案时出现错误。请稍后重试。',
      nodes: [],
      edges: []
    };
  }
}
