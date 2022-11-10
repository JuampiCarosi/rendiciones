import { google } from "googleapis";
import { env } from "../env/server.mjs";

export const authenticateGoogle = () => {
  if (typeof window !== "undefined") {
    throw new Error("NO SECRETS ON CLIENT!");
  }

  const { privateKey } = JSON.parse(env.GOOGLE_PRIVATE_KEY || "{ privateKey: null }");
  const auth = new google.auth.GoogleAuth({
    projectId: env.GOOGLE_PROJECTID,
    scopes: "https://www.googleapis.com/auth/drive",
    credentials: {
      private_key: privateKey,
      client_email: env.GOOGLE_CLIENT_EMAIL,
    },
  });

  console.log(auth);

  return auth;
};
