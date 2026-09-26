# Resonance - The Breath of Realms

A contemplative first-person zero-HUD exploration game where your voice reshapes procedural desert, snow, and forest worlds powered by Google Gemini AI.

## Controls

### Desktop (Web / PC / Mac)
- **Move**: `W, A, S, D` or `Z, Q, S, D` / Arrow keys
- **Look**: Mouse movement
- **Jump**: `Spacebar`
- **Voice / Sing**: Speak or sing into your microphone (low grave tones awaken desert monoliths, high harmonics shatter ice barriers).

### Mobile & Tablet (iOS / Android)
- **Left Thumb**: Semi-transparent virtual joystick for walking in all directions.
- **Right Thumb**: Drag to look around and orient your view.
- **▲ JUMP Button**: Tap to jump / ascend.
- **Microphone**: Automatically captures voice on mobile via Web Audio API.

## Vercel Deployment

1. Import this repository directly into [Vercel](https://vercel.com/new).
2. (Optional) Set the `GEMINI_API_KEY` environment variable in Vercel **Settings > Environment Variables** with your Google AI Studio API key.
3. Click **Deploy**!

All serverless API routes (`/api/gemini/...` and `/api/gradium/...`) run out-of-the-box with zero configuration needed.
