// chat-app/api/chat.(ts|mts)
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export default async function handler(req: any, res: any) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // or your domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Method guard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  }

  try {
    // Ensure we actually have JSON
    const isJson = (req.headers?.['content-type'] || '').includes('application/json');

    // In some runtimes/body parsers, req.body could be a string
    const body =
      isJson && typeof req.body === 'string' ? JSON.parse(req.body) :
      isJson && typeof req.body === 'object' ? req.body :
      {};

    console.log('Received request body:', body);

    const { playerName, playerDescription, mjMessage } = body;

    if (!playerName || !playerDescription || !mjMessage) {
      console.log('Missing fields:', {
        playerName: !!playerName,
        playerDescription: !!playerDescription,
        mjMessage: !!mjMessage,
      });
      return res.status(400).json({ error: 'Missing required fields: playerName, playerDescription, mjMessage' });
    }

    // API key must be on the SERVER (Vercel → Project Settings → Environment Variables)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set on the server environment');
      return res.status(500).json({ error: 'Server misconfiguration: OPENAI_API_KEY missing' });
    }

    // Build the model with explicit apiKey so it never tries to read frontend envs
    console.log('Creating OpenAI model...');
    const model = openai('gpt-4o', { apiKey });

    // You’re using the playerDescription as system prompt and mjMessage as user prompt
    console.log('Generating text...');
    const { text } = await generateText({
      model,
      system: playerDescription,
      prompt: mjMessage,
      temperature: 0.8,
      maxTokens: 150,
    });

    console.log(`Response for ${playerName}:`, text);

    // Optional: CORS on response
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ response: text });
  } catch (error: any) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error?.stack ?? 'No stack trace');

    // Keep your friendly fallback
    const name = req.body?.playerName || 'Player';
    const fallbackResponse = `*${name} nods thoughtfully*`;

    return res.status(200).json({ response: fallbackResponse, error: true });
  }
}
