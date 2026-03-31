#!/bin/bash
# 條碼掃描更新腳本
# 使用手機相機掃描條碼後，手動輸入更新庫存

echo "📱 Home Inventory 條碼更新"
echo "=========================="
echo ""

# 顯示當前庫存
echo "📋 當前庫存列表:"
cat ~/.openclaw/workspace/inventory/home-inventory.csv | head -20
echo ""

# 輸入條碼
echo "請輸入條碼（或輸入 'list' 查看全部，'exit' 退出）:"
read barcode

if [ "$barcode" = "exit" ]; then
    exit 0
fi

if [ "$barcode" = "list" ]; then
    cat ~/.openclaw/workspace/inventory/home-inventory.csv
    exit 0
fi

# 查找物品
item=$(grep "$barcode" ~/.openclaw/workspace/inventory/home-inventory.csv)

if [ -z "$item" ]; then
    echo "❌ 未找到此條碼的物品"
    echo "是否要添加新物品？ (y/n)"
    read addnew
    if [ "$addnew" = "y" ]; then
        echo "請使用 'add-item' 命令添加新物品"
    fi
    exit 1
fi

echo ""
echo "找到物品:"
echo "$item" | awk -F',' '{print "名稱: " $2 "\n規格: " $5 "\n當前數量: " $6}'
echo ""

# 輸入新數量
echo "請輸入新數量:"
read newqty

echo "請輸入備註（可選）:"
read note

# 更新 CSV
# 這裡使用 Node.js 進行更複雜的 CSV 操作
node ~/.openclaw/workspace/inventory/update-item.js "$barcode" "$newqty" "$note"

echo ""
echo "✅ 庫存已更新！"
