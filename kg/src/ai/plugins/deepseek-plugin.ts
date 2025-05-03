// src/ai/plugins/deepseek-plugin.ts
// 由于无法直接导入 genkit 的类型，我们自己定义需要的接口

// 定义基本插件接口
interface Plugin {
  name: string;
  registerCallbacks: (callbacks: PluginCallbacks) => void;
}

// 定义插件回调接口
interface PluginCallbacks {
  registerInferenceCallback: (callback: InferenceCallback) => void;
}

// 定义推理回调接口
type InferenceCallback = (params: {
  model: string;
  input: any;
  options?: any;
}) => Promise<{
  result: any;
  provider: string;
  metadata?: any;
}>;

interface DeepSeekOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * 创建一个 DeepSeek AI 插件，支持与 DeepSeek API 兼容的接口
 * DeepSeek API 使用与 OpenAI 兼容的 API 格式
 */
export function deepSeekAI(options: DeepSeekOptions): Plugin {
  const apiKey = options.apiKey;
  const baseURL = options.baseURL || 'https://api.deepseek.com/v1';
  const defaultModel = options.model || 'deepseek-chat';

  if (!apiKey) {
    throw new Error('DeepSeek API key is required');
  }

  return {
    name: 'deepseek',
    registerCallbacks(callbacks: PluginCallbacks) {
      callbacks.registerInferenceCallback(async ({ model, input, options: callOptions }) => {
        // 使用指定的模型或默认模型
        const modelName = model.includes('deepseek') ? model : defaultModel;
        
        try {
          // 准备请求体，遵循 OpenAI 兼容格式
          const body = {
            model: modelName,
            messages: [
              { role: 'system', content: callOptions?.prompt || '' },
              { role: 'user', content: typeof input === 'string' ? input : JSON.stringify(input) }
            ],
            temperature: callOptions?.temperature || 0.7,
            max_tokens: callOptions?.maxTokens || 1000,
          };

          // 调用 DeepSeek API
          const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`DeepSeek API error: ${response.status}, ${error}`);
          }

          const data = await response.json();
          
          // 返回响应内容
          return {
            result: data.choices[0].message.content,
            provider: 'deepseek',
            // 如果需要，可以添加更多元数据
            metadata: {
              rawResponse: data,
            },
          };
        } catch (error) {
          console.error('DeepSeek API error:', error);
          throw error;
        }
      });
    },
  };
}