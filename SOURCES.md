# Documentary research, media rights, and attribution

Beyond Gravity is an **independent educational documentary**, not a Tesla or SpaceX product, promotion, official engineering document, or Netflix project.

This source log is as important as the visual design. The site should never suggest that an original 3D interpretation is Tesla's proprietary CAD or that a brief 2026 stunt demonstrates certified sustained aircraft flight.

## Core primary and reported sources

| Source | URL | How it is used |
|---|---|---|
| Tesla, Roadster product page | https://www.tesla.com/roadster | Official historic Roadster photos for visual study; older displayed 1.9 s / 250+ mph / 620 mi promotional figures; context for body, interior, aero efficiency and removable roof. **Not verification of the 2026 Rocket version's performance.** |
| Tesla, official Roadster event livestream, 15 October 2026 | https://www.youtube.com/live/qt5p-_tE8d0 | Official 2026 demonstration with timestamped embedded chapters (ramp, kickflip, design, aero, acceleration). Publisher-hosted YouTube player; no video bytes in this repository. |
| Tesla via its Roadster page: 2017 unveil Vimeo | https://player.vimeo.com/video/249563752 | Official embedded archival Roadster promotional video for the opening film; site only embeds video through its publisher/player. The video predates the 2026 flying demo. |
| Tesla Roadster 2026 event replay and transcript | https://elonmuskarchive.org/video/tesla-roadster-event-2026-10-16 | 2026 reveal, ramp, kickflip, aerodynamic and acceleration segments, linked as a third-party archive. |
| Reuters, Oct 15 2026 reveal | https://www.reuters.com/business/autos-transportation/tesla-set-unveil-next-generation-roadster-sports-ev-after-years-delay-2026-10-15/ | Reported capabilities and limitations; 2028 production target subject to change. |
| AP, Oct 2026 | https://apnews.com/article/7d5f19665435b7408025bfb7a2f2f0b7 | Demonstration context, availability and certification status. |
| WIRED, Oct 2026 engineering explainer | https://www.wired.com/story/how-tesla-made-its-new-230-mph-car-fly | Fan system, compressed-gas propulsion, reported parameters. These are reported prototype values, not independent factory blueprints. |
| NASA X-57 electric aircraft | https://www.nasa.gov/x-57-maxwell/ | Distributed electric propulsion, system tradeoffs and research context. |
| FAA air taxis and AAM | https://www.faa.gov/air-taxis | Airworthiness and aviation regulation background. |

### What the source material does **not** grant

Tesla's intellectual property notice: https://www.tesla.com/legal/additional-resources

It says Tesla website photos, graphics, audiovisual media and layout are protected, and restricts copying, modification, reposting and distribution. Attribution is ethically important, but it is **not a licence** to copy Tesla's work or a promise that Tesla cannot object.

Project policy:
1. **Do not copy/download and commit Tesla imagery or footage** to `public/` without documented written permission.
2. Embed publisher-hosted clips only through their supported official players and link to source context; honor publisher embed and takedown controls.
3. No Tesla logos, badges or endorsement-suggesting artwork in the site's own branding.
4. Brand/product names may appear for factual identification, with an immediate independent-project disclaimer.
5. The procedural car uses original code and general exterior design study, not a claim of perfect dimensional reproduction; Tesla retains rights in its original designs.
6. For a public high-profile release, consider professional intellectual-property review. **No legal notice can be guaranteed away** through a disclaimer or attribution alone.
7. On any takedown/licensing request, remove or replace disputed media promptly.

## Opening film — official October 2026 footage

The entrance uses Tesla's [The Ramp | Roadster](https://www.youtube.com/watch?v=7p5LxFdc-Qg) clip of the 15 October 2026 demonstration. The 46-second YouTube player is displayed directly from Tesla's channel as a background behind independent overlays. No downloaded footage is stored in this project. Playback and availability remain subject to Tesla and YouTube controls. The 2017 Vimeo archival clip is separately available in the model-history chapter.

## 2026 video moments

An event replay and transcript references:
- **06:03** ramp demonstration
- **10:56** kickflip / mid-air manoeuvre
- **12:47** design
- **14:38** aerodynamic system
- **15:58** acceleration demonstration

We deep-link to the publisher/archive instead of pretending a 2017 promotional clip documents 2026 events.

## Evidence classifications

- **VERIFIED EVENT**: observation of a demonstration or directly sourced statement, cited with time context.
- **ENGINEERING MODEL**: a generalized, simplified physical explanation; not Tesla's undisclosed geometry, source code or validated design.
- **FUTURE CONCEPT**: proposed research direction, not a confirmed Tesla roadmap.

### Science notes

- Suction estimate: `F ≈ ΔP × A` only for assumed pressure difference and effective sealed area.
- Hover requirement: upward force on an aircraft must equal about `mg` to hover in a simplified static situation.
- Ideal rotor hover power: `P ≈ T^(3/2) / sqrt(2 ρ A)` from actuator-disk momentum theory under idealized conditions.
- Cold-gas thrust derives from momentum flux and pressure terms. Real thruster performance requires properly validated aerospace engineering.
- Modelled internal parts are intentionally labelled illustrative. Do not use the website as a build plan.

## Voice licensing

Natural neural voices may be generated **offline** using [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) (MIT) and an owned/licensed reference recording. Only distribute output you have the rights to share. Voice identity, cloning permission and dataset/model rights should be reviewed. Browser speech synthesis is an optional, quality-variable fallback; this repository does not deceptively claim to ship pre-recorded human performances.

## Browser and distribution

The opening archival film needs internet access to load from Vimeo. The website remains a static locally runnable client-side app with no login, paid subscription, analytics server or database. If the embed is unavailable, the dark cinematic UI continues, but video playback may not work. A true self-hosted montage of Tesla footage would require appropriate media permissions.
