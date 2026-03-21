// Cloudflare Pages Function — handles all /api/v1/entities/* calls
// Stores inquiries in Cloudflare KV (if bound) or returns mock success

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const url = new URL(request.url);

  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (method === "POST") {
      const body = await request.json();
      const data = body?.data || {};
      const id = Date.now().toString();
      const record = { id, ...data, created_at: new Date().toISOString() };

      // Store in KV if available
      if (env.INQUIRIES_KV) {
        const existing = await env.INQUIRIES_KV.get("inquiries");
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(record);
        await env.INQUIRIES_KV.put("inquiries", JSON.stringify(list));
      }

      return new Response(JSON.stringify({ data: record }), { headers });
    }

    if (method === "GET") {
      let items = [];
      if (env.INQUIRIES_KV) {
        const existing = await env.INQUIRIES_KV.get("inquiries");
        items = existing ? JSON.parse(existing) : [];
      }
      return new Response(JSON.stringify({ data: { items } }), { headers });
    }

    if (method === "PUT" || method === "PATCH") {
      return new Response(JSON.stringify({ data: { success: true } }), { headers });
    }

  } catch (err) {
    console.error("Entity function error:", err);
  }

  return new Response(JSON.stringify({ data: {} }), { headers });
}
