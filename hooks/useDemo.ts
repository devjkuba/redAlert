import { idbGet, idbSet } from "@/lib/indexeddb";
import { useEffect, useState } from "react";

export default function useDemo() {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  useEffect(() => {
    const loadDemoFlag = async () => {
      const demoFlag = await idbGet("demo");
      if (demoFlag === "true") {
        setIsDemoActive(true);
      }
    };

    loadDemoFlag();
  }, []);

  const toggleDemo = async () => {
    const newValue = !isDemoActive;
    await idbSet("demo", String(newValue));
    setIsDemoActive(newValue);
  };

  return { isDemoActive, toggleDemo };
}