import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const PORT = 3001;
const MODEL = "gemini-3.5-flash-lite";

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/*
|--------------------------------------------------------------------------
| Flashcard Schema
|--------------------------------------------------------------------------
*/

const flashcardSchema = {
  type: "object",

  properties: {
    title: {
      type: "string"
    },

    cards: {
      type: "array",

      items: {
        type: "object",

        properties: {
          question: {
            type: "string"
          },

          answer: {
            type: "string"
          },

          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"]
          }
        },

        required: [
          "question",
          "answer",
          "difficulty"
        ]
      }
    }
  },

  required: [
    "title",
    "cards"
  ]
};

/*
|--------------------------------------------------------------------------
| Backend Validation
|--------------------------------------------------------------------------
*/

function validateFlashcards(data) {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      error: "AI response is not an object."
    };
  }

  if (
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    return {
      valid: false,
      error: "AI response has an invalid title."
    };
  }

  if (!Array.isArray(data.cards)) {
    return {
      valid: false,
      error: "AI response does not contain a cards array."
    };
  }

  if (data.cards.length === 0) {
    return {
      valid: false,
      error: "AI returned no flashcards."
    };
  }

  if (data.cards.length > 10) {
    return {
      valid: false,
      error: "AI returned too many flashcards."
    };
  }

  for (let i = 0; i < data.cards.length; i++) {
    const card = data.cards[i];

    if (!card || typeof card !== "object") {
      return {
        valid: false,
        error: `Card ${i + 1} is invalid.`
      };
    }

    if (
      typeof card.question !== "string" ||
      card.question.trim() === ""
    ) {
      return {
        valid: false,
        error: `Card ${i + 1} has an invalid question.`
      };
    }

    if (
      typeof card.answer !== "string" ||
      card.answer.trim() === ""
    ) {
      return {
        valid: false,
        error: `Card ${i + 1} has an invalid answer.`
      };
    }

    if (
      !["easy", "medium", "hard"].includes(
        card.difficulty
      )
    ) {
      return {
        valid: false,
        error: `Card ${i + 1} has an invalid difficulty.`
      };
    }
  }

  return {
    valid: true
  };
}

/*
|--------------------------------------------------------------------------
| Generate Content With Retry
|--------------------------------------------------------------------------
*/

async function generateWithRetry(prompt, maxRetries = 2) {
  let lastError;

  for (
    let attempt = 0;
    attempt <= maxRetries;
    attempt++
  ) {
    try {
      console.log(
        `Gemini request attempt ${attempt + 1}`
      );

      const response = await ai.models.generateContent({
        model: MODEL,

        contents: prompt,

        config: {
          temperature: 0.2,

          responseMimeType: "application/json",

          responseSchema: flashcardSchema
        }
      });

      return response;

    } catch (error) {
      lastError = error;

      console.error(
        `Gemini attempt ${attempt + 1} failed. Status:`,
        error.status
      );

      /*
       * 503 = service temporarily unavailable
       * 429 = rate limit / quota
       *
       * These errors are worth retrying.
       */

      if (
        error.status !== 503 &&
        error.status !== 429
      ) {
        throw error;
      }

      /*
       * Don't wait after the final attempt.
       */

      if (attempt < maxRetries) {
        const delay =
          1000 * Math.pow(2, attempt);

        console.log(
          `Retrying in ${delay}ms...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }
  }

  throw lastError;
}

/*
|--------------------------------------------------------------------------
| Generate Flashcards
|--------------------------------------------------------------------------
*/

app.post("/api/generate", async (req, res) => {
  try {
    const { input } = req.body;

    /*
     * Validate user input
     */

    if (
      typeof input !== "string" ||
      input.trim() === ""
    ) {
      return res.status(400).json({
        error: "Please provide a study topic."
      });
    }

    /*
     * Prevent extremely large requests.
     */

    if (input.length > 5000) {
      return res.status(400).json({
        error:
          "Study topic is too long. Please keep it under 5000 characters."
      });
    }

    /*
     * Strict AI instruction.
     */

    const prompt = `
You are an AI study material generator.

The user will provide a study topic.

Generate useful educational flashcards.

IMPORTANT RULES:

1. Return ONLY JSON.
2. Do not return markdown.
3. Do not use code fences.
4. Do not add explanations outside the JSON.
5. Generate between 5 and 10 flashcards.
6. Every flashcard must contain:
   - question
   - answer
   - difficulty
7. Difficulty must be exactly:
   - easy
   - medium
   - hard
8. Questions should test understanding.
9. Answers should be concise and accurate.
10. Do not create empty fields.

The required JSON structure is:

{
  "title": "string",
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "easy"
    }
  ]
}

Study topic:

${input.trim()}
`;

    /*
     * Call Gemini.
     */

    const response =
      await generateWithRetry(prompt);

    /*
     * Get generated text.
     */

    const rawText = response.text;

    if (
      !rawText ||
      rawText.trim() === ""
    ) {
      return res.status(502).json({
        error:
          "The AI returned an empty response."
      });
    }

    console.log(
      "Gemini response received successfully."
    );

    /*
     * Parse JSON.
     */

    let data;

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error(
        "Failed to parse Gemini JSON:"
      );

      console.error(rawText);

      return res.status(502).json({
        error:
          "The AI returned malformed JSON."
      });
    }

    /*
     * Validate the parsed object.
     */

    const validation =
      validateFlashcards(data);

    if (!validation.valid) {
      console.error(
        "AI response failed validation:",
        validation.error
      );

      return res.status(502).json({
        error:
          "The AI returned data in an unexpected format."
      });
    }

    /*
     * Everything is valid.
     */

    return res.status(200).json(data);

  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "GEMINI REQUEST FAILED"
    );

    console.error(
      "================================="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Status:",
      error.status
    );

    /*
     * Temporary Gemini availability issue.
     */

    if (error.status === 503) {
      return res.status(503).json({
        error:
          "The AI service is temporarily busy. Please try again in a moment."
      });
    }

    /*
     * Rate limit / quota.
     */

    if (error.status === 429) {
      return res.status(429).json({
        error:
          "The AI request limit was reached. Please try again shortly."
      });
    }

    /*
     * Authentication problem.
     */

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      return res.status(error.status).json({
        error:
          "Gemini API authentication failed. Check your API key."
      });
    }

    /*
     * Model not found.
     */

    if (error.status === 404) {
      return res.status(404).json({
        error:
          `Gemini model "${MODEL}" is unavailable.`
      });
    }

    /*
     * Generic server error.
     */

    return res.status(500).json({
      error:
        "Failed to generate study material."
    });
  }
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    model: MODEL
  });
});

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    message: "FLAM Study Assistant backend is running.",
    health: "/api/health",
    generate: "POST /api/generate"
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );

  console.log(
    `Using Gemini model: ${MODEL}`
  );
});
