import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const cookieToken = Cookies.get("token") || null;
    setToken(cookieToken);
  }, []);

  return token;
}