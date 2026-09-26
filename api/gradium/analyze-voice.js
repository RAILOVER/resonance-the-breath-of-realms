/**
 * Vercel Serverless Function: /api/gradium/analyze-voice
 * 
 * Instantaneous voice analysis computing pitch registers and scream intensities.
 */

export default async function handler(req, res) {
  // Enable CORS
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

  const isLowGrave = freq >= 55 && freq <= 185;
  const isHighPitch = freq >= 420;
  const isScreamDecibels = db >= -32;

  return res.status(200).json({
    success: true,
    provider: 'gradium-ai',
    isLowGrave,
    isHighPitch,
    isScreamDecibels,
    pitchHz: freq,
    gradiumDetails: null
  });
}
