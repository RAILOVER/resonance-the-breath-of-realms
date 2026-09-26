/**
 * Centralized Configuration for Resonance API Services
 * 
 * Groups all configurable parameters, models, URLs, and acoustic thresholds
 * according to the project guidelines.
 */

export const CONFIG = {
  // AI Models
  GEMINI_MODEL: 'gemini-3.8-flash',
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  
  // Gradium AI Voice Infrastructure
  GRADIUM_API_URL: 'https://api.gradium.ai/api',
  GRADIUM_VOICES_ENDPOINT: 'https://api.gradium.ai/api/voices',
  
  // Voice Frequency Thresholds (in Hertz)
  PITCH_THRESHOLDS: {
    GRAVE_MIN: 55,
    GRAVE_MAX: 185,
    HIGH_PITCH_MIN: 420,
    SCREAM_DECIBELS_MIN: -32
  },

  // Recognized Voice Commands for Game Interactions
  VOICE_COMMANDS: {
    TAKE: ['take it', 'take', 'prend', 'prendre', 'grab', 'attrape', 'ramasse', 'sheet'],
    CIRCLE: ['circle', 'cercle', 'rond', 'transmute', 'transmuter', 'forge', 'sphere'],
    JUMP: ['jump', 'saute', 'monter', 'vole', 'ascend'],
    ECHO: ['echo', 'resonance', 'voix', 'parle', 'chante']
  }
};
