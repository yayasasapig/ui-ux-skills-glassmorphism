# Shared Directory

所有 agent 共用的工作空間，根據 Agent Team Orchestration skill 設置。

## 目錄結構

```
shared/
├── artifacts/   ← 各 agent 產出的檔案（代碼、文檔、設計稿等）
├── specs/       ← 規格文件、需求文檔
├── reviews/     ← 審查意見、回饋
├── decisions/   ← 架構和產品決策記錄
└── handoffs/   ← 任務交接記錄
```

## 使用規則

- 各 agent 可以讀寫自己負責的 artifacts
- Reviewer agent 負責寫入 reviews
- Orchestrator (main) 負責維護 specs 和 decisions
- 所有 agent 都可以讀取 shared 目錄

## 當前任務

- task-003: 女兒中文科學習計劃 (tutor agent) → artifacts 在 artifacts/learning/
