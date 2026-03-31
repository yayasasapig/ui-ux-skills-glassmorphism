# Agent Team Orchestration 工作流程模板

## 📋 創建新任務

### 模板
```
【新任務創建】
標題：[任務名稱]
描述：[任務詳細描述]
負責 Agent：[agent-id]
優先級：[high/medium/low]
產出路徑：[shared/artifacts/xxx/]
截止日期：[如有]
```

### 示例
```
【新任務創建】
標題：女兒數學學習計劃
描述：為女兒制定數學學習計劃，她喜歡公主主題、繪畫
負責 Agent：tutor
優先級：high
產出路徑：shared/artifacts/learning/task-004-math.md
截止日期：2026-04-05
```

---

## 📝 任務狀態更新

### 模板
```
【任務狀態更新】
任務 ID：[task-xxx]
新狀態：[inbox/assigned/in_progress/review/done/failed]
更新者：[agent-id]
備註：[原因或說明]
```

### 示例
```
【任務狀態更新】
任務 ID：task-003
新狀態：in_progress
更新者：main
備註：已聯繫 tutor agent，佢正在處理
```

---

## 🔄 跨 Agent 交接 (Handoff)

### 模板
```
【任務交接】
從：[agent-A]
到：[agent-B]
任務 ID：[task-xxx]

已完成：
- [列出已完成的工作]

產出位置：
- [檔案路徑]

驗證方式：
- [如何確認工作完成]

已知問題：
- [任何未解决的問題]

下一步：
- [下一個 agent 需要做什麼]
```

### 示例
```
【任務交接】
從：research
到：translator
任務 ID：task-005

已完成：
- 研究了2026年健康趨勢
- 整理了10個關鍵發現

產出位置：
- shared/artifacts/research/task-005-health-trends.md

驗證方式：
- 閱讀摘要，確認涵蓋了你要求的topic

已知問題：
- 部分研究資料來自英文來源

下一步：
- 請根據研究資料撰寫800字blog文章
```

---

## 📊 Task Board 常用指令

### 1. 查看所有任務
```
【指令】：/task board
【輸出】：所有任務狀態概覽
```

### 2. 查看特定任務
```
【指令】：/task view [task-id]
【輸出】：任務詳細資訊
```

### 3. 創建新任務
```
【指令】：/task create [標題] [agent] [優先級]
【輸出】：新任務已創建，狀態為 inbox
```

### 4. 更新狀態
```
【指令】：/task status [task-id] [新狀態]
【輸出】：狀態已更新
```

### 5. 分配任務
```
【指令】：/task assign [task-id] [agent-id]
【輸出】：任務已分配俾 [agent]
```

---

## 🎯 常用工作流程模板

### 流程 A：建立 → 審查 → 完成

```
1. 創建任務
   → inbox

2. 分配俾 Builder
   → assigned → in_progress

3. Builder 完成
   → review

4. Reviewer 審查
   → 如需修改：→ in_progress（退返）
   → 如通過：→ done

5. Orchestrator 確認並匯報
   → 完成
```

### 流程 B：研究 → 翻譯 → 發布

```
1. 向 research bot 發送研究任務
2. research agent 研究並寫入 shared/artifacts/research/
3. 你更新狀態：→ review
4. 向 translator bot 發送翻譯任務（引用 research 成果）
5. translator agent 完成後 → done
6. 你審查並發布
```

### 流程 C：自動化 Cron 任務

```
1. Ops agent 負責 cron jobs
2. 每日自動生成報告
3. 任務完成後自動更新狀態
4. 你只需檢查結果
```

---

## 👥 Agent 聯繫方式

| 需求 | 聯繫 Bot | Agent Role |
|------|----------|-----------|
| 教學/學習 | @sasacomcom_tutor_bot | Reviewer |
| 翻譯/寫作 | @sacompig_translator_bot | Reviewer |
| 圖片生成 | @sasacomcom_image_bot | Builder |
| 創意/發明 | @sasacomcom_inventor_bot | Builder |
| SEO/內容 | @sasacomcom_jemmy_bot | Ops |
| 研究/資料 | @sasacomcom_research_bot | Reviewer |
| 所有任務協調 | @（目前用緊呢個） | Orchestrator |

---

## 📁 產出目錄結構

```
~/.openclaw/workspace/shared/
├── artifacts/
│   ├── learning/        # 學習計劃
│   │   └── task-003-summary.md
│   ├── coding/          # 程式碼項目
│   ├── translation/     # 翻譯成品
│   ├── design/         # 設計稿
│   └── research/       # 研究報告
├── specs/              # 規格文件
├── reviews/            # 審查意見
├── decisions/          # 決策記錄
└── handoffs/          # 任務交接記錄
```

---

## ⚠️ 規則提醒

1. **每個任務要有產出路徑** — 唔好留喺 agent 個人 workspace
2. **失敗係正常嘅** — 記錄原因，繼續下一個
3. **定時檢查 board** — 確保冇任務卡住
4. **清晰交接** — handover 資訊要夠詳細

---

## 🚨 任務卡住時點做

```
1. 確認 agent 係咪正常運作
   → 向相應 bot 發送測試訊息

2. 如果 agent 無回應
   → 狀態改為 failed
   → 記錄原因
   → 自己接手或重新分配

3. 如果需要緊急處理
   → 直接聯繫相關 bot
   → timeout 後改為 failed
```

---

## 📈 成功關鍵

1. **清晰任務描述** — 避免 agent 估估下
2. **指定產出路徑** — 完成後知道你喺邊
3. **定義驗收標準** — 點樣算完成？
4. **定期檢查** — 唔好 set完就唔理
5. **持續改進** — 根據結果調整流程
