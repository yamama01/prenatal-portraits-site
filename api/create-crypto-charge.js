exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    if (!process.env.COINBASE_COMMERCE_API_KEY) return { statusCode: 500, body: 'Coinbase key missing' };

    const { finish, imageUrl, name, email, amount = '59.99', currency = 'USD' } = JSON.parse(event.body || '{}');
    const origin = event.headers.origin || 'https://prenatalportraits.com';

    const payload = {
      name: `3D Baby Portrait – ${finish || 'Finish'}`,
      description: `Keepsake ordered by ${name || 'Customer'}${imageUrl ? ` (image: ${imageUrl})` : ''}`,
      pricing_type: 'fixed_price',
      local_price: { amount, currency },
      metadata: { finish, imageUrl, name, email },
      redirect_url: `${origin}/success.html`,
      cancel_url: `${origin}/shop.html`
    };

    const resp = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, body: text };
    const json = JSON.parse(text);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hosted_url: json.data.hosted_url }) };
  } catch (e) {
    return { statusCode: 500, body: `Coinbase error: ${e.message}` };
  }
};
