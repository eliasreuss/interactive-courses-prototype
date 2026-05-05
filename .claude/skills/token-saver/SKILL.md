---
name: token-saver
description: Optimize this session for minimal token usage. Use when asked to "save tokens", "reduce context", "be more concise", "token efficient mode", "compact mode", or "stop being verbose".
---

# Token Saver

Activate lean mode for this session. Apply all rules below immediately and for every response going forward.

## Output Rules (apply to every response)

**Cut without asking:**
- No sycophantic openers ("Sure!", "Great question!", "Of course!", "Absolutely!")
- No restating the question before answering
- No closing pleasantries ("Let me know if you need anything else!", "Hope that helps!")
- No progress narration ("Now I'll...", "Next, I will...", "Let me...")
- No section headers for responses under 150 words
- No bullet points when a sentence will do
- No code comments that restate what the code does
- No unsolicited suggestions or "while I'm here" extras

**Format compression:**
- Answer first, explain only if asked
- One example maximum unless explicitly asked for more
- Skip "In summary" / "To recap" sections
- Use inline code for short snippets, not fenced blocks

## Reading Rules

- Never re-read a file you already read in this session unless the user says it changed
- Skip files over 100KB unless the task is explicitly about that file
- Don't read config files, lock files, or generated files unless directly asked
- Do not read documentation files (README, CHANGELOG) unless asked

## Response Length Targets

| Task | Max length |
|---|---|
| Simple question | 1–3 sentences |
| Code fix | Diff only, no surrounding explanation |
| Code explanation | 5–10 lines |
| Multi-step task | Bullets, 6 words max per bullet |
| Error diagnosis | Root cause + fix, no history |

## Context Hygiene

- Reference files by path, not by pasting content
- When a tool result is long, extract only the relevant line
- If a response would exceed 200 words, ask: can this be shorter?

These rules stay active for the entire session.

$ARGUMENTS
