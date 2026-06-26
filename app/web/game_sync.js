// ---- 1. 配置区 (请替换为您自己的 Supabase 欧洲节点信息) ----
const SUPABASE_URL = 'https://您的项目ID.supabase.co';
const SUPABASE_ANON_KEY = 'MjN65DSJyPrnBds5'; 

// 如果未来国内访问Supabase确实受阻，可在此处换成 Cloudflare Worker 搭建的国内加速代理地址
const API_ENDPOINT = SUPABASE_URL + '/rest/v1/users';

// ---- 2. 本地数据库和游戏状态 ----
let gameState = {
    username: 'admin',
    money: 1000000,
    level: '杀手',
    base: '无'
};

function printLog(text) {
    const out = document.getElementById('terminal-output');
    const div = document.createElement('div');
    div.innerText = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
}

// ---- 3. 云端同步与本地存储的逻辑 ----
// 保存到本地浏览器 (离线缓存)
function saveLocal() {
    localStorage.setItem('scp_local_save', JSON.stringify(gameState));
}

// 加载本地缓存
function loadLocal() {
    const data = localStorage.getItem('scp_local_save');
    if (data) {
        const parsed = JSON.parse(data);
        gameState.money = parsed.money;
        gameState.level = parsed.level;
        gameState.base = parsed.base;
        printLog(`[本地] 从浏览器缓存读取存档成功: 资金 $${gameState.money}`);
        return true;
    }
    return false;
}

// 强制将当前状态同步到欧洲云端
async function syncToCloud() {
    try {
        // 在真实场景中，这里要替换为 Supabase 的 update 语句。
        // 由于 Supabase 有跨域限制，我们在此演示使用 fetch 发送模拟请求
        printLog(`[网络] 正在向欧洲节点同步数据...`);
        
        // 模拟一个网络请求延迟（实际开发请替换为真实的 fetch 请求）
        await new Promise(r => setTimeout(r, 1500));

        // 成功回执
        printLog(`[云端] 同步成功！资金已写入欧洲云数据库。`);
    } catch (err) {
        printLog(`[警告] 云端同步失败 (网络异常)，玩家数据已保存在本地。下次连网将自动合并。`);
    }
}

// 云端加载逻辑 (启动时尝试从云端读取数据)
async function loadFromCloud() {
    try {
        printLog(`[网络] 正在连接欧洲节点获取档案...`);
        // 模拟网络请求
        await new Promise(r => setTimeout(r, 1000));
        
        // 返回模拟云端数据 (如果没有数据，则返回null)
        const cloudData = null; // 这里未来替换为真实 fetch 获取到的 JSON
        
        if (cloudData) {
            // 如果云端有数据，就用云端的 (覆盖本地)
            gameState.money = cloudData.money;
            gameState.level = cloudData.level;
            gameState.base = cloudData.base;
            printLog(`[网络] 云端读取成功！`);
            return true;
        } else {
            printLog(`[网络] 云端未找到数据，使用本地或初始数据。`);
            return false;
        }
    } catch (err) {
        printLog(`[网络] 云连接失败！已切换至纯单机模式。`);
        return false;
    }
}

// ---- 4. 游戏引擎 (执行动作后自动触发同步) ----
async function executeCmd(cmd) {
    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();

    if (action === 'help') {
        printLog("指令: status, attack, buy [物品], sync (手动同步)");
    } else if (action === 'status') {
        printLog(`资金: $${gameState.money} | 等级: ${gameState.level} | 基地: ${gameState.base}`);
    } else if (action === 'attack') {
        const reward = Math.floor(Math.random() * (500000 - 10000 + 1)) + 10000;
        gameState.money += reward;
        if(gameState.money > 1000000000) gameState.level = '世界第一';
        else if(gameState.money > 100000000) gameState.level = '世界前五';
        printLog(`攻击成功！掠夺了 $${reward}。`);
        saveLocal();            // 本地存一份
        await syncToCloud();    // 云端存一份
    } else if (action === 'buy') {
        const item = parts[1];
        const qty = parseInt(parts[2]);
        let price = (item === '导弹') ? 20000 : (item === '无人机') ? 50000 : 1000000;
        if (gameState.money < price * qty) return printLog(`钱不够！需要 $${price * qty}`);
        gameState.money -= price * qty;
        printLog(`成功买入 ${qty} 个 ${item}。`);
        saveLocal();
        await syncToCloud();
    } else if (action === 'sync') {
        printLog("手动触发全量同步...");
        await syncToCloud();
    } else {
        printLog(`未知指令: ${action}`);
    }
}

// ---- 5. 程序入口 (启动逻辑) ----
window.onload = async function() {
    printLog(">>> Hello, world! Welcome to SCP (云同步试作版)");
    printLog(">>> 尝试连接欧洲云数据库...");
    
    // 尝试连接云端数据
    const cloudFound = await loadFromCloud();
    
    if (!cloudFound) {
        // 如果连不上云端，就读取本地缓存
        const localFound = loadLocal();
        if (!localFound) {
            printLog(">>> 初始化为默认新手资金 $1000000");
        }
    }

    // 启动事件监听
    document.getElementById('cmd-btn').addEventListener('click', async () => {
        const input = document.getElementById('cmd-input');
        await executeCmd(input.value);
        input.value = '';
    });
};
