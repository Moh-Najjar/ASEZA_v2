import axios from "axios";

export const apiHelper = {
  post: async <T, R>(url: string, data: T): Promise<R> => {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;

      const response = await axios.post<R>(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "ChatAI-React-App/1.0",
        },
        timeout: 30000, // 30 seconds timeout for AI responses
        validateStatus: (status: number) => status >= 200 && status < 300,
        responseType: "json",
      });

      return response.data;
    } catch (error) {
      // Handle axios errors properly
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          throw new Error("Authentication failed. Please check your API key.");
        } else if (status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (status && status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else if (error.code === "ECONNABORTED") {
          throw new Error("Request timeout. Please try again.");
        } else {
          throw new Error(
            `API request failed: ${error.response?.data?.error?.message || error.message}`,
          );
        }
      }
      throw new Error(
        `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  get: async <R>(url: string): Promise<R> => {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;

      const response = await axios.get<R>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "ChatAI-React-App/1.0",
        },
        timeout: 30000, // 30 seconds timeout for AI responses
        validateStatus: (status: number) => status >= 200 && status < 300,
        responseType: "json",
      });

      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },
};

const normalizeAxiosError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    return new Error(error.response?.data?.error?.message || error.message);
  }
  return new Error(error instanceof Error ? error.message : "Unknown error");
};