const SUPABASE_PAT = require('fs').readFileSync('supabase/.temp/pat.txt', 'utf8').trim();
const https = require('https');

function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname,
      method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_PAT}`,
        'Content-Type': 'application/json',
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Create storage bucket
  const bucketResult = await request(
    'https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/storage/buckets',
    'POST',
    {
      id: 'product-images',
      name: 'product-images',
      public: true,
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
    }
  );
  console.log('BUCKET CREATE:', JSON.stringify(bucketResult, null, 2));
  
  // List buckets to verify
  const listResult = await request(
    'https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/storage/buckets',
    'GET'
  );
  console.log('\nBUCKETS:', JSON.stringify(listResult, null, 2));
}

main().catch(console.error);
