const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://94.131.92.125:8000';

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function copyHeaders(source) {
  const headers = {};
  for (const [key, value] of source.entries()) {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      headers[key] = value;
    }
  }
  return headers;
}

function getForwardPath(reqUrl) {
  const original = reqUrl || '/';
  const url = new URL(original, 'http://localhost');
  const path = url.pathname.replace(/^\/api\//, '/');
  return `${path}${url.search}`;
}

export default async function handler(req, res) {
  const forwardPath = getForwardPath(req.url);
  const targetUrl = new URL(forwardPath, BACKEND_BASE_URL);

  const init = {
    method: req.method,
    headers: copyHeaders(req.headers),
  };

  delete init.headers.host;
  delete init.headers['content-length'];

  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    if (body.length > 0) init.body = body;
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (!hopByHopHeaders.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.setHeader('X-Proxy-By', 'vercel-api-proxy');
    res.end(buffer);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: error instanceof Error ? error.message : String(error),
      targetUrl: targetUrl.toString(),
    }));
  }
}
