/**
 * Vercel Serverless Function: /api/gemini/biome-lore
 * 
 * Generates contemplative lore upon discovering or entering biomes.
 */

const FALLBACK_LORE = {
  desert: 'Surrender your song to the singing dust, where every patient grain vibrates with ancient memory. Walk softly, wanderer, for the wind has waited an age to echo your breath.',
  snow: 'In the silence of falling frost, brutalist pillars dream of warmth long forgotten. Let your highest pitch awaken the sleeping monoliths.',
  forest: 'The realm awaits the breath that unifies stone, ice, and leaf. Roots intertwine beneath the moss, awaiting your harmonic call.'
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { biomeId = 'desert' } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Using atmospheric procedural fallback.');
    const fallback = FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert;
    return res.status(200).json({ success: true, lore: fallback, provider: 'fallback' });
  }

  try {
    const prompt = `Describe the ancient lore and contemplative mystery of the ${biomeId} realm in 2 concise, deeply poetic sentences, addressing the wanderer whose voice can awaken the world.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'You are the Ancient Voice of the Earth, a contemplative, poetic presence in a zero-HUD exploration game called Resonance. You speak in concise, deeply poetic, mystical whispers (maximum 2-3 sentences).'
          }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 250
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status}`);
      const fallback = FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert;
      return res.status(200).json({ success: true, lore: fallback, provider: 'fallback' });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const loreText = candidate ? candidate.trim() : (FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert);

    return res.status(200).json({
      success: true,
      lore: loreText,
      provider: 'gemini-2.5-flash'
    });
  } catch (error) {
    console.error('Error in /api/gemini/biome-lore:', error);
    const fallback = FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert;
    return res.status(200).json({ success: true, lore: fallback, provider: 'fallback' });
  }
}
