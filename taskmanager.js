window.TaskManagerApp = function(container) {
  function reload() {
    const openWins = window.openWindows || {};
    const entries = Object.entries(openWins)
      .filter(([id, win]) => win && win.querySelector && win.querySelector(".window-title"))
      .map(([id, win]) => {
        const title = win.querySelector(".window-title").textContent;
        return `<li style="margin-bottom:6px;">
          <span>${title}</span>
          <button onclick="closeWindowById('${id}')" style="margin-left:15px;background:#fd3c5a;color:#fff;border:none;border-radius:7px;padding:2px 10px;">Close</button>
        </li>`;
      });
    container.innerHTML = `
      <h2>Task Manager</h2>
      <ul style="margin-top:14px;">${entries.length ? entries.join("") : "<li style='color:#aaa;'>No running apps.</li>"}</ul>
      <div style="color:#888;margin-top:12px;">(Closing Task Manager won't close other apps)</div>
    `;
  }
  reload();
  const interval = setInterval(reload, 800);
  container._taskInterval = interval;
  container.onremove = function() { clearInterval(interval); };
};
window.closeWindowById = function(id){
  if(window.openWindows && window.openWindows[id]){
    window.openWindows[id].remove();
    delete window.openWindows[id];
  }
};