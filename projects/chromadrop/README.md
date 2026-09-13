# ChromaDrop — Android puzzle app

**A complete mobile game taken from concept to a production-ready Android app, awaiting production release.**

Developed by **Tom Magnusson** · Godot · Android · ElevenLabs-generated game audio

**Release status — 13 September 2026:** development and closed testing have progressed to production release preparation. The app is awaiting production release and is not yet publicly launched. This status reflects my current development/release position, not a claim that Google Play has already approved or published it.

## What I built

ChromaDrop is a portrait colour-sort puzzle with a gravity-flip mechanic. The project covers more than a playable mechanic: gameplay, level progression, saved state, onboarding, assistance tools, audio, advertising integration, Android packaging and release preparation.

Classic and Zen provide different play conditions and separate progression. The game includes hints, assisted solving, undo/restart and fixed campaigns followed by endless play. My development work has included testing and debugging the complete application rather than stopping at a concept demo.

## End-to-end delivery

- Developed and iterated on the gameplay, interface and progression systems.
- Integrated audio assets into the game and checked the resulting playback.
- Worked through Android builds, closed testing and release-candidate preparation.
- Added application-level concerns such as save handling, tutorials and advertising configuration.

The engineering value of this project is bringing many interacting parts together in a usable mobile application and carrying it through a release workflow.

## ElevenLabs during development

I used **ElevenLabs to generate game audio during development**, then integrated the sounds into ChromaDrop. This is an asset-production use of ElevenLabs: the game plays the resulting audio files. It is separate from the real-time speech integration in my [pizzeria voice agent](../pizzeria-voice-agent/).

My [Python game-audio generation tooling](../elevenlabs-game-audio/) is another related project, originally built for Stroke of Steel. This case study does not claim that ChromaDrop used that particular script or generates audio through a live API while a player is playing.

## AI-assisted development

I use AI-assisted implementation alongside hands-on testing, debugging and iteration. My role spans the product direction, integration of the components, diagnosing failures and preparing the app for release.

## Public scope

This page is a case study, not the complete game source or an app-store download. Signing material, private configuration and game-development repositories remain private. Public source samples for other projects are available from the portfolio; a ChromaDrop store link can be added after release.

[Back to portfolio](../../README.md)
