// === 1. 全局配置与状态 ===
const IDB_NAME = 'sthing.db';
const STORE_NAME = 'sqlite_binary';
let SQL = null;
let db = null;
let gameState = { username: '', money: 0, level: '杀手', base: '无' };

// === 2. 从 IndexedDB 还原数据库 ===
async function initApp() {
    // 加载 sql.js
    const config = { locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}` };
    SQL = await initSqlJs(config);
    showLog("[系统] 引擎加载成功，正在从内部数据库 (sthing.db) 同步...");

    // 从 IndexedDB 读取
    const data = await new Promise((resolve) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onsuccess = (e) => {
            const dbIDB = e.target.result;
            const tx = dbIDB.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get('sqlite_data');
            getReq.onsuccess = () => resolve(getReq.result);
            getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
    });

    if (!data) {
        showLog("[错误] 没有找到内部数据库！请先去首页点击 [初始化数据库]！");
        return;
    }
    
    // 重建内存 SQLite 数据库
    const uintArray = new Uint8Array(data);
    db = new SQL.Database(uintArray);
    showLog("[系统] 内存数据库成功加载！请输入用户名与验证码登录。");
}

// === 3. 登录逻辑 ===
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const token = document.getElementById('token').value.trim();
    const mode = document.getElementById('auth_mode').value; // pass or hash

    if(!db) return showLog("[警告] 数据库未加载");

    // 从 SQLite 内存数据库查询
    const stmt = db.prepare("SELECT pass, hash, money, level, base FROM users WHERE username = ?");
    stmt.bind([username]);
    if (!stmt.step()) {
        showLog("错误：用户不存在！");
        stmt.free();
        return;
    }
    const row = stmt.getAsObject();
    stmt.free();

    let valid = false;
    if (mode === 'password' && row.pass === token) valid = true;
    else if (mode === 'hash' && row.hash === token) valid = true;

    if (!valid) {
        showLog(`错误：${mode === 'password' ? '密码' : '哈希'}验证失败！`);
        return;
    }

    showLog(`[+] 登录成功！欢迎回来，${username}`);
    gameState = { username, money: row.money, level: row.level, base: row.base };
    
    document.getElementById('login-area').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    showLog(`>>> 资金: $${gameState.money}, 等级: ${gameState.level}, 基地: ${gameState.base}`);
}

// === 4. 游戏引擎与数据库保存 ===
function saveGameToIndexedDB() {
    // 由于操作频繁，我们在每次大动作后手动将内存保存到 IndexedDB
    const binaryData = db.export();
    const req = indexedDB.open(IDB_NAME, 1);
    req.onsuccess = (e) => {
        const dbIDB = e.target.result;
        const tx = dbIDB.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(binaryData, 'sqlite_data');
    };
}

function executeGameCommand() {
    const input = document.getElementById('cmd-input');
    const cmd = input.value.trim();
    if(!cmd) return;
    input.value = '';
    showLog(`>>> ${cmd}`);
    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();

    if (action === 'help') {
        showLog("指令: status (状态), attack (攻击), buy 物品 数量 (购买), save (手动保存)");
    } else if (action === 'status') {
        showLog(`资金: $${gameState.money}, 等级: ${gameState.level}, 基地: ${gameState.base}`);
    } else if (action === 'attack') {
        const reward = Math.floor(Math.random() * 500000) + 10000;
        gameState.money += reward;
        const lvl = checkLevelUp(gameState.money);
        if(lvl !== gameState.level) {
            gameState.level = lvl;
            showLog(`[升级] 恭喜晋升为 ${gameState.level}`);
        }
        showLog(`攻击成功！获得 $${reward}`);
        // 更新数据库内存
        db.run("UPDATE users SET money = ?, level = ? WHERE username = ?", [gameState.money, gameState.level, gameState.username]);
        saveGameToIndexedDB();
        showLog("[系统] 自动保存至内部数据库。");
    } else if (action === 'buy') {
        const item = parts[1], qty = parseInt(parts[2]);
        if (!item || isNaN(qty)) return showLog("格式: buy 导弹/无人机/预警机 数量");
        let price = item === '导弹' ? 20000 : item === '无人机' ? 50000 : 1000000;
        const total = price * qty;
        if (gameState.money < total) return showLog(`资金不足！需要 $${total}`);
        gameState.money -= total;
        showLog(`成功买入 ${qty} 个 ${item}`);
        db.run("UPDATE users SET money = ? WHERE username = ?", [gameState.money, gameState.username]);
        saveGameToIndexedDB();
    } else if (action === 'exit') {
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('terminal-output').innerHTML = '';
    } else {
        showLog(`未知指令: ${action}`);
    }
}

function checkLevelUp(money) {
    if (money >= 1000000000) return "世界第一";
    if (money >= 500000000) return "世界前五";
    if (money >= 100000000) return "世界前十";
    if (money >= 10000000) return "世界百强";
    if (money >= 1000000) return "世界富豪";
    return "杀手";
}

// === 5. 界面辅助工具 ===
function showLog(text) {
    const out = document.getElementById('terminal-output');
    const div = document.createElement('div');
    div.innerHTML = text.replace(/\n/g, '<br>');
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
}

window.onload = () => {
    initApp();
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-submit-cmd').addEventListener('click', executeGameCommand);
    document.getElementById('cmd-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeGameCommand();
    });
};
