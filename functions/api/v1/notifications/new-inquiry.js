// Cloudflare Pages Function — sends email to info@pixelrebels.space via Resend
// Requires RESEND_API_KEY environment variable set in Cloudflare Pages settings

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const { name, email, company, phone, selected_package, description } = await request.json();

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #FF4D4D; margin-bottom: 24px;">New Inquiry — Pixel Rebels</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${company || "—"}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone || "—"}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Package</td><td style="padding: 8px 0; font-weight: 600; color: #FF4D4D;">${selected_package || "Not selected"}</td></tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <p style="color: #666; margin: 0 0 8px;">Message</p>
          <p style="margin: 0; white-space: pre-wrap;">${description}</p>
        </div>
      </div>
    `;

    const emailText = `New Inquiry — Pixel Rebels\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "—"}\nPhone: ${phone || "—"}\nPackage: ${selected_package || "Not selected"}\n\nMessage:\n${description}`;

    if (env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Pixel Rebels <noreply@pixelrebels.space>",
          to: ["info@pixelrebels.space"],
          reply_to: email,
          subject: `New inquiry from ${name} — ${selected_package || "General"}`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
      }
    } else {
      console.warn("RESEND_API_KEY not set — email not sent");
    }

    return new Response(JSON.stringify({ success: true }), { headers });

  } catch (err) {
    console.error("Notification function error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
