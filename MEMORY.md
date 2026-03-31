# MEMORY.md - Long-term Memory

## 重要工作流程設定

### 雙軌並行匯報系統（2026-03-31 確定）
- **流程 A（TG 直接通知）：** Subagent 完成每個步驟後，直接向用戶 Telegram 匯報
- **流程 B（Orchestrator 整合）：** Subagent 完成後同時向 Orchestrator 報告，確保統一視圖
- **關鍵教訓**：唔會將所有嘢自己做曉再做一次性 report，每完成一個步驟就即時匯報
- **Secretary Agent**：負責執行日常行政任務（收據處理、資料輸入等），直接向用戶匯報

## MiniMax Image Generation Skills

yayafu has set up MiniMax Image-01 API for text-to-image generation. Two skills exist:

1. **mini-image** - General text-to-image generation
   - Script: /Users/sacompig/.openclaw/workspace/skills/mini-image/scripts/minimax_image.py
   - Usage: `python3 .../minimax_image.py "prompt" output.png`

2. **cat-image** - Cute cartoon cat illustrations (whimsical children's picture book style)
   - Trigger: "貓貓圖<subject>"
   - Script: /Users/sacompig/.openclaw/workspace/skills/cat-image/scripts/minimax_image.py

API Key (minimax): sk-cp-LAFqJ8zoM0LEHwXy4-7T1Fe-OMI-j-5y4IUFhAi_48AJdCE-ttvdzS0rQoDwkzjjJh1DUwz5PBci3Opntg3jRBw05LINQaVAInpiWDzkFfyLtjYDXPLtC98
API endpoint: https://api.minimax.io/v1/image_generation

