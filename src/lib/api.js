export async function generateStudyMaterial(input) {
  const response = await fetch("/api/generate", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      input
    })
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Failed to generate study material."
    );
  }

  return data;
}