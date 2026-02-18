export const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain",
  "Content-Type": "application/json",
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://backlot.vercel.app";
