#!/usr/bin/env node
/**
 * Home Inventory Management System
 * 自動檢查庫存並發送提醒
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  inventoryFile: path.join(__dirname, 'home-inventory.csv'),
  alertDays: 7,        // 提前7天提醒
  criticalDays: 3,     // 緊急提醒（3天內用完）
  telegramTo: '8744150155',
  telegramChannel: 'telegram'
};

// 讀取庫存
function readInventory() {
  const content = fs.readFileSync(CONFIG.inventoryFile, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true
  });
}

// 計算預計用完日期
function calculateDepletionDate(item) {
  const lastRestock = new Date(item['上次補貨日期']);
  const consumptionDays = parseInt(item['消耗天數/單位']);
  const currentQty = parseInt(item['當前數量']);
  
  if (consumptionDays === 0 || currentQty === 0) return null;
  
  const totalDays = consumptionDays * currentQty;
  const depletionDate = new Date(lastRestock);
  depletionDate.setDate(depletionDate.getDate() + totalDays);
  
  return depletionDate;
}

// 計算剩餘天數
function getDaysUntilDepletion(depletionDate) {
  if (!depletionDate) return Infinity;
  const today = new Date();
  const diffTime = depletionDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 獲取物品狀態
function getItemStatus(item) {
  const currentQty = parseInt(item['當前數量']);
  const minStock = parseInt(item['最低庫存']);
  const depletionDate = calculateDepletionDate(item);
  const daysLeft = getDaysUntilDepletion(depletionDate);
  
  // 已售罄
  if (currentQty === 0) return { level: 'out', daysLeft, message: '已售罄' };
  
  // 低於最低庫存
  if (currentQty <= minStock) return { level: 'critical', daysLeft, message: '低於安全庫存' };
  
  // 即將用完（3天內）
  if (daysLeft <= CONFIG.criticalDays) return { level: 'critical', daysLeft, message: `${daysLeft}天後用完` };
  
  // 需要補貨（7天內）
  if (daysLeft <= CONFIG.alertDays) return { level: 'warning', daysLeft, message: `${daysLeft}天後用完` };
  
  return { level: 'ok', daysLeft, message: '庫存充足' };
}

// 生成提醒訊息
function generateAlertMessage(items) {
  const critical = [];
  const warning = [];
  const outOfStock = [];
  
  items.forEach(item => {
    const status = getItemStatus(item);
    if (status.level === 'out') outOfStock.push({ item, status });
    else if (status.level === 'critical') critical.push({ item, status });
    else if (status.level === 'warning') warning.push({ item, status });
  });
  
  if (critical.length === 0 && warning.length === 0 && outOfStock.length === 0) {
    return null; // 無需提醒
  }
  
  let message = '🏠 **Home Inventory 提醒**\n\n';
  
  // 已售罄
  if (outOfStock.length > 0) {
    message += '🔴 **已售罄（需立即補貨）**\n';
    outOfStock.forEach(({ item }) => {
      message += `• ${item['物品名稱']} - ${item['規格']}\n`;
      if (item['備註']) message += `  💡 ${item['備註']}\n`;
    });
    message += '\n';
  }
  
  // 緊急提醒
  if (critical.length > 0) {
    message += '⚠️ **緊急補貨（3天內）**\n';
    critical.forEach(({ item, status }) => {
      message += `• ${item['物品名稱']} - ${status.message}\n`;
      message += `  📍 位置: ${item['存放位置']} | 現存: ${item['當前數量']}\n`;
    });
    message += '\n';
  }
  
  // 普通提醒
  if (warning.length > 0) {
    message += '💡 **即將需要補貨（7天內）**\n';
    warning.forEach(({ item, status }) => {
      message += `• ${item['物品名稱']} - ${status.message}\n`;
    });
    message += '\n';
  }
  
  // 反向代購商機提示
  const daigouItems = items.filter(item => 
    item['備註'] && item['備註'].includes('代購') && parseInt(item['當前數量']) <= 3
  );
  
  if (daigouItems.length > 0) {
    message += '🛒 **代購補貨機會**\n';
    daigouItems.forEach(item => {
      message += `• ${item['物品名稱']} - 可順便補貨賺取利潤\n`;
    });
    message += '\n';
  }
  
  message += '---\n查看完整庫存表請回覆「庫存」';
  
  return message;
}

// 生成購物清單
function generateShoppingList(items) {
  const needRestock = items.filter(item => {
    const status = getItemStatus(item);
    return status.level === 'critical' || status.level === 'out';
  });
  
  if (needRestock.length === 0) return null;
  
  let message = '🛒 **本週購物清單**\n\n';
  
  // 按類別分組
  const byCategory = {};
  needRestock.forEach(item => {
    const cat = item['類別'];
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });
  
  Object.entries(byCategory).forEach(([category, items]) => {
    message += `**${category}**\n`;
    items.forEach(item => {
      message += `□ ${item['物品名稱']} (${item['規格']}) x 建議買 ${parseInt(item['最低庫存']) + 1}\n`;
      if (item['品牌']) message += `  品牌: ${item['品牌']}\n`;
    });
    message += '\n';
  });
  
  // 購買地點建議
  const locations = [...new Set(needRestock.map(i => i['存放位置']))];
  message += `📍 檢查地點: ${locations.join(', ')}\n`;
  
  return message;
}

// 發送 Telegram 通知
function sendTelegram(message) {
  if (!message) return;
  
  try {
    // 使用 message 工具發送 (修正：使用 -t 而不是 --to)
    const cmd = `openclaw message send -t ${CONFIG.telegramTo} --channel ${CONFIG.telegramChannel} --message "${message.replace(/"/g, '\\"')}"`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error('發送通知失敗:', e.message);
    // 備用：輸出到 stdout
    console.log('\n========== 提醒訊息 ==========');
    console.log(message);
    console.log('==============================\n');
  }
}

// 統計報告
function generateStats(items) {
  const totalItems = items.length;
  const outOfStock = items.filter(i => parseInt(i['當前數量']) === 0).length;
  const lowStock = items.filter(i => {
    const status = getItemStatus(i);
    return status.level === 'critical';
  }).length;
  
  // 按類別統計
  const byCategory = {};
  items.forEach(item => {
    const cat = item['類別'];
    if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
    byCategory[cat].count++;
  });
  
  return {
    totalItems,
    outOfStock,
    lowStock,
    healthy: totalItems - outOfStock - lowStock,
    byCategory
  };
}

// 主函數
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  try {
    const items = readInventory();
    
    switch (command) {
      case 'check':
        // 每日檢查
        const alertMsg = generateAlertMessage(items);
        if (alertMsg) {
          sendTelegram(alertMsg);
          console.log('✅ 提醒已發送');
        } else {
          console.log('✅ 所有庫存充足，無需提醒');
        }
        break;
        
      case 'shopping-list':
        // 生成購物清單
        const listMsg = generateShoppingList(items);
        if (listMsg) {
          sendTelegram(listMsg);
        } else {
          console.log('✅ 暫無需購買物品');
        }
        break;
        
      case 'stats':
        // 統計報告
        const stats = generateStats(items);
        console.log('\n📊 庫存統計');
        console.log(`總物品數: ${stats.totalItems}`);
        console.log(`已售罄: ${stats.outOfStock}`);
        console.log(`低庫存: ${stats.lowStock}`);
        console.log(`庫存正常: ${stats.healthy}`);
        console.log('\n按類別分布:');
        Object.entries(stats.byCategory).forEach(([cat, data]) => {
          console.log(`  ${cat}: ${data.count} 項`);
        });
        break;
        
      case 'update':
        // 更新庫存（互動模式）
        console.log('使用方式: node inventory.js update <物品ID> <新數量>');
        console.log('例如: node inventory.js update INV001 5');
        break;
        
      default:
        console.log('用法: node inventory.js [check|shopping-list|stats|update]');
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    process.exit(1);
  }
}

main();
