#!/usr/bin/env node
/**
 * 更新庫存物品
 */

const fs = require('fs');
const path = require('path');
const { parse, stringify } = require('csv/sync');

const inventoryFile = path.join(__dirname, 'home-inventory.csv');

// 讀取參數
const [barcode, newQty, note] = process.argv.slice(2);

if (!barcode || !newQty) {
  console.log('用法: node update-item.js <條碼> <新數量> [備註]');
  process.exit(1);
}

// 讀取 CSV
const content = fs.readFileSync(inventoryFile, 'utf-8');
const records = parse(content, {
  columns: true,
  skip_empty_lines: true
});

// 查找並更新
let found = false;
const updatedRecords = records.map(record => {
  if (record['條碼'] === barcode || record['物品ID'] === barcode) {
    found = true;
    record['當前數量'] = newQty;
    record['上次補貨日期'] = new Date().toISOString().split('T')[0];
    if (note) record['備註'] = note;
    console.log(`✅ 已更新: ${record['物品名稱']} -> 數量: ${newQty}`);
  }
  return record;
});

if (!found) {
  console.log(`❌ 未找到條碼: ${barcode}`);
  process.exit(1);
}

// 寫回 CSV
const output = stringify(updatedRecords, { header: true });
fs.writeFileSync(inventoryFile, output);
console.log('💾 已保存到 home-inventory.csv');
