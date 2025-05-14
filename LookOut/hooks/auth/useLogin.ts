import { useState } from "react";
import { loginApi } from "@/lib/auth";

/**
 * Hook to manage logging in a user.
 *
 * @returns {{
*   login: (identifier: string, password: string) => Promise<void>,
*   loading: boolean,
*   error: string | null
* }}
*/
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginApi(identifier, password);
    } catch (e: any) {
      setError(e.message ?? "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
