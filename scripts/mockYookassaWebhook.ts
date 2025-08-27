const externalId = process.argv[2] || 'mock-payment';
await fetch('http://localhost:3000/api/billing/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ object: { id: externalId, status: 'succeeded' } })
});
console.log(`Mock webhook sent for ${externalId}`);
