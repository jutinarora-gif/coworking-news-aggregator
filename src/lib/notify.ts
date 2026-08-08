const RESEND_API_URL = "https://api.resend.com/emails";

export async function notifyTeam(subject: string, lines: Record<string, string | undefined | null>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const rows = Object.entries(lines)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap">${k}</td><td style="padding:4px 0">${v}</td></tr>`)
    .join("");

  try {
    await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "The Coworking Dispatch <onboarding@resend.dev>",
        to,
        subject: `[TCD] ${subject}`,
        html: `<table>${rows}</table>`,
      }),
    });
  } catch {
    // Best-effort: never let a notification failure break the user-facing action.
  }
}
