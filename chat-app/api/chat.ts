import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body);
    
    const { playerName, playerDescription, mjMessage } = req.body;

    if (!playerName || !playerDescription || !mjMessage) {
      console.log('Missing fields:', { playerName: !!playerName, playerDescription: !!playerDescription, mjMessage: !!mjMessage });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating OpenAI model...');
    const model = openai('gpt-4o');
    
    console.log('Generating text...');
    const { text } = await generateText({
      model,
      system: playerDescription,
      prompt: mjMessage,
      temperature: 0.8,
      maxTokens: 150
    });

    console.log(`Response for ${playerName}:`, text);

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Fallback response
    const playerName = req.body?.playerName || 'Player';
    const fallbackResponse = `*${playerName} nods thoughtfully*`;
    
    return res.status(200).json({ response: fallbackResponse });
  }
}