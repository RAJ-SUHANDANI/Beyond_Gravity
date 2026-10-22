# BEYOND GRAVITY
#### THE STUNT. THE SCIENCE. THE FUTURE.

**An independent, cinematic, interactive documentary about the Tesla Roadster demonstrations and the extraordinary engineering required to move beyond the road.**

> A car enters the frame. The world goes dark. Light slices across the bodywork. The invitation appears: **ENTER EXPERIENCE**. What follows is not an ordinary site — it's a chapter-gated film with an original interactive 3D vehicle, playable physics experiments, documentary narration and a fully cited technical sourcebook.

[![Build & Typecheck](https://github.com/RAJ-SUHANDANI/Beyond_Gravity/actions/workflows/build.yml/badge.svg)](https://github.com/RAJ-SUHANDANI/Beyond_Gravity/actions/workflows/build.yml)
[![Free](https://img.shields.io/badge/runtime-no_paid_APIs-91e1d4)](https://github.com/RAJ-SUHANDANI/Beyond_Gravity)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-procedural_3D-black?logo=threedotjs)](https://threejs.org/)

---

## What makes it different?

### 01 — Cinematic entry, not a website landing page
The experience starts behind a near-black screen. A historical *publisher-hosted official Roadster unveil video* emerges through aperture masks, a lighting sweep, letterboxing and a hand-art-directed montage effect. Pointer movement adds subtle video-layer depth. A metallic, dimensional **Enter Experience** button completes the opening. It is **video**, not the site's 3D model.

**Media honesty:** Tesla's official Roadster webpage features a 2017 Vimeo unveil. This intro is that archival video, **not** footage of the separate 2026 flight demonstrations. The 2026 event replay is linked within the documentary with segment references. We neither redistribute Tesla film files nor pretend to own them.

### 02 — A film that unlocks chapter by chapter
A single animated stage replaces ordinary stacked content blocks. Each chapter is introduced by editorial typography, a kinetic reveal wipe, a live-moving 3D scene, ambient cinematic treatment and narrated explanation. **The first experience begins after Enter is clicked** (browsers commonly block audible autoplay without interaction). Subsequent narration can automatically advance the story when it concludes. Manual chapter seeking remains possible.

### 03 — The car becomes an educational instrument
A hand-authored, procedural Three.js sports-car interpretation with a lofted sculptural exterior, streamlined canopy, racing wheels, headlights, aerodynamic detailing, separately animated fans, cold-gas nozzles, vessel and flight-control electronics. The geometry uses original code inspired by Roadster exterior references and the technique advocated by [img2threejs](https://github.com/img2threejs/img2threejs). No marketplace meshes are downloaded.

**This model is not Tesla CAD, a precision photogrammetric scan or an exact reproduction of the October 2026 prototype.** Unknown internals are labelled conceptual.

### 04 — Watch / Explore / Experiment
- **Watch**: full-screen film chapters, animated transitions, evidence and optional subtitle panels.
- **Explore**: orbit/zoom the 3D car, explode it, click or select components, and see the relevant mechanism enlarged with a concise female-guide explanation.
- **Experiment**: interact with a hover-power model that updates as mass, rotor disk area and efficiency change. This is physics education, not flight certification.

### 05 — Two natural-language documentary hosts
- **Male**: deeper and more involved explanations across twelve chapters.
- **Female**: short introductions, component explanations and interactive guidance.
- Sound starts after the visitor's **Enter Experience** interaction, not after tapping a "hear story" button in every chapter.
- The application prefers **pre-rendered local natural TTS audio** named `public/audio/male-00.mp3` through `male-11.mp3`, and `female-*.mp3`. It falls back to a browser-supplied voice if clips are absent; that system voice is **not guaranteed natural-sounding**.
- To generate permissively licensed neural voices with no recording or paid key, use [tools/render_kokoro.py](tools/render_kokoro.py), based on the Apache-licensed [Kokoro 82M](https://huggingface.co/hexgrad/Kokoro-82M). The [voice-production workflow](.github/workflows/voices.yml) can render all 19 clips (12 male chapters, 6 female component explanations and female introduction). A separate [Chatterbox](https://github.com/resemble-ai/chatterbox) workflow remains available if you supply voice samples you are authorized to use.

**Voice-quality disclosure:** Kokoro produces synthetic speech, not a human performance. If `public/audio/*.mp3` has not yet been generated and reviewed, the browser speech engine acts as a fallback. The renderer also writes `.vtt` subtitle cues using Kokoro's phoneme-timing output; the player prioritizes them whenever available. All published audio should be checked by ear for natural delivery, pronunciation and clipping.

---

## Thirty-six deep-dive explanations

Each of the twelve chapters now includes **three researched educational beats**, each with its own diagram, explanation and scientific takeaway. Visitors can open the **Science Theater** to investigate the drawings, move between conceptual stages, and read extended explanations. These diagrams are teaching reconstructions—not manufacturer-provided CAD, measured CFD outputs or airworthiness evidence.

The documentary also includes an original **Web Audio soundscape** that reacts to chapters and automatically lowers its level under narration. The audio starts only after the viewer enters the experience and does not depend on proprietary music tracks or cloud services.

## Twelve chapters

| # | Episode | Subject |
|---|---|---|
| 01 | **The Impossible Moment** | What Tesla demonstrated in October 2026, plus the limitations of brief airborne stunts. |
| 02 | **Anatomy of an Idea** | Inspect an original Roadster-inspired conceptual mechanical model. |
| 03 | **The Suction Secret** | Four reported fan motors, skirts, pressure differences and traction. |
| 04 | **Force on Demand** | Gas storage, cold-gas thrust, reaction forces, attitude control. |
| 05 | **Gravity Never Negotiates** | Mass, lift, thrust and torque. |
| 06 | **The Digital Pilot** | Feedback loops, sensor systems and stability. |
| 07 | **Built to be Tested** | Research, safety requirements, verification and iteration. |
| 08 | **The Hard Limits** | Range, energy, noise, safety and airworthiness. |
| 09 | **Four Roads to the Sky** | Roadable eVTOL, winged cars, modular systems, thruster variants. |
| 10 | **What Comes Next?** | Technical directions and genuine engineering trade-offs. |
| 11 | **Make Physics Visible** | Interactive rotor hover-power experiment. |
| 12 | **Beyond Gravity** | Film epilogue, research links and scientific perspective. |

---

## Install and run — completely free

Requires Node.js **20.19+** or **22.12+**, npm and a modern WebGL browser.

```bash
git clone https://github.com/RAJ-SUHANDANI/Beyond_Gravity.git
cd Beyond_Gravity
npm install
npm run dev
```

Open the local Vite address (usually `http://localhost:5173`).

```bash
npm run typecheck
npm run build
npm run preview
```

There are **no runtime accounts, paid APIs, database, payment system or required hosting service**. The Vimeo intro is an external optional official embed, so that particular video needs internet access. No third-party media is copied into the repository.

### Optional: locally render professional narration

```bash
python -m pip install chatterbox-tts torchaudio
python tools/render_narration.py --male-ref voices/my_authorized_male.wav --female-ref voices/my_authorized_female.wav
```

Requires an installed FFmpeg, model weights and sufficient compute. These commands generate independent voice files from two **properly licensed** samples and save them in `public/audio/`. Listen to every result, revise pronunciation and pauses, and only then commit audio assets you are permitted to distribute.

---

## Creative and technical stack

| System | Tools |
|---|---|
| Application | React 19, TypeScript, Vite |
| Original WebGL car + physical teaching scenes | Three.js, React Three Fiber, Drei utilities |
| Documentary transitions | Motion |
| Cinematic engineering drawings | Authored SVG, CSS motion and Motion |
| Original atmospheric soundtrack | Web Audio synthesis with dialogue ducking |
| Realistic local TTS production | Chatterbox; FFmpeg |
| Offline-safe calculations | Built-in TypeScript physics formulas |
| Sourcebook | Audited public references and independent explanations |

A **responsive, mobile-aware** interface includes pointer/touch/keyboard controls, reduced motion styles, evidence source panels, and opt-in narrated playback. Scene complexity is capped for performance.

### Important interactions
- Landing **Enter Experience** -> begin documentary + audio in response to the user gesture.
- Wait for narration and auto progression, or manually step forwards/backwards.
- Click **Field Notes / Evidence** to inspect documented claims and source URLs.
- Select **Inspect** to manipulate a custom component scene.
- Change mass, rotor area and efficiency in the **Future Lab**.
- Toggle captions, mute or enable auto-advance.
- Follow the 2026 reveal link to review the genuine demo context.

---

## Factual integrity and Tesla's rights

Read [SOURCES.md](SOURCES.md) before distributing this educational project.

- Tesla's own Roadster webpage displays **older promotional figures** such as 1.9 s acceleration and 620 mi range. Do not confuse these with the **2026** prototype demonstration.
- Reuters, WIRED and AP reported on the October 2026 stunt and its SpaceX-influenced gas thrusters, fans and production targets. See [sources](SOURCES.md).
- Brief airborne action **is not** independent proof of sustained commercially certified flight.
- Internal parts and new scenarios in our 3D model are explicitly **conceptual educational reconstruction**.
- The video is publisher-embedded, not copied, remixed or shipped as ours.
- Tesla's copyrights/trademarks remain Tesla's. **Attribution and an independence disclaimer do not grant permission** or guarantee against a takedown or legal notice. Obtain appropriate rights before mirroring or creating derivative Tesla media for public distribution.

**Not affiliated with, sponsored by, or endorsed by Tesla, SpaceX, Netflix or any other company mentioned.**

### Research anchors
[Tesla Roadster](https://www.tesla.com/roadster) · [Reuters Roadster reveal](https://www.reuters.com/business/autos-transportation/tesla-set-unveil-next-generation-roadster-sports-ev-after-years-delay-2026-10-15/) · [WIRED technical explanation](https://www.wired.com/story/how-tesla-made-its-new-230-mph-car-fly) · [AP](https://apnews.com/article/7d5f19665435b7408025bfb7a2f2f0b7) · [NASA](https://www.nasa.gov/x-57-maxwell/) · [FAA](https://www.faa.gov/air-taxis)

---

## Testing and release verification

`npm run test` launches Playwright Chromium desktop and mobile suites after `npm run build`. Tests cover the entrance, storyboard explanation theater, navigation, physical labs, slider-free controls, and safe hit targets. GitHub Actions also checks the *actual Vercel deployment* after the Vercel status for that commit becomes successful. Rendered QA screenshots and browser traces are available via the build artifacts. Passing CI is not proof of perfect visuals or natural human-quality narration; manual listening and visual review remain essential.

## Project organization

```text
src/
  Intro.tsx         official-player film entrance, reveal layers, magnetic CTA
  Film.tsx          director, 12 chapter-gated stages, media and evidence
  Vehicle.tsx       handcrafted mesh surfaces and animated 3D subsystems
  Lab.tsx           interactive component explorer and physics simulation
  research.ts       source-backed technical annotations
  data.ts           12 authored narrator scripts and teaching content
  audio.ts          dual-voice playback routing
  physics.ts        transparent educational equations
  cinema.css        cinematic montage and documentary design language
  styles.css        component lab, responsive and accessibility styles
  main.tsx          app entry
tools/
  render_narration.py  optional local natural-TTS batch renderer
public/
  audio/README.md
  favicon.svg
SOURCES.md
```

---

### Why this exists

A spectacle can capture attention, but engineering deserves explanation. Beyond Gravity turns the viral question—**How did that car leave the ground?**—into something you can watch, explore, and test.

> *The future doesn't become real because it looks like science fiction. It becomes real when the science stands up to scrutiny.*


## Director's Cut update · October 2026

The production currently uses a **single dark design system**. The light/dark theme toggle was intentionally retired to improve documentary consistency and prevent the low-contrast overlaps observed during review. Responsive typography and the bottom player were redesigned around unobstructed caption-safe areas.

### New chapter-level animated explanations
A set of authored SVG/CSS instrument-style animations varies by chapter: animated traction vectors, a propulsion jet, the sense-compute-correct control loop, certification tradeoffs, architecture navigation, and hover-energy instrumentation. These are **illustrative graphics**, not computational fluid dynamics or recorded footage.

### Improved captions and sound
The voice player now dispatches caption segments while speech proceeds, based on browser word boundaries or an approximate position in the available local MP3. This is an improvement over displaying the first paragraph as a static overlay, but **precise phrase timing still requires final mastered audio and aligned captions**. If the local files are absent, the browser's built-in speech synthesis remains a variable-quality fallback. The repo does not currently bundle natural neural voice recordings.

### Component inspection
The inspection stage uses the same procedural geometry definitions for the selected wheel, fan, nozzle, reservoir, controller and body, and suppresses the corresponding original subsystem when it is being isolated. The original car still represents a conceptual educational model, not licensed manufacturer CAD.

### Production-readiness caveats
A GitHub Actions green build confirms TypeScript and Vite completion, **not visual correctness, voice quality, accessibility certification, frame rate, or copyright clearance**. Before advertising the project as finished, test actual desktop/mobile browsers, obtain usable locally mastered two-voice narration, verify publisher-hosted media permissions, and capture measured performance/accessibility results. We do not invent a numerical "10/10" audit grade without measured verification.
