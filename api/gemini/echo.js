/**
 * Gemini Ancient Echoes Generation Feature
 * 
 * This module generates mystical, poetic whispers spoken by the Ancient Voice of the Earth.
 * It uses the Google Gemini 2.5 Flash model to synthesize custom, contextual responses
 * whenever a player vocalizes into ancient ruins or steles.
 * 
 * USE CASES:
 * 1. Stele Awakening (Desert):
 *    Responds to deep grave chanting when activating ancient numbered steles.
 * 2. Harmonic Echoes (Snow):
 *    Echoes high soprano crystal vibrations near brutalist pillars.
 * 3. Contemplative Whispers:
 *    Reflects the player's acoustic frequency into atmospheric poetic lore.
 * 
 * Logs all parameters and genai calls according to hackathon coding guidelines.
 */

import { CONFIG } from '../config.js';

const FALLBACK_ECHOS = {
  desert: 'The orange dust stirs, answering the ancient rumble of your voice.',
  snow: 'The crystalline ice shivers as high harmonics pierce the silent brutalist mist.',
  forest: 'Deep roots tremble in harmony with your breath, weaving moss into ancient song.'
};

/**
 * Handles incoming echo requests and contacts Google Gemini API.
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

  const { biomeId = 'desert', frequencyType = 'medium', pitchHz = 220, relicIndex = 0 } = req.body || {};

  console.info('[Gemini.echo] Function called with parameters:', {
    biomeId,
    frequencyType,
    pitchHz,
    relicIndex
  });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini.echo] GEMINI_API_KEY environment variable is not set. Using atmospheric procedural fallback.');
    const fallback = FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert;
    return res.status(200).json({ success: true, echo: fallback, provider: 'fallback' });
  }

  try {
    const prompt = `The wanderer vocalized in the ${biomeId} realm with a ${frequencyType} frequency (${pitchHz} Hz) near ancient relic #${relicIndex}. Speak to them as the Ancient Voice of the Earth in 2 concise, deeply poetic, mystical sentences reflecting their voice resonance.`;

    const systemInstruction = 'You are the Ancient Voice of the Earth, a contemplative, poetic presence in a zero-HUD exploration game called Resonance. You speak in concise, deeply poetic, mystical whispers (maximum 2-3 sentences). Your words reflect the player voice frequency and their harmony with nature.';

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
      console.warn(`[Gemini.echo] Gemini API returned status: ${response.status}`);
      const fallback = FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert;
      return res.status(200).json({ success: true, echo: fallback, provider: 'fallback' });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const echoText = candidate ? candidate.trim() : (FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert);

    console.info('[GenAI.output] Gemini echo response received:', { echo: echoText });

    return res.status(200).json({
      success: true,
      echo: echoText,
      provider: CONFIG.GEMINI_MODEL
    });
  } catch (error) {
    console.error('[Gemini.echo] Error generating echo:', error.message);
    const fallback = FALLBACK_ECHOS[biomeId] || FALLBACK_ECHOS.desert;
    return res.status(200).json({ success: true, echo: fallback, provider: 'fallback' });
  }
}
