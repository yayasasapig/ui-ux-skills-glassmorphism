# WORKFLOW.md - 工作流程定義

## 📋 收據處理流程（Receipt Processing Workflow）

### 角色定義
- **Orchestrator（我）**：統籌協調者，負責接收任務、分派工作、整合結果
- **Secretary（秘書 Subagent）**：負責執行日常行政任務，直接向用戶匯報進度

### 標準流程

```
用戶 → Orchestrator → [Spawn Secretary Agent] → Secretary 直接向用戶 Telegram 匯報
                                    ↓
                            Orchestrator 整合最終結果
```

### Step-by-Step 流程

1. **用戶發送收據圖片**
2. **Orchestrator 確認收到**：「收到 X 張收據，正在分派任務俾秘書...」
3. **Spawn Secretary Agent** 並分派任務
4. **Secretary 直接向用戶 Telegram 匯報每個步驟**：
   ```
   📱 秘書：✅ 已分析第1張收據
   📱 秘書：⏳ 正在上傳第2張...
   📱 秘書：✅ 已上傳並加入記錄（5/20）
   ...
   📱 秘書：✅ 全部20張完成！
   ```
5. **Orchestrator 整合最終結果（如有需要）**

### 關鍵原則
- **即時匯報**：唔會做完先一次性 report，每完成一個步驟就即時匯報
- **Subagent 直接匯報**：Secretary Agent 直接向用戶 Telegram 發送更新，唔經 Orchestrator
- **雙軌並行**：Subagent 匯報用戶的同時也向 Orchestrator 報告，確保資訊一致性

---

## 🗂️ 其他已知流程

### 別墅裝修項目（進行中）
- Wiki: http://wiki.bb168.com.hk
- 用戶期望：每3天更新一次進度

### GOG 任務
- Gmail, Calendar, Drive, Contacts, Sheets, Docs
- 指令：`gog <service> <action> [args]`

### 的其他工作流程...
