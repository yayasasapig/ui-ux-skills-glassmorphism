# Learnings Log

## [LRN-20260316-001] business_model

**Logged**: 2026-03-16T18:30:00+08:00
**Priority**: medium
**Status**: pending
**Area**: business

### Summary
反向代購商業模式的核心優勢在於結合地理位置的多點協同

### Details
用戶 (yayafu) 居住在銅鑼灣，同時經常去灣仔、金鐘、深水埗。這形成了一個完美的閉環：
- 深水埗：低成本貨源 (vintage 相機、黑膠、舊書)
- 銅鑼灣：處理中心 + 樓上舖寄賣渠道
- 灣仔/金鐘：懷舊寶藏 + 高端客戶接觸點

關鍵洞察：信息差套利不需要創造新產品，而是發現兩個市場間的價值不對稱。

### Suggested Action
未來類似諮詢中，應首先評估用戶的地理優勢和日常動線，設計符合其生活模式的商業模式，而非提供通用建議。

### Metadata
- Source: conversation
- Related Files: 反向代購物流成本計算表.csv
- Tags: business, arbitrage, hong-kong, e-commerce
- Pattern-Key: business.geographic_arbitrage
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

---

## [LRN-20260316-002] knowledge_gap

**Logged**: 2026-03-16T18:30:00+08:00
**Priority**: low
**Status**: pending
**Area**: research

### Summary
HOHK 是香港本地製造的紙巾品牌，之前未知

### Details
HOHK 是 HK Tissue 旗下的純原木漿紙巾系列，與 Booz (竹漿系列) 並列。香港目前唯一本地製造的紙巾品牌。

這類本地小眾品牌雖然不是高毛利代購品類，但可以作為「香港特色」手信組合的一部分。

### Suggested Action
建立「香港本土品牌」清單，作為未來代購選品參考。

### Metadata
- Source: user_question
- Related Files: none
- Tags: hong-kong, brand, local
- Pattern-Key: knowledge.local_brands
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

---

## [LRN-20260316-003] backup_workflow

**Logged**: 2026-03-16T19:00:00+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
建立了完整的 OpenClaw 備份和遷移工作流程

### Details
用戶需要將 OpenClaw 配置遷移到新機器。建立了以下流程：
1. 識別關鍵資料：`openclaw.json`、`.env`、`workspace/`、`memory/`、`cron/`、`extensions/`、`credentials/`
2. 創建壓縮備份：`tar -czvf openclaw-backup-YYYYMMDD.tar.gz`
3. 上傳到 Google Drive 進行雲端存儲
4. 新機器恢復步驟：安裝 → 解壓 → 重新授權 → 驗證

### Suggested Action
將此流程整理成可重用的腳本，方便未來備份和遷移。

### Metadata
- Source: user_request
- Related Files: openclaw-backup-20260316.tar.gz
- Tags: backup, migration, openclaw, gog
- Pattern-Key: workflow.backup_migration
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

---

## [LRN-20260316-004] user_preference

**Logged**: 2026-03-16T19:00:00+08:00
**Priority**: low
**Status**: pending
**Area**: config

### Summary
用戶偏好使用 Google Drive 進行雲端備份

### Details
當提供多個備份選項（USB、SCP、雲端）時，用戶選擇了 Google Drive。這與之前配置的 gog (Google Workspace CLI) 工具一致。

### Suggested Action
未來涉及文件傳輸或備份時，優先提供 Google Drive 選項。

### Metadata
- Source: user_choice
- Related Files: none
- Tags: preference, google-drive, backup
- Pattern-Key: user.cloud_storage_preference
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

---

## [LRN-20260316-005] cli_syntax

**Logged**: 2026-03-16T19:15:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
`openclaw message send` 命令使用 `-t` 而非 `--to` 指定目標

### Details
在編寫 Home Inventory 系統時，錯誤地使用了 `--to` 參數發送消息：
```bash
openclaw message send --to 8744150155 --channel telegram --message "..."
```

正確語法應為：
```bash
openclaw message send -t 8744150155 --channel telegram --message "..."
# 或
openclaw message send --target 8744150155 --channel telegram --message "..."
```

### Resolution
已修復 `inventory.js` 中的 `sendTelegram` 函數，將 `--to` 改為 `-t`。

### Metadata
- Source: error
- Related Files: inventory.js
- Tags: openclaw, cli, syntax
- Pattern-Key: cli.message_send_syntax
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

---

## [LRN-20260316-006] project_completion

**Logged**: 2026-03-16T19:15:00+08:00
**Priority**: medium
**Status**: completed
**Area**: project

### Summary
今日完成三個主要項目：健康檢查、反向代購商業模式規劃、Home Inventory Management System

### Details

**1. 健康檢查**
- 完成 OpenClaw 安全審計
- 創建備份並上傳 Google Drive
- 識別到 1 個 critical、3 個 warning 安全問題

**2. 反向代購商業模式**
- 設計地理套利模式（深水埗+銅鑼灣+灣仔/金鐘）
- 創建物流成本計算表
- 撰寫檸檬王小紅書文案
- 規劃首月行動計劃

**3. Home Inventory Management System**
- 完整的庫存管理系統
- 自動每日/每週提醒（Cron jobs）
- 智能預測消耗速度
- 與反向代購整合
- 支持條碼更新

### Metadata
- Source: project_summary
- Related Files: inventory/, 反向代購物流成本計算表.csv
- Tags: project, completion, home-inventory, business-model
- Pattern-Key: project.daily_summary
- Recurrence-Count: 1
- First-Seen: 2026-03-16
- Last-Seen: 2026-03-16

---
