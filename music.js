window.MusicApp = function(container) {
  // Get audio files from user files
  const files = typeof getUserFiles === "function" ? getUserFiles() : [];
  const blobs = typeof getUserBlobs === "function" ? getUserBlobs() : {};
  const audioFiles = files.filter(f => /\.(mp3|wav|ogg|m4a|flac)$/i.test(f));

  let current = null;

  function renderList() {
    if (!audioFiles.length) {
      return `<li style="color:#aaa;">No audio/music files in your Files app.</li>`;
    }
    return audioFiles.map(f => `
      <li>
        <span class="music-fname">${f}</span>
        <button class="music-play-btn" data-f="${f}">Play</button>
      </li>
    `).join("");
  }

  container.innerHTML = `
    <h2>Music Player</h2>
    <div id="music-list-wrap">
      <b>Your Music Files:</b>
      <ul class="music-list">${renderList()}</ul>
    </div>
    <div id="music-player-area" style="margin-top:22px;${audioFiles.length ? "" : "display:none;"}">
      <audio id="music-audio" controls style="width:100%;max-width:440px;border-radius:8px;background:#101520;box-shadow:0 2px 16px #0002;"></audio>
      <div id="music-track-info" style="margin-top:7px;color:#8ec9ff;font-size:1.08em;"></div>
    </div>
    <style>
      .music-list { list-style: none; padding:0; margin:0; }
      .music-list li { margin-bottom: 7px; display:flex; align-items:center; gap:12px; }
      .music-fname { font-family:monospace;font-size:1.04em; }
      .music-play-btn { padding:3px 16px;border-radius:5px;border:none;background:#28395e;color:#fff;cursor:pointer;transition:background 0.2s;}
      .music-play-btn:hover { background:#4275b1;}
    </style>
  `;

  const audioEl = container.querySelector("#music-audio");
  const infoEl = container.querySelector("#music-track-info");
  const playerArea = container.querySelector("#music-player-area");

  // Play logic
  container.querySelectorAll(".music-play-btn").forEach(btn => {
    btn.onclick = function() {
      const fname = btn.getAttribute("data-f");
      if (!blobs[fname]) return;
      audioEl.src = blobs[fname];
      audioEl.play();
      infoEl.textContent = `Playing: ${fname}`;
      playerArea.style.display = "";
      current = fname;
    };
  });

  // If audio ends, clear info
  audioEl && audioEl.addEventListener("ended", () => {
    infoEl.textContent = current ? `Finished: ${current}` : "";
    current = null;
  });
};