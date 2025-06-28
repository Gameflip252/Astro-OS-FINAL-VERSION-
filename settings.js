window.SettingsApp = function(container) {
  // Helper: Animate section transitions
  function showSection(id) {
    const sections = container.querySelectorAll('.settings-section');
    sections.forEach(sec => {
      if (sec.id === id) {
        sec.classList.add('show');
        setTimeout(() => sec.classList.add('visible'), 10);
      } else {
        sec.classList.remove('visible');
        setTimeout(() => sec.classList.remove('show'), 200);
      }
    });
    // Highlight button
    container.querySelectorAll('.settings-nav button').forEach(btn => {
      if (btn.dataset.section === id) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  // Device Info
  function deviceSpecsHtml() {
    return `
      <div class="settings-spec-group">
        <div><b>User Agent:</b> <span>${navigator.userAgent}</span></div>
        <div><b>Platform:</b> <span>${navigator.platform}</span></div>
        <div><b>Language:</b> <span>${navigator.language}</span></div>
        <div><b>Screen:</b> <span>${window.screen.width} x ${window.screen.height}</span></div>
        <div><b>Memory:</b> <span>${navigator.deviceMemory || "?"} GB</span></div>
        <div><b>CPU Cores:</b> <span>${navigator.hardwareConcurrency || "?"}</span></div>
      </div>
    `;
  }

  // Background Picker
  function backgroundHtml() {
    const color = localStorage.getItem('astra_user_' + (getCurrentUser() ? getCurrentUser().id : "guest") + '_desktop_bg_color') || '#102055';
    return `
      <div class="settings-bg-group">
        <label>
          <span>Background Color:</span>
          <input type="color" id="bg-color-input" value="${color}">
        </label>
        <button id="set-bg-darkblue" class="set-bg-btn">Set to Dark Blue</button>
      </div>
    `;
  }

  // Audio/Video Output
  async function audioVideoHtml() {
    let audioList = '';
    let videoList = '';
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audios = devices.filter(dev => dev.kind === "audiooutput");
      const videos = devices.filter(dev => dev.kind === "videoinput");
      audioList = audios.length
        ? `<select id="audio-output">${audios.map(d => `<option value="${d.deviceId}">${d.label||("Audio Output "+d.deviceId.slice(-4))}</option>`).join('')}</select>`
        : '<span style="color:#bbb;">No audio outputs found.</span>';
      videoList = videos.length
        ? `<select id="video-input">${videos.map(d => `<option value="${d.deviceId}">${d.label||("Video Input "+d.deviceId.slice(-4))}</option>`).join('')}</select>`
        : '<span style="color:#bbb;">No video inputs found.</span>';
    } else {
      audioList = '<span style="color:#bbb;">Not supported.</span>';
      videoList = '<span style="color:#bbb;">Not supported.</span>';
    }
    return `
      <div class="settings-av-group">
        <label>Audio Output: ${audioList}</label>
        <label>Video Input: ${videoList}</label>
      </div>
    `;
  }

  // Layout
  container.innerHTML = `
    <div class="settings-nav">
      <button class="active" data-section="settings-info">Info</button>
      <button data-section="settings-bg">Background</button>
      <button data-section="settings-av">Audio/Video</button>
    </div>
    <div class="settings-content">
      <div class="settings-section show visible" id="settings-info">
        <div class="settings-section-title">Device Info</div>
        <div class="settings-section-anim">${deviceSpecsHtml()}</div>
      </div>
      <div class="settings-section" id="settings-bg">
        <div class="settings-section-title">Background</div>
        <div class="settings-section-anim">${backgroundHtml()}</div>
      </div>
      <div class="settings-section" id="settings-av">
        <div class="settings-section-title">Audio/Video</div>
        <div class="settings-section-anim" id="settings-av-inner"><span style="color:#bbb;">Loading...</span></div>
      </div>
    </div>
    <style>
      .settings-nav {
        display: flex; gap: 15px; margin-bottom: 15px; justify-content: center;
      }
      .settings-nav button {
        background: #273862; color: #fff; border: none; border-radius: 7px; padding: 8px 22px; font-size: 1.09em;
        transition: background 0.23s, color 0.23s, box-shadow 0.23s;
        cursor: pointer; outline: none; box-shadow: 0 2px 6px #101b3c22;
      }
      .settings-nav button.active, .settings-nav button:hover {
        background: #3656a0; color: #fff; box-shadow: 0 3px 16px #1231a066;
      }
      .settings-content { border-radius: 13px; background: #16244a; padding: 20px 16px; min-height: 190px; box-shadow: 0 2px 18px #0004; }
      .settings-section { display: none; opacity: 0; transform: translateY(30px); transition: opacity 0.35s cubic-bezier(.44,1.44,.52,1), transform 0.35s cubic-bezier(.44,1.44,.52,1);}
      .settings-section.show { display: block; }
      .settings-section.visible { opacity: 1; transform: none; }
      .settings-section-title { font-size: 1.19em; font-weight: bold; margin-bottom: 15px; letter-spacing: .1em; color: #86b6ff; }
      .settings-spec-group > div { margin-bottom: 8px; }
      .settings-bg-group { display: flex; align-items: center; gap: 18px; }
      .settings-bg-group label { font-size:1.08em; display: flex; align-items: center; gap: 8px;}
      .settings-bg-group .set-bg-btn { margin-left: 10px; padding: 6px 16px; background: #1b2a55; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; transition: background 0.2s;}
      .settings-bg-group .set-bg-btn:hover { background: #2c468a; }
      .settings-av-group label { display: block; margin-bottom: 14px; font-size: 1.08em;}
      .settings-section-anim { animation: fadeinup .6s cubic-bezier(.44,1.44,.52,1); }
      @keyframes fadeinup { from { opacity: 0; transform: translateY(32px);} to { opacity: 1; transform: none;}}
    </style>
  `;

  // Nav
  container.querySelectorAll('.settings-nav button').forEach(btn => {
    btn.onclick = () => showSection(btn.dataset.section);
  });

  // Background section logic
  container.querySelector("#bg-color-input").oninput = function() {
    setDesktopBgColor(this.value);
  };
  container.querySelector("#set-bg-darkblue").onclick = function() {
    setDesktopBgColor("#102055");
    container.querySelector("#bg-color-input").value = "#102055";
  };

  // Device Info: nothing to do (auto loads)

  // Audio/Video section logic (async, after render)
  audioVideoHtml().then(html => {
    const av = container.querySelector("#settings-av-inner");
    av.innerHTML = html;
    // Save on change
    const audioSel = av.querySelector("#audio-output");
    if (audioSel) {
      audioSel.onchange = function() {
        localStorage.setItem("astra_audio_output", this.value);
      };
      // restore last selection if present
      const stored = localStorage.getItem("astra_audio_output");
      if (stored) audioSel.value = stored;
    }
    const videoSel = av.querySelector("#video-input");
    if (videoSel) {
      videoSel.onchange = function() {
        localStorage.setItem("astra_video_input", this.value);
      };
      const stored = localStorage.getItem("astra_video_input");
      if (stored) videoSel.value = stored;
    }
  });

  // Default: show info
  showSection('settings-info');
};