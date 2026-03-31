#!/bin/bash
# Task Poller - Semi-automated workflow
# Checks for new tasks and dispatches to appropriate agents

TASKS_DIR="/Users/sacompig/.openclaw/workspace/tasks"
AGENT_BOTS=(
  "tutor:sasacomcom_tutor_bot"
  "research:sasacomcom_research_bot"
  "inventor:sasacomcom_inventor_bot"
  "translator:sacompig_translator_bot"
  "image:sasacomcom_image_bot"
  "jemmy:sasacomcom_jemmy_bot"
  "dankoe:sasacomcom_dankoe_bot"
  "coding:coding_bot"
  "qimen:qimen_bot"
)

LOG_FILE="/Users/sacompig/.openclaw/workspace/tasks/poller.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check for new tasks in inbox
check_inbox() {
  local inbox_dir="$TASKS_DIR/inbox"
  if [ ! -d "$inbox_dir" ]; then
    log "Inbox directory not found"
    return
  fi
  
  local count=$(ls -1 "$inbox_dir" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    log "Found $count new task(s) in inbox"
    ls -1 "$inbox_dir"/*.json 2>/dev/null | while read task_file; do
      if [ -f "$task_file" ]; then
        process_task "$task_file"
      fi
    done
  else
    log "No new tasks in inbox"
  fi
}

# Process a single task
process_task() {
  local task_file="$1"
  local task_id=$(basename "$task_file" .json)
  
  log "Processing task: $task_id"
  
  # Read task details
  local assigned_to=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('assigned_to',''))" 2>/dev/null)
  local title=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('title',''))" 2>/dev/null)
  local description=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('description',''))" 2>/dev/null)
  
  if [ -z "$assigned_to" ]; then
    log "Task $task_id has no assigned agent, skipping"
    return
  fi
  
  # Find agent's bot name
  local bot_name=""
  for ab in "${AGENT_BOTS[@]}"; do
    local agent="${ab%%:*}"
    local bot="${ab##*:}"
    if [ "$agent" == "$assigned_to" ]; then
      bot_name="$bot"
      break
    fi
  done
  
  if [ -z "$bot_name" ]; then
    log "Unknown agent: $assigned_to for task $task_id"
    return
  fi
  
  log "Dispatching task $task_id to agent $assigned_to (bot: $bot_name)"
  
  # Move task to assigned
  mv "$task_file" "$TASKS_DIR/assigned/$task_id.json" 2>/dev/null
  
  # Update task state to assigned
  python3 -c "
import json
with open('$TASKS_DIR/assigned/$task_id.json', 'r+') as f:
    d = json.load(f)
    d['state'] = 'assigned'
    d['dispatched_at'] = '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
    f.seek(0)
    json.dump(d, f, indent=2)
    f.truncate()
" 2>/dev/null
  
  # Update task board
  update_task_board "$task_id" "assigned" "$assigned_to"
  
  log "Task $task_id dispatched successfully"
}

# Update task board JSON
update_task_board() {
  local task_id="$1"
  local new_state="$2"
  local assigned="$3"
  
  python3 << 'EOF'
import json

board_file = "/Users/sacompig/.openclaw/workspace/tasks/task-board.json"
try:
    with open(board_file, 'r') as f:
        board = json.load(f)
    
    # Update task state
    for task in board.get('tasks', []):
        if task.get('id') == task_id:
            task['state'] = new_state
            task['assigned_to'] = assigned
    
    # Update stats
    stats = board.get('stats', {})
    for s in ['inbox', 'assigned', 'in_progress', 'review', 'done', 'failed']:
        stats[s] = sum(1 for t in board.get('tasks', []) if t.get('state') == s)
    
    with open(board_file, 'w') as f:
        json.dump(board, f, indent=2)
except Exception as e:
    print(f"Error updating board: {e}")
EOF
}

# Main
log "=== Task Poller Started ==="
check_inbox
log "=== Task Poller Finished ==="
