// app/post-handler/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const mikrotikData = Object.fromEntries(formData.entries());

  // Save Mikrotik data to cookie
  (await cookies()).set('mikrotik-data', JSON.stringify(mikrotikData), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 50, // 50 minutes
  });

  // Redirect to home page
  // Instead of forcing a redirect, return an HTML page that tells the browser to redirect
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="refresh" content="0; url=/" />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>Data received. Redirecting to homepage...</p>
        <script>window.location.href = "/";</script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
