@echo off
setlocal enabledelayedexpansion
set DB=database.db

:start
if not exist "%DB%" (
    echo [错误] 未找到 database.db 文件！请先从网页下载并放至同目录。
    pause
    exit
)

:login
set /p user="用户名 (默认为 admin): "
if "!user!"=="" set user=admin
set /p pass="密码/哈希值: "
for /f "tokens=1,2 delims=|" %%a in ('sqlite3 %DB% "SELECT pass, hash FROM users WHERE username='!user!';"') do (
    set db_pass=%%a
    set db_hash=%%b
)
if "!db_pass!"=="" (
    echo 用户不存在！
    goto login
)
if "!pass!"=="!db_pass!" (
    echo [+] 密码验证成功！
) else if "!pass!"=="!db_hash!" (
    echo [+] 哈希值验证成功！
) else (
    echo [-] 验证失败！
    goto login
)

:main
echo.
set /p cmd=">>> "
if "!cmd!"=="exit" exit

if "!cmd!"=="help" (
    echo 指令: status (状态), attack (攻击), buy 物品 数量 (购买), save (保存)
    goto main
)

if "!cmd!"=="status" (
    for /f "tokens=1-4 delims=|" %%a in ('sqlite3 %DB% "SELECT money, level, base, inventory FROM users WHERE username='!user!';"') do (
        echo 资金: %%a ^| 等级: %%b ^| 基地: %%c ^| 背包: %%d
    )
    goto main
)

if "!cmd!"=="attack" (
    echo 激光激活... 导弹发射！
    sqlite3 %DB% "UPDATE users SET money = money + 50000 WHERE username='!user!';"
    sqlite3 %DB% "UPDATE users SET level = CASE WHEN money >= 1000000000 THEN '世界第一' WHEN money >= 500000000 THEN '世界前五' WHEN money >= 100000000 THEN '世界前十' WHEN money >= 10000000 THEN '世界百强' WHEN money >= 1000000 THEN '世界富豪' ELSE '杀手' END WHERE username='!user!';"
    echo 掠夺了 50000 资金！
    goto main
)

if "!cmd:~0,3!"=="buy" (
    for /f "tokens=2,3" %%a in ("!cmd!") do (
        set item=%%a
        set qty=%%b
        set price=0
        if "!item!"=="导弹" set price=20000
        if "!item!"=="无人机" set price=50000
        if "!item!"=="预警机" set price=1000000
        set /a total=price*qty
        
        for /f %%m in ('sqlite3 %DB% "SELECT money FROM users WHERE username='!user!';"') do set money=%%m
        if !money! LSS !total! (
            echo 资金不足！
        ) else (
            set /a new_money=money-total
            sqlite3 %DB% "UPDATE users SET money = !new_money! WHERE username='!user!';"
            echo 成功购买 !qty! 个 !item!
        )
    )
    goto main
)

echo 未知指令，输入 help 获取帮助。
goto main
