export default async (request, context) => {
  const JIRA_BASE = "https://riversidejira.atlassian.net";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await request.json();
  } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
  }

  const { path, email, token } = body;

  if (!path || !email || !token) {
    return new Response(JSON.stringify({ error: "Missing path, email, or token" }), { status: 400, headers: corsHeaders });
  }

  if (!path.startsWith("rest/api/3/")) {
    return new Response(JSON.stringify({ error: "Forbidden path" }), { status: 403, headers: corsHeaders });
  }

  const auth = btoa(`${email}:${token}`);

  try {
    const response = await fetch(`${JIRA_BASE}/${path}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: `Upstream fetch failed: ${e.message}` }), {
      status: 502,
      headers: corsHeaders,
    });
  }
};

export const config = { path: "/.netlify/functions/jira-proxy" };
