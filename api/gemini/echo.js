/**
 * Vercel Serverless Function: /api/gemini/echo
 * 
 * Generates mystical, poetic echoes reflecting the player's voice frequency and discovered relics.
 * Utilizes the Google Gemini API with system instructions for the Ancient Voice of the Earth.
 */

const FALLBACK_ECHOS = {
  desert: 'The orange dust stirs, answering the ancient rumble of your voice.',
  snow: 'The crystalline ice shivers as high harmonics pierce the silent brutalist mist.',
  forest: 'Deep roots tremble in harmony with your breath, weaving moss into ancient song.'
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

  const { biomeId = 'desert', frequencyType = 'medium', pitchHz = 220, relicIndex = 0 } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Using atmospheric procedural fallback.');
    const fallback = FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert;
    return res.status(200).json({ success: true, echo: fallback, provider: 'fallback' });
  }

  try {
    const prompt = `The wanderer vocalized in the ${biomeId} realm with a ${frequencyType} frequency (${pitchHz} Hz) near ancient relic #${relicIndex}. Speak to them as the Ancient Voice of the Earth in 2 concise, deeply poetic, mystical sentences reflecting their voice resonance.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'You are the Ancient Voice of the Earth, a contemplative, poetic presence in a zero-HUD exploration game called Resonance. You speak in concise, deeply poetic, mystical whispers (maximum 2-3 sentences). Your words reflect the player voice frequency and their harmony with nature.'
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
      const fallback = FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert;
      return res.status(200).json({ success: true, echo: fallback, provider: 'fallback' });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const echoText = candidate ? candidate.trim() : (FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert);

    return res.status(200).json({
      success: true,
      echo: echoText,
      provider: 'gemini-2.5-flash'
    });
  } catch (error) {
    console.error('Error in /api/gemini/echo:', error);
    const fallback = FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert;
    return res.status(200).json({ success: true, echo: fallback, provider: 'fallback' });
  }
}
