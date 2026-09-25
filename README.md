# FLAM AI Study Assistant

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/) [![React](https://img.shields.io/badge/React-18%2B-blue)](https://react.dev/) [![Gemini API](https://img.shields.io/badge/Google%20Gemini-API-orange)](https://ai.google.dev/)

An AI-powered interactive study tool that transforms free-form study topics into structured flashcard decks for the FLAM Frontend Internship Assignment.

This is intentionally not a chatbot. The app demonstrates secure AI integration by sending requests to a backend, validating the model response, and rendering only trusted structured data as interactive flashcards.

---

## Project Overview

The AI Study Assistant helps users turn a study topic into an interactive deck of flashcards.

### Example

A user can enter:

> Explain binary search and its time complexity.

The AI generates structured data containing:

- A topic title
- Multiple flashcards
- Questions
- Answers
- Difficulty levels

The React app then allows the user to:

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

### Structured Data Contract

The AI is instructed to return data in the following shape:

```json
{
  "title": "Binary Search",
  "cards": [
    {
      "question": "What is binary search?",
      "answer": "Binary search finds an element in a sorted collection by repeatedly dividing the search range.",
      "difficulty": "easy"
    }
  ]
}
```

Each flashcard must contain:

- `question` → string
- `answer` → string
- `difficulty` → `easy | medium | hard`

The response is validated before it is allowed to reach the UI.

### Tech Stack

#### Frontend
- React
- Vite
- React Hooks
- JavaScript
- CSS

#### Backend
- Node.js
- Express
- CORS
- dotenv

#### AI
- Google Gemini API
- `@google/genai`

#### Development
- Git
- GitHub
- VS Code

### Project Structure

```text
flam-study-assistant/
│
├── public/
│
├── server/
│   └── server.js
│
├── src/
│   ├── components/
│   │   ├── ErrorState.jsx
│   │   ├── FlashcardDeck.jsx
│   │   ├── LoadingState.jsx
│   │   └── PromptInput.jsx
│   │
│   ├── lib/
│   │   ├── api.js
│   │   └── validateResult.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

You will also need a Gemini API key.

### 1. Clone the repository

```bash
git clone https://github.com/SUMANTH1011/flam-study-assistant.git
```

Move into the project:

```bash
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

Do not commit this file.

The repository already includes `.gitignore` protection for `.env`.

A safe template is provided in `.env.example`.

### 4. Start the backend

Open a terminal in the project root and run:

```bash
node server/server.js
```

The backend will run on:

`http://localhost:3001`

You can verify it by opening:

`http://localhost:3001/api/health`

Expected response:

```json
{
  "status": "ok"
}
```

### 5. Start the frontend

Open a second terminal:

```bash
npm run dev
```

The Vite development server will normally run at:

`http://localhost:5173`

Open that URL in your browser.

---

## How It Works

### 1. User enters a topic

The user enters free-form text through the study prompt.

Example:

```text
Explain CPU scheduling, FCFS, SJF and Round Robin.
```

### 2. React sends the request

The frontend sends:

```http
POST /api/generate
```

with:

```json
{
  "input": "Explain CPU scheduling, FCFS, SJF and Round Robin."
}
```

The frontend does not communicate directly with Gemini.

### 3. Backend calls Gemini

The Express backend receives the request and sends a strict prompt to Gemini.

The model is instructed to return structured JSON containing flashcards.

The Gemini API key remains on the server.

### 4. Structured response is parsed

The backend receives the model response and parses it using:

```javascript
JSON.parse()
```

Invalid JSON is rejected instead of being rendered.

### 5. Response validation

The backend verifies:

- The response is an object
- A title exists
- `cards` is an array
- At least one card exists
- Each card contains a question
- Each card contains an answer
- Difficulty is valid

The frontend performs another validation pass before rendering.

### 6. React renders the result

Once the data is validated, it is stored in React state and passed to `FlashcardDeck`.

The component manages:

- Current card
- Flip state
- Review state
- Known state
- Navigation

---

## Error Handling

A major focus of the implementation is handling unreliable AI output and network failures.

### Empty response

If Gemini returns no content:

- The AI returned an empty response.
- The response is rejected.

### Malformed JSON

If the model returns invalid JSON:

```json
{
  "title": "Binary Search"
  ...
}
```

the backend catches the parsing error and returns an error response rather than allowing the application to crash.

### Invalid response shape

Valid JSON does not necessarily mean valid application data.

For example:

```json
{
  "title": "Binary Search"
}
```

This is valid JSON but does not contain flashcards.

The validation layer rejects this response.

### Gemini 503

A temporary Gemini service failure is handled with retries.

The backend retries temporary 503 responses before returning a user-friendly error.

### Gemini 429

Rate-limit responses are handled separately and returned as a clear error state.

### API authentication errors

Authentication and permission errors are detected and converted into an appropriate server response.

### Loading state

While an AI request is running, the interface displays a loading state instead of leaving the user wondering whether the application is working.

### Stale responses

Multiple requests can finish in a different order from when they started.

The frontend uses a request ID with `useRef`:

```javascript
const requestId = useRef(0);
```

Each request receives an ID.

Only the latest request is allowed to update the UI.

This prevents a slower older request from overwriting a newer result.

---

## API Security

The Gemini API key is stored in `.env` and accessed by the Node.js backend.

The frontend never contains `GEMINI_API_KEY` and never calls Gemini directly.

The request flow is:

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

This prevents the secret API key from being bundled into the browser application.

---

## AI Usage

AI development tools were used during implementation for:

- Exploring implementation approaches
- Debugging API integration issues
- Reviewing React component structure
- Improving error handling
- Refining UI and CSS
- Generating initial implementation suggestions

The final project structure, integration, validation logic, UI behavior, and implementation were reviewed and tested as part of the project development.

The AI-generated code was not treated as trusted output. The project specifically demonstrates the same principle in its application architecture: AI output is parsed and validated before it is used.

---

## Design Decisions

### Why React Hooks?

React Hooks provide a simple way to manage:

- Input state
- Loading state
- Error state
- Generated results
- Flashcard navigation
- Card interaction

The project primarily uses `useState()` and `useRef()`.

### Why a backend proxy?

The assignment explicitly requires that the API key is not exposed in the browser.

The Express backend provides a small API boundary between the frontend and Gemini.

### Why structured JSON?

Raw LLM text is unpredictable and difficult to turn into reliable UI.

Structured JSON allows the application to represent AI output as application data:

```text
AI output
   ↓
JSON
   ↓
Validation
   ↓
React state
   ↓
UI
```

This makes the AI output usable by normal frontend components.

### Why validate twice?

The backend validates the response immediately after receiving it from Gemini.

The frontend validates the data again before rendering.

This creates an additional safety boundary between external data and the UI.

---

## Limitations

This is a small internship assignment project and intentionally does not attempt to be a complete learning platform.

Current limitations include:

- No user authentication
- No persistent user accounts
- Flashcard progress is not saved after refreshing the page
- No database
- No long-term study history
- No spaced-repetition scheduling
- AI-generated content may occasionally contain factual inaccuracies
- Gemini availability and rate limits can affect generation
- The application currently focuses on flashcards rather than multiple study modes
- Development currently requires running both frontend and backend processes locally

---

## Future Improvements

Possible future improvements include:

- Persistent study sessions
- User accounts
- Spaced-repetition scheduling
- Quiz mode
- AI-generated explanations
- Difficulty filtering
- Search through generated cards
- Save and reload previous sessions
- Streaming AI responses
- Offline support
- Production deployment
- Automated tests
- More robust schema validation

---

## Testing Checklist

Before submission, the following scenarios should be tested:

- [ ] Normal topic generation
- [ ] Empty input
- [ ] Very long input
- [ ] Loading state
- [ ] Gemini 503 response
- [ ] Gemini 429 response
- [ ] Malformed JSON
- [ ] Missing title
- [ ] Missing cards
- [ ] Empty cards array
- [ ] Invalid difficulty
- [ ] Flashcard flip
- [ ] Previous card
- [ ] Next card
- [ ] Know action
- [ ] Review action
- [ ] Multiple requests
- [ ] Mobile viewport

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

`http://localhost:5173`

Backend:

`http://localhost:3001`

Health check:

`http://localhost:3001/api/health`

---

## Project Status

The core application is implemented with:

- React frontend
- Express backend
- Gemini API integration
- Structured AI responses
- Backend validation
- Frontend validation
- Interactive flashcards
- Loading and error states
- Retry handling
- Stale-response protection
- Responsive UI

---

## Author

Sumanth Reddy
