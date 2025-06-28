window.FileManagerApp = function(container) {
  // Load files/blobs from storage
  const files = (typeof getUserFiles === "function" ? getUserFiles() : []);
  const blobs = (typeof getUserBlobs === "function" ? getUserBlobs() : {});

  // Render file list
  function renderList() {
    const list = files.length
      ? files.map(f => {
          const ext = f.split('.').pop().toLowerCase();
          let extractBtn = "";
          if (ext === "zip") {
            extractBtn = `<button class="file-extract-btn" data-f="${f}">Extract</button>`;
          }
          return `
           <li>
              <span class="file-fname">${f}</span>
              <button class="file-open-btn" data-f="${f}">Open</button>
              <button class="file-dl-btn" data-f="${f}">Download</button>
              <button class="file-del-btn" data-f="${f}">Delete</button>
              ${extractBtn}
           </li>
        `;
        }).join('')
      : `<li style="color:#aaa;">No files uploaded yet.</li>`;
    return `<ul class="file-list">${list}</ul>`;
  }

  container.innerHTML = `
    <h2>File Manager</h2>
    <form id="file-upload-form" style="margin-bottom:14px;">
      <input type="file" id="file-upload-input" multiple>
      <button type="submit">Upload</button>
    </form>
    <div class="file-list-wrap">${renderList()}</div>
    <div style="margin-top:18px;color:#bbb;font-size:0.96em;">
      You can upload files. They will be stored in your browser.<br>
      (Max file size may depend on your browser/storage.)
    </div>
    <style>
      .file-list { list-style: none; padding:0; margin:0; }
      .file-list li { margin-bottom: 7px; display:flex; align-items:center; gap:12px; }
      .file-fname { font-family:monospace;font-size:1.04em; }
      .file-list button { padding:3px 12px;border-radius:5px;border:none;background:#28395e;color:#fff;cursor:pointer;transition:background 0.2s;}
      .file-del-btn { background:#b34c4c;}
      .file-list button:hover { background:#4275b1;}
      .file-del-btn:hover { background:#e04747;}
    </style>
  `;

  // Upload logic
  container.querySelector("#file-upload-form").onsubmit = function(e) {
    e.preventDefault();
    const input = container.querySelector("#file-upload-input");
    const newFiles = Array.from(input.files || []);
    if (!newFiles.length) return false;
    let pending = newFiles.length;
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const fname = file.name;
        if (!files.includes(fname)) files.push(fname);
        blobs[fname] = evt.target.result;
        if (typeof setUserFiles === "function") setUserFiles(files);
        if (typeof setUserBlobs === "function") setUserBlobs(blobs);
        pending--;
        if (pending === 0) rerender();
      };
      reader.readAsDataURL(file);
    });
    input.value = "";
    return false;
  };

  function rerender() {
    container.querySelector(".file-list-wrap").innerHTML = renderList();
    bindButtons();
  }

  // Bind file list buttons
  function bindButtons() {
    // Open (view)
    container.querySelectorAll(".file-open-btn").forEach(btn => {
      btn.onclick = function() {
        const fname = btn.getAttribute("data-f");
        if (!blobs[fname]) return;
        const ext = fname.split('.').pop().toLowerCase();
        let winTitle = "Open: " + fname;
        openWindow(winTitle, c => {
          let html = '';
          if (["png","jpg","jpeg","gif","webp","bmp","svg"].includes(ext)) {
            html = `<img src="${blobs[fname]}" style="max-width:100%;max-height:400px;border-radius:12px;">`;
          } else if (["mp4","webm","ogg"].includes(ext)) {
            html = `<video src="${blobs[fname]}" controls style="max-width:100%;max-height:400px;background:#000;border-radius:10px;"></video>`;
          } else if (["mp3","wav","ogg"].includes(ext)) {
            html = `<audio src="${blobs[fname]}" controls style="width:95%;margin-top:22px;"></audio>`;
          } else {
            html = `<a href="${blobs[fname]}" download="${fname}" style="color:#6cf;">Download file</a>`;
          }
          c.innerHTML = `<h3>${fname}</h3><div style="margin-top:18px;text-align:center;">${html}</div>`;
        }, "📂");
      };
    });
    // Download
    container.querySelectorAll(".file-dl-btn").forEach(btn => {
      btn.onclick = function() {
        const fname = btn.getAttribute("data-f");
        if (!blobs[fname]) return;
        const a = document.createElement("a");
        a.href = blobs[fname];
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>a.remove(),200);
      };
    });
    // Delete
    container.querySelectorAll(".file-del-btn").forEach(btn => {
      btn.onclick = function() {
        const fname = btn.getAttribute("data-f");
        if (!blobs[fname]) return;
        if (!confirm("Delete " + fname + "?")) return;
        const idx = files.indexOf(fname);
        if (idx > -1) files.splice(idx,1);
        delete blobs[fname];
        if (typeof setUserFiles === "function") setUserFiles(files);
        if (typeof setUserBlobs === "function") setUserBlobs(blobs);
        rerender();
      };
    });
    // Extract ZIP
    container.querySelectorAll(".file-extract-btn").forEach(btn => {
      btn.onclick = async function() {
        const fname = btn.getAttribute("data-f");
        if (!blobs[fname] || typeof JSZip === "undefined") {
          alert("JSZip not loaded or file missing.");
          return;
        }
        try {
          const zipData = blobs[fname];
          let zipBlob;
          if (zipData.startsWith("data:")) {
            const resp = await fetch(zipData);
            zipBlob = await resp.blob();
          } else {
            zipBlob = zipData;
          }
          const arrayBuffer = await zipBlob.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);
          const extractedFiles = [];
          for (const [name, fileObj] of Object.entries(zip.files)) {
            if (!fileObj.dir) {
              const content = await fileObj.async("base64");
              const mime = "application/octet-stream";
              const dataUrl = `data:${mime};base64,${content}`;
              if (!files.includes(name)) files.push(name);
              blobs[name] = dataUrl;
              extractedFiles.push(name);
            }
          }
          if (typeof setUserFiles === "function") setUserFiles(files);
          if (typeof setUserBlobs === "function") setUserBlobs(blobs);
          rerender();
          alert("Extracted: " + extractedFiles.join(", "));
        } catch (err) {
          alert("Failed to extract ZIP: " + err);
        }
      };
    });
  }
  bindButtons();
};