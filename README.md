# FLAM AI Study Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-5FA04E?logo=node.js&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Gemini-API-8A2BE2" alt="Gemini API" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

An AI-powered study companion that transforms a free-form topic into a structured flashcard deck. Built for the FLAM Frontend Internship Assignment, this project focuses on safe AI integration, structured response validation, and a clean interactive learning experience.

This app is intentionally not a chatbot. Instead of trusting raw model output, it validates the AI response server-side and client-side before rendering anything to the UI.

---

## Overview

The FLAM AI Study Assistant helps users turn learning topics into quick, engaging flashcard reviews.

### Example input

> Explain binary search and its time complexity.

The app generates structured output containing:

- a topic title
- multiple flashcards
- questions and answers
- difficulty levels

Users can then:

- flip cards to reveal answers
- move between cards
- mark cards as known
- mark cards for review
- track the current card
- retry failed AI requests

---

## Key Features

### AI-powered generation

- free-form topic input
- Gemini API integration
- structured JSON output
- 5–10 flashcards per generation request

### Interactive flashcards

- click to reveal answers
- previous/next navigation
- easy / medium / hard difficulty labels
- known and review tracking
- progress indicator for current card

### Defensive AI handling

The app does not trust LLM output blindly. Data goes through multiple validation layers:

1. JSON parsing
2. backend validation
3. frontend validation
4. state update
5. UI rendering

It handles:

- empty responses
- malformed JSON
- invalid response shapes
- missing or invalid flashcard fields
- Gemini 503 errors
- Gemini 429 errors
- authentication failures
- model unavailability issues
- stale request responses

### Secure API architecture

The Gemini API key is stored only on the backend and is never exposed to the React application.

---

## Architecture

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
```

---

## Response Contract

The AI is instructed to return structured JSON in this format:

```json
{
  "title": "Binary Search",
  "cards": [
    {
      "question": "What is binary search?",
      "answer": "Binary search repeatedly divides a sorted collection to find an element efficiently.",
      "difficulty": "easy"
    }
  ]
}
```

Each flashcard contains:

- `question`: string
- `answer`: string
- `difficulty`: `easy | medium | hard`

The data is validated before it is allowed to reach the UI.

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Hooks

### Backend

- Node.js
- Express
- CORS
- dotenv

### AI

- Google Gemini API
- `@google/genai`

### Development

- Git
- GitHub
- VS Code

---

## Project Structure

```text
flam-study-assistant/
├── public/
├── server/
│   └── server.js
├── src/
│   ├── components/
│   │   ├── ErrorState.jsx
│   │   ├── FlashcardDeck.jsx
│   │   ├── LoadingState.jsx
│   │   └── PromptInput.jsx
│   ├── lib/
│   │   ├── api.js
│   │   └── validateResult.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── LICENSE
```

---

## Getting Started

### Prerequisites

Make sure you have:

- Node.js 18+
- npm
- Git
- a Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/SUMANTH1011/flam-study-assistant.git
cd flam-study-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

You can also copy the example template:

```bash
cp .env.example .env
```

> Do not commit your `.env` file. It is already ignored by Git.

### 4. Start the backend

In one terminal, run:

```bash
node server/server.js
```

The backend will run on:

```text
http://localhost:3001
```

Health check:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### 5. Start the frontend

In a second terminal, run:

```bash
npm run dev
```

Open the app in your browser at:

```text
http://localhost:5173
```

---

## How It Works

### 1. User enters a topic

Example:

```text
Explain CPU scheduling, FCFS, SJF, and Round Robin.
```

### 2. Frontend sends a request

The app sends:

```http
POST /api/generate
```

with a payload like:

```json
{
  "input": "Explain CPU scheduling, FCFS, SJF, and Round Robin."
}
```

The frontend does not communicate directly with Gemini.

### 3. Backend calls Gemini

The Express backend receives the request and sends a strict prompt to Gemini. The model is instructed to return structured JSON containing flashcards.

### 4. Response parsing

The backend parses the model response using `JSON.parse()`. Invalid JSON is rejected before it reaches the UI.

### 5. Validation

The backend verifies:

- the response is an object
- a title exists
- `cards` is an array
- at least one card exists
- each card has a question
- each card has an answer
- difficulty is valid

The frontend performs a second validation pass before rendering.

### 6. UI rendering

Once validated, the data is stored in React state and passed into the flashcard UI.

---

## Error Handling

A major focus of this project is handling unreliable AI output and network issues.

### Empty response

If Gemini returns no usable content, the app rejects it and shows an error state.

### Malformed JSON

If the model returns invalid JSON, the backend catches the parse error and responds cleanly instead of crashing the app.

### Invalid response shape

Valid JSON does not automatically mean valid app data. The validation layer rejects responses missing required fields or cards.

### Gemini 503

Temporary Gemini service failures are retried and surfaced as clear errors.

### Gemini 429

Rate limits are handled separately with user-friendly messaging.

### Authentication errors

Authentication and permission problems are detected and converted into a server response.

### Stale responses

Multiple requests can finish in a different order from which they started. The frontend uses a request ID pattern to ensure only the latest response updates the UI.

---

## Security

The app follows a secure AI integration model:

```text
React
  ↓
Express
  ↓
Gemini
```

rather than:

```text
React
  ↓
Gemini
```

This ensures that the secret API key is never bundled into the browser application.

---

## Why This Project Matters

This app demonstrates a practical pattern for building AI-powered features safely:

- AI output is treated as untrusted input
- parsing and validation are mandatory
- application logic uses only verified data
- secrets remain on the server

This is a strong example of defensive integration with external AI services.

---

## Design Decisions

### Why React Hooks?

React Hooks simplify state management for:

- input values
- loading state
- error state
- generated results
- flashcard navigation
- interaction tracking

### Why a backend proxy?

The assignment explicitly requires that the API key not be exposed in the browser. The Express backend provides a secure boundary between the frontend and Gemini.

### Why structured JSON?

Raw AI text is unpredictable. Structured JSON lets the app transform model output into reliable app data.

### Why validate twice?

The backend validates immediately after receiving Gemini output, and the frontend validates again before rendering. This creates multiple safety layers between external data and the UI.

---

## Limitations

This is a small internship assignment project and intentionally does not attempt to be a complete learning platform.

Current limitations include:

- no user authentication
- no persistent user accounts
- no saved study progress across refreshes
- no database
- no long-term learning history
- no spaced repetition scheduling
- occasional factual inaccuracies from AI-generated content
- dependency on Gemini availability and rate limits
- local-only development setup

---

## Future Improvements

Possible enhancements include:

- persistent study sessions
- user accounts
- spaced repetition scheduling
- quiz mode
- AI-generated explanations
- difficulty filtering
- card search and organization
- save/reload previous sessions
- streaming AI responses
- offline support
- production deployment
- automated tests
- stronger schema validation

---

## Testing Checklist

Before submission, verify these cases:

- [ ] normal topic generation
- [ ] empty input
- [ ] very long input
- [ ] loading state
- [ ] Gemini 503 response
- [ ] Gemini 429 response
- [ ] malformed JSON
- [ ] missing title
- [ ] missing cards
- [ ] empty cards array
- [ ] invalid difficulty
- [ ] flashcard flip
- [ ] previous card
- [ ] next card
- [ ] know action
- [ ] review action
- [ ] multiple requests
- [ ] mobile viewport

---

## Local Development

Run the backend:

```bash
node server/server.js
```

Run the frontend in another terminal:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/api/health
```

---

## Project Status

The core app is implemented with:

- React frontend
- Express backend
- Gemini API integration
- structured AI responses
- backend validation
- frontend validation
- interactive flashcards
- loading and error states
- retry handling
- stale-response protection
- responsive UI

---

## Author

Sumanth Reddy

---

## License

This project is licensed under the MIT License.
