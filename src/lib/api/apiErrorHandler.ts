import axios, { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: {
    field?: string;
    messages?: string[];
  }[];
}

export function handleApiError(error: unknown): string | string[] {
  if (axios.isAxiosError(error)) {
    const res = error.response as AxiosError<ApiErrorResponse>["response"];

    if (!res) return "Network error. Please check your connection.";

    if (res.status === 400 && Array.isArray(res.data?.errors)) {
      return res.data.errors.flatMap((e) => e.messages ?? []);
    }

    if (res.data?.message) return res.data.message;

    return `Server error (${res.status})`;
  }

  return "Unexpected error occurred.";
}
