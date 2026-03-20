// Vercel Serverless Function — emails you on every registration via Resend
// Set these in Vercel project settings → Environment Variables:
//   RESEND_API_KEY  — from resend.com (free tier: 3k emails/mo)
//   NOTIFY_EMAIL    — the address YOU want to receive notifications at

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body ?? {};

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
      to: 'marcom@thetacapital.com',
      subject: `New registration: ${email}`,
      text: `Someone just signed up to be notified about Legends 4 Legends 2026.\n\nEmail: ${email}\nTime: ${new Date().toUTCString()}`,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }

  return res.status(200).json({ ok: true });
}
