exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFICATION_TO || !process.env.FROM_EMAIL) {
      return { statusCode: 500, body: 'Email env vars missing' };
    }
    const data = JSON.parse(event.body || '{}');
    const subject = `Partner Interest: ${data['business-name'] || 'Clinic'}`;
    const html = `
      <h2>New Partner Interest</h2>
      <p><b>Business:</b> ${data['business-name'] || ''}</p>
      <p><b>Contact:</b> ${data['contact-name'] || ''}</p>
      <p><b>Email:</b> ${data.email || ''}</p>
      <p><b>Phone:</b> ${data.phone || ''}</p>
      <p><b>Message:</b> ${data.message || ''}</p>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL,
        to: [process.env.ORDER_NOTIFICATION_TO],
        subject,
        html
      })
    });

    const text = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, body: text };
    return { statusCode: 200, body: 'Sent' };
  } catch (e) {
    return { statusCode: 500, body: `Email error: ${e.message}` };
  }
};
