const SUPABASE_PAT = require('fs').readFileSync('supabase/.temp/pat.txt', 'utf8').trim();
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Authorization': `Bearer ${SUPABASE_PAT}` } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function storageRequest(hostname, path, method, body, jwt) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const keys = await get('https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/api-keys');
  const serviceRoleKey = keys.find(k => k.name === 'service_role').api_key;
  
  console.log('Service role key length:', serviceRoleKey.length);
  
  // Create bucket using service role JWT
  const result = await storageRequest(
    'aigzjdtktqntkouzcmyf.supabase.co',
    '/storage/v1/bucket',
    'POST',
    {
      id: 'product-images',
      name: 'product-images',
      public: true,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
    },
    serviceRoleKey
  );
  
  console.log('CREATE BUCKET:', result.status, result.data.substring(0, 500));
  
  // List buckets to verify
  const listResult = await storageRequest(
    'aigzjdtktqntkouzcmyf.supabase.co',
    '/storage/v1/bucket',
    'GET',
    null,
    serviceRoleKey
  );
  
  console.log('\nLIST BUCKETS:', listResult.status, listResult.data.substring(0, 500));
  
  // Also save the full env properly
  const anonKey = keys.find(k => k.name === 'anon').api_key;
  const envContent = [
    `NEXT_PUBLIC_SUPABASE_URL=https://aigzjdtktqntkouzcmyf.supabase.co`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
  ].join('\n');
  
  // Save raw JSON for env values
  require('fs').writeFileSync('supabase/.temp/anon_key.txt', anonKey);
  require('fs').writeFileSync('supabase/.temp/service_key.txt', serviceRoleKey);
  console.log('\nEnv keys saved to files!');
}

main().catch(console.error);
