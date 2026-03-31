#!/usr/bin/env node
/**
 * 自然語言庫存更新解析器
 * 支持粵語/中文口語命令
 */

const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/sync').parse;
const stringify = require('csv-stringify/sync').stringify;

const inventoryFile = path.join(__dirname, 'home-inventory.csv');

// 數字詞典
const numberMap = {
  '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
};

// 動作關鍵詞
const actionKeywords = {
  '用': 'consume', '用咗': 'consume', '用了': 'consume', '消耗': 'consume', '用完': 'consume',
  '買': 'restock', '買咗': 'restock', '買了': 'restock', '補': 'restock', '補貨': 'restock', '入貨': 'restock',
  '加': 'add', '添加': 'add', '新增': 'add',
  '查': 'query', '查看': 'query', '幾多': 'query', '多少': 'query', '庫存': 'query'
};

// 量詞映射
const unitKeywords = ['支', '包', '瓶', '個', '盒', '罐', '件'];

// 讀取庫存
function readInventory() {
  const content = fs.readFileSync(inventoryFile, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true
  });
}

// 保存庫存
function saveInventory(records) {
  const output = stringify(records, { header: true });
  fs.writeFileSync(inventoryFile, output);
}

// 模糊匹配產品名稱
function findItem(items, keyword) {
  // 完全匹配
  let match = items.find(item => 
    item['物品名稱'].toLowerCase() === keyword.toLowerCase()
  );
  if (match) return match;
  
  // 包含匹配
  match = items.find(item => 
    item['物品名稱'].toLowerCase().includes(keyword.toLowerCase())
  );
  if (match) return match;
  
  // 部分匹配（前3個字）
  if (keyword.length >= 2) {
    match = items.find(item => {
      const itemName = item['物品名稱'].toLowerCase();
      const searchKey = keyword.toLowerCase().slice(0, 3);
      return itemName.includes(searchKey);
    });
    if (match) return match;
  }
  
  return null;
}

// 解析數字
function parseNumber(text) {
  // 直接數字
  const directMatch = text.match(/(\d+)/);
  if (directMatch) return parseInt(directMatch[1]);
  
  // 中文數字
  for (const [cn, num] of Object.entries(numberMap)) {
    if (text.includes(cn)) return num;
  }
  
  return null;
}

// 解析命令
function parseCommand(text) {
  const result = {
    action: null,
    itemName: null,
    quantity: null,
    original: text
  };
  
  // 識別動作
  for (const [keyword, action] of Object.entries(actionKeywords)) {
    if (text.includes(keyword)) {
      result.action = action;
      break;
    }
  }
  
  // 如果沒有識別到動作，默認為查詢
  if (!result.action) {
    result.action = 'query';
  }
  
  // 解析數量
  result.quantity = parseNumber(text);
  
  // 如果沒有數量，默認為1（消耗/補貨）
  if (!result.quantity && (result.action === 'consume' || result.action === 'restock')) {
    result.quantity = 1;
  }
  
  return result;
}

// 提取產品名稱
function extractItemName(text, items) {
  // 移除動作詞和數字
  let cleaned = text;
  
  // 移除動作關鍵詞（按長度排序，先移除長的避免子串問題）
  const sortedKeywords = Object.keys(actionKeywords).sort((a, b) => b.length - a.length);
  sortedKeywords.forEach(keyword => {
    cleaned = cleaned.replace(new RegExp(keyword, 'g'), '');
  });
  
  // 移除數字
  cleaned = cleaned.replace(/[\d一二兩三四五六七八九十]+/g, '');
  
  // 移除量詞
  unitKeywords.forEach(unit => {
    cleaned = cleaned.replace(new RegExp(unit, 'g'), '');
  });
  
  // 清理標點和空格
  cleaned = cleaned.replace(/[：:，,。.;；\s]/g, '');
  
  // 嘗試匹配
  if (cleaned.length >= 1) {
    const match = findItem(items, cleaned);
    if (match) return match;
  }
  
  // 如果清理後太短，嘗試原句匹配
  // 移除常見詞後匹配
  const commonWords = ['咗', '了', '個', '支', '包', '瓶', '罐'];
  let searchText = text;
  commonWords.forEach(word => {
    searchText = searchText.replace(new RegExp(word, 'g'), '');
  });
  
  // 嘗試匹配原句中的每個詞
  const words = searchText.split(/[\s，,。.;；]+/).filter(w => w.length >= 2);
  for (const word of words) {
    const match = findItem(items, word);
    if (match) return match;
  }
  
  return null;
}

// 執行命令
function executeCommand(parsed, items) {
  const { action, itemName, quantity } = parsed;
  
  // 查找物品
  const item = extractItemName(itemName || parsed.original, items);
  
  if (!item) {
    return {
      success: false,
      message: `❌ 找不到產品：「${itemName || parsed.original}」\n\n請檢查庫存表中的產品名稱，或使用更準確的名稱。`
    };
  }
  
  const currentQty = parseInt(item['當前數量']);
  let newQty = currentQty;
  let message = '';
  
  switch (action) {
    case 'consume':
      newQty = currentQty - quantity;
      if (newQty < 0) newQty = 0;
      item['當前數量'] = newQty;
      item['上次補貨日期'] = new Date().toISOString().split('T')[0];
      
      message = `✅ **已記錄消耗**\n\n`;
      message += `📦 ${item['物品名稱']} (${item['規格']})\n`;
      message += `📉 ${currentQty} → ${newQty} (-${quantity})\n`;
      
      // 檢查是否需要提醒
      const minStock = parseInt(item['最低庫存']);
      if (newQty <= minStock) {
        message += `\n⚠️ **提醒**：已低於安全庫存 (${minStock})\n`;
        message += `🛒 建議儘快補貨！`;
      }
      break;
      
    case 'restock':
    case 'add':
      newQty = currentQty + quantity;
      item['當前數量'] = newQty;
      item['上次補貨日期'] = new Date().toISOString().split('T')[0];
      
      message = `✅ **已記錄補貨**\n\n`;
      message += `📦 ${item['物品名稱']} (${item['規格']})\n`;
      message += `📈 ${currentQty} → ${newQty} (+${quantity})\n`;
      
      // 代購提醒
      if (item['備註'] && item['備註'].includes('代購')) {
        message += `\n💰 **代購機會**：可同時為客戶補貨賺取利潤`;
      }
      break;
      
    case 'query':
      message = `📊 **庫存查詢**\n\n`;
      message += `📦 ${item['物品名稱']}\n`;
      message += `📍 位置: ${item['存放位置']}\n`;
      message += `📦 當前庫存: ${currentQty}\n`;
      message += `⚠️ 安全庫存: ${item['最低庫存']}\n`;
      message += `📅 上次補貨: ${item['上次補貨日期']}\n`;
      
      if (item['消耗天數/單位'] && parseInt(item['消耗天數/單位']) > 0) {
        const daysLeft = parseInt(item['消耗天數/單位']) * currentQty;
        message += `⏰ 預計可用: ${daysLeft} 天\n`;
      }
      
      if (item['備註']) {
        message += `💡 備註: ${item['備註']}`;
      }
      break;
      
    default:
      return {
        success: false,
        message: `❌ 不明白的命令\n\n請嘗試：\n• 「用咗1支沐浴露」\n• 「買咗3包檸檬王」\n• 「檸檬王庫存多少」`
      };
  }
  
  return {
    success: true,
    message,
    item,
    action
  };
}

// 批量更新
function batchUpdate(text, items, isRestock = true) {
  const lines = text.split(/[\n,，]/).filter(line => line.trim() && !line.match(/^[：:\s]+$/));
  const results = [];
  let hasChange = false;
  
  for (const line of lines) {
    // 支持中英文冒號
    const match = line.match(/^(.+?)[:：](.+)$/);
    if (match) {
      const name = match[1].trim();
      const qtyStr = match[2].trim();
      const qty = parseNumber(qtyStr);
      const item = extractItemName(name, items);
      
      if (item && qty !== null) {
        const oldQty = parseInt(item['當前數量']);
        const newQty = isRestock ? oldQty + qty : Math.max(0, oldQty - qty);
        
        item['當前數量'] = newQty;
        item['上次補貨日期'] = new Date().toISOString().split('T')[0];
        
        results.push(`✅ ${item['物品名稱']}: ${oldQty} → ${newQty} (${isRestock ? '+' : '-'}${qty})`);
        hasChange = true;
      } else {
        results.push(`❌ 無法識別: ${line}`);
      }
    }
  }
  
  if (!hasChange) {
    return { success: false, message: '❌ 未能識別任何有效更新\n\n格式範例：\n沐浴露: 2\n檸檬王: 5' };
  }
  
  return {
    success: true,
    message: `📋 **批量更新完成**\n\n${results.join('\n')}`
  };
}

// 主函數
function processMessage(text) {
  try {
    const items = readInventory();
    
    // 檢查是否批量更新
    const isBatchRestock = text.includes('更新庫存') || text.includes('買') || text.includes('補') || text.includes('入');
    if (text.includes('更新庫存') || (text.includes(':') && text.includes('\n'))) {
      return batchUpdate(text.replace('更新庫存', '').trim(), items, isBatchRestock);
    }
    
    // 單條命令解析
    const parsed = parseCommand(text);
    parsed.itemName = text; // 保存原始文本用於產品名稱提取
    
    const result = executeCommand(parsed, items);
    
    // 如果有變化，保存庫存
    if (result.success && (parsed.action === 'consume' || parsed.action === 'restock' || parsed.action === 'add')) {
      saveInventory(items);
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      message: `❌ 錯誤: ${error.message}`
    };
  }
}

// 命令行接口
if (require.main === module) {
  const text = process.argv.slice(2).join(' ');
  
  if (!text) {
    console.log('用法: node nlp-inventory.js "用咗1支沐浴露"');
    console.log('      node nlp-inventory.js "買咗3包檸檬王"');
    console.log('      node nlp-inventory.js "檸檬王庫存多少"');
    console.log('      node nlp-inventory.js "更新庫存：\n沐浴露: 2\n檸檬王: 3"');
    process.exit(1);
  }
  
  const result = processMessage(text);
  console.log(result.message);
  process.exit(result.success ? 0 : 1);
}

module.exports = { processMessage };
