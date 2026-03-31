# Error Log - 2026-03-16

## 1. Cron Job --system-event 錯誤

**時間:** 2026-03-16 10:18 GMT+8  
**錯誤:** `Error: Main jobs require --system-event (systemEvent)`  
**原因:** 嘗試用 `--session main` 創建 cron job，但 main session jobs 必須指定 `--system-event`  
**解決:** 改用 `--session isolated` (subagent 模式)  
**教訓:** Isolated sessions 更適合自動化任務，避免阻塞 main session

## 2. API Rate Limit (Kimi)

**時間:** 2026-03-16 10:02-10:14 GMT+8  
**錯誤:** `⚠️ API rate limit reached. Please try again later.`  
**原因:** 短時間內連續觸發多次 cron job 測試 (針灸表 + 吉凶概覽 + 重試)  
**解決:** 等 1-2 分鐘後再試，成功執行  
**教訓:** 
- 測試 cron jobs 時要留足夠間隔 (建議 >1 分鐘)
- 正式運行時間表已錯開 (06:00 vs 07:00)，不會互相影響
- 考慮為高頻測試切換到備用模型

## 3. openclaw config 路徑混淆

**時間:** 2026-03-16 04:35 GMT+8  
**問題:** 以為 config 喺 `~/.openclaw/config.json`，實際喺 `~/.openclaw/openclaw.json`  
**解決:** 正確編輯 `openclaw.json` 加入 `plugins.allow`  
**教訓:** 永遠先用 `openclaw status` 確認配置來源

## 4. macOS 工具命令缺失

**時間:** 2026-03-16 13:49 GMT+8  
**錯誤:** 
- `zsh:1: command not found: lsof`
- `zsh:1: command not found: softwareupdate`
- `zsh:1: command not found: netstat`

**原因:** healthcheck skill 嘗試用 macOS 標準工具檢查系統，但此環境缺少這些命令 (可能係 minimal macOS install 或 PATH 問題)  
**解決:** 改用內建替代方案 (e.g. `openclaw status` 代替手動 port scan)  
**教訓:** 檢查工具可用性，準備 fallback 方法

---
下次遇到類似問題，先檢查此檔案。
