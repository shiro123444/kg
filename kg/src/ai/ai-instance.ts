import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// 从环境变量中读取 API 密钥
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing API key. Please set DEEPSEEK_API_KEY, GOOGLE_GENAI_API_KEY or GEMINI_API_KEY in your environment variables.');
}

// 注意：这里我们使用 Google AI 插件，因为直接自定义插件遇到了类型兼容问题
// 实际项目中，建议设置一个代理服务器将请求从 Google API 格式转换为 DeepSeek API 格式
export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'gemini-1.5-flash', // 使用 Google 的模型
});
