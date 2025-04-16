import { loadEnv } from "dotenvalid";

export const environment = loadEnv({
  NODE_ENV: { type: "string", default: "development" },
  PORT: { type: "number", default: 3000 },
  MONGO_URI: { type: "string" },
  SESSION_SECRET: { type: "string" },
  ADMIN_FULLNAME: { type: "string" },
  ADMIN_USERNAME: { type: "string" },
  ADMIN_PASSWORD: { type: "string" },
  BASE_URL: { type: "string" },
});
