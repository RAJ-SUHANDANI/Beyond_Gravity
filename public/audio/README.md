# Optional pre-rendered cinematic narration

The application works without bundled voice recordings through the browser SpeechSynthesis API. For consistently natural documentary voices, run a free local speech synthesis engine (for example Chatterbox, MIT; or Kokoro, Apache 2.0 weights), render the written narration in src/data.ts and master audio locally.

Add files as:
- male-00.mp3 through male-11.mp3 — one male long-form documentary voice per chapter
- female-intro.mp3 — optional female introduction
- female-fans.mp3, female-vessel.mp3, female-thrusters.mp3, female-wheels.mp3, female-computer.mp3, female-body.mp3 — short female component explanations

Missing audio automatically falls back to browser voices. Never place copyrighted narration or music into the repository without redistribution rights. Recordings must match their associated script for accurate captions. Audio is opt-in. The browser does not guarantee particular installed voices.
