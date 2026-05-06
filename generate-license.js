const crypto = require('crypto');
const fs = require('fs');

// Read private key from .env
const envContent = fs.readFileSync('.env', 'utf8');
const privateKeyLine = envContent.split('\n').find(l => l.startsWith('LICENSE_PRIVATE_KEY='));
let privateKeyPem = privateKeyLine.split('=').slice(1).join('=');
// Remove surrounding quotes
privateKeyPem = privateKeyPem.replace(/^"|"$/g, '').trim();
// Replace literal \n with real newlines
privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');

const machineId = process.argv[2] || '97796EF0D8B9110A';
const durationDays = parseInt(process.argv[3] || '365');

const expDate = new Date();
expDate.setDate(expDate.getDate() + durationDays);

const payload = {
  cid: 'vortex-client-001',
  pid: 'ferreteria-erp',
  mid: machineId,
  exp: expDate.toISOString().split('T')[0],
  ver: '1.0'
};

console.log('Payload:', JSON.stringify(payload, null, 2));

const data = JSON.stringify(payload);
const signature = crypto.sign('sha256', Buffer.from(data), {
  key: privateKeyPem,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});

const payloadBase64 = Buffer.from(data).toString('base64');
const signatureBase64 = signature.toString('base64');

const licenseKey = `${payloadBase64}.${signatureBase64}`;

console.log('\n=== LICENSE KEY ===');
console.log(licenseKey);
console.log('=== END ===');

// Also verify it works
const pubKeyLine = envContent.split('\n').find(l => l.startsWith('LICENSE_PUBLIC_KEY='));
let publicKeyPem = pubKeyLine.split('=').slice(1).join('=');
publicKeyPem = publicKeyPem.replace(/^"|"$/g, '').trim();
publicKeyPem = publicKeyPem.replace(/\\n/g, '\n');

const isValid = crypto.verify(
  'sha256',
  Buffer.from(data),
  { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PSS_PADDING },
  signature
);

console.log('\nSelf-verification:', isValid ? 'PASSED ✓' : 'FAILED ✗');
