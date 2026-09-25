import { useRef, useState } from "react";

import "./App.css";

import PromptInput from "./components/PromptInput";
import FlashcardDeck from "./components/FlashcardDeck";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";

import { generateStudyMaterial } from "./lib/api";
import { validateResult } from "./lib/validateResult";

function App() {
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [lastInput, setLastInput] = useState("");

  
  const requestId = useRef(0);

  async function generate(input) {
    const id = ++requestId.current;

    setLoading(true);
    setError(null);
    setResult(null);
    setLastInput(input);

    try {
      const data =
        await generateStudyMaterial(input);


      if (id !== requestId.current) {
        return;
      }


      const validation =
        validateResult(data);

      if (!validation.valid) {
        throw new Error(
          validation.error
        );
      }

      setResult(validation.data);

    } catch (error) {
      if (id !== requestId.current) {
        return;
      }

      setError(
        error.message ||
          "Something went wrong."
      );

    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }

  function retry() {
    if (lastInput) {
      generate(lastInput);
    }
  }

  return (
    <main className="app">

      <header className="hero">

        <div className="badge">
          AI STUDY TOOL
        </div>

        <h1>
          Study smarter with AI.
        </h1>

        <p>
          Turn any topic into interactive
          flashcards.
        </p>

      </header>

      <PromptInput
        onGenerate={generate}
        disabled={loading}
      />

      {loading && (
        <LoadingState />
      )}

      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={retry}
        />
      )}

      {result &&
        !loading &&
        !error && (
          <FlashcardDeck
            key={JSON.stringify(result)}
            result={result}
          />
        )}

    </main>
  );
}

export default App;