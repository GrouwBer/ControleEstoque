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

async function main() {
  // Try auth settings
  const authSettings = await get('https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/config/auth/settings');
  console.log('AUTH SETTINGS:', JSON.stringify(authSettings, null, 2));

  // Also check the config endpoint
  const config = await get('https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/api-keys');
  const anonKey = config.find(k => k.name === 'anon')?.api_key;
  console.log('\nANON_KEY length:', anonKey?.length);
  console.log('ANON_KEY first 50 chars:', anonKey?.substring(0, 50));
  console.log('ANON_KEY last 10 chars:', anonKey?.substring(anonKey.length - 10));
  
  // Verify it's a valid JWT
  if (anonKey && anonKey.includes('.')) {
    const parts = anonKey.split('.');
    console.log('JWT header:', Buffer.from(parts[0], 'base64').toString());
    console.log('JWT payload:', Buffer.from(parts[1], 'base64').toString());
  }
}

main().catch(console.error);
