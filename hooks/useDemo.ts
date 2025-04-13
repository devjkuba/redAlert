import { useEffect, useState } from "react";

export default function useDemo() {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  useEffect(() => {
    const demoFlag = localStorage.getItem("demo");
    if (demoFlag === "true") {
      setIsDemoActive(true);
    }
  }, []);

  const toggleDemo = () => {
    const newValue = !isDemoActive;
    localStorage.setItem("demo", String(newValue));
    setIsDemoActive(newValue);
    window.location.reload(); // nebo použij router.reload() pro Next.js
  };

  return { isDemoActive, toggleDemo };
}