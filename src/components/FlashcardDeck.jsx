import { useState } from "react";

function FlashcardDeck({ result }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState({});
  const [showScore, setShowScore] = useState(false);

  const total = result.cards.length;
  const card = result.cards[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;
  const completedCards = Object.keys(reviewed).length;
  const knownCards = Object.values(reviewed).filter(
    (status) => status === "known"
  ).length;
  const score = Math.round((knownCards / total) * 100);
  const allCardsMarked = completedCards === total;

  function markCard(status) {
    setReviewed((previous) => ({
      ...previous,
      [currentIndex]: status,
    }));
  }

  function nextCard() {
    if (currentIndex < total - 1) {
      setCurrentIndex((index) => index + 1);
      setFlipped(false);
    }
  }

  function previousCard() {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
      setFlipped(false);
    }
  }

  function restartReview() {
    setCurrentIndex(0);
    setFlipped(false);
    setReviewed({});
    setShowScore(false);
  }

  if (showScore) {
    return (
      <section className="state-card score-card" aria-label="Study score">
        <div className="score-circle">
          <strong>{score}%</strong>
          <span>score</span>
        </div>

        <span className="eyebrow">Deck complete</span>
        <h2>Great work!</h2>
        <p>
          You knew {knownCards} of {total} cards.
          {score < 70
            ? " Review the difficult cards once more."
            : " Keep practicing to make it stick."}
        </p>

        <div className="score-actions">
          <button type="button" onClick={restartReview}>
            Review again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="deck" aria-label="Flashcard study deck">
      <div className="deck-header">
        <div>
          <span className="eyebrow">Your study deck</span>
          <h2>{result.title}</h2>
          <p>
            Card {currentIndex + 1} of {total} · {completedCards} marked
          </p>
        </div>

        <span className={`difficulty ${card.difficulty}`}>
          {card.difficulty}
        </span>
      </div>

      <div
        className="progress-track"
        aria-label={`${Math.round(progress)}% viewed`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <button
        type="button"
        className={`flashcard ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <span className="card-icon" aria-hidden="true">
          {flipped ? "✓" : "?"}
        </span>

        <span className="card-label">
          {flipped ? "ANSWER" : "QUESTION"}
        </span>

        {flipped ? <p>{card.answer}</p> : <h3>{card.question}</h3>}

        <span className="flip-hint">
          Click to {flipped ? "see the question" : "reveal the answer"}
        </span>
      </button>

      <div className="actions" aria-label="Card confidence">
        <button
          type="button"
          className={`review ${
            reviewed[currentIndex] === "review" ? "selected" : ""
          }`}
          onClick={() => markCard("review")}
          aria-pressed={reviewed[currentIndex] === "review"}
        >
          ↻ Review
        </button>

        <button
          type="button"
          className={`known ${
            reviewed[currentIndex] === "known" ? "selected" : ""
          }`}
          onClick={() => markCard("known")}
          aria-pressed={reviewed[currentIndex] === "known"}
        >
          ✓ Know it
        </button>
      </div>

      {allCardsMarked && (
        <button
          type="button"
          className="finish-button"
          onClick={() => setShowScore(true)}
        >
          Finish and see score →
        </button>
      )}

      <div className="navigation">
        <button
          type="button"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <span>
          {currentIndex + 1} / {total}
        </span>

        <button
          type="button"
          onClick={nextCard}
          disabled={currentIndex === total - 1}
        >
          Next →
        </button>
      </div>
    </section>
  );
}

export default FlashcardDeck;