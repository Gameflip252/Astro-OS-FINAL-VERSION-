window.VideoPlayerApp = function(container) {
  const files = typeof getUserFiles === "function" ? getUserFiles() : [];
  const blobs = typeof getUserBlobs === "function" ? getUserBlobs() : {};
  const videoFiles = files.filter(f => /\.(mp4|webm|ogg)$/i.test(f));
  container.innerHTML = `
    <h2>Video Player</h2>
    <div id="video-file-list" style="margin-bottom:17px;">
      <b>Available Videos:</b>
      <ul>
        ${videoFiles.length ?
          videoFiles.map(f=>`<li style="cursor:pointer;color:#9df;" data-f="${f}">${f}</li>`).join('')
          : '<li style="color:#999;">No video files in Files app.</li>'}
      </ul>
    </div>
    <video id="demo-video" controls style="background:#000;max-width:100%;width:100%;display:none;margin-bottom:8px;"></video>
    <div id="video-info" style="margin-top:8px;color:#bbb;font-size:0.97em;"></div>
  `;
  const video = container.querySelector("#demo-video");
  const info = container.querySelector("#video-info");
  Array.from(container.querySelectorAll('#video-file-list li[data-f]')).forEach(li => {
    li.onclick = function(){
      const fname = li.getAttribute('data-f');
      let src = blobs && blobs[fname] ? blobs[fname] : fname;
      video.src = src;
      video.style.display = '';
      info.textContent = "Playing: " + fname;
    };
  });
};