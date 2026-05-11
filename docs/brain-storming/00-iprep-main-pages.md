---
name: iPrep main pages
description: Brainstorming map of the main pages planned for the iPrep application.
---

# iPrep Main Pages

This document maps the core pages planned for the iPrep application. It is a product brainstorming note, not a final implementation specification.

The goal is to define what each page should help the user accomplish, what data it should surface, and how the pages connect across the interview practice journey.

## Main Pages

### Practice

- Dashboard
- New Interview
- History

### Tools

- AI Coach
- Notes & Files
- Communication
- Settings

## Dashboard

The dashboard is the home page of the application. It should give the user a quick overview of their preparation progress and make the next useful action obvious.

Expected dashboard content:

- Quick stats
- User streaks
- Practice tips
- Suggested next topic to practice
- Start new interview button
- View history button
- Recent sessions
- Anonymous leaderboard and score comparison

## New Interview

The New Interview page lets the user create and start an interview using ready-made templates or an AI-guided setup flow. The first version should focus on the ready-made template flow.

For the detailed onboarding and first-interview flow, see [`01-iprep-onboarding-and-first-interview.md`](./01-iprep-onboarding-and-first-interview.md).

Core behavior:

- Create an interview from a predefined template
- Start the interview in chat or voice mode
- Quit or cancel a session when needed
- Generate analysis after completion
- Automatically back up and save session details inside the `.iprep` folder

## History

The History page shows past interview sessions and gives the user access to recordings, transcripts, analysis, scores, and interview metadata.

Expected actions:

- Open analysis for a completed session
- View transcript with AI/user speaker labels and timestamps
- View or play the session recording
- Search across past sessions
- Export transcript and recording when available

Open product decision:

- Decide whether recordings should open on a dedicated page, in a modal, or inside the history table detail view.

## AI Coach

AI Coach is the chat area where the user can discuss preparation, past performance, notes, roadmaps, and future interview plans with the AI.

The AI Coach should support:

- Questions about past performance
- Predefined prompts for common coaching tasks
- Discussion-based interview planning
- Scheduling or starting a new interview from chat
- Adding notes, files, and previous discussions as context
- Generating syllabus plans, preparation roadmaps, and focused practice tasks

## Notes & Files

The Notes & Files page is where the user uploads and manages preparation context such as resumes, notes, PDFs, and reference material.

Uploaded files should be converted into Markdown where possible so the AI receives clean, structured context.

Expected capabilities:

- Upload resume, notes, PDFs, and other preparation files
- Convert supported documents into Markdown
- Edit, view, update, and delete Markdown files
- Organize files in a folder structure
- View Markdown through the iPrep UI or the `idocs-md-viwer.vercel.app` viewer
- Ask AI to improve notes, identify missing topics, and prepare interview context
- Use selected notes as context for future interviews

Future capability:

- Use ChromaDB or another vector database for semantic search and retrieval over user notes.

## Communication

The Communication page helps the user improve clarity, fluency, grammar, vocabulary, and interview speaking habits.

It should summarize communication patterns across sessions and translate them into practical improvement tasks.

Expected content:

- Grammar mistakes
- Communication mistakes
- Frequently used words
- Filler words and repeated phrases
- Better alternative words and sentences
- Weekly focus area for improvement
- Quick communication stats
- Improvement tips and priority areas

## Individual Session Analysis

Individual session analysis is the detailed report for one completed interview. It should combine transcript, recording, scoring, feedback, and coaching suggestions in one place.

Expected analysis areas:

- Time-based analysis across the session
- Voice-based feedback
- Confidence, pacing, tone, and voice tuning feedback
- Vocabulary used during the interview
- Incorrect or weak word choices
- Suggested alternative sentences
- Most frequently used words and filler words
- Tips for improvement
- Feedback on answer clarity and structure
- Concept knowledge gaps for each question
- Suggested future questions related to the same topics
- Guidance on answer depth, including when to expand and when to stop

## Settings

The Settings page holds app configuration, user preferences, system preferences, sensitive keys, and active AI provider information.

Expected settings:

- User profile preferences
- System preferences
- Active AI provider
- API keys and sensitive credentials
- Default prompts
- Skills or custom practice preferences
- Interview package configuration
- Future paid/pro interview package settings
