#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
計算2026年3月15日嘅靈龜八法同飛騰八法開穴表
"""

# 天干地支
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 靈龜八法八穴對應八卦
LINGGUI_BAGUA = {
    "乾": "申脈",
    "兌": "照海", 
    "離": "外關",
    "震": "臨泣",
    "巽": "列缺",
    "坎": "內關",
    "艮": "公孫",
    "坤": "後溪"
}

# 靈龜八法穴位對應經絡
LINGGUI_JINGLUO = {
    "申脈": "足太陽膀胱經",
    "照海": "足少陰腎經",
    "外關": "手少陽三焦經",
    "臨泣": "足少陽膽經",
    "列缺": "手太陰肺經",
    "內關": "手厥陰心包經",
    "公孫": "足太陰脾經",
    "後溪": "手太陽小腸經"
}

# 飛騰八法八穴對應八卦（甲己子午九...）
FEITENG_BAGUA = {
    "乾": "公孫",
    "兌": "內關",
    "離": "後溪",
    "震": "外關",
    "巽": "臨泣",
    "坎": "照海",
    "艮": "申脈",
    "坤": "列缺"
}

# 時辰對應
time_shichen = {
    "子": "23:00-01:00",
    "丑": "01:00-03:00",
    "寅": "03:00-05:00",
    "卯": "05:00-07:00",
    "辰": "07:00-09:00",
    "巳": "09:00-11:00",
    "午": "11:00-13:00",
    "未": "13:00-15:00",
    "申": "15:00-17:00",
    "酉": "17:00-19:00",
    "戌": "19:00-21:00",
    "亥": "21:00-23:00"
}

def get_day_ganzhi(year, month, day):
    """計算日干支 - 使用蔡勒公式變體"""
    from datetime import datetime
    
    # 基準日：2024年1月1日係癸亥日 (第60日)
    base_date = datetime(2024, 1, 1)
    base_ganzhi_index = 59  # 癸亥係第60個，索引59 (0-based)
    
    target_date = datetime(year, month, day)
    delta_days = (target_date - base_date).days
    
    # 計算日干支索引
    ganzhi_index = (base_ganzhi_index + delta_days) % 60
    
    gan_idx = ganzhi_index % 10
    zhi_idx = ganzhi_index % 12
    
    return TIANGAN[gan_idx], DIZHI[zhi_idx], ganzhi_index + 1

def get_hour_ganzhi(day_gan, hour_zhi):
    """根據日干推算時干"""
    # 日干對應時干起始
    day_gan_idx = TIANGAN.index(day_gan)
    
    # 甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子
    if day_gan_idx in [0, 5]:  # 甲己
        start_gan = 0  # 甲
    elif day_gan_idx in [1, 6]:  # 乙庚
        start_gan = 2  # 丙
    elif day_gan_idx in [2, 7]:  # 丙辛
        start_gan = 4  # 戊
    elif day_gan_idx in [3, 8]:  # 丁壬
        start_gan = 6  # 庚
    else:  # 戊癸
        start_gan = 8  # 壬
    
    hour_zhi_idx = DIZHI.index(hour_zhi)
    hour_gan_idx = (start_gan + hour_zhi_idx) % 10
    
    return TIANGAN[hour_gan_idx], hour_zhi

def linggui_bafa(day_ganzhi_num, hour_zhi_idx):
    """
    靈龜八法計算
    公式：(日干支序數 + 時辰序數 - 1) % 9，餘數對應八卦
    若整除則取9
    """
    result = (day_ganzhi_num + hour_zhi_idx) % 9
    if result == 0:
        result = 9
    
    # 數字對應八卦
    bagua_num = {
        1: "坎",
        2: "坤", 
        3: "震",
        4: "巽",
        5: "中宮(男坤女艮)",
        6: "乾",
        7: "兌",
        8: "艮",
        9: "離"
    }
    
    return bagua_num[result]

def linggui_kexue(bagua):
    """根據主穴八卦計算客穴"""
    # 客穴對應：主與客相對
    ke_pairs = {
        "乾": "離",  # 申脈對外關
        "兌": "艮",  # 照海對公孫
        "離": "乾",  # 外關對申脈
        "震": "巽",  # 臨泣對列缺
        "巽": "震",  # 列缺對臨泣
        "坎": "坤",  # 內關對後溪
        "艮": "兌",  # 公孫對照海
        "坤": "坎"   # 後溪對內關
    }
    ke_bagua = ke_pairs.get(bagua, bagua)
    return ke_bagua

def feiteng_bafa(hour_gan, hour_zhi):
    """
    飛騰八法計算
    根據時干支的數字和取八卦
    歌訣：甲己子午九，乙庚丑未八，丙辛寅申七，丁壬卯酉六，戊癸辰戌五，巳亥四數終
    """
    # 干支對應數字
    num_map = {
        "甲": 9, "己": 9, "子": 9, "午": 9,
        "乙": 8, "庚": 8, "丑": 8, "未": 8,
        "丙": 7, "辛": 7, "寅": 7, "申": 7,
        "丁": 6, "壬": 6, "卯": 6, "酉": 6,
        "戊": 5, "癸": 5, "辰": 5, "戌": 5,
        "巳": 4, "亥": 4
    }
    
    total = num_map.get(hour_gan, 0) + num_map.get(hour_zhi, 0)
    remainder = total % 9
    if remainder == 0:
        remainder = 9
    
    # 數字對應八卦
    bagua_num = {
        1: "坎",
        2: "坤",
        3: "震", 
        4: "巽",
        5: "中宮",
        6: "乾",
        7: "兌",
        8: "艮",
        9: "離"
    }
    
    return bagua_num[remainder]

def main():
    print("=" * 80)
    print("2026年3月15日 十二時辰開穴表")
    print("=" * 80)
    
    # 計算日干支
    day_gan, day_zhi, day_ganzhi_num = get_day_ganzhi(2026, 3, 15)
    print(f"\n📅 日期：2026年3月15日（星期日）")
    print(f"📌 日干支：{day_gan}{day_zhi} (第{day_ganzhi_num}日)")
    print(f"📌 年干支：丙午年")
    
    print("\n" + "=" * 80)
    print("十二時辰開穴表")
    print("=" * 80)
    
    # 表頭
    print(f"\n{'時辰':<6} {'時間':<12} {'靈龜八法主穴':<12} {'狀態/經絡':<18} {'靈龜八法客穴':<12} {'飛騰八法':<10}")
    print("-" * 80)
    
    overlaps = []
    
    for i, zhi in enumerate(DIZHI):
        time_range = time_shichen[zhi]
        hour_gan, _ = get_hour_ganzhi(day_gan, zhi)
        
        # 靈龜八法
        lg_bagua = linggui_bafa(day_ganzhi_num, i)
        
        if "中宮" in lg_bagua:
            lg_xue = "中宮(閉穴)"
            lg_jingluo = "-"
        else:
            lg_xue = LINGGUI_BAGUA.get(lg_bagua, "-")
            lg_jingluo = LINGGUI_JINGLUO.get(lg_xue, "-")
        
        # 靈龜客穴
        ke_bagua = linggui_kexue(lg_bagua) if not "中宮" in lg_bagua else "-"
        ke_xue = LINGGUI_BAGUA.get(ke_bagua, "-") if ke_bagua != "-" else "-"
        
        # 飛騰八法
        ft_bagua = feiteng_bafa(hour_gan, zhi)
        if ft_bagua == "中宮":
            ft_xue = "中宮(閉穴)"
        else:
            ft_xue = FEITENG_BAGUA.get(ft_bagua, "-")
        
        # 檢查重疊
        if lg_xue == ft_xue and "中宮" not in lg_xue:
            overlaps.append(f"{zhi}時 ({time_range})")
            ft_display = f"{ft_xue} ✅"
        else:
            ft_display = ft_xue
        
        # 輸出
        if "中宮" in lg_bagua:
            lg_display = f"{lg_bagua}"
            ke_display = "-"
        else:
            lg_display = f"{lg_xue} ({lg_bagua})"
            ke_display = f"{ke_xue} ({ke_bagua})"
        
        print(f"{zhi}時    {time_range:<12} {lg_display:<18} {lg_jingluo:<16} {ke_display:<16} {ft_display}")
    
    print("\n" + "=" * 80)
    print("重疊時段（靈龜八法同飛騰八法開同一個穴）：")
    print("=" * 80)
    if overlaps:
        for ov in overlaps:
            print(f"  ✅ {ov}")
    else:
        print("  無重疊時段")
    
    print("\n" + "=" * 80)
    print("穴位對應參考：")
    print("=" * 80)
    print("\n【靈龜八法】")
    print("  乾-申脈(膀胱)  兌-照海(腎)  離-外關(三焦)  震-臨泣(膽)")
    print("  巽-列缺(肺)    坎-內關(心包) 艮-公孫(脾)    坤-後溪(小腸)")
    print("\n【飛騰八法】")
    print("  乾-公孫(脾)    兌-內關(心包) 離-後溪(小腸)  震-外關(三焦)")
    print("  巽-臨泣(膽)    坎-照海(腎)   艮-申脈(膀胱)  坤-列缺(肺)")

if __name__ == "__main__":
    main()
