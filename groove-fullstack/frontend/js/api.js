const API_BASE = '/api';

function getToken() { return localStorage.getItem('groove_token'); }
function setToken(t) { localStorage.setItem('groove_token', t); }
function removeToken() { localStorage.removeItem('groove_token'); }
function setUser(u) { localStorage.setItem('groove_user', JSON.stringify(u)); }
function getUser() { try { return JSON.parse(localStorage.getItem('groove_user')); } catch { return null; } }
function removeUser() { localStorage.removeItem('groove_user'); }

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiGet(endpoint) { return apiFetch(endpoint); }
async function apiPost(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
}
async function apiDelete(endpoint) { return apiFetch(endpoint, { method: 'DELETE' }); }

function secsToStr(s) {
  s = Math.floor(s || 0);
  const m = Math.floor(s / 60), r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}

function coverUrl(path) {
  if (!path) return null;
  return '/uploads/' + path;
}

function audioUrl(path) {
  return '/uploads/' + path;
}

function genreEmoji(genre) {
  const map = { pop:'🎤', rock:'⚡', jazz:'🎷', electronic:'🌌', hiphop:'🎧', classical:'🎻', other:'🎵' };
  return map[genre] || '🎵';
}

function genreColor(genre) {
  const map = { pop:'#2d101a', rock:'#1a1030', jazz:'#2d1a10', electronic:'#1a2d47', hiphop:'#102d1a', classical:'#1a2a10', other:'#1a1a2d' };
  return map[genre] || '#1a1a2d';
}

function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}
