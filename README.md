# Tom Magnusson

### Enterprise integrations · Data migration · Applied AI

Technical consultant based in **Vaggeryd, Sweden**. My professional work focuses on connecting business systems, resolving data problems and building migration tooling. My personal work spans voice agents, AI-assisted analysis, multi-model development workflows and **ChromaDrop, a complete Android app awaiting production release**.

I use AI-assisted development extensively, alongside hands-on debugging, testing and iteration. I am particularly interested in what happens around the model: context, business rules, external APIs, failure handling and human review. My ElevenLabs experience includes both **voice-agent speech integration and game-audio generation**, with Python tooling for batch audio production.

[LinkedIn](https://www.linkedin.com/in/tom-magnusson-2913b8106/) · [GitHub](https://github.com/Theseal86)

## Selected projects

| Project | What it demonstrates | Start here |
| --- | --- | --- |
| **Swedish AI voice receptionist** | OpenAI Realtime, ElevenLabs and Twilio connected to an order workflow with server-controlled pricing | [Case study and runnable order-engine sample](projects/pizzeria-voice-agent/) |
| **ChromaDrop** | End-to-end Android app development, closed testing and release preparation; ElevenLabs used for game audio. **Awaiting production release.** | [App-delivery case study](projects/chromadrop/) |
| **ElevenLabs game-audio tooling** | Python API automation for sound effects/music: batch selection, retries, downloads and Godot-format conversion | [Case study, Python transport excerpt and offline tests](projects/elevenlabs-game-audio/) |
| **AI Development Team / AI Team Coordinator** | OpenAI, Gemini and Grok working with project context, review feedback and human-controlled code changes | [Case study and provider-route sample](projects/ai-team-coordinator/) |
| **EvidenceLayer** | Blockchain-data investigation and AI-assisted reporting built around structured evidence | [Case study and runnable evidence-packaging sample](projects/evidencelayer/) |
| **AI Shield** | Text/image analysis for explaining possible scam and manipulation signals | [Source and project overview](https://github.com/Theseal86/ai-shield) |

**This is a curated public portfolio, not a mirror of every development repository.** Project pages distinguish complete applications, prototypes, case studies and source excerpts. The full development applications remain private; the samples do not launch the complete voice agent, game, dashboard or development workbench. No live credentials, customer records or private working-directory backups are included in the portfolio samples.

## Try the code samples

### JavaScript samples

With **Node.js 22**, from this repository root:

```bash
npm test
```

No dependency installation or API key is needed. The command runs eight order-engine tests and four evidence-packaging tests using synthetic fixtures. They check local deterministic behaviour, not live voice quality, model accuracy or production reliability. The Next.js provider-route excerpt is for code review and is not part of this standalone test command.

### Python audio-transport sample

With Python 3.10 or newer in an activated virtual environment:

```bash
python -m pip install -r projects/elevenlabs-game-audio/requirements.txt
python -m unittest discover -s projects/elevenlabs-game-audio/tests -v
```

Six mocked-response tests cover request/retry and download handling. They do not contact ElevenLabs or consume generation credits. See the [audio-tooling case study](projects/elevenlabs-game-audio/) for the full generator's scope.

## Professional background

**Centric Software — Technical Consultant**  
2 October 2023–present. Enterprise PLM integrations, data migration, SQL investigation, import tooling and troubleshooting across applications, APIs and databases.

**PLM Group — Technical Consultant**  
2019–2023. Consulting across CAD, CAM, PDM and PLM, including implementation, server installations, technical troubleshooting and training.

Employer and customer source code are intentionally not included in this public portfolio.

## Technologies used across my work

REST APIs · RabbitMQ · SQL Server · PostgreSQL · JSON/XML · PowerShell · Python scripting/API automation · JavaScript/TypeScript · Node.js · React/Next.js · Godot/Android · AI APIs

The individual case studies explain which technologies each project uses and distinguish implemented functionality from prototype limitations. Older experiments remain in repository history; the projects linked above are the portfolio entry points.
