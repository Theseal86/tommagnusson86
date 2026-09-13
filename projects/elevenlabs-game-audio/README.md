# ElevenLabs game-audio generation tooling

**Python automation around sound-effect and music generation for a Godot game.**

Developed by **Tom Magnusson** · Python · ElevenLabs APIs · requests · FFmpeg · Godot

Originally built for **Stroke of Steel**, this tooling turns an organised audio catalog into selectively generated assets rather than requiring each request and download to be handled manually. It complements my ElevenLabs use in [ChromaDrop](../chromadrop/) and the [pizzeria voice agent](../pizzeria-voice-agent/).

## Full generator workflow

```text
Asset catalog -> tier/category/name selection -> dry-run plan or confirmed generation
              -> ElevenLabs request -> streamed file download -> output metadata
              -> optional WAV/OGG conversion -> audition and integrate in Godot
```

The generator implements separate requests for sound effects and instrumental music. Assets have stable names, categories, prompts, duration, tier and loop settings. Catalog entries describe the generation plan; they are not evidence that every asset has been generated or shipped.

## Engineering work

- **Selective generation:** tier, category and name filters, maximum-item limits and dry-run plans. Music is opt-in rather than part of the default sound-effects run.
- **Request handling:** connection/read timeouts and bounded retries with increasing delays for selected transient errors and rate limits.
- **Download handling:** streamed chunks are written to a `.part` file; the target is replaced after basic response/size checks.
- **Restartable batches:** existing output files are skipped unless regeneration is requested. Individual failures are recorded so processing can continue.
- **Asset preparation:** sidecar generation metadata and optional FFmpeg conversion to WAV for short effects and OGG for ambience/music.

## Included Python source

[`audio_transport.py`](audio_transport.py) contains the original generator's `post_with_retry` and `save_stream` functions, unchanged apart from being extracted with their imports and constant. The excerpt shows request timeouts, retry behaviour and file handling without publishing the entire game catalog or a live generation command.

It contains no API credentials, generated audio or customer data. It does not call any service on import and is not the complete generator.

## Offline checks

From the portfolio root, with Python 3.10 or newer in an activated virtual environment:

```bash
python -m pip install -r projects/elevenlabs-game-audio/requirements.txt
python -m unittest discover -s projects/elevenlabs-game-audio/tests -v
```

The **six regression tests added for this public excerpt** use mocked responses and temporary files. They cover streaming/timeouts, a rate-limit retry, retry exhaustion, a non-retryable error, successful file replacement and rejection of invalid downloads. No ElevenLabs key or live generation is used. These checks are separate from the portfolio's existing `npm test` command.

## Scope

This is development tooling, not a hosted audio service. A network failure after a paid request has been accepted can make a retry duplicate work or charges; the excerpt does not implement provider-side idempotency or `Retry-After` handling. Response/size checks do not validate audio quality. Generated assets still need listening, loop-point review and in-game testing.

Built with AI-assisted development and hands-on debugging. The public example makes the Python integration inspectable without claiming full-catalog completion or production-service reliability.

[Back to portfolio](../../README.md)
