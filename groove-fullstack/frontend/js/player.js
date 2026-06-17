// ── Groove Player ──
const Player = (() => {
  let audio = new Audio();
  let queue = [];
  let currentIdx = -1;
  let isShuffle = false;
  let isRepeat = false;
  let isPlaying = false;
  let onTrackChange = null;
  let onStateChange = null;

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    const fill = document.getElementById('progress-fill');
    const thumb = document.getElementById('progress-thumb');
    const cur = document.getElementById('cur-time');
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (cur) cur.textContent = secsToStr(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    const dur = document.getElementById('dur-time');
    if (dur) dur.textContent = secsToStr(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (isRepeat) { audio.currentTime = 0; audio.play(); return; }
    next();
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayBtn();
    if (onStateChange) onStateChange(true);
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayBtn();
    if (onStateChange) onStateChange(false);
  });

  function updatePlayBtn() {
    const btn = document.getElementById('play-pause-btn');
    const eq = document.getElementById('player-eq');
    if (btn) btn.innerHTML = isPlaying
      ? '<i class="ti ti-player-pause"></i>'
      : '<i class="ti ti-player-play"></i>';
    if (eq) eq.classList.toggle('eq-paused', !isPlaying);
  }

  function loadTrack(idx) {
    if (idx < 0 || idx >= queue.length) return;
    currentIdx = idx;
    const song = queue[idx];
    audio.src = audioUrl(song.audioFile);
    audio.load();
    audio.play().catch(() => {});
    updateNowPlaying(song);
    // increment play count
    apiPost('/songs/' + song._id + '/play').catch(() => {});
    if (onTrackChange) onTrackChange(song, idx);
  }

  function updateNowPlaying(song) {
    const title = document.getElementById('np-title');
    const artist = document.getElementById('np-artist');
    const art = document.getElementById('np-art');
    const sidebarNow = document.getElementById('sidebar-now-title');
    if (title) title.textContent = song.title;
    if (artist) artist.textContent = song.artist;
    if (art) {
      const url = coverUrl(song.coverImage);
      art.innerHTML = url
        ? `<img src="${url}" alt="cover">`
        : `<span>${genreEmoji(song.genre)}</span>`;
      art.style.background = url ? '' : genreColor(song.genre);
    }
    if (sidebarNow) sidebarNow.textContent = song.title;
    // update like button
    updateLikeBtn(song._id);
    // update page title
    document.title = `${song.title} — ${song.artist} | Groove`;
  }

  function updateLikeBtn(songId) {
    const btn = document.getElementById('np-like-btn');
    if (!btn) return;
    const user = getUser();
    const likedSongs = window.currentUserLikedSongs || [];
    const liked = likedSongs.includes(songId);
    btn.className = liked ? 'liked ti ti-heart-filled' : 'ti ti-heart';
    btn.dataset.songId = songId;
  }

  return {
    setQueue(songs, startIdx = 0) {
      queue = [...songs];
      loadTrack(startIdx);
    },
    addToQueue(song) { queue.push(song); },
    play() { audio.play(); },
    pause() { audio.pause(); },
    togglePlay() { isPlaying ? audio.pause() : audio.play(); },
    next() {
      if (!queue.length) return;
      let idx;
      if (isShuffle) {
        do { idx = Math.floor(Math.random() * queue.length); } while (queue.length > 1 && idx === currentIdx);
      } else {
        idx = (currentIdx + 1) % queue.length;
      }
      loadTrack(idx);
    },
    prev() {
      if (!queue.length) return;
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      loadTrack((currentIdx - 1 + queue.length) % queue.length);
    },
    seek(pct) {
      if (audio.duration) audio.currentTime = pct * audio.duration;
    },
    setVolume(v) { audio.volume = v / 100; },
    toggleShuffle() {
      isShuffle = !isShuffle;
      const btn = document.getElementById('shuffle-btn');
      if (btn) btn.classList.toggle('active', isShuffle);
      return isShuffle;
    },
    toggleRepeat() {
      isRepeat = !isRepeat;
      const btn = document.getElementById('repeat-btn');
      if (btn) btn.classList.toggle('active', isRepeat);
      return isRepeat;
    },
    getCurrentSong() { return queue[currentIdx] || null; },
    getQueue() { return queue; },
    isPlaying() { return isPlaying; },
    onTrackChange(fn) { onTrackChange = fn; },
    onStateChange(fn) { onStateChange = fn; },
    refreshLikeBtn() {
      const song = queue[currentIdx];
      if (song) updateLikeBtn(song._id);
    }
  };
})();
