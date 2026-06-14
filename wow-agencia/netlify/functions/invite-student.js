exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { name, email } = JSON.parse(event.body);

    if (!name || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nombre y correo son requeridos.' }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const SITE_URL = process.env.SITE_URL;

    // Llamada directa a la API REST de Supabase usando fetch nativo de Node 18+
    const response = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        data: { full_name: name },
        redirect_to: `${SITE_URL}/set-password.html`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.msg && result.msg.includes('already been invited')) {
        return { statusCode: 409, headers, body: JSON.stringify({ error: 'Este correo ya fue invitado anteriormente.' }) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: result.msg || result.error_description || 'Error al invitar.' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, userId: result.id }),
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno: ' + err.message }) };
  }
};

