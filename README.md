# BEYOND GRAVITY
### An interactive documentary about the car that challenged gravity — and the physics of what comes next.

**A cinematic, chapter-based exploration of Tesla's 2026 Roadster demonstration, flight physics, vehicle mechanisms, and the future of roadable aircraft.** Built entirely as a free, local-first, front-end experience with original procedural 3D, scientific interactives, and complementary documentary narrators.

> **Start the film. Step inside the machine. Question the future.**

---

## The experience

This is not a conventional product landing page. Beyond Gravity is a **playable science documentary**. A persistent WebGL world moves through twelve chapters as the viewer scrolls; the car transforms from a silhouette into a labeled engineering cutaway. At any moment, viewers can enter a dedicated component lab or run a physics experiment.

| Experience | What you do |
| --- | --- |
| **WATCH / Documentary** | Follow twelve cinematic chapters, optional voice narration, animated cameras, editorial captions, sources, and a film-style progress rail. |
| **EXPLORE / Component laboratory** | Orbit and zoom a fully original, code-generated sports-car concept. Focus on wheels, suction fans, nitrogen vessel, thruster nozzles, and controls. Each part triggers a short female-guide explanation. |
| **EXPERIMENT / Flight laboratory** | Change aircraft mass, rotor disk area, and efficiency; calculate the corresponding ideal and estimated hover-power requirement live. Compare principles without confusing a simulation with flight certification. |

### The chapters
01. **The Impossible Moment** — the actual demonstration and its limits.
02. **Anatomy of the Machine** — a visual tour of a conceptual mechanical layout.
03. **The Suction Secret** — fans, skirts, and pressure difference.
04. **Force, On Demand** — nitrogen, nozzles, and Newton's third law.
05. **The Mathematics of Flight** — weight, lift, thrust, and torque.
06. **The Digital Pilot** — sensors and control loops.
07. **Engineering the Impossible** — modelling, manufacturing, and staged testing.
08. **The Reality Check** — weight, energy, redundancy, infrastructure, and safety.
09. **Four Roads to the Sky** — thruster-assisted, multicopter, winged, modular.
10. **The Next Generation** — high-impact research directions and trade-offs.
11. **The Future Lab** — interactive hover-power model and design tradeoffs.
12. **Beyond Gravity** — the future of mobility, deliberately left open.

## Art direction

Dramatic graphite interiors, physically motivated highlights, minimal editorial typography, carefully paced transitions, and a believable procedural car. This project intentionally avoids downloaded car meshes, generic templates, gratuitous glowing gradients, stock-video wallpaper, and ungrounded techno-babble. Motion exists to **teach a concept**.

The source of the car is **hand-authored procedural Three.js geometry**: named, independently animated groups for the body, canopy, wheels, fans, thrusters, and cylinder. The approach takes inspiration from [img2threejs](https://github.com/img2threejs/img2threejs), an Apache-2.0 code-first reconstruction workflow. It is *not* a Tesla CAD dump or an exact reverse-engineered replica. No proprietary 3D models, paid asset packs, or copied press footage are bundled.

## Audio: two documentary voices

- **Male documentary narrator:** long, important, dramatic scientific explanations.
- **Female field guide:** short introductions, transitions, and contextual explanations when a component is clicked and enlarged.
- **Sound is opt-in.** Playback can be disabled. The site falls back to browser speech synthesis with separate voice preferences. Available voices and how natural they sound vary by OS/browser.
- For consistently cinematic natural voices, render **local audio files** from the open-source [Chatterbox](https://github.com/resemble-ai/chatterbox) or [Kokoro](https://github.com/hexgrad/kokoro) TTS engines (respect their model/voice licensing) and put them in `public/audio/` using the filename convention in `public/audio/README.md`. The player tries those recordings first and otherwise uses local/browser speech when available.
- No paid narration service, API key, login, server or user database is required.

**Transparency:** This repository does not pretend to ship licensed voice-actor performances or pre-rendered neural TTS audio it hasn't produced. Browser voice quality is platform-dependent; local neural audio is an optional enhancement.

## Tech stack

- **React 19 + TypeScript + Vite** — front-end application.
- **Three.js + React Three Fiber + Drei** — procedural vehicle, light and camera rigs, WebGL interactions.
- **GSAP + ScrollTrigger + Lenis** — documentary scroll choreography and chapter synchronization.
- **Motion** — editorial interface animations.
- **Anime.js** — instrumentation and animated explanatory diagrams.
- **@react-spring/three** — physically springing parts in the component laboratory.
- **Lucide React** — accessible control icons.
- **CSS** — hand-authored responsive visual system, gradients used sparingly.
- **Web Speech API** — free built-in, offline-when-supported narration fallback.
- No back end. No payments. No runtime cloud AI dependency. No required hosting.

## Run locally

Requires **Node.js 20.19+ or 22.12+**, npm, and a modern WebGL-capable browser.

```bash
git clone https://github.com/RAJ-SUHANDANI/Beyond_Gravity.git
cd Beyond_Gravity
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

```bash
npm run build        # static production build -> dist/
npm run preview      # preview the built experience
npm run typecheck    # TypeScript validation
```

The static build can be served from any static file server later, but **deployment is entirely optional**.

## Interface and accessibility

- Documentary progress is driven by the visible chapter.
- **Explore** opens the component examination stage; change focus, orbit, zoom or close it.
- **Experiment** opens an actual parameterized power calculation using actuator-disk momentum theory, not a fabricated numerical "AI prediction".
- Motion and narration controls are explicit, keyboard accessible, with legible labels.
- `prefers-reduced-motion` reduces decorative transitions.
- Mobile layouts simplify graphics and controls; GPU-heavy effects are intentionally limited.
- Audio is never forced at page load.
- An HTML summary and research links remain useful when WebGL is not available.

## Equations and simulation accuracy

For an aircraft with mass `m`, gravity `g`, air density `rho` and combined effective rotor disk area `A`:

```
Weight / hover thrust T = m × g
Ideal hover power P = T^(3/2) / sqrt(2 × rho × A)
Electrical-power estimate = P / assumed overall efficiency
```

This educational model omits dynamic inflow, interactions between rotors and airframe, climb, forward flight, reserves, battery degradation, control authority and countless certification constraints. It is **not** a build plan or flight-certified tool.

### Evidence and sourcing standards

A 2026 Roadster demonstration included short-duration airborne manoeuvres with cold-gas thrusters. **This did not establish normal sustained flight, commercial production, or legal road/air use.** Our models of unpublicized internal geometry, component placement, tank sections and control details are clearly marked *conceptual*.

Recommended primary/industry reporting:
- [Associated Press — Roadster demonstration and its limitations](https://apnews.com/article/7d5f19665435b7408025bfb7a2f2f0b7)
- [WIRED — Engineering of Tesla's new Roadster](https://www.wired.com/story/how-tesla-made-its-new-230-mph-car-fly)
- [The Verge — Next-generation Roadster reveal](https://www.theverge.com/transportation/1012552/tesla-roadster-next-gen-reveal-elon-musk)
- [NASA — X-57 electric flight research](https://www.nasa.gov/x-57-maxwell/)
- [FAA — Advanced Air Mobility](https://www.faa.gov/air-taxis)
- [img2threejs procedural 3D skill](https://github.com/img2threejs/img2threejs)

This educational independent project is **not affiliated with or endorsed by Tesla, SpaceX, Netflix, NASA or any company referenced.** No Tesla trademarks, corporate branding, or third-party video clips are packaged into the site.

## Architecture

```text
src/
  main.tsx           # entry and runtime
  App.tsx            # experience director + chapter UI
  Vehicle.tsx        # custom procedural 3D geometry and cameras
  Lab.tsx            # component explorer + power experiment
  data.ts            # documentary writing + evidence links
  audio.ts           # male/female narration director
  physics.ts         # educational power model
  styles.css         # design system and responsive cinematic layout
public/
  favicon.svg
  audio/README.md    # optional offline neural-narration asset instructions
```

The current experience is deliberately static: no personal information collected, no external analytics, no account, no server.

## Content and asset contributions

When contributing a real photograph, recording, or 3D reference, include its URL, author, license, and whether commercial redistribution is permitted. A single exterior photo is not sufficient evidence for hidden engineering geometry. Label estimated and illustrative engineering features explicitly. New interactive simulations must document assumptions and units.

## Free means actually free

All runtime functionality works with local source and standard open-source dependencies. The optional img2threejs agent workflow and optional neural TTS generation are **production tools, not runtime services**; neither paid generation nor subscription software is necessary for running the site.

---

**Created as an independent educational experiment. The future is not something to pretend we already know — it is something to investigate.**
