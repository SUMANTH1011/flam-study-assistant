function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card error">
      <h2>Something went wrong</h2>

      <p>{message}</p>

      <button onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

export default ErrorState;