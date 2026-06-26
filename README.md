# game
# SCP 跑团终端游戏 (SCP Terminal RPG)

> 一个基于原生终端（CMD / Bash）的文字跑团游戏，极简黑绿配色，附带网页版前端。完美适配 Windows 与 Android (Termux)。
> **🚀 特性：无需安装 Python，无需配置复杂环境，解压双击即可运行。**

![终端演示](https://img.shields.io/badge/终端-黑底绿字-00ff00?style=for-the-badge) ![平台-Windows](https://img.shields.io/badge/平台-Windows-0078d7?style=for-the-badge) ![平台-Android](https://img.shields.io/badge/平台-Android_Termux-3ddc84?style=for-the-badge)

---

## ✨ 核心特性

- **真正的零依赖运行**：不依赖 Python，不依赖 Node.js。直接利用系统底层的 SQLite 命令行工具（`sqlite3`）驱动整个游戏逻辑。
- **真实终端体验**：黑底绿字、ASCII字符风格，沉浸式跑团交互。
- **双端完美适配**：提供 Windows (`.bat`) 与 Android/Termux (`.sh`) 双平台启动脚本，原生流畅。
- **内部数据库驱动**：基于 SQLite 数据库存放玩家数据，支持密码与哈希值（Hx）双重登录验证。
- **网页版入口**：可直接在浏览器中通过 JS 模拟游玩，方便快速体验（基于浏览器 IndexedDB/内存，无磁盘权限安全隐患）。

---

## 🗂️ 项目架构与文件结构
项目根目录/
├── index.html           (GitHub Pages 入口，引导下载)
├── 404.html             (404 错误处理页)
└── app/
├── web/             (网页端工具与游戏入口)
│   ├── init_db.html (⚠️ 核心：在浏览器内存中生成 database.db 并触发下载)
│   ├── game.html    (网页在线游戏页面)
│   └── game.js      (网页版游戏核心 JS 引擎)
├── windows/         (Windows 终端包源码)
│   ├── sqlite3.exe  (打包必备：SQLite 命令行工具)
│   ├── game.bat     (Windows CMD 游戏核心脚本)
│   └── install.zip  (供下载的 Windows 终端压缩包)
└── android/         (Android/Termux 终端包源码)
├── sqlite3      (打包必备：Android 架构 SQLite 可执行文件)
├── game.sh      (Android Bash 游戏核心脚本)
└── install.zip  (供下载的 Android 终端压缩包)



## 🎮 如何开始游玩（本地终端版）

本游戏**不需要安装 Python**，只需要以下三个简单步骤即可开始跑团：

### 1. 下载数据库文件 `database.db`
由于纯终端无法通过脚本在服务器上安全地创建表结构，**您必须使用我们提供的网页工具来生成包含表结构的 `.db` 文件**。
- 打开 [GitHub Pages 首页](https://wedonot2026.github.io/game) ，点击 **“⚡ 生成并下载 database.db”**。
- 或者直接访问 `/app/web/init_db.html` 页面。
- （浏览器会利用内存生成数据库供您下载，关闭页面后内存自动释放，绝无权限安全隐患）。

### 2. 下载对应系统的终端包
- **Windows 用户**：点击首页下载 **Windows CMD 包**（获取 `install.zip`）。
- **Android 用户**：在 Termux 环境下下载 **Android Termux 包**（获取 `install.zip`）。

### 3. 解压与游玩
- 将压缩包解压到一个文件夹中。
- **将第一步下载的 `database.db` 文件放到解压后的文件夹内**（必须与 `sqlite3` 工具和脚本放在同一级目录）。
- **Windows 用户**双击 `game.bat`。
- **Android 用户**在 Termux 终端中输入 `sh game.sh`。

> **登录账号数据：**
> 初始化数据库时默认内置了一个测试账号：
> - **用户名：** `admin`
> - **密码登录：** `80800101` （对应 `pass` 字段）
> - **哈希登录：** `a2bCAcCdeziqP97AeZppA7319` （对应 `hash` 字段）

---

## 🌐 如何开始游玩（网页在线版）

如果你不方便下载终端包，可以直接在浏览器中体验。
- 访问 `https://wedonot2026.github.io/game/app/web/game.html`。
- 网页版会自动读取浏览器内的 `IndexedDB` 数据，并提供与终端完全相同的功能玩法（攻击、买装备、建合金房等）。


