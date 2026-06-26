#!/data/data/com.termux/files/usr/bin/bash
DB="database.db"

if [ ! -f "$DB" ]; then
    echo "[错误] 缺少 database.db 文件。请从网页下载并放到此目录。"
    exit
fi

read -p "用户名 (默认admin): " user
user=${user:-admin}
read -p "密码/哈希值: " pass

IFS='|' read -r db_pass db_hash <<< $(sqlite3 $DB "SELECT pass, hash FROM users WHERE username='$user';")
if [[ -z "$db_pass" ]]; then
    echo "用户不存在！"
    exit
fi

if [[ "$pass" == "$db_pass" ]]; then
    echo "[+] 密码验证成功！"
elif [[ "$pass" == "$db_hash" ]]; then
    echo "[+] 哈希值验证成功！"
else
    echo "[-] 验证失败！"
    exit
fi

while true; do
    read -p ">>> " cmd
    if [[ "$cmd" == "exit" ]]; then break; fi

    if [[ "$cmd" == "help" ]]; then
        echo "指令: status, attack, buy 物品 数量, exit"
    elif [[ "$cmd" == "status" ]]; then
        IFS='|' read -r money level base inventory <<< $(sqlite3 $DB "SELECT money, level, base, inventory FROM users WHERE username='$user';")
        echo "资金: $money  等级: $level  基地: $base  背包: $inventory"
    elif [[ "$cmd" == "attack" ]]; then
        sqlite3 $DB "UPDATE users SET money = money + 50000 WHERE username='$user';"
        sqlite3 $DB "UPDATE users SET level = CASE WHEN money >= 1000000000 THEN '世界第一' WHEN money >= 500000000 THEN '世界前五' WHEN money >= 100000000 THEN '世界前十' WHEN money >= 10000000 THEN '世界百强' WHEN money >= 1000000 THEN '世界富豪' ELSE '杀手' END WHERE username='$user';"
        echo "攻击成功！掠夺 50000 资金。"
    elif [[ "$cmd" == buy* ]]; then
        arr=($cmd)
        item=${arr[1]}
        qty=${arr[2]}
        case "$item" in
            "导弹") price=20000 ;;
            "无人机") price=50000 ;;
            "预警机") price=1000000 ;;
            *) price=0 ;;
        esac
        total=$((price * qty))
        money=$(sqlite3 $DB "SELECT money FROM users WHERE username='$user';")
        if [[ $money -lt $total ]]; then
            echo "资金不足！"
        else
            new_money=$((money - total))
            sqlite3 $DB "UPDATE users SET money = $new_money WHERE username='$user';"
            echo "购买 ${qty} 个 ${item} 成功！"
        fi
    else
        echo "未知指令。"
    fi
done
