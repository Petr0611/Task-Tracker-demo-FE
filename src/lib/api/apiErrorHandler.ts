import axios from "axios";

export function handleApiError(error: any): string | string[] {
  if (axios.isAxiosError(error)) {
    const res = error.response;
    if (!res) return "Network error. Please check your connection.";

    if (res.status === 400 && Array.isArray(res.data?.errors)) {
      return res.data.errors.flatMap((e: any) => e.messages || []);
    }

    if (res.data?.message) return res.data.message;

    return `Server error (${res.status})`;
  }

  return "Unexpected error occurred.";
}
