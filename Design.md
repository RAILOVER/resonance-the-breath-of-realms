# Design Document - Resonance: The Breath of Realms

## Overview
**Resonance - The Breath of Realms** is a contemplative, first-person zero-HUD exploration game. The player wanders through three interconnected procedural realms (Desert of Echoes, Brutalist Frost, Ancient Harmonic Canopy). The environment reacts directly to the player's acoustic voice, pitch, and spoken words using **Gradium AI Voice platform** and **Google Gemini 2.5 Flash**.

---

## Architectural Features & Service Boundaries

### 1. Gradium AI Voice Infrastructure
- **Acoustic Voice Frequency Analysis (`/api/gradium/analyze-voice`)**:
  - Connects to Gradium Voice infrastructure (`https://api.gradium.ai/api`).
  - Classifies audio resonance in real time:
    - **Grave / Deep Voice (55 Hz - 185 Hz)**: Awakens dormant monoliths in the desert.
    - **High Harmonics / Soprano (>= 420 Hz)**: Vibrates and shatters brutalist crystal barriers in the snow realm.
    - **Scream / Decibel Pulse (>= -32 dB)**: Generates seismic visual waves across terrain vertices.
- **Voice Commands & Semantic Word Interpretation (`/api/gradium/voice-command`)**:
  - Transcribes voice audio and matches gameplay action triggers:
    - `"take"` / `"prends"`: Picks up the brutalist ice sheet.
    - `"circle"` / `"cercle"` / `"transmute"`: Reshapes the ice sheet into a circular relic key to fit the pedestal socket.
    - `"jump"` / `"saute"`: Ascends on harmonic air currents.

### 2. Generative Lore & Whispers (Google Gemini 2.5 Flash)
- **Ancient Echoes (`/api/gemini/echo`)**:
  - Acts as the "Ancient Voice of the Earth".
  - Synthesizes 2-3 sentence poetic whispers reflecting the player's voice pitch and relic discoveries.
- **Biome Lore (`/api/gemini/biome-lore`)**:
  - Generates environmental contemplative prose upon discovering new biomes or gateways.

### 3. Dual Platform Controls
- **Desktop (PC / Mac)**:
  - Movement: `W, A, S, D` or `Z, Q, S, D` / Arrow keys.
  - Camera: Pointer lock mouse navigation.
  - Action / Jump: `Spacebar`.
  - Microphone: Real-time Web Audio API pitch estimation and speech recording.
- **Mobile & Tablet (iOS / Android)**:
  - Left zone: Semi-transparent floating virtual joystick for omnidirectional movement.
  - Right zone: Touch drag for 360° camera orientation.
  - On-screen `▲ JUMP` button.
  - Microphone: Web Audio API integration with HTTPS authorization.

---

## Configuration & Environment Variables

Centralized in `api/config.js`:
- `GEMINI_API_KEY`: API Key for Google Gemini 2.5 Flash model.
- `GRADIUM_API_KEY`: API Key for Gradium Voice platform (`x-api-key: gsk_...`).
- `PITCH_THRESHOLDS`: Numerical frequency boundaries for voice mechanics.
- `VOICE_COMMANDS`: Keywords for interactive hands-free voice commands.

---

## Telemetry & Logging
All API functions log:
- Full parameter signatures.
- Model names, prompt configs, and output payloads (with base64 inline audio data truncated for security and clean logs).
- Gradium connection status and latency indicators.
