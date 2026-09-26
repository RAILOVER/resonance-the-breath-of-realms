# Resonance - The Breath of Realms

A contemplative first-person zero-HUD exploration game where your voice reshapes procedural desert, snow, and forest worlds powered by **Gradium AI Voice** and **Google Gemini 2.5 Flash**.

## Features & Voice Mechanics

- **Voice Frequency Detection (Gradium AI)**:
  - Deep grave voices (55 - 185 Hz) awaken the sleeping desert monoliths.
  - High harmonics (>= 420 Hz) shatter brutalist crystal barriers.
  - Intense vocal pulses trigger shockwaves.
- **Voice Commands & Word Interpretation (Gradium STT)**:
  - Speak `"take"` / `"prends"` to pick up mystical items.
  - Speak `"circle"` / `"cercle"` to transmute relics.
  - Speak `"jump"` / `"saute"` to ascend.
- **Contemplative Lore & Whispers (Google Gemini)**:
  - Ancient whispers generated based on your voice frequency and biome location.

## Controls

### Desktop (Web / PC / Mac)
- **Move**: `W, A, S, D` or `Z, Q, S, D` / Arrow keys
- **Look**: Mouse movement
- **Jump**: `Spacebar`
- **Voice**: Speak or sing into your microphone

### Mobile & Tablet (iOS / Android)
- **Left Thumb**: Semi-transparent virtual joystick for movement
- **Right Thumb**: Drag to look around
- **▲ JUMP Button**: Tap to jump / ascend
- **Microphone**: Hands-free vocal detection and command recognition

## Environment Variables for Vercel

In your Vercel Project Settings > **Environment Variables**, add:
1. `GEMINI_API_KEY`: Your Google AI Studio API key
2. `GRADIUM_API_KEY`: Your Gradium API key (`gsk_...`)
