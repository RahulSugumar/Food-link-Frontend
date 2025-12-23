
// Central configuration file
// Safely handles the API URL by stripping any trailing slashes to prevent double-slash errors (e.g. //api)

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
