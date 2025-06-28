const defaultAvatar = "data:image/svg+xml;utf8,<svg width='80' height='80' xmlns='http://www.w3.org/2000/svg'><circle cx='40' cy='40' r='40' fill='%2338407a'/><text x='50%' y='58%' text-anchor='middle' font-size='40' fill='white' font-family='Arial' dy='.3em'>👤</text></svg>";

function getAccounts() {
  let accs = JSON.parse(localStorage.getItem("astra_accounts") || "[]");
  return Array.isArray(accs) ? accs : [];
}
function saveAccounts(accs) {
  localStorage.setItem("astra_accounts", JSON.stringify(accs));
}
function getCurrentUser() {
  let id = localStorage.getItem("astra_current_user") || "";
  let accs = getAccounts();
  return accs.find(u => u.id === id) || null;
}
function setCurrentUser(id) {
  localStorage.setItem("astra_current_user", id);
}
function genId() { return Math.random().toString(36).slice(2,10)+"_"+Date.now(); }

function showAccountTab() {
  document.getElementById("account-screen").style.display = "none";
  document.getElementById("desktop").style.display = "none";
  document.getElementById("taskbar").style.display = "none";
  let tab = document.getElementById("account-switch-tab");
  if (!tab) {
    tab = document.createElement("div");
    tab.id = "account-switch-tab";
    tab.style.position = "fixed";
    tab.style.bottom = "20px";
    tab.style.left = "50%";
    tab.style.transform = "translateX(-50%)";
    tab.style.background = "#262e4b";
    tab.style.color = "#fff";
    tab.style.padding = "10px 32px";
    tab.style.borderRadius = "12px";
    tab.style.boxShadow = "0 2px 12px #0008";
    tab.style.fontWeight = "bold";
    tab.style.cursor = "pointer";
    tab.style.zIndex = "9999";
    tab.textContent = "Switch Account";
    document.body.appendChild(tab);
    tab.onclick = showAccountManagePage;
  }
}

function showAccountManagePage() {
  // Remove tab
  let tab = document.getElementById("account-switch-tab");
  if (tab) tab.remove();
  // Remove any old page
  let oldPage = document.getElementById("account-manage-page");
  if (oldPage) oldPage.remove();
  // Show fullscreen page
  let accManage = document.createElement("div");
  accManage.id = "account-manage-page";
  accManage.style.position = "fixed";
  accManage.style.top = "0";
  accManage.style.left = "0";
  accManage.style.width = "100vw";
  accManage.style.height = "100vh";
  accManage.style.background = "rgba(20,24,36,0.98)";
  accManage.style.zIndex = "9998";
  accManage.style.display = "flex";
  accManage.style.flexDirection = "column";
  accManage.style.justifyContent = "center";
  accManage.style.alignItems = "center";
  accManage.style.padding = "0";
  accManage.style.margin = "0";
  accManage.style.boxSizing = "border-box";
  accManage.style.overflowY = "auto";
  document.body.appendChild(accManage);

  function rerender() {
    let accs = getAccounts();
    let html = `
      <div style="width:100vw;max-width:100vw;height:100vh;max-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="background:#24305c;border-radius:0;width:100vw;max-width:420px;padding:34px 14px 28px 14px;box-shadow:0 2px 18px #0006;max-height:95vh;overflow-y:auto;">
          <h2 style="text-align:center;margin-top:0;">Account Management</h2>
          <div style="margin-bottom:22px;">
          ${
            accs.length ?
            accs.map(acc => `
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;">
                <img src="${acc.avatar || defaultAvatar}" style="width:38px;height:38px;border-radius:50%;background:#344178;">
                <span style="font-weight:bold;font-size:1.11em;">${acc.username}</span>
                <button style="margin-left:18px;padding:5px 16px;border-radius:7px;background:#29a4fc;color:#fff;border:none;cursor:pointer;font-weight:bold;" onclick="switchAccount('${acc.id}')">Switch</button>
                <button style="margin-left:8px;padding:5px 13px;border-radius:7px;background:#dc3958;color:#fff;border:none;cursor:pointer;" onclick="deleteAccount('${acc.id}')">Delete</button>
              </div>
            `).join('')
            : `<div style="color:#eee;text-align:center;">No accounts yet. Create one below.</div>`
          }
          </div>
          <form id="acc-create-form" style="margin-top:20px;text-align:center;">
            <input type="text" id="acc-create-name" placeholder="New Username" maxlength="16" required style="padding:7px 13px;border-radius:8px;border:none;margin-bottom:8px;">
            <button type="submit" style="padding:7px 18px;border-radius:8px;">Create Account</button>
            <div id="acc-create-err" style="color:#fd3c5a;margin-top:8px;"></div>
          </form>
          <div style="margin-top:22px;text-align:center;">
            <button id="acc-manage-close" style="padding:6px 25px;border-radius:9px;background:#364b7a;color:#fff;border:none;font-weight:bold;">Close</button>
          </div>
        </div>
      </div>
    `;
    accManage.innerHTML = html;

    // Bind new account form
    accManage.querySelector("#acc-create-form").onsubmit = function(e) {
      e.preventDefault();
      let name = accManage.querySelector("#acc-create-name").value.trim();
      if(!name) { accManage.querySelector("#acc-create-err").textContent = "Enter a username!"; return false; }
      let accs = getAccounts();
      let id = genId();
      accs.push({id, username: name, avatar: defaultAvatar});
      saveAccounts(accs);
      setCurrentUser(id);
      location.reload();
    };

    // Bind close
    accManage.querySelector("#acc-manage-close").onclick = function() {
      accManage.remove();
      showAccountTab();
    };
  }
  window.switchAccount = function(id) {
    setCurrentUser(id);
    location.reload();
  }
  window.deleteAccount = function(id) {
    let accs = getAccounts();
    let idx = accs.findIndex(x=>x.id===id);
    if(idx>-1) {
      if(confirm("Delete this account?")) {
        accs.splice(idx,1);
        saveAccounts(accs);
        if(localStorage.getItem("astra_current_user")===id) {
          localStorage.removeItem("astra_current_user");
        }
        rerender();
      }
    }
  }
  rerender();
}

window.onload = function() {
  let accScreen = document.getElementById("account-screen");
  let desktop = document.getElementById("desktop");
  let taskbar = document.getElementById("taskbar");
  accScreen.classList.remove("show");
  desktop.classList.remove("show");
  taskbar.classList.remove("show");
  if (!getCurrentUser()) {
    showAccountTab();
  } else {
    accScreen.style.display = "none";
    desktop.style.display = "";
    taskbar.style.display = "";
    desktop.classList.add("show");
    taskbar.classList.add("show");
    renderDesktopIcons();
    renderTaskbarBtns();
    renderClock();
    const clock = document.getElementById("clock");
    if (clock) {
      clock.style.cursor = "pointer";
      clock.title = "Click to log out and switch account";
      clock.onclick = function() {
        localStorage.removeItem("astra_current_user");
        showAccountTab();
      };
    }
  }
};

function renderDesktopIcons() {
  let icons = [
    {app:'filemanager', icon:'📁', label:'Files'},
    {app:'videoplayer', icon:'🎬', label:'Video'},
    {app:'webbrowser', icon:'🌐', label:'Browser'},
    {app:'music', icon:'🎵', label:'Music'},
    {app:'terminal', icon:'🖳', label:'Terminal'},
    {app:'settings', icon:'⚙️', label:'Settings'},
    {app:'taskmanager', icon:'📊', label:'TaskMgr'},
    {app:'download', icon:'⬇️', label:'Download'}
  ];
  let el = document.getElementById("desktop-icons");
  el.innerHTML = icons.map((i,j)=>`
    <div class="icon fadein desktop-app-icon" style="animation-delay:${0.05*j}s" onclick="launchApp('${i.app}')">
      ${i.icon}
      <span>${i.label}</span>
    </div>
  `).join('');
}
function renderTaskbarBtns() {
  let icons = [
    {app:'filemanager', icon:'📁'},
    {app:'webbrowser', icon:'🌐'},
    {app:'videoplayer', icon:'🎬'},
    {app:'music', icon:'🎵'},
    {app:'terminal', icon:'🖳'},
    {app:'settings', icon:'⚙️'},
    {app:'taskmanager', icon:'📊'},
    {app:'download', icon:'⬇️'}
  ];
  let el = document.getElementById("taskbar-btns");
  el.innerHTML = icons.map(i=>`<button class="taskbar-btn" onclick="launchApp('${i.app}')">${i.icon}</button>`).join('');
}
function renderClock() {
  function updateClock() {
    let now = new Date();
    let text = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}) +
      ' ' + now.toLocaleDateString();
    document.getElementById("clock").textContent = text;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// --- Window manager ---
window.openWindows = {};
let zIndexCounter = 100;
window.launchApp = function(appname) {
  const registry = {
    filemanager: {title:"File Manager", func:window.FileManagerApp, icon:"📁"},
    videoplayer: {title:"Video Player", func:window.VideoPlayerApp, icon:"🎬"},
    webbrowser: {title:"Web Browser", func:window.WebBrowserApp, icon:"🌐"},
    music: {title:"Music Player", func:window.MusicApp, icon:"🎵"},
    terminal: {title:"Terminal", func:window.TerminalApp, icon:"🖳"},
    settings: {title:"Settings", func:window.SettingsApp, icon:"⚙️"},
    taskmanager: {title:"Task Manager", func:window.TaskManagerApp, icon:"📊"},
    download: {title:"Download", func:window.DownloadApp, icon:"⬇️"},
  };
  if (registry[appname] && typeof registry[appname].func === "function") {
    openWindow(registry[appname].title, registry[appname].func, registry[appname].icon);
  } else {
    alert("This app is not available or not loaded: " + appname);
  }
};

function openWindow(title, appFunc, icon) {
  const winId = 'window-' + title.replace(/\s+/g, '').toLowerCase();
  if (window.openWindows[winId] && document.body.contains(window.openWindows[winId])) {
    const existing = window.openWindows[winId];
    existing.style.display = '';
    existing.style.zIndex = zIndexCounter++;
    existing.classList.add('focus');
    setTimeout(() => existing.classList.remove('focus'), 450);
    return;
  }
  if (window.openWindows[winId] && !document.body.contains(window.openWindows[winId])) {
    delete window.openWindows[winId];
  }
  const win = document.createElement('div');
  win.className = 'window fade';
  win.id = winId;
  const winWidth = 600, winHeight = 400;
  win.style.width = winWidth + "px";
  win.style.height = winHeight + "px";
  win.style.left = `calc(50vw - ${winWidth / 2}px)`;
  win.style.top = `calc(50vh - ${winHeight / 2}px)`;
  win.style.zIndex = zIndexCounter++;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `<span class="window-title">${icon || ''} ${title}</span>`;
  const controls = document.createElement('span');
  controls.className = 'window-controls';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'wctrl';
  closeBtn.title = "Close";
  closeBtn.innerHTML = '×';
  controls.appendChild(closeBtn);
  header.appendChild(controls);
  win.appendChild(header);

  const content = document.createElement('div');
  content.className = 'window-content';
  appFunc(content);
  win.appendChild(content);

  const resizer = document.createElement('div');
  resizer.className = 'window-resizer';
  win.appendChild(resizer);

  document.body.appendChild(win);
  window.openWindows[winId] = win;
  setTimeout(()=>win.classList.add("show"),16);

  let dragging = false, dragOffsetX = 0, dragOffsetY = 0;
  header.onmousedown = function(e) {
    if (e.button !== 0) return;
    dragging = true;
    dragOffsetX = e.clientX - win.offsetLeft;
    dragOffsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = "none";
  };
  document.addEventListener('mousemove', function(e) {
    if (dragging) {
      let x = e.clientX - dragOffsetX;
      let y = e.clientY - dragOffsetY;
      x = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, x));
      y = Math.max(0, Math.min(window.innerHeight - win.offsetHeight - 48, y));
      win.style.left = x + "px";
      win.style.top = y + "px";
    }
  });
  document.addEventListener('mouseup', function() {
    dragging = false;
    document.body.style.userSelect = "";
  });

  let resizing = false, resizeStartX = 0, resizeStartY = 0, startW = 0, startH = 0;
  resizer.onmousedown = function(e) {
    if (e.button !== 0) return;
    resizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    startW = win.offsetWidth;
    startH = win.offsetHeight;
    document.body.style.userSelect = "none";
    e.stopPropagation();
  };
  document.addEventListener('mousemove', function(e) {
    if (resizing) {
      let newW = Math.max(320, Math.min(window.innerWidth - win.offsetLeft, startW + (e.clientX - resizeStartX)));
      let newH = Math.max(180, Math.min(window.innerHeight - win.offsetTop - 48, startH + (e.clientY - resizeStartY)));
      win.style.width = newW + "px";
      win.style.height = newH + "px";
    }
  });
  document.addEventListener('mouseup', function() {
    resizing = false;
    document.body.style.userSelect = "";
  });

  closeBtn.onclick = () => {
    win.classList.remove("show");
    win.classList.add('closing');
    setTimeout(() => {
      win.remove();
      delete window.openWindows[winId];
    }, 400);
  };
}