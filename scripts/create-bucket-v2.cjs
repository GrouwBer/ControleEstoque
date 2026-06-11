const SUPABASE_PAT = require('fs').readFileSync('supabase/.temp/pat.txt', 'utf8').trim();
const https = require('https');

function request(url, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname,
      method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_PAT}`,
        ...headers
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: data, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Try storage API endpoint directly on the project
  const r1 = await request(
    `https://aigzjdtktqntkouzcmyf.supabase.co/storage/v1/bucket`,
    'POST',
    {
      id: 'product-images',
      name: 'product-images',
      public: true,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
    },
    { 'Content-Type': 'application/json' }
  );
  console.log('DIRECT STORAGE API:', r1.status, r1.data.substring(0, 300));
}

main().catch(console.error);
