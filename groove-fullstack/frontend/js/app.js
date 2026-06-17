// ── Groove App ──
let allSongs = [];
let currentGenre = 'all';
let currentView = 'home';
window.currentUserLikedSongs = [];

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Set username in header
  document.getElementById('username-label').textContent = user.username;
  document.getElementById('user-avatar').textContent = user.username[0].toUpperCase();

  // Load liked songs
  try {
    const data = await apiGet('/users/profile');
    window.currentUserLikedSongs = data.user.likedSongs.map(s => s._id || s);
  } catch {}

  // Load songs
  await loadSongs();

  // Bind controls
  bindPlayerControls();
  bindNav();
  bindSearch();
  bindUploadForm();
  bindGenreChips();
});

// ── Load Songs ──
async function loadSongs(genre = 'all', search = '') {
  try {
    const params = new URLSearchParams();
    if (genre && genre !== 'all') params.set('genre', genre);
    if (search) params.set('search', search);
    const data = await apiGet('/songs?' + params.toString());
    allSongs = data.songs || [];
    renderAllViews();
  } catch (err) {
    console.error('Failed to load songs', err);
  }
}

// ── Render ──
function renderAllViews() {
  renderCards();
  renderTracklist('main-tracklist', allSongs);
  renderTracklist('library-tracklist', allSongs);
  renderLikedView();
}

function songCardHTML(song) {
  const url = coverUrl(song.coverImage);
  const liked = window.currentUserLikedSongs.includes(song._id);
  return `<div class="song-card" onclick="playSong('${song._id}')">
    <div class="card-cover" style="background:${genreColor(song.genre)}">
      ${url ? `<img src="${url}" alt="cover">` : `<span class="cover-placeholder">${genreEmoji(song.genre)}</span>`}
      <div class="card-play-overlay"><i class="ti ti-player-play"></i></div>
    </div>
    <div class="card-info">
      <div class="card-title ellipsis">${esc(song.title)}</div>
      <div class="card-artist ellipsis">${esc(song.artist)}</div>
    </div>
  </div>`;
}

function trackRowHTML(song, idx) {
  const cur = Player.getCurrentSong();
  const isPlaying = cur && cur._id === song._id;
  const liked = window.currentUserLikedSongs.includes(song._id);
  return `<div class="track-row${isPlaying ? ' playing' : ''}" onclick="playSong('${song._id}')">
    <div class="track-idx">${isPlaying
      ? `<div class="eq-bars"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>`
      : (idx + 1)}</div>
    <div class="track-meta">
      <div class="t-title ellipsis">${esc(song.title)}</div>
      <div class="t-sub ellipsis">${esc(song.artist)} · ${esc(song.album)}</div>
    </div>
    <div class="track-dur">${secsToStr(song.duration)}</div>
    <button class="like-btn ti ${liked ? 'ti-heart-filled liked' : 'ti-heart'}"
      onclick="handleLike(event,'${song._id}')" aria-label="Like"></button>
  </div>`;
}

function renderCards() {
  const el = document.getElementById('featured-cards');
  if (!el) return;
  const songs = allSongs.slice(0, 12);
  el.innerHTML = songs.length ? songs.map(songCardHTML).join('') : emptyState('No songs yet — upload the first one!');
}

function renderTracklist(containerId, songs) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = songs.length
    ? `<div class="tracklist">${songs.map((s, i) => trackRowHTML(s, i)).join('')}</div>`
    : emptyState('No tracks found.');
}

function renderLikedView() {
  const liked = allSongs.filter(s => window.currentUserLikedSongs.includes(s._id));
  renderTracklist('liked-tracklist', liked);
}

function emptyState(msg) {
  return `<div class="empty-state"><i class="ti ti-music-off"></i><p>${msg}</p></div>`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Play ──
function playSong(songId) {
  const idx = allSongs.findIndex(s => s._id === songId);
  if (idx === -1) return;
  Player.setQueue(allSongs, idx);
  renderAllViews();
}

Player.onTrackChange(() => renderAllViews());

// ── Like ──
async function handleLike(e, songId) {
  e.stopPropagation();
  const token = getToken();
  if (!token) { window.location.href = '/pages/login.html'; return; }
  try {
    const data = await apiPost('/songs/' + songId + '/like');
    window.currentUserLikedSongs = data.likedSongs;
    Player.refreshLikeBtn();
    renderAllViews();
  } catch (err) {
    alert(err.message);
  }
}

// ── Player Controls ──
function bindPlayerControls() {
  // play/pause
  document.getElementById('play-pause-btn').onclick = () => Player.togglePlay();
  // next/prev
  document.getElementById('next-btn').onclick = () => Player.next();
  document.getElementById('prev-btn').onclick = () => Player.prev();
  // shuffle / repeat
  document.getElementById('shuffle-btn').onclick = () => Player.toggleShuffle();
  document.getElementById('repeat-btn').onclick = () => Player.toggleRepeat();
  // seek
  document.getElementById('progress-bar').onclick = (e) => {
    const bar = e.currentTarget;
    const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
    Player.seek(pct);
  };
  // volume
  const volSlider = document.getElementById('vol-slider');
  volSlider.oninput = () => Player.setVolume(parseInt(volSlider.value));
  document.getElementById('vol-icon-btn').onclick = () => {
    volSlider.value = volSlider.value > 0 ? 0 : 80;
    Player.setVolume(parseInt(volSlider.value));
  };
  // np like
  document.getElementById('np-like-btn').onclick = () => {
    const song = Player.getCurrentSong();
    if (song) handleLike({ stopPropagation: () => {} }, song._id);
  };
}

// ── Navigation ──
function bindNav() {
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', () => switchView(el.dataset.view));
  });
  document.getElementById('logout-btn').onclick = logout;
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  if (view === 'upload') renderMyUploads();
}

// ── Search ──
function bindSearch() {
  const input = document.getElementById('search-input');
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim();
      loadSongs(currentGenre, q);
    }, 350);
  });
}

// ── Genre Chips ──
function bindGenreChips() {
  document.getElementById('genre-chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('#genre-chips .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentGenre = chip.dataset.genre;
    loadSongs(currentGenre);
  });
}

// ── Upload Form ──
function bindUploadForm() {
  // audio file drop
  const audioDrop = document.getElementById('audio-drop');
  const audioInput = document.getElementById('audio-file');
  audioDrop.onclick = () => audioInput.click();
  audioInput.onchange = () => {
    if (audioInput.files[0]) {
      audioDrop.querySelector('.file-chosen').textContent = audioInput.files[0].name;
      // Try to get duration
      const url = URL.createObjectURL(audioInput.files[0]);
      const a = new Audio(url);
      a.addEventListener('loadedmetadata', () => {
        document.getElementById('song-duration').value = Math.floor(a.duration);
        URL.revokeObjectURL(url);
      });
    }
  };

  // cover file drop
  const coverDrop = document.getElementById('cover-drop');
  const coverInput = document.getElementById('cover-file');
  coverDrop.onclick = () => coverInput.click();
  coverInput.onchange = () => {
    if (coverInput.files[0]) coverDrop.querySelector('.file-chosen').textContent = coverInput.files[0].name;
  };

  // drag & drop
  [audioDrop, coverDrop].forEach(drop => {
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
    drop.addEventListener('drop', e => {
      e.preventDefault(); drop.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (drop === audioDrop) { audioInput.files = e.dataTransfer.files; audioInput.dispatchEvent(new Event('change')); }
      else { coverInput.files = e.dataTransfer.files; coverInput.dispatchEvent(new Event('change')); }
    });
  });

  // submit
  document.getElementById('upload-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('upload-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Uploading...';
    document.getElementById('upload-alert').innerHTML = '';
    try {
      const fd = new FormData();
      fd.append('title', document.getElementById('song-title').value.trim());
      fd.append('artist', document.getElementById('song-artist').value.trim());
      fd.append('album', document.getElementById('song-album').value.trim());
      fd.append('genre', document.getElementById('song-genre').value);
      fd.append('duration', document.getElementById('song-duration').value || '0');
      if (audioInput.files[0]) fd.append('audio', audioInput.files[0]);
      if (coverInput.files[0]) fd.append('cover', coverInput.files[0]);

      await apiFetch('/songs', { method: 'POST', body: fd });
      showAlert('upload-alert', 'Song uploaded successfully!', 'success');
      document.getElementById('upload-form').reset();
      audioDrop.querySelector('.file-chosen').textContent = '';
      coverDrop.querySelector('.file-chosen').textContent = '';
      await loadSongs(currentGenre);
      renderMyUploads();
    } catch (err) {
      showAlert('upload-alert', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-upload"></i> Upload Song';
    }
  };
}

// ── My Uploads ──
async function renderMyUploads() {
  const el = document.getElementById('my-uploads-list');
  if (!el) return;
  el.innerHTML = '<p style="color:var(--text3);font-size:13px">Loading...</p>';
  try {
    const data = await apiGet('/users/my-uploads');
    const songs = data.songs || [];
    if (!songs.length) { el.innerHTML = emptyState('You haven\'t uploaded any songs yet.'); return; }
    el.innerHTML = `<div class="tracklist">${songs.map((s, i) => `
      <div class="track-row">
        <div class="track-idx">${i + 1}</div>
        <div class="track-meta">
          <div class="t-title ellipsis">${esc(s.title)}</div>
          <div class="t-sub ellipsis">${esc(s.artist)} · ${esc(s.album)} · ${s.plays} plays</div>
        </div>
        <div class="track-dur">${secsToStr(s.duration)}</div>
        <button class="like-btn ti ti-trash" style="color:var(--text3)"
          onclick="deleteSong('${s._id}')" aria-label="Delete"></button>
      </div>`).join('')}</div>`;
  } catch (err) {
    el.innerHTML = emptyState('Could not load uploads.');
  }
}

async function deleteSong(id) {
  if (!confirm('Delete this song? This cannot be undone.')) return;
  try {
    await apiDelete('/songs/' + id);
    await loadSongs(currentGenre);
    renderMyUploads();
  } catch (err) { alert(err.message); }
}

// ── Logout ──
function logout() {
  removeToken();
  removeUser();
  window.location.href = '/pages/login.html';
}
