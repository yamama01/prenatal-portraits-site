exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const {
      finish, imageUrl, name, email,
      address1, address2, city, state, zip, country = 'US',
      amount_cents = 5999, shipping_cents = 699
    } = JSON.parse(event.body || '{}');

    if (!process.env.STRIPE_SECRET_KEY) return { statusCode: 500, body: 'Stripe key missing' };

    const params = new URLSearchParams();
    params.set('mode', 'payment');
    const origin = event.headers.origin || 'https://prenatalportraits.com';
    params.set('success_url', `${origin}/success.html`);
    params.set('cancel_url', `${origin}/shop.html`);
    params.set('payment_method_types[0]', 'card');

    params.set('line_items[0][price_data][currency]', 'usd');
    params.set('line_items[0][price_data][unit_amount]', String(amount_cents));
    params.set('line_items[0][price_data][product_data][name]', `3D Baby Portrait – ${finish || 'Finish'}`);
    if (imageUrl) params.set('line_items[0][price_data][product_data][images][0]', imageUrl);
    params.set('line_items[0][quantity]', '1');

    params.set('line_items[1][price_data][currency]', 'usd');
    params.set('line_items[1][price_data][unit_amount]', String(shipping_cents));
    params.set('line_items[1][price_data][product_data][name]', 'Shipping');
    params.set('line_items[1][quantity]', '1');

    params.set('shipping_address_collection[allowed_countries][0]', 'US');

    if (finish) params.set('metadata[finish]', finish);
    if (imageUrl) params.set('metadata[imageUrl]', imageUrl);
    if (name) params.set('metadata[name]', name);
    if (email) params.set('customer_email', email);
    if (address1) params.set('metadata[address1]', address1);
    if (address2) params.set('metadata[address2]', address2 || '');
    if (city) params.set('metadata[city]', city);
    if (state) params.set('metadata[state]', state);
    if (zip) params.set('metadata[zip]', zip);
    if (country) params.set('metadata[country]', country);

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const text = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, body: text };
    const json = JSON.parse(text);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: json.url }) };
  } catch (e) {
    return { statusCode: 500, body: `Stripe error: ${e.message}` };
  }
};
