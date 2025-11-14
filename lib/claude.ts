import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HealthDataContext {
  sleep?: any[];
  activity?: any[];
  readiness?: any[];
  heartRate?: any[];
  workouts?: any[];
}

/**
 * Generate a response from Claude based on user question and health data
 */
export async function generateHealthInsight(
  userQuestion: string,
  healthData: HealthDataContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const systemPrompt = `You are a health and wellness assistant analyzing data from an Oura Ring wearable device.
Your role is to:
1. Answer user questions about their health data
2. Provide insights and patterns from their metrics
3. Generate helpful visualizations using Vega-Lite specifications when appropriate
4. Offer actionable suggestions for improving health metrics

When generating visualizations:
- Use Vega-Lite JSON specifications
- Wrap the specification in a code block with the language identifier "vega-lite"
- Keep visualizations simple and focused on the data being discussed

Available health data:
${JSON.stringify(healthData, null, 2)}

Be conversational, supportive, and data-driven in your responses.`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: userQuestion,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const textContent = response.content.find((block) => block.type === 'text');
  return textContent?.type === 'text' ? textContent.text : '';
}

/**
 * Generate a Vega-Lite visualization specification for health data
 */
export async function generateVisualization(
  dataType: string,
  data: any[],
  userRequest?: string
): Promise<any> {
  const prompt = userRequest
    ? `Create a Vega-Lite visualization for this ${dataType} data based on the user's request: "${userRequest}"\n\nData: ${JSON.stringify(data, null, 2)}`
    : `Create a meaningful Vega-Lite visualization for this ${dataType} data: ${JSON.stringify(data, null, 2)}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    system: 'You are a data visualization expert. Generate only valid Vega-Lite JSON specifications. Return ONLY the JSON, no explanation or markdown.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (textContent?.type === 'text') {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to generate visualization');
}
