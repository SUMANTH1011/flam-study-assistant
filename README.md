# FLAM AI Study Assistant

An AI-powered interactive study tool built for the FLAM Frontend Internship Assignment.

The application takes a free-form study topic, sends it to an LLM through a secure backend, converts the response into validated structured JSON, and renders the result as an interactive flashcard experience.

This is intentionally **not a chatbot**. The AI generates structured study data that is parsed, validated, and rendered using React components and state.

---

## Project Overview

The AI Study Assistant helps users turn any study topic into a set of interactive flashcards.

### Example

A user can enter:

> Explain binary search and its time complexity.

The AI generates structured data containing:

- A topic title
- Multiple flashcards
- Questions
- Answers
- Difficulty levels

The React application then allows the user to:

- Flip between questions and answers
- Navigate between flashcards
- Mark cards as known
- Mark cards for review
- Track the current card
- Retry failed AI requests

---

## Features

### AI-powered generation

- Free-form text input for study topics
- Gemini API integration
- Structured JSON generation
- 5–10 flashcards per request

### Interactive flashcards

- Click to reveal answers
- Previous / Next navigation
- Easy / Medium / Hard difficulty indicators
- "Know" and "Review" actions
- Current card progress

### Defensive AI handling

The application does not directly trust LLM output.

Responses go through:

1. JSON parsing
2. Backend validation
3. Frontend validation
4. React state
5. UI rendering

The application handles:

- Empty responses
- Malformed JSON
- Invalid response structures
- Invalid flashcard fields
- Gemini 503 errors
- Gemini 429 errors
- Authentication errors
- Model availability errors
- Stale frontend requests

### Secure API architecture

The Gemini API key is stored on the backend and is never exposed to the React application.

---

# Architecture

```text
                        User
                          │
                          ▼
                ┌──────────────────┐
                │   React Frontend │
                │                  │
                │ PromptInput      │
                │ FlashcardDeck    │
                │ LoadingState     │
                │ ErrorState       │
                └────────┬─────────┘
                         │
                         │ POST /api/generate
                         ▼
                ┌──────────────────┐
                │  Vite Dev Proxy  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Express Backend  │
                │                  │
                │ API key stored   │
                │ securely in .env │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    Gemini API    │
                │                  │
                │ Structured JSON  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Backend Parsing  │
                │ + Validation     │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Frontend         │
                │ Validation       │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Interactive      │
                │ Flashcard UI     │
                └──────────────────┘