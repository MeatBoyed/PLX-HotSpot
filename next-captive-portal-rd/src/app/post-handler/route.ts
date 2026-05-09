// app/post-handler/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const mikrotikData = Object.fromEntries(formData.entries());

  // console.log("Incomming Mikrotik Data: ", mikrotikData)

  // Save Mikrotik data to cookie
  (await cookies()).set('mikrotik-data', JSON.stringify(mikrotikData), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 50, // 50 minutes
  });

  // Extract SSID from Mikrotik link-login URL (AP is configured to redirect to /{ssid})
  let ssid = '';
  const linkLogin = String(mikrotikData['link-login'] || mikrotikData['link-login-only'] || '');
  if (linkLogin) {
    try {
      const parts = new URL(linkLogin).pathname.split('/').filter(Boolean);
      if (parts.length > 0) ssid = parts[0];
    } catch { /* invalid URL — ssid stays '' */ }
  }
  const splashUrl = ssid ? `/${ssid}/splash` : '/';

  // Redirect to splash — return HTML so the browser follows even from a POST
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="refresh" content="0; url=${splashUrl}" />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>Data received. Redirecting to captive portal...</p>
        <script>window.location.href = "${splashUrl}";</script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
