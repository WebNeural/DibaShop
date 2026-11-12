const API_BASE = 'api';

async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        credentials: 'same-origin',
        headers: options.body ? { 'Content-Type': 'application/json' } : {},
        ...options
    });

    let data;
    try { data = await res.json(); }
    catch { throw new Error('پاسخ سرور نامعتبر بود.'); }

    if (!res.ok || data.success === false) {
        throw new Error(data.message || 'خطایی رخ داد.');
    }
    return data;
}

function apiGet(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
}

function apiPost(endpoint, body) {
    return apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) });
}
