export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { firstName, lastName, email, company, industry, message } = data;

  if (!firstName || !email) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emailBody = `New consultation request from strailight.ai

Name: ${firstName} ${lastName || ''}
Email: ${email}
Company: ${company || '-'}
Industry: ${industry || '-'}

Message:
${message || '-'}`;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'StraiLight Website <website@strailight.ai>',
      to: 'admin@strailight.ai',
      reply_to: email,
      subject: `New consultation request from ${firstName} ${lastName || ''}`.trim(),
      text: emailBody,
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    return new Response(JSON.stringify({ error: 'Failed to send email', details }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
