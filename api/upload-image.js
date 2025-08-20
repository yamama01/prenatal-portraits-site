exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { dataUrl } = JSON.parse(event.body || '{}');
    if (!dataUrl) return { statusCode: 400, body: 'Missing dataUrl' };
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
      return { statusCode: 500, body: 'Cloudinary config missing' };
    }

    const params = new URLSearchParams();
    params.set('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    params.set('file', dataUrl);

    const resp = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const text = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, body: text };
    const json = JSON.parse(text);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secure_url: json.secure_url }) };
  } catch (e) {
    return { statusCode: 500, body: `Cloudinary error: ${e.message}` };
  }
};
