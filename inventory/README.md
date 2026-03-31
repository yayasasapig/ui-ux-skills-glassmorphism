# 🏠 Home Inventory Management System

完整的家庭庫存管理系統，支持**自然語言命令**、自動提醒、條碼掃描、智能預測。

## 🌟 核心功能

### 🗣️ 自然語言支持（推薦）
只需在 Telegram 發送口語化命令：

```
用咗1支沐浴露
買咗3包檸檬王
檸檬王庫存多少
沐浴露還有幾多
```

系統會自動：
- 識別動作（消耗/補貨/查詢）
- 提取產品名稱
- 更新庫存
- 發送確認回覆

### 📱 支持的命令格式

**消耗物品：**
- `用咗1支沐浴露`
- `用了2瓶黃道益`
- `消耗3包檸檬王`
- `用完沐浴露`

**補貨/新增：**
- `買咗3包檸檬王`
- `買了2支沐浴露`
- `補貨黃道益 5支`
- `入貨檸檬王10包`

**查詢庫存：**
- `檸檬王庫存多少`
- `沐浴露還有幾多`
- `查看黃道益`
- `黃道益數量`

**批量更新：**
```
更新庫存：
沐浴露: 2
檸檬王: 3
黃道益: 5
```

## 📁 檔案結構

```
~/.openclaw/workspace/inventory/
├── home-inventory.csv      # 庫存主檔案
├── inventory.js            # 主程式（檢查/提醒/統計）
├── nlp-inventory.js        # 🆕 自然語言解析器
├── update-item.js          # 精確更新物品數量
├── add-item.js             # 添加新物品
├── scan-update.sh          # 條碼掃描更新腳本
├── README.md               # 本文件
└── package.json            # Node 依賴
```

## 🚀 快速開始

### 方法一：自然語言（最簡單）
```bash
cd ~/.openclaw/workspace/inventory
node nlp-inventory.js "用咗1支沐浴露"
node nlp-inventory.js "買咗3包檸檬王"
node nlp-inventory.js "檸檬王庫存多少"
```

### 方法二：精確更新
```bash
node update-item.js INV001 5
node update-item.js 4891028175601 3
```

### 方法三：查看統計
```bash
node inventory.js stats
node inventory.js check
node inventory.js shopping-list
```

## ⏰ 設置自動提醒

### 每日檢查（晚上8點）
```bash
openclaw cron add --name "inventory:daily-check" \
  --cron "0 20 * * *" \
  --message "node ~/.openclaw/workspace/inventory/inventory.js check" \
  --to 8744150155 --channel telegram --session isolated
```

### 每週購物清單（週日早上10點）
```bash
openclaw cron add --name "inventory:weekly-shopping" \
  --cron "0 10 * * 0" \
  --message "node ~/.openclaw/workspace/inventory/inventory.js shopping-list" \
  --to 8744150155 --channel telegram --session isolated
```

## 📊 庫存表欄位說明

| 欄位 | 說明 | 示例 |
|------|------|------|
| 物品ID | 系統自動生成 | INV001 |
| 物品名稱 | 產品名稱 | 檸檬王甘草檸檬 |
| 類別 | 分類 | 食品/日用品/清潔/藥品/電子產品/收藏品/美妝 |
| 品牌 | 品牌名 | 檸檬王 |
| 規格 | 規格描述 | 300g |
| 當前數量 | 現有庫存 | 3 |
| 最低庫存 | 安全庫存水平 | 1 |
| 消耗天數/單位 | 預計用完天數 | 30 |
| 上次補貨日期 | 最近購買日期 | 2026-03-01 |
| 存放位置 | 物品位置 | 廚房櫃 |
| 備註 | 特殊說明 | 香港手信代購用 |
| 條碼 | 產品條碼 | 4891028175601 |

## 🔔 提醒規則

- 🔴 **已售罄**: 立即通知
- ⚠️ **緊急（3天內）**: 每日提醒
- 💡 **警告（7天內）**: 普通提醒
- ✅ **庫存充足**: 不通知

## 🛒 與反向代購整合

系統會自動識別備註中包含「代購」的物品：
- 當代購物品庫存 ≤ 3 時，提醒順便補貨
- 顯示預計利潤機會
- 整合到購物清單

## 💡 提示

- **自然語言**：支援粵語口語，無需記憶指令格式
- **模糊匹配**：輸入「檸檬」即可匹配「檸檬王甘草檸檬」
- **智能提醒**：低庫存時自動建議補貨
- **批量操作**：一次更新多個物品

---
有問題？問小咪！🐈‍⬛
