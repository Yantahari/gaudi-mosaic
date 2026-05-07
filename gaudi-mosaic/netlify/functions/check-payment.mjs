// =====================================================
// Endpoint de polling: la pàgina del client pregunta cada
// pocs segons si el seu token ha estat marcat com a pagat.
// =====================================================

import { getStore } from '@netlify/blobs';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export default async (request) => {
  if (request.method !== 'GET') {
    return jsonResponse({ paid: false, error: 'method_not_allowed' }, 405);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token || !TOKEN_PATTERN.test(token)) {
    return jsonResponse({ paid: false, error: 'invalid_token' }, 400);
  }

  const store = getStore({ name: 'payments', consistency: 'strong' });
  const record = await store.get(token, { type: 'json' });

  if (!record || !record.paid) {
    return jsonResponse({ paid: false }, 200);
  }

  return jsonResponse({
    paid: true,
    sale_id: record.sale_id,
    paid_at: record.paid_at,
    test: record.test || false
  }, 200);
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json',
      // No cache — sempre volem dades fresques
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
}

export const config = {
  path: '/.netlify/functions/check-payment'
};
