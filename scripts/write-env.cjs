const fs = require('fs');
const anonKey = fs.readFileSync('supabase/.temp/anon_key.txt', 'utf8').trim();
const envContent = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://aigzjdtktqntkouzcmyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
`;
fs.writeFileSync('.env.local', envContent);
console.log('Wrote .env.local with key length:', anonKey.length);
console.log('File content length:', envContent.length);
