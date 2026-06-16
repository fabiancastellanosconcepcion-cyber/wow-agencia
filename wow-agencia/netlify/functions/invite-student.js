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
    const { name, email, referred_by } = JSON.parse(event.body);
    const referralCode = Math.random().toString(36).substring(2,6).toUpperCase() +
                     Math.random().toString(36).substring(2,6).toUpperCase();

    if (!name || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nombre y correo son requeridos.' }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const SITE_URL = process.env.SITE_URL;

    const redirectTo = `${SITE_URL}/set-password.html`;
    const inviteUrl = `${SUPABASE_URL}/auth/v1/invite?redirect_to=${encodeURIComponent(redirectTo)}`;

    const response = await fetch(inviteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        data: { full_name: name },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.msg && result.msg.includes('already been invited')) {
        return { statusCode: 409, headers, body: JSON.stringify({ error: 'Este correo ya fue invitado anteriormente.' }) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: result.msg || result.error_description || 'Error al invitar.' }) };
    }

    // Guardar código de referido y datos en tabla students
await fetch(`${SUPABASE_URL}/rest/v1/students`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Prefer': 'resolution=merge-duplicates',
  },
  body: JSON.stringify({
    name,
    email,
    active: true,
    referral_code: referralCode,
    referred_by: referred_by || null,
  }),
});
    // Si vino referido, sumar $10 de comisión al afiliado
    if (referred_by) {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_commission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ referral_code_input: referred_by, amount: 10 }),
      });
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
