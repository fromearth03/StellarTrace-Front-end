export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on server' });
    return;
  }

  try {
    const { prompt, model, max_tokens: requestedMaxTokens } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const PROMPT_CHAR_LIMIT = 5000;
    const MAX_OUTPUT_TOKENS = 1200;
    const safePrompt = prompt.slice(0, PROMPT_CHAR_LIMIT);
    const parsedMaxTokens = Number(requestedMaxTokens);
    const safeMaxTokens = Number.isFinite(parsedMaxTokens)
      ? Math.min(Math.max(parsedMaxTokens, 64), MAX_OUTPUT_TOKENS)
      : MAX_OUTPUT_TOKENS;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin || 'https://stellartrace.jarviscore.me',
        'X-Title': 'Stellar Trace Frontend'
      },
      body: JSON.stringify({
        model: model || 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: safePrompt }],
        temperature: 0.3,
        max_tokens: safeMaxTokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: data?.error?.message || 'OpenRouter request failed',
        details: data
      });
      return;
    }

    const content = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}