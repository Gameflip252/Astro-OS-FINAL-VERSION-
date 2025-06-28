window.ImageViewerApp = function(container) {
  // Get current files and blobs
  const files = typeof getUserFiles === "function" ? getUserFiles() : [];
  const blobs = typeof getUserBlobs === "function" ? getUserBlobs() : {};

  // Supported image extensions (you can add more)
  const imageExts = /\.(png|jpe?g|gif|bmp|svg|webp)$/i;
  const imageFiles = files.filter(f => imageExts.test(f));

  let current = null;

  function renderList() {
    if (!imageFiles.length) {
      return `<li style="color:#aaa;">No image files in your Files app.</li>`;
    }
    return imageFiles.map((f,i) => `
      <li>
        <span class="imgv-fname" data-idx="${i}" style="cursor:pointer;color:#7af;text-decoration:underline;">${f}</span>
        <button class="imgv-view-btn" data-idx="${i}" style="margin-left:12px;">View</button>
      </li>
    `).join("");
  }

  container.innerHTML = `
    <h2>Image Viewer</h2>
    <div id="imgv-list-wrap">
      <b>Your Image Files:</b>
      <ul class="imgv-list">${renderList()}</ul>
    </div>
    <div id="imgv-viewer-area" style="margin-top:22px;display:none;text-align:center;">
      <img id="imgv-image" src="" style="max-width:95%;max-height:400px;border-radius:10px;box-shadow:0 2px 18px #0004;">
      <div id="imgv-img-info" style="margin-top:8px;color:#8ec9ff;font-size:1.08em;"></div>
      <div style="margin-top:12px;">
        <button id="imgv-prev-btn" style="padding:4px 17px;">Previous</button>
        <button id="imgv-next-btn" style="padding:4px 17px;margin-left:8px;">Next</button>
        <button id="imgv-close-btn" style="padding:4px 20px;margin-left:18px;">Close</button>
      </div>
    </div>
    <style>
      .imgv-list { list-style: none; padding:0; margin:0; }
      .imgv-list li { margin-bottom: 7px; display:flex; align-items:center; gap:10px; }
      .imgv-fname { font-family:monospace;font-size:1.04em; }
      .imgv-view-btn { padding:3px 16px;border-radius:5px;border:none;background:#28395e;color:#fff;cursor:pointer;transition:background 0.2s;}
      .imgv-view-btn:hover { background:#4275b1;}
    </style>
  `;

  function showImage(idx) {
    if (imageFiles.length === 0) return;
    idx = Math.max(0, Math.min(imageFiles.length-1, idx));
    current = idx;
    const fname = imageFiles[idx];
    const src = blobs[fname];
    const viewer = container.querySelector("#imgv-viewer-area");
    const imgEl = container.querySelector("#imgv-image");
    const info = container.querySelector("#imgv-img-info");
    imgEl.src = src || "";
    info.textContent = `Viewing: ${fname} (${idx+1} of ${imageFiles.length})`;
    viewer.style.display = "";
  }

  function hideViewer() {
    const viewer = container.querySelector("#imgv-viewer-area");
    viewer.style.display = "none";
    current = null;
  }

  // Bind events for list
  container.querySelectorAll(".imgv-fname, .imgv-view-btn").forEach(el => {
    el.onclick = function() {
      const idx = parseInt(el.getAttribute("data-idx"), 10);
      showImage(idx);
    };
  });

  // Bind viewer controls
  container.querySelector("#imgv-prev-btn").onclick = function() {
    if (current === null) return;
    showImage((current - 1 + imageFiles.length) % imageFiles.length);
  };
  container.querySelector("#imgv-next-btn").onclick = function() {
    if (current === null) return;
    showImage((current + 1) % imageFiles.length);
  };
  container.querySelector("#imgv-close-btn").onclick = function() {
    hideViewer();
  };
};