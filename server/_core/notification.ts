import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Sends a notification to the project owner.
 * Currently logs to console. Can be extended with email (nodemailer),
 * Slack webhooks, or any other notification service.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  try {
    // Log notification (always works)
    console.log(`[Notification] To Owner:`);
    console.log(`  Title: ${title}`);
    console.log(`  Content: ${content}`);

    // TODO: Integrate with your preferred notification service:
    // - Email: Use nodemailer with SMTP credentials
    // - Slack: POST to a Slack webhook URL
    // - Discord: POST to a Discord webhook URL
    // - Telegram: Use Telegram Bot API
    //
    // Example (Slack):
    // const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    // if (webhookUrl) {
    //   await fetch(webhookUrl, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ text: `*${title}*\n${content}` }),
    //   });
    // }

    return true;
  } catch (error) {
    console.warn("[Notification] Error sending notification:", error);
    return false;
  }
}
