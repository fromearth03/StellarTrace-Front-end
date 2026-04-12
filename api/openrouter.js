export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
    return;
  }

  try {
    const { prompt, model } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const resolvedModel = (model || 'gemini-2.5-flash').replace(/^google\//, '');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${apiKey}`,
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: data?.error?.message || 'Gemini request failed',
        details: data
      });
      return;
    }

    const content = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('') || '';
    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}