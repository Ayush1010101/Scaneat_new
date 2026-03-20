export const ENV = {
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // JWT
  cookieSecret: process.env.JWT_SECRET ?? "",

  // Google OAuth 2.0
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

  // Google Gemini API (LLM)
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",

  // AWS S3 Storage
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",

  // OpenAI (for Whisper transcription)
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",

  // Google Maps
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",

  // Admin
  adminEmail: process.env.ADMIN_EMAIL ?? "",

  // Runtime
  isProduction: process.env.NODE_ENV === "production",
};
