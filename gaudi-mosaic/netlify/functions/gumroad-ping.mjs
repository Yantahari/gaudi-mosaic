// =====================================================
// Webhook receptor de Gumroad (ping)
// Es dispara quan algú compra a cardom.gumroad.com/l/{slug}
// Marca el token del comprador com a pagat dins Netlify Blobs.
// =====================================================

import { getStore } from '@netlify/blobs';

const EXPECTED_SELLER_ID = process.env.GUMROAD_SELLER_ID;

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Gumroad envia x-www-form-urlencoded amb arrays format clau[index]
  let payload;
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const text = await request.text();
      payload = parseFormUrlEncoded(text);
    }
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_payload' }, 400);
  }

  // 1. Autenticitat: el seller_id ha de coincidir amb el de Carlos
  if (!EXPECTED_SELLER_ID || payload.seller_id !== EXPECTED_SELLER_ID) {
    console.warn('Gumroad ping rebutjat: seller_id no coincideix', { received: payload.seller_id });
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
  }

  // 2. Recuperar el mosaic_token del url_params (que la nostra app va passar a la URL de compra)
  const mosaicToken = extractMosaicToken(payload);
  if (!mosaicToken) {
    // Compra legítima però sense token nostre (algú comprant via la pàgina pública de Gumroad sense passar per la nostra app)
    console.info('Compra sense mosaic_token (compra directa des de Gumroad)', { sale_id: payload.sale_id });
    return jsonResponse({ ok: true, info: 'no_mosaic_token' });
  }

  // 3. Marcar com a pagat al store (idempotent: sobreescriure està bé)
  const store = getStore({ name: 'payments', consistency: 'strong' });
  const record = {
    paid: true,
    sale_id: payload.sale_id || null,
    order_number: payload.order_number || null,
    paid_at: Date.now(),
    test: payload.test === 'true' || payload.test === true,
    product_permalink: payload.product_permalink || null
  };

  await store.setJSON(mosaicToken, record);
  console.info('Pagament registrat', { token: mosaicToken, sale_id: record.sale_id });

  return jsonResponse({ ok: true });
};

// ----- helpers -----

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function parseFormUrlEncoded(text) {
  const params = new URLSearchParams(text);
  const result = {};
  for (const [key, value] of params.entries()) {
    // Suport per estructures imbricades tipus url_params[mosaic_token]
    const nestedMatch = key.match(/^([^[]+)\[([^\]]+)\]$/);
    if (nestedMatch) {
      const [, parent, child] = nestedMatch;
      if (!result[parent]) result[parent] = {};
      result[parent][child] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function extractMosaicToken(payload) {
  // Gumroad pot enviar el token de tres maneres segons configuració:
  //   1. url_params[mosaic_token]   (forma més habitual)
  //   2. custom_fields[mosaic_token]
  //   3. mosaic_token (top-level si el sistema l'aplana)
  if (payload.url_params && typeof payload.url_params === 'object') {
    if (payload.url_params.mosaic_token) return payload.url_params.mosaic_token;
  }
  if (payload.custom_fields && typeof payload.custom_fields === 'object') {
    if (payload.custom_fields.mosaic_token) return payload.custom_fields.mosaic_token;
  }
  if (typeof payload.mosaic_token === 'string') return payload.mosaic_token;
  return null;
}

export const config = {
  path: '/.netlify/functions/gumroad-ping'
};
