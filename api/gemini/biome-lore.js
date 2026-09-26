/**
 * Gemini Biome Lore Generation Feature
 * 
 * This module generates contemplative, mystical introductions and descriptions
 * for each realm (Desert, Snow, Forest) when the player enters or explores them.
 * 
 * USE CASES:
 * 1. Desert Realm Lore:
 *    Evokes the singing dunes, forgotten monoliths, and vibrational memory of stone.
 * 2. Snow Realm Lore:
 *    Describes the brutalist architecture, frozen time, and crystal resonance.
 * 3. Forest Realm Lore:
 *    Explores subterranean mycelium and harmonic canopy networks.
 * 
 * Logs all parameters and genai calls according to hackathon coding guidelines.
 */

import { CONFIG } from '../config.js';

const FALLBACK_LORE = {
  desert: 'Surrender your song to the singing dust, where every patient grain vibrates with ancient memory. Walk softly, wanderer, for the wind has waited an age to echo your breath.',
  snow: 'In the silence of falling frost, brutalist pillars dream of warmth long forgotten. Let your highest pitch awaken the sleeping monoliths.',
  forest: 'The realm awaits the breath that unifies stone, ice, and leaf. Roots intertwine beneath the moss, awaiting your harmonic call.'
};

/**
 * Handles incoming lore generation requests.
 * 
 * @param {import('http').IncomingMessage} req - The incoming HTTP request.
 * @param {import('http').ServerResponse} res - The outgoing HTTP response.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export default async function handler(req, res) {
  // CORS configuration
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

  console.info('[Gemini.biomeLore] Function called with parameters:', { biomeId });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini.biomeLore] GEMINI_API_KEY environment variable is not set. Using atmospheric procedural fallback.');
    const fallback = FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert;
    return res.status(200).json({ success: true, lore: fallback, provider: 'fallback' });
  }

  try {
    const prompt = `Describe the ancient lore and contemplative mystery of the ${biomeId} realm in 2 concise, deeply poetic sentences, addressing the wanderer whose voice can awaken the world.`;

    const systemInstruction = 'You are the Ancient Voice of the Earth, a contemplative, poetic presence in a zero-HUD exploration game called Resonance. You speak in concise, deeply poetic, mystical whispers (maximum 2-3 sentences).';

    const config = {
      temperature: 0.85,
      maxOutputTokens: 250
    };

    console.info('[GenAI.call] Calling Gemini with parameters:', {
      model: CONFIG.GEMINI_MODEL,
      prompt,
      config
    });

    const url = `${CONFIG.GEMINI_BASE_URL}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: config
      })
    });

    if (!response.ok) {
      console.warn(`[Gemini.biomeLore] Gemini API returned status: ${response.status}`);
      const fallback = FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert;
      return res.status(200).json({ success: true, lore: fallback, provider: 'fallback' });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const loreText = candidate ? candidate.trim() : (FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert);

    console.info('[GenAI.output] Gemini lore response received:', { lore: loreText });

    return res.status(200).json({
      success: true,
      lore: loreText,
      provider: CONFIG.GEMINI_MODEL
    });
  } catch (error) {
    console.error('[Gemini.biomeLore] Error generating biome lore:', error.message);
    const fallback = FALLBACK_LORE[biomeId] || FALLBACK_LORE.desert;
    return res.status(200).json({ success: true, lore: fallback, provider: 'fallback' });
  }
}
