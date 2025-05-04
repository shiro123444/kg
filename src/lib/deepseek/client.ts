interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required');
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: '你是一个专业的人工智能导论问答助手。请根据提供的上下文信息回答用户的问题。如果上下文中没有相关信息，请坦诚地说明这一点。'
      },
      {
        role: 'user',
        content: `上下文信息：\n${context}\n\n问题：${question}`
      }
    ];

    return this.chat(messages);
  }
}

// Export singleton instance
export const deepseekClient = new DeepSeekClient();
