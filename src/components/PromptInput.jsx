import { useState } from "react";

function PromptInput({
  onGenerate,
  disabled
}) {
  const [input, setInput] = useState("");
  const characterLimit = 500;
  const remaining = characterLimit - input.length;

  function handleSubmit(e) {
    e.preventDefault();

    const topic = input.trim();

    if (topic && !disabled) {
      onGenerate(topic);
    }
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <div className="input-heading">
        <label htmlFor="topic">What do you want to study?</label>
        <span>{remaining} characters left</span>
      </div>

      <textarea
        id="topic"
        value={input}
        maxLength={characterLimit}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Try “JavaScript promises” or “World War II causes”..."
        disabled={disabled}
        rows={5}
        required
      />

      <button
        type="submit"
        disabled={disabled || !input.trim()}
      >
        {disabled ? "Creating your deck..." : "Generate flashcards →"}
      </button>
    </form>
  );
}

export default PromptInput;