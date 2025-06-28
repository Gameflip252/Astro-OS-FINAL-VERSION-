// --- Windowing system ---
window.openWindows = {};
let winCount = 0;
window.openWindow = function(title, appFunc, icon) {
  const id = "win" + (++winCount);
  const win = document.createElement("div");
  win.className = "window";
  win.style.top = (80 + winCount*16) + "px";
  win.style.left = (120 + winCount*22) + "px";
  win.innerHTML = `
    <div class="window-titlebar">
      <span class="window-title">${icon||""} ${title}</span>
      <button class="window-close">×</button>
    </div>
    <div class="window-content"></div>
  `;
  win.querySelector(".window-close").onclick = () => { win.remove(); delete window.openWindows[id]; };
  document.getElementById("windows").appendChild(win);
  window.openWindows[id] = win;
  appFunc(win.querySelector(".window-content"));
  // Simple drag
  let dragging = false, offsetX=0, offsetY=0;
  win.querySelector('.window-titlebar').onmousedown = function(e){
    dragging = true; offsetX = e.offsetX; offsetY = e.offsetY;
    document.onmousemove = function(ev){
      if(!dragging) return;
      win.style.left = (ev.clientX-offsetX) + "px";
      win.style.top = (ev.clientY-offsetY) + "px";
    };
    document.onmouseup = ()=>{ dragging = false; document.onmousemove = null; };
  };
};

// --- App registry ---
window.launchApp = function(appname) {
  const registry = {
    filemanager: {title:"File Manager", func:window.FileManagerApp, icon:"📁"},
    imageviewer: {title:"Image Viewer", func:window.ImageViewerApp, icon:"🖼️"},
  };
  if (registry[appname] && typeof registry[appname].func === "function") {
    openWindow(registry[appname].title, registry[appname].func, registry[appname].icon);
  } else {
    alert("This app is not available or not loaded: " + appname);
  }
};

// --- Desktop icons ---
function renderDesktopIcons() {
  let icons = [
    {app:'filemanager', icon:'📁', label:'Files'},
    {app:'imageviewer', icon:'🖼️', label:'Images'},
  ];
  let el = document.getElementById("desktop-icons");
  el.innerHTML = icons.map((i,j)=>`
    <div class="icon fadein desktop-app-icon" style="animation-delay:${0.05*j}s" onclick="launchApp('${i.app}')">
      ${i.icon}
      <span>${i.label}</span>
    </div>
  `).join('');
}
renderDesktopIcons();

// --- Taskbar ---
function renderTaskbarBtns() {
  let icons = [
    {app:'filemanager', icon:'📁'},
    {app:'imageviewer', icon:'🖼️'},
  ];
  let el = document.getElementById("taskbar-btns");
  el.innerHTML = icons.map(i=>`<button class="taskbar-btn" onclick="launchApp('${i.app}')">${i.icon}</button>`).join('');
}
renderTaskbarBtns();

// --- Simple file storage ---
window.getUserFiles = ()=>JSON.parse(localStorage.getItem("astra_files")||"[]");
window.setUserFiles = arr=>localStorage.setItem("astra_files",JSON.stringify(arr));
window.getUserBlobs = ()=>JSON.parse(localStorage.getItem("astra_blobs")||"{}");
window.setUserBlobs = obj=>localStorage.setItem("astra_blobs",JSON.stringify(obj));