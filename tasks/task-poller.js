#!/usr/bin/env node
// Task Poller - Semi-automated workflow
// Checks inbox every 15 mins, dispatches to agents, waits for approval

const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const TASKS_DIR = '/Users/sacompig/.openclaw/workspace/tasks';
const LOG_FILE = `${TASKS_DIR}/poller.log`;

// Agent to Telegram Account mapping
const AGENT_ACCOUNTS = {
  'tutor': 'tutor',
  'translator': 'translator', 
  'inventor': 'inventor',
  'jemmy': 'jemmy',
  'image': 'image',
  'qimen': 'qimen',
  'research': 'research',
  'coding': 'coding',
  'dankoe': 'dankoe'
};

// Telegram bot tokens (from openclaw.json)
const BOT_TOKENS = {
  'tutor': '8697161695:AAE1vDSgyoP914m0nL5MFme3hV6VKigTeWg',
  'translator': '8708876750:AAFMjZkRsdb7dVpUtmLQjhCYN5Y2MjOGKrE',
  'inventor': '8563295186:AAE7jbbN_eqOGz_grgpvIQrNKDz430IhohU',
  'jemmy': '8795827387:AAH16Y5sbNXnYcMvmt37jfHKTJhWrLZ0OCM',
  'image': '8673616965:AAFMbscig8X8ocKs8gLZmwzZQKZgSByDoWc',
  'qimen': 'qimen_token_placeholder', // Not set yet
  'research': '8606304758:AAET5Mfiuso4MMHgkzk1FOPic4Qqn5gt0lc',
  'coding': 'coding_token_placeholder', // Not set yet
  'dankoe': 'dankoe_token_placeholder' // Not set yet
};

const USER_CHAT_ID = '8744150155';

function log(msg) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
  console.log(`[${timestamp}] ${msg}`);
}

function readTaskFile(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    log(`Error reading ${filepath}: ${e.message}`);
    return null;
  }
}

function writeTaskFile(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    log(`Error writing ${filepath}: ${e.message}`);
    return false;
  }
}

function sendTelegramMessage(accountId, text) {
  return new Promise((resolve, reject) => {
    const token = BOT_TOKENS[accountId];
    if (!token || token.includes('placeholder')) {
      log(`No token for agent ${accountId}, skipping`);
      resolve(false);
      return;
    }
    
    const postData = JSON.stringify({
      chat_id: USER_CHAT_ID,
      text: text
    });
    
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            log(`Message sent to ${accountId} via Telegram: ${result.result.message_id}`);
            resolve(true);
          } else {
            log(`Telegram error for ${accountId}: ${result.description}`);
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      });
    });
    
    req.on('error', (e) => {
      log(`Request error for ${accountId}: ${e.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

function moveTask(taskId, fromDir, toDir) {
  const from = path.join(TASKS_DIR, fromDir, taskId);
  const to = path.join(TASKS_DIR, toDir, taskId);
  
  try {
    fs.renameSync(from, to);
    log(`Moved ${taskId} from ${fromDir} to ${toDir}`);
    return true;
  } catch (e) {
    log(`Error moving ${taskId}: ${e.message}`);
    return false;
  }
}

function updateTaskState(taskId, newState, agentId) {
  const taskFile = path.join(TASKS_DIR, 'assigned', taskId);
  const task = readTaskFile(taskFile + '.json');
  
  if (!task) return false;
  
  task.state = newState;
  task.updated_at = new Date().toISOString();
  
  if (agentId) task.assigned_to = agentId;
  
  return writeTaskFile(taskFile + '.json', task);
}

function updateTaskBoard() {
  const boardFile = path.join(TASKS_DIR, 'task-board.json');
  const states = ['inbox', 'assigned', 'in_progress', 'review', 'done', 'failed'];
  const stats = {};
  const tasks = [];
  
  for (const state of states) {
    const dir = path.join(TASKS_DIR, state);
    stats[state] = 0;
    
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      stats[state] = files.length;
      
      for (const file of files) {
        const task = readTaskFile(path.join(dir, file));
        if (task) tasks.push({
          id: task.id,
          title: task.title,
          state: task.state,
          assigned_to: task.assigned_to
        });
      }
    }
  }
  
  try {
    const board = JSON.parse(fs.readFileSync(boardFile, 'utf8'));
    board.tasks = tasks;
    board.stats = stats;
    board.last_updated = new Date().toISOString();
    fs.writeFileSync(boardFile, JSON.stringify(board, null, 2));
    log('Task board updated');
  } catch (e) {
    log(`Error updating board: ${e.message}`);
  }
}

async function processTask(taskFile) {
  const taskId = path.basename(taskFile, '.json');
  log(`Processing: ${taskId}`);
  
  const task = readTaskFile(taskFile);
  if (!task) return;
  
  const agentId = task.assigned_to;
  if (!agentId) {
    log(`${taskId}: No agent assigned, skipping`);
    return;
  }
  
  // Move to assigned
  moveTask(taskId, 'inbox', 'assigned');
  
  // Update state
  updateTaskState(taskId, 'assigned', agentId);
  
  // Build message for agent
  const msg = `【新任務】
標題：${task.title || taskId}
優先級：${task.priority || 'medium'}

${task.description || ''}

${task.handoff_notes || ''}

請完成後通知家長確認。`;
  
  // Send to agent
  await sendTelegramMessage(agentId, msg);
  
  // Update task board
  updateTaskBoard();
  
  log(`${taskId} dispatched to ${agentId}`);
}

async function checkInbox() {
  const inboxDir = path.join(TASKS_DIR, 'inbox');
  
  if (!fs.existsSync(inboxDir)) {
    log('Inbox directory not found');
    return;
  }
  
  const files = fs.readdirSync(inboxDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    log('No new tasks in inbox');
    return;
  }
  
  log(`Found ${files.length} new task(s)`);
  
  for (const file of files) {
    await processTask(path.join(inboxDir, file));
  }
}

async function main() {
  log('=== Task Poller Started ===');
  
  try {
    await checkInbox();
  } catch (e) {
    log(`Error: ${e.message}`);
  }
  
  log('=== Task Poller Finished ===');
}

main();
