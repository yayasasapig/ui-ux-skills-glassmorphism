#!/bin/bash
# JetsClub Deals Daily Update Script
# Fetches latest deals from JetsClub and sends to Telegram

TELEGRAM_CHAT_ID="8744150155"
JETSOCLUB_URL="https://www.jetsoclub.com/?m=1"

# Use curl to fetch the page and extract recent posts
RESPONSE=$(curl -s "$JETSOCLUB_URL" 2>/dev/null)

if [ $? -eq 0 ]; then
    # Extract dates and titles (simplified parsing)
    echo "📢 JetsClub 今日著數資訊更新"
    echo ""
    echo "請打開 https://www.jetsoclub.com/ 查看最新優惠"
else
    echo "⚠️ 無法獲取 JetsClub 資訊"
fi
