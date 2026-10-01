---
workflow: general-video
flow: automation
storyboard: no
message: "KBC Adapt: a bank that rebuilds itself around what you are going through right now"
destination: hackathon upload
aspect: "16:9"
language: nl-BE
length: 180s
---

## Intent

3:00 pitch demo of KBC Adapt, following the team's 7-part Dutch voiceover script. Footage is a real
screen recording of the app (scratchpad recording, copilot answers in scenes 3–5 come from a local
OpenAI stand-in because no API key was available; validation, crisis rules and balances are the real code).

## Customizations

- Two renders from one composition, switched by the `prompter` variable:
  - `prompter: true`  → teleprompter version: the script line to speak, timed, at the bottom.
  - `prompter: false` → clean version for upload.
- Subtle punch-ins on the three key moments (new signal, Marc's crisis screen, Japan planner).

## Assets

- `assets/demo.mp4` — 180s screen recording, 1920×1080, no audio.
- Voiceover: recorded by the user per scene, placed at each scene start (see VOICEOVER.md).
