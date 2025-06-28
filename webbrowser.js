window.WebBrowserApp = function(container) {
  // Helper to sanitize and ensure http/https prefix
  function normalizeUrl(url) {
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }

  container.innerHTML = `
    <h2>Web Browser</h2>
    <form id="browser-bar" style="display:flex;gap:8px;margin-bottom:10px;">
      <input type="text" id="browser-url" placeholder="Enter URL..." style="flex:1;padding:7px 10px;border-radius:7px;border:none;background:#232943;color:#fff;font-size:1.06em;" />
      <button type="submit" style="padding:7px 20px;border-radius:7px;background:#38407a;color:#fff;border:none;">Go</button>
    </form>
    <iframe id="browser-iframe" style="width:100%;height:340px;border-radius:12px;border:none;background:#181b29;transition:box-shadow 0.22s;box-shadow:0 2px 18px #0004;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    <div id="browser-info" style="margin-top:10px;color:#bbb;font-size:0.97em;"></div>
    <style>
      #browser-iframe:focus { box-shadow:0 0 0 3px #67aaff; }
    </style>
  `;

  const form = container.querySelector("#browser-bar");
  const input = container.querySelector("#browser-url");
  const iframe = container.querySelector("#browser-iframe");
  const info = container.querySelector("#browser-info");

  // Try to load last URL if present
  let lastUrl = localStorage.getItem("astra_browser_lasturl") || "";
  if (lastUrl) {
    input.value = lastUrl;
    iframe.src = normalizeUrl(lastUrl);
    info.textContent = "Loaded: " + lastUrl;
  }

  // On submit/load
  form.onsubmit = function(e) {
    e.preventDefault();
    let url = normalizeUrl(input.value);
    iframe.src = url;
    info.textContent = "Loading: " + url;
    localStorage.setItem("astra_browser_lasturl", url);
    return false;
  };

  // Update info when iframe loads
  iframe.onload = function() {
    info.textContent = "Loaded: " + input.value.trim();
  };
};