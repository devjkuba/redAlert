import { IncomingMessage } from "http";

export function detectLanguage(req?: IncomingMessage) {
  if (!req) return "cs";

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)i18next=([a-zA-Z-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  const acceptLang = req.headers["accept-language"];
  if (acceptLang) {
    return acceptLang.split(",")[0];
  }

  return "cs";
}
