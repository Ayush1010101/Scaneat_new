import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Google OAuth token exchange
async function exchangeGoogleCode(code: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
    refresh_token?: string;
  };
}

// Get Google user info using access token
async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Google user info request failed: ${response.status}`);
  }

  return (await response.json()) as {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

export function registerOAuthRoutes(app: Express) {
  // Google OAuth login redirect
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/callback`;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    res.redirect(302, url.toString());
  });

  // OAuth callback (handles Google response)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      console.error("[OAuth] Error from provider:", error);
      res.redirect(302, "/?error=oauth_denied");
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/callback`;

      // Exchange code for tokens
      const tokens = await exchangeGoogleCode(code, redirectUri);

      // Get user info
      const userInfo = await getGoogleUserInfo(tokens.access_token);

      if (!userInfo.id) {
        res.status(400).json({ error: "Failed to get user info from Google" });
        return;
      }

      // Use Google ID as openId
      const openId = `google_${userInfo.id}`;

      // Upsert user in database
      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error instanceof Error ? error.message : error);
      console.error("[OAuth] Full error:", error);
      res.redirect(302, "/?error=oauth_failed");
    }
  });
}
