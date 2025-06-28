window.TerminalApp = function(container) {
  let commandHistory = [];
  let historyIndex = -1;

  container.innerHTML = `
    <h2 style="margin-bottom:12px;">Terminal</h2>
    <pre id="term-out" style="background:#101521;padding:12px 9px;height:180px;overflow:auto;border-radius:8px;"></pre>
    <form id="term-form" autocomplete="off" style="margin-top:10px;">
      <span style="color:#5af;">$</span>
      <input id="term-input" style="width:72%;background:#222;border:none;color:#fff;padding:7px 9px;font-family:monospace;font-size:1em;border-radius:7px;" />
      <button type="submit" style="padding:7px 16px;border-radius:7px;background:#38407a;color:#fff;border:none;margin-left:10px;">Run</button>
    </form>
  `;
  const out = container.querySelector("#term-out");
  const form = container.querySelector("#term-form");
  const input = container.querySelector("#term-input");
  out.textContent = `Astra Terminal\nType 'help' for common commands, 'helpdev' for advanced/developer commands.\n`;

  const getFiles = () => (typeof getUserFiles === "function" ? getUserFiles() : []);
  const getBlobs = () => (typeof getUserBlobs === "function" ? getUserBlobs() : {});
  const setFiles = (arr) => (typeof setUserFiles === "function" ? setUserFiles(arr) : undefined);
  const setBlobs = (obj) => (typeof setUserBlobs === "function" ? setUserBlobs(obj) : undefined);

  let envVars = {};

  async function handleCommand(cmdline) {
    let res = "";
    const args = cmdline.split(/\s+/);
    const files = getFiles();
    const blobs = getBlobs();

    if (cmdline === "help") {
      res = [
        "help - Show this help",
        "whoami - Show your username",
        "files - List your files",
        "clear - Clear terminal",
        "recovery - Enter recovery mode",
        "helpdev - Show developer commands"
      ].join("\n");
    } else if (cmdline === "helpdev") {
      res = [
        "Developer/Advanced commands:",
        "ls - List files",
        "cd [folder] - Change directory (stub)",
        "pwd - Print working directory (stub)",
        "cat [filename] - Print file contents (.txt) or preview image (.jpeg, .jpg)",
        "touch [filename] - Create an empty file",
        "rm [filename] - Delete a file",
        "extractzip [filename] - Extract ZIP file (not supported without JSZip)",
        "echo [text] - Print text",
        "history - Show command history",
        "env - List environment variables",
        "setenv [KEY]=[VALUE] - Set environment variable",
        "printenv [KEY] - Print env variable",
        "osinfo - Show OS info",
        "uptime - Show uptime",
        "date - Show current date/time",
        "alias [name]=[command] - Create alias (stub)",
        "eval [js code] - Evaluate JavaScript",
        "log [msg] - Print to browser console",
        "ps - List open windows",
        "kill [appname] - Close a window",
        "open [appname] - Open an app",
        "reset - Reset user settings",
        "logout - Log out",
        "users - List users (stub)",
        "adduser [username] - Add user (stub)",
        "switchuser [username] - Switch user (stub)",
        "userdel [username] - Delete user (stub)"
      ].join("\n");
    } else if (cmdline === "whoami") {
      res = (typeof getCurrentUser === "function" && getCurrentUser()) ? getCurrentUser().username : "unknown";
    } else if (cmdline === "files" || cmdline === "ls") {
      res = files.length ? files.join("\n") : "(no files)";
    } else if (cmdline === "clear") {
      out.textContent = "";
      return;
    } else if (cmdline === "recovery") {
      res = "(entered recovery mode)";
    } else if (cmdline === "history") {
      res = commandHistory.length ? commandHistory.join("\n") : "(no history)";
    } else if (cmdline === "env") {
      res = Object.keys(envVars).length ? Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join("\n") : "(no env vars set)";
    } else if (args[0] === "setenv" && args[1]) {
      const [k, v] = args[1].split("=");
      if (k && v !== undefined) {
        envVars[k] = v;
        res = `Set ${k}=${v}`;
      } else {
        res = "Usage: setenv KEY=VALUE";
      }
    } else if (args[0] === "printenv" && args[1]) {
      res = envVars[args[1]] !== undefined ? envVars[args[1]] : "(not set)";
    } else if (cmdline === "osinfo") {
      res = [
        "Astra OS Desktop (Web Edition)",
        "Version: 1.0",
        "Platform: " + (navigator.platform || "?"),
        "User Agent: " + (navigator.userAgent || "?")
      ].join("\n");
    } else if (cmdline === "uptime") {
      if (!window._astraUptimeStart) window._astraUptimeStart = Date.now();
      const sec = Math.floor((Date.now() - window._astraUptimeStart) / 1000);
      res = `Uptime: ${Math.floor(sec/60)}m ${sec%60}s`;
    } else if (cmdline === "date") {
      res = new Date().toString();
    } else if (args[0] === "echo") {
      res = cmdline.slice(5);
    } else if (args[0] === "touch" && args[1]) {
      const fname = args[1];
      if (!files.includes(fname)) {
        files.push(fname);
        // For .txt files, initialize as a blank text file
        if (fname.endsWith('.txt')) {
          blobs[fname] = "data:text/plain;base64,";
        } else {
          blobs[fname] = "";
        }
        setFiles(files);
        setBlobs(blobs);
        res = `Created: ${fname}`;
      } else {
        res = `${fname} already exists`;
      }
    } else if (args[0] === "rm" && args[1]) {
      const fname = args[1];
      if (files.includes(fname)) {
        files.splice(files.indexOf(fname), 1);
        delete blobs[fname];
        setFiles(files);
        setBlobs(blobs);
        res = `Deleted: ${fname}`;
      } else {
        res = `${fname} not found`;
      }
    } else if (args[0] === "cat" && args[1]) {
      const fname = args[1];
      if (files.includes(fname)) {
        const data = blobs[fname];
        // Show .txt file as text
        if (fname.match(/\.txt$/i) && data && data.startsWith("data:")) {
          try {
            const fetched = await fetch(data);
            const txt = await fetched.text();
            res = txt;
          } catch {
            res = "(unreadable .txt file)";
          }
        // Show .jpeg/.jpg file as image preview (prints a base64 img tag)
        } else if (fname.match(/\.(jpeg|jpg)$/i) && data && data.startsWith("data:")) {
          res = `[image] <img src="${data}" alt="${fname}" style="max-width:100%;max-height:160px;border-radius:6px;">`;
        } else if (data && data.startsWith("data:")) {
          try {
            const fetched = await fetch(data);
            const txt = await fetched.text();
            res = txt;
          } catch {
            res = "(binary or unreadable file)";
          }
        } else {
          res = blobs[fname] || "";
        }
      } else {
        res = `${fname} not found`;
      }
    } else if (args[0] === "extractzip" && args[1]) {
      res = "ZIP file extraction is not supported in this browser build (no JSZip).";
    } else if (cmdline === "ps") {
      const openWins = window.openWindows || {};
      const entries = Object.entries(openWins)
        .filter(([id, win]) => win && win.querySelector && win.querySelector(".window-title"))
        .map(([id, win]) => win.querySelector(".window-title").textContent);
      res = entries.length ? entries.join("\n") : "(no running apps)";
    } else if (args[0] === "kill" && args[1]) {
      const appname = args.slice(1).join(" ");
      const openWins = window.openWindows || {};
      let closed = false;
      Object.entries(openWins).forEach(([id, win]) => {
        if (win && win.querySelector && win.querySelector(".window-title") && 
            win.querySelector(".window-title").textContent.toLowerCase().includes(appname.toLowerCase())) {
          win.remove();
          delete window.openWindows[id];
          closed = true;
        }
      });
      res = closed ? `Closed: ${appname}` : `${appname} not found`;
    } else if (args[0] === "open" && args[1]) {
      const appname = args[1].toLowerCase();
      if (typeof window.launchApp === "function") {
        window.launchApp(appname);
        res = `Launched: ${appname}`;
      } else {
        res = "App launcher not available";
      }
    } else if (args[0] === "eval" && args.length > 1) {
      try {
        // eslint-disable-next-line no-eval
        const val = eval(cmdline.slice(5));
        res = String(val);
      } catch (e) {
        res = "Error: " + e;
      }
    } else if (args[0] === "log" && args.length > 1) {
      console.log(cmdline.slice(4));
      res = "Logged to console.";
    } else if (["cd", "pwd", "mkdir", "rmdir"].includes(args[0])) {
      res = "Directory/folder support is not implemented in this version (stub).";
    } else if (args[0] === "alias" && args[1]) {
      res = "Alias feature is a stub. (Would alias: " + args[1] + ")";
    } else if (args[0] === "users") {
      res = "(stub) Only one user supported in this version.";
    } else if (args[0] === "adduser" && args[1]) {
      res = `(stub) User '${args[1]}' added. (Not really)`;
    } else if (args[0] === "switchuser" && args[1]) {
      res = `(stub) Switched to user '${args[1]}'. (Not really)`;
    } else if (args[0] === "userdel" && args[1]) {
      res = `(stub) User '${args[1]}' deleted. (Not really)`;
    } else if (cmdline === "reset") {
      res = "User settings reset (background/theme/avatar not auto-restored).";
    } else if (cmdline === "logout") {
      res = "(logged out)";
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("astra_current_user");
        if (typeof showAccountTab === "function") showAccountTab();
      }
    } else {
      res = "Unknown command. Type 'help' or 'helpdev'.";
    }
    // If an image preview, show as HTML in the terminal
    if (res.startsWith("[image] ")) {
      out.innerHTML += `<br>$ ${cmdline}<br>${res}<br>`;
    } else {
      out.textContent += "\n$ " + cmdline + "\n" + res + "\n";
    }
    out.scrollTop = out.scrollHeight;
  }

  form.onsubmit = async function(e){
    e.preventDefault();
    const cmdline = input.value.trim();
    if (!cmdline) return false;
    commandHistory.push(cmdline);
    if (commandHistory.length > 100) commandHistory.shift();
    historyIndex = -1;
    input.value = "";
    await handleCommand(cmdline);
    return false;
  };

  input.addEventListener("keydown", function(e) {
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      if (!commandHistory.length) return;
      if (e.key === "ArrowUp") {
        if (historyIndex === -1) historyIndex = commandHistory.length - 1;
        else if (historyIndex > 0) historyIndex--;
      } else if (e.key === "ArrowDown") {
        if (historyIndex !== -1 && historyIndex < commandHistory.length - 1) historyIndex++;
        else historyIndex = -1;
      }
      input.value = historyIndex === -1 ? "" : commandHistory[historyIndex];
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      e.preventDefault();
    }
  });
};