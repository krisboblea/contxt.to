export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    console.error('Missing Airtable config');
    return res.status(500).json({ error: 'Server config error' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Waitlist%20Signups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              Email: email,
              'Signup Timestamp': new Date().toISOString()
            }
          }]
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable error:', err);
      return res.status(500).json({ error: 'Failed to save' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Waitlist error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
