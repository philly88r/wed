const testAiConnection = async () => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Wedding Seating Planner"
      },
      body: JSON.stringify({
        model: "openai/o3-mini-high",
        messages: [
          {
            role: "user",
            content: "Please respond with just the word: hello"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response not OK:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", data.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
};

testAiConnection();
