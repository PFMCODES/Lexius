export async function sendMessage(message) {
  try {
    const response = await fetch("https://indu-backend.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret": "TmlnZ2Vy"  // Your secret header key
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (response.ok && data.response) {
      return data.response;
    } else {
      console.error("Server error:", data);
      return "<h1>There was an error sending your message to Indu. Please try again.</h1>";
    }
  } catch (err) {
    console.error("Network error:", err);
    return "<h1>Network error. Please check your connection and try again.</h1>";
  }
}