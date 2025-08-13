import type { VercelRequest, VercelResponse } from '@vercel/node';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerName, playerDescription, mjMessage } = req.body;

    if (!playerName || !playerDescription || !mjMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const model = openai('gpt-4o');
    
    const { text } = await generateText({
      model,
      system: playerDescription,
      prompt: mjMessage,
      temperature: 0.8,
      maxOutputTokens: 150
    });

    console.log(`Response for ${playerName}:`, text);

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error generating player response:', error);
    
    // Fallback response
    const { playerName } = req.body;
    const fallbackResponse = `*${playerName || 'Player'} nods thoughtfully*`;
    
    return res.status(200).json({ response: fallbackResponse });
  }
}