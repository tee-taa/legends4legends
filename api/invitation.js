// Vercel Serverless Function — emails you on every invitation acceptance via Resend
// Reuses the same env vars as other API endpoints:
//   RESEND_API_KEY  — from resend.com
//   NOTIFY_EMAIL    — the address YOU want to receive notifications at

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, nextDay } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const { RESEND_API_KEY, NOTIFY_EMAIL } = process.env;

  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.error('Missing env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Legends 4 Legends <onboarding@resend.dev>',
      to: NOTIFY_EMAIL,
      subject: `New invitation acceptance: ${name}`,
      text: [
        `New invitation acceptance for Legends4Legends 2026.`,
        ``,
        `Name:      ${name}`,
        `Email:     ${email}`,
        `Next day:  ${nextDay ? 'Yes' : 'No'}`,
        ``,
        `Time: ${new Date().toUTCString()}`,
      ].join('\n'),
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }

  return res.status(200).json({ ok: true });
}
