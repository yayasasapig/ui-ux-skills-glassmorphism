#!/usr/bin/env node
/**
 * 添加新物品到庫存
 */

const fs = require('fs');
const path = require('path');
const { parse, stringify } = require('csv/sync');
const readline = require('readline');

const inventoryFile = path.join(__dirname, 'home-inventory.csv');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('➕ 添加新物品到庫存\n');
  
  const item = {};
  
  item['物品ID'] = `INV${String(Date.now()).slice(-6)}`;
  item['物品名稱'] = await question('物品名稱: ');
  item['類別'] = await question('類別 (食品/日用品/清潔/藥品/電子產品/收藏品/美妝): ');
  item['品牌'] = await question('品牌: ');
  item['規格'] = await question('規格 (例如: 300g/1000ml/5盒裝): ');
  item['當前數量'] = await question('當前數量: ');
  item['最低庫存'] = await question('最低庫存 (安全庫存水平): ');
  item['消耗天數/單位'] = await question('消耗天數/單位 (預計用多少天，不確定填0): ');
  item['上次補貨日期'] = new Date().toISOString().split('T')[0];
  item['存放位置'] = await question('存放位置 (廚房/浴室/藥箱/工作室等): ');
  item['備註'] = await question('備註 (代購/客戶訂單等): ');
  item['條碼'] = await question('條碼 (無則留空): ') || '';
  
  rl.close();
  
  // 讀取現有 CSV
  const content = fs.readFileSync(inventoryFile, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });
  
  // 添加新記錄
  records.push(item);
  
  // 寫回
  const output = stringify(records, { header: true });
  fs.writeFileSync(inventoryFile, output);
  
  console.log('\n✅ 新物品已添加！');
  console.log(`物品ID: ${item['物品ID']}`);
}

main().catch(console.error);
