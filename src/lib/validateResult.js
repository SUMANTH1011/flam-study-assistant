export function validateResult(data) {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      error: "Response is not a valid object."
    };
  }

  if (
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    return {
      valid: false,
      error: "Missing or invalid title."
    };
  }

  if (!Array.isArray(data.cards)) {
    return {
      valid: false,
      error: "Cards must be an array."
    };
  }

  if (data.cards.length === 0) {
    return {
      valid: false,
      error: "No flashcards were generated."
    };
  }

  for (const card of data.cards) {
    if (!card || typeof card !== "object") {
      return {
        valid: false,
        error: "Invalid flashcard."
      };
    }

    if (
      typeof card.question !== "string" ||
      card.question.trim() === ""
    ) {
      return {
        valid: false,
        error: "Flashcard question is invalid."
      };
    }

    if (
      typeof card.answer !== "string" ||
      card.answer.trim() === ""
    ) {
      return {
        valid: false,
        error: "Flashcard answer is invalid."
      };
    }

    if (
      !["easy", "medium", "hard"].includes(
        card.difficulty
      )
    ) {
      return {
        valid: false,
        error: "Invalid flashcard difficulty."
      };
    }
  }

  return {
    valid: true,
    data
  };
}