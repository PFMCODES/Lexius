const conversationHistory = [];

export async function sendMessage(newMessage, files) {
  conversationHistory.push({ role: "user", content: newMessage });

  try {
    const response = await fetch("https://indu-backend.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret": "TmlnZ2Vy"
      },
      body: JSON.stringify({
        messages: conversationHistory,
        files: files || []
      })
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    conversationHistory.push({ role: "assistant", content: result });
    return result;

  } catch (err) {
    console.error("Streaming error:", err);
    return "<h1>Error talking to Indu. Please try again.</h1>";
  }
}
