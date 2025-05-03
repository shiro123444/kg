// src/ai/services/deepseek-service.ts
/**
 * DeepSeek API 服务
 * 直接调用 DeepSeek API，不依赖于 genkit 插件系统
 */

// 输入类型定义
export interface DeepSeekInput {
  question: string;
}

// 输出类型定义，保持与原 generate-answer.ts 中的类型兼容
export interface DeepSeekOutput {
  answer: string;
  nodes?: Array<{
    id: string;
    label: string;
    type?: string;
  }>;
  edges?: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
  }>;
}

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat'; // DeepSeek-V3 全能模型

/**
 * 调用 DeepSeek API 生成答案
 */
export async function callDeepSeekAPI(input: DeepSeekInput): Promise<DeepSeekOutput> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('Missing DeepSeek API key. Please set DEEPSEEK_API_KEY in your environment variables.');
  }

  // 构建系统提示信息，指导模型生成答案和知识图谱
  const systemPrompt = `You are an AI assistant inspired by Apple's design philosophy - clean, intuitive, and helpful. Answer the user's question clearly and concisely.

In addition to providing the answer, analyze the question and your generated answer to identify key entities and their relationships. Extract these as a simple knowledge graph structure.

Represent the graph with:
1. **nodes**: An array of objects, each with 'id' (unique name/identifier), 'label' (display name), and optionally 'type'.
2. **edges**: An array of objects, each with 'id' (unique identifier, e.g., source_target_relation), 'source' (source node id), 'target' (target node id), and 'label' (relationship description).

If no clear entities or relationships are found, return empty arrays for nodes and edges.`;

  try {
    // 准备请求体，遵循 OpenAI 兼容格式
    const requestBody = {
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.question }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" } // 请求 JSON 格式的响应
    };

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status}, ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 解析 JSON 响应
    let parsedContent;
    try {
      parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      console.error('Failed to parse DeepSeek response as JSON:', e);
      // 如果解析失败，创建一个只有答案的对象
      return { answer: content };
    }

    // 转换为预期的输出格式
    const result: DeepSeekOutput = {
      answer: parsedContent.answer || '',
      nodes: parsedContent.nodes || [],
      edges: parsedContent.edges || []
    };

    return result;
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}