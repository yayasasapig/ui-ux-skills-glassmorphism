# SHARED_WORKSPACE_GUIDE.md — 團隊共享工作區規則

> 定義所有 Specialist Agent 如何讀寫共享檔案，避免衝突與混乱。

---

## 📁 共享工作區結構

```
~/.openclaw/workspace/
├── SOUL.md              # Orchestrator 核心人格定義（唯讀）
├── IDENTITY.md          # Orchestrator 身份形象（唯讀）
├── USER.md              # 用戶資訊（唯讀）
├── AGENTS.md            # 通用工作指南（唯讀）
├── MEMORY.md             # 長期記憶（讀寫）
├── HEARTBEAT.md         # 心跳檢查清單（讀寫）
├── TOOLS.md             # 本機工具配置（讀寫）
│
├── skills/              # Agent 技能目錄（唯讀）
│   ├── mini-image/
│   ├── cat-image/
│   └── ...
│
├── memory/              # 每日工作日誌（讀寫）
│   └── YYYY-MM-DD.md    # 每日獨立日誌
│
├── team/                # 🆕 團隊共享檔案
│   ├── SHARED_WORKSPACE_GUIDE.md   # 本檔案
│   ├── TEAM_CAPABILITIES.md         # Agent 能力總覽
│   ├── ORCHESTRATION_LOG.md         # 任務協調日誌
│   ├── TEAM_NOTES.md                 # 臨時團隊筆記
│   └── ACTIVE_TASKS.md              # 當前任務追蹤
│
└── output/              # 生成物存放（可選）
    ├── images/
    └── documents/
```

---

## 📖 檔案讀寫規則

### 等級定義

| 等級 | 符號 | 意義 | 可寫入者 |
|------|------|------|---------|
| 唯讀 | 🔒 | 所有 Agent 不可修改 | Orchestrator（初始化後鎖定）|
| 標準 | 📝 | 所有 Agent 可讀寫 | 全員 |
| 任務鎖定 | 🔐 | 單一 Agent 正在使用 | 指定 Agent |

### 檔案等級列表

| 檔案 | 等級 | 說明 |
|------|------|------|
| SOUL.md | 🔒 唯讀 | 核心人格定義，初始化後不可改 |
| IDENTITY.md | 🔒 唯讀 | 身份形象定義 |
| USER.md | 🔒 唯讀 | 用戶資訊 |
| AGENTS.md | 🔒 唯讀 | 通用指南 |
| MEMORY.md | 📝 標準 | 長期記憶，全員可寫 |
| HEARTBEAT.md | 📝 標準 | 心跳清單 |
| TOOLS.md | 📝 標準 | 本機配置 |
| memory/*.md | 📝 標準 | 每日日誌 |
| team/*.md | 📝 標準 | 團隊共享檔案 |

---

## ✏️ 寫入公約

### 1. 讀取前先檢查
任何 Agent 在寫入共享檔案前，**必須先確認該檔案的狀態**：
- 檢查是否已有其他 Agent 在使用（任務鎖定）
- 確保寫入不會覆蓋他人的未完成工作

### 2. 任務鎖定機制
當 Agent 開始處理共享檔案時，**必須在 ACTIVE_TASKS.md 中聲明**：

```markdown
## 2026-03-31 Task Lock Example
- [LOCKED] ORCHESTRATION_LOG.md by Translator Agent
  - 任務：翻譯 X 文件
  - 預計完成：14:00
```

完成後**立即解除鎖定**並更新日誌。

### 3. 備份原則
- 修改共享檔案前，**建議先複製內容**到記憶中
- 重大變更（如 ORCHESTRATION_LOG.md）由 Orchestrator 統一管理

### 4. 衝突處理
若發現同時寫入衝突：
1. **不接受**後寫覆蓋先寫
2. 通知 Orchestrator 裁決
3. 協商合併或分工

---

## 📝 ORCHESTRATION_LOG.md 寫入規則

| 情境 | 誰來寫 | 寫什麼 |
|------|-------|-------|
| 任務開始 | Orchestrator | 任務分解、路由決策 |
| 子任務完成 | 各 Agent 回報後由 Orchestrator 統一寫入 | 產出摘要、完成狀態 |
| 任務失敗 | Orchestrator | 失敗原因、修正方案 |
| 最終交付 | Orchestrator | 整合結果摘要、團隊表現評估 |

**格式要求：**
```
## YYYY-MM-DD HH:MM — [任務名稱]

### 任務分解
1. 子任務 A → [Agent]
2. 子任務 B → [Agent]（並行）

### 執行記錄
- [HH:MM] 子任務 A 完成 → [產出摘要]
- [HH:MM] 子任務 B 完成 → [產出摘要]

### 最終結果
[整合後的最終交付]

### 團隊表現
[效率評估 / 改進建議]
```

---

## 🔄 資訊共享流程

### 跨 Agent 資訊傳遞
```
Agent A 完成 → 寫入共享檔案/ORCHESTRATION_LOG.md 
        ↓
Orchestrator 解讀 → 決定下一步路由
        ↓
Agent B 讀取所需資訊 → 繼續執行
```

### 禁止事項 🚫
- **禁止**直接在其他 Agent 的 session 中寫入
- **禁止**未聲明就覆蓋共享檔案
- **禁止**在未完成時刪除他 Agent 的工作進度

---

## 📊 ACTIVE_TASKS.md 格式

```markdown
# ACTIVE_TASKS.md — 當前任務追蹤

## 🟢 進行中
| 任務 ID | 任務名稱 | 負責 Agent | 開始時間 | 預計完成 | 狀態 |
|---------|---------|-----------|---------|---------|------|
| T-001 | 文件翻譯 | Translator | 10:00 | 11:00 | 75% |

## 🔴 阻塞中
| 任務 ID | 任務名稱 | 負責 Agent | 阻塞原因 |
|---------|---------|-----------|---------|
| T-002 | 研究報告 | Researcher | 等待用戶提供關鍵字 |

## ✅ 已完成（本輪）
| 任務 ID | 任務名稱 | 負責 Agent | 完成時間 | 產出 |
|---------|---------|-----------|---------|------|
| T-000 | 初步分析 | Generalist | 09:45 | 3頁摘要 |
```

---

*最後更新：2026-03-31 by Orchestrator Nova*
