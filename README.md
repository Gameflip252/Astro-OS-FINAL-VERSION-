# Astra OS Desktop – Terminal Command Reference

Welcome to **Astra OS Desktop**!  
This document lists and explains all available terminal commands, including file handling, developer, and system commands.  
The Terminal app gives you a familiar way to interact with your files and system using simple commands.

---

## 📋 General Commands

| Command              | Description                                  |
|----------------------|----------------------------------------------|
| `help`               | Show basic help and common commands.         |
| `helpdev`            | Show advanced/developer commands.            |
| `clear`              | Clear the terminal window.                   |
| `history`            | Show your command history.                   |
| `echo [text]`        | Print text to the terminal.                  |

---

## 👤 User/System Info

| Command         | Description                                |
|-----------------|--------------------------------------------|
| `whoami`        | Show your username.                        |
| `osinfo`        | Show Astra OS version and system info.     |
| `uptime`        | Show how long Astra OS has been running.   |
| `date`          | Show the current date and time.            |

---

## 📁 File Commands

| Command                  | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| `files` or `ls`          | List your files.                                                   |
| `cat [filename]`         | Print file content for `.txt` files, or preview `.jpeg`/`.jpg` images. |
| `touch [filename]`       | Create a new, empty file (blank `.txt` supported).                 |
| `rm [filename]`          | Delete a file.                                                     |

---

## 🖼️ Image Handling

- When you run `cat myphoto.jpg` or `cat myphoto.jpeg`, the image is previewed directly in the terminal.
- To view and browse all images, use the **Image Viewer** app from your desktop.

---

## 🌐 Developer & Advanced Commands

| Command                      | Description                                                        |
|------------------------------|--------------------------------------------------------------------|
| `env`                        | List environment variables.                                        |
| `setenv KEY=VALUE`           | Set an environment variable.                                       |
| `printenv KEY`               | Print the value of an environment variable.                        |
| `ps`                         | List all open application windows.                                 |
| `kill [appname]`             | Close an app window by name (e.g. `kill terminal`).                |
| `open [appname]`             | Launch an app by name (e.g. `open filemanager`).                   |
| `eval [js code]`             | Evaluate JavaScript code (for advanced use).                       |
| `log [message]`              | Print a message to the browser console.                            |
| `extractzip [filename]`      | (Stub) Extraction not supported without JSZip.                     |
| `cd`, `pwd`, `mkdir`, `rmdir`| Directory commands (not implemented; stub only).                   |
| `alias [name]=[command]`     | Alias (stub only).                                                 |

---

## 👥 User Management (Stub)

| Command                | Description                                 |
|------------------------|---------------------------------------------|
| `users`                | List users (stub; only one user supported). |
| `adduser [username]`   | Add user (stub; not functional).            |
| `switchuser [username]`| Switch user (stub; not functional).         |
| `userdel [username]`   | Delete user (stub; not functional).         |

---

## ⚙️ Session and Recovery

| Command      | Description                                             |
|--------------|---------------------------------------------------------|
| `reset`      | Reset user settings (theme, avatar, etc. not restored). |
| `logout`     | Log out of your session.                                |
| `recovery`   | Enter recovery mode (stub).                             |

---

## 🔎 Tips

- Use arrow keys (`↑`/`↓`) to browse your command history.
- File extensions matter: `.txt` files are shown as text, `.jpeg`/`.jpg` as images.
- All commands are **case-sensitive**.

---

## 🖥️ Apps You Can Open

You can launch these apps using the terminal `open [appname]` command or using desktop icons:
- `filemanager`
- `imageviewer`

---

## 📝 Example Terminal Usage

```shell
ls
touch hello.txt
cat hello.txt
rm hello.txt
cat photo.jpg
open imageviewer
setenv GREETING=Hello
printenv GREETING
```

---

Enjoy exploring Astra OS Desktop!
