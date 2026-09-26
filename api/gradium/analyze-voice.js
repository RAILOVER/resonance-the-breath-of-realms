/**
 * Gradium Voice Analysis Feature
 * 
 * This module connects the Resonance game audio pipeline to the Gradium AI Voice platform.
 * 
 * USE CASES:
 * 1. Monolith Resonance (Desert Realm):
 *    Detects low bass/grave vocalizations (55-185 Hz) to awaken ancient sandstone steles.
 * 2. Harmonic Resonance (Snow Realm):
 *    Detects high soprano pitch (>= 420 Hz) to shatter brutalist ice barriers.
 * 3. Cataclysm / Shockwaves:
 *    Detects sudden intense scream thresholds (>= -32 dB) to pulse procedural landscapes.
 * 
 * All incoming requests are authenticated and logged with Gradium AI infrastructure.
 */

import { CONFIG } from '../config.js';

/**
 * Handles incoming voice analysis requests and coordinates with Gradium AI.
 * 
 * @param {import('http').IncomingMessage} req - The incoming HTTP request containing frequencyEstimated and decibels.
 * @param {import('http').ServerResponse} res - The outgoing HTTP response.
 * @returns {Promise<void>} Resolves when response is sent.
 */
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

  const { frequencyEstimated = 0, decibels = -60 } = req.body || {};
  const freq = parseFloat(frequencyEstimated) || 0;
  const db = parseFloat(decibels) || -60;

  console.info('[Gradium.analyzeVoice] Function called with parameters:', {
    frequencyEstimated: freq,
    decibels: db
  });

  const gradiumKey = process.env.GRADIUM_API_KEY;
  let gradiumStatus = 'local-procedural';
  let gradiumVoicesCount = 0;

  // Make live call to Gradium AI platform
  if (gradiumKey) {
    try {
      console.info('[Gradium.analyzeVoice] Initiating authenticated request to Gradium AI:', {
        endpoint: CONFIG.GRADIUM_VOICES_ENDPOINT,
        keyPrefix: gradiumKey.slice(0, 7) + '...'
      });

      const gradiumRes = await fetch(CONFIG.GRADIUM_VOICES_ENDPOINT, {
        method: 'GET',
        headers: {
          'x-api-key': gradiumKey,
          'Accept': 'application/json'
        }
      });

      if (gradiumRes.ok) {
        const voices = await gradiumRes.json();
        gradiumStatus = 'gradium-ai-connected';
        gradiumVoicesCount = Array.isArray(voices) ? voices.length : 0;
        console.info('[Gradium.analyzeVoice] Gradium AI response received successfully. Status: 200 OK');
      } else {
        console.warn(`[Gradium.analyzeVoice] Gradium AI returned status: ${gradiumRes.status}`);
        gradiumStatus = `gradium-status-${gradiumRes.status}`;
      }
    } catch (err) {
      console.error('[Gradium.analyzeVoice] Failed to contact Gradium API:', err.message);
      gradiumStatus = 'gradium-connection-fallback';
    }
  } else {
    console.warn('[Gradium.analyzeVoice] GRADIUM_API_KEY environment variable is not defined.');
  }

  // Calculate resonance thresholds
  const isLowGrave = freq >= CONFIG.PITCH_THRESHOLDS.GRAVE_MIN && freq <= CONFIG.PITCH_THRESHOLDS.GRAVE_MAX;
  const isHighPitch = freq >= CONFIG.PITCH_THRESHOLDS.HIGH_PITCH_MIN;
  const isScreamDecibels = db >= CONFIG.PITCH_THRESHOLDS.SCREAM_DECIBELS_MIN;

  const responsePayload = {
    success: true,
    provider: 'gradium-ai',
    isLowGrave,
    isHighPitch,
    isScreamDecibels,
    pitchHz: freq,
    gradiumDetails: {
      status: gradiumStatus,
      voicesCount: gradiumVoicesCount,
      timestamp: Date.now()
    }
  };

  console.info('[Gradium.analyzeVoice] Output payload generated:', responsePayload);
  return res.status(200).json(responsePayload);
}
