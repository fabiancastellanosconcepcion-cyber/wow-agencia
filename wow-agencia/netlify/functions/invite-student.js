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

    /// Validar el código de referido ANTES de guardar al estudiante,
    // para saber qué precio anotar (20 normal, 18 con referido válido)
    let referrerInfo = null;
    if (referred_by) {
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/students?referral_code=eq.${encodeURIComponent(referred_by)}&select=id,name`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      });
      const checkData = await checkRes.json();
      if (checkRes.ok && Array.isArray(checkData) && checkData.length > 0) {
        referrerInfo = checkData[0];
      }
    }

    const amountPaid = referrerInfo ? 18 : 20;

    // Guardar al nuevo estudiante en la tabla students
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
        amount_paid: amountPaid,
      }),
    });

    // Si el código era válido, sumar $10 de comisión al afiliado
    let commissionStatus = null;
    if (referred_by) {
      if (!referrerInfo) {
        commissionStatus = { ok: false, reason: `El código "${referred_by}" no corresponde a ningún estudiante. No se asignó comisión.` };
      } else {
        const commRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_commission`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ referral_code_input: referred_by, amount: 10 }),
        });

        if (!commRes.ok) {
          const commErr = await commRes.json().catch(() => ({}));
          commissionStatus = { ok: false, reason: 'Error al sumar la comisión: ' + (commErr.message || 'desconocido') };
        } else {
          commissionStatus = { ok: true, referrerName: referrerInfo.name, amount: 10 };
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, userId: result.id, commissionStatus }),
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno: ' + err.message }) };
  }
};
