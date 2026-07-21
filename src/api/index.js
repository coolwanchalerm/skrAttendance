const GAS_URL = import.meta.env.VITE_GAS_URL || "";

export const apiCall = async (action, data = null) => {
  if (!GAS_URL) {
    throw new Error("API URL is not defined. Please set VITE_GAS_URL in .env file.");
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, data }),
      // Important for Google Apps Script to avoid CORS preflight issues
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      redirect: "follow",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};
