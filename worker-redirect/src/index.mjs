// Hamma so'rovni asosiy domenga 301 bilan yo'naltiradi (yo'l va query saqlanadi)
export default {
  fetch(req) {
    const u = new URL(req.url);
    u.protocol = 'https:'; u.hostname = 'orlentmedical.uz'; u.port = '';
    return new Response(null, { status: 301, headers: { Location: u.toString(), 'Cache-Control': 'public, max-age=86400' } });
  }
};
