import { idbGet } from "@/lib/indexeddb";
import { useEffect, useState } from "react";

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadToken = async () => {
      const storedToken = await idbGet("token");
      setToken(storedToken);
    };

    loadToken();
  }, []);

  return token;
};

export default useAuthToken;