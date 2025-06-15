// ==UserScript==
// @name         [银河奶牛]强化运气统计
// @namespace    https://github.com/username/milkyway-enhancement-stats
// @version      1.2.1
// @description  银河奶牛强化运气统计插件 - 类似康康运气的强化运气分析 (优化多语言支持)
// @author       adudu
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // 配置
    const CONFIG = {
        DEBUG: true,
        STORAGE_KEY: 'mw_enhancement_luck_stats',
        CHECK_INTERVAL: 2000
    };

    // 多语言支持 (参考MWITools实现)
    const LANG = {
        // 自动检测游戏语言 - 使用游戏内设置
        detectLanguage() {
            // 优先使用游戏内语言设置 (参考MWITools)
            const gameLanguage = localStorage.getItem("i18nextLng")?.toLowerCase();
            if (gameLanguage?.startsWith("zh")) {
                return 'zh';
            } else if (gameLanguage?.startsWith("en")) {
                return 'en';
            }
            
            // 后备检测：检测页面中是否有英文强化相关文本
            const hasEnglish = document.querySelector('[role="tab"]')?.textContent?.includes('Enhance') ||
                              document.querySelector('.NavigationBar_label__1uH-y')?.textContent?.includes('Enhancing');
            return hasEnglish ? 'en' : 'zh';
        },

        getCurrentLang() {
            if (!this._currentLang) {
                this._currentLang = this.detectLanguage();
                logInfo('检测到游戏语言:', this._currentLang);
            }
            return this._currentLang;
        },

        // 强制刷新语言检测
        refreshLanguage() {
            this._currentLang = null;
            return this.getCurrentLang();
        },

        // 文本配置
        text: {
            zh: {
                // 按钮文本
                enhance: '强化',
                currentAction: '当前动作',
                stop: '停止',
                
                // UI文本
                enhancementData: '强化数据',
                level: '等级',
                success: '成功', 
                failed: '失败',
                rate: '概率',
                total: '总计',
                target: '目标',
                
                // 运气描述
                luckNormal: '运气正常',
                luckGood: '运气不错',
                luckExcellent: '运气爆表',
                luckBad: '运气不佳',
                luckTerrible: '运气极差',
                noData: '暂无数据',
                
                // 弹窗标题
                statsTitle: '强化运气统计',
                currentEnhancement: '当前强化',
                overallStats: '总体统计',
                levelDetails: '等级详情',
                recentHistory: '最近记录'
            },
            en: {
                // 按钮文本
                enhance: 'Enhance',
                currentAction: 'Current Action',
                stop: 'Stop',
                
                // UI文本
                enhancementData: 'Enhancement Data',
                level: 'Level',
                success: 'Success',
                failed: 'Failed', 
                rate: 'Rate',
                total: 'Total',
                target: 'Target',
                
                // 运气描述
                luckNormal: 'Normal Luck',
                luckGood: 'Good Luck',
                luckExcellent: 'Excellent Luck',
                luckBad: 'Bad Luck', 
                luckTerrible: 'Terrible Luck',
                noData: 'No Data',
                
                // 弹窗标题
                statsTitle: 'Enhancement Luck Stats',
                currentEnhancement: 'Current Enhancement',
                overallStats: 'Overall Stats',
                levelDetails: 'Level Details',
                recentHistory: 'Recent History'
            }
        },

        t(key) {
            const lang = this.getCurrentLang();
            return this.text[lang][key] || this.text.zh[key] || key;
        },

        // 物品名称翻译 (简化版，仅包含常见强化装备)
        translateItemName(itemName) {
            const lang = this.getCurrentLang();
            if (lang === 'zh') return itemName; // 中文界面直接返回
            
            // 英文到中文的常见装备映射
            const itemMap = {
            "Coin": "金币",
            "Task Token": "任务代币",
            "Chimerical Token": "奇幻代币",
            "Sinister Token": "阴森代币",
            "Enchanted Token": "秘法代币",
            "Pirate Token": "海盗代币",
            "Cowbell": "牛铃",
            "Bag Of 10 Cowbells": "牛铃袋 (10个)",
            "Purple's Gift": "小紫牛的礼物",
            "Small Meteorite Cache": "小陨石舱",
            "Medium Meteorite Cache": "中陨石舱",
            "Large Meteorite Cache": "大陨石舱",
            "Small Artisan's Crate": "小工匠匣",
            "Medium Artisan's Crate": "中工匠匣",
            "Large Artisan's Crate": "大工匠匣",
            "Small Treasure Chest": "小宝箱",
            "Medium Treasure Chest": "中宝箱",
            "Large Treasure Chest": "大宝箱",
            "Chimerical Chest": "奇幻宝箱",
            "Sinister Chest": "阴森宝箱",
            "Enchanted Chest": "秘法宝箱",
            "Pirate Chest": "海盗宝箱",
            "Blue Key Fragment": "蓝色钥匙碎片",
            "Green Key Fragment": "绿色钥匙碎片",
            "Purple Key Fragment": "紫色钥匙碎片",
            "White Key Fragment": "白色钥匙碎片",
            "Orange Key Fragment": "橙色钥匙碎片",
            "Brown Key Fragment": "棕色钥匙碎片",
            "Stone Key Fragment": "石头钥匙碎片",
            "Dark Key Fragment": "黑暗钥匙碎片",
            "Burning Key Fragment": "燃烧钥匙碎片",
            "Chimerical Entry Key": "奇幻钥匙",
            "Chimerical Chest Key": "奇幻宝箱钥匙",
            "Sinister Entry Key": "阴森钥匙",
            "Sinister Chest Key": "阴森宝箱钥匙",
            "Enchanted Entry Key": "秘法钥匙",
            "Enchanted Chest Key": "秘法宝箱钥匙",
            "Pirate Entry Key": "海盗钥匙",
            "Pirate Chest Key": "海盗宝箱钥匙",
            "Donut": "甜甜圈",
            "Blueberry Donut": "蓝莓甜甜圈",
            "Blackberry Donut": "黑莓甜甜圈",
            "Strawberry Donut": "草莓甜甜圈",
            "Mooberry Donut": "哞莓甜甜圈",
            "Marsberry Donut": "火星莓甜甜圈",
            "Spaceberry Donut": "太空莓甜甜圈",
            "Cupcake": "纸杯蛋糕",
            "Blueberry Cake": "蓝莓蛋糕",
            "Blackberry Cake": "黑莓蛋糕",
            "Strawberry Cake": "草莓蛋糕",
            "Mooberry Cake": "哞莓蛋糕",
            "Marsberry Cake": "火星莓蛋糕",
            "Spaceberry Cake": "太空莓蛋糕",
            "Gummy": "软糖",
            "Apple Gummy": "苹果软糖",
            "Orange Gummy": "橙子软糖",
            "Plum Gummy": "李子软糖",
            "Peach Gummy": "桃子软糖",
            "Dragon Fruit Gummy": "火龙果软糖",
            "Star Fruit Gummy": "杨桃软糖",
            "Yogurt": "酸奶",
            "Apple Yogurt": "苹果酸奶",
            "Orange Yogurt": "橙子酸奶",
            "Plum Yogurt": "李子酸奶",
            "Peach Yogurt": "桃子酸奶",
            "Dragon Fruit Yogurt": "火龙果酸奶",
            "Star Fruit Yogurt": "杨桃酸奶",
            "Milking Tea": "挤奶茶",
            "Foraging Tea": "采摘茶",
            "Woodcutting Tea": "伐木茶",
            "Cooking Tea": "烹饪茶",
            "Brewing Tea": "冲泡茶",
            "Alchemy Tea": "炼金茶",
            "Enhancing Tea": "强化茶",
            "Cheesesmithing Tea": "奶酪锻造茶",
            "Crafting Tea": "制作茶",
            "Tailoring Tea": "缝纫茶",
            "Super Milking Tea": "超级挤奶茶",
            "Super Foraging Tea": "超级采摘茶",
            "Super Woodcutting Tea": "超级伐木茶",
            "Super Cooking Tea": "超级烹饪茶",
            "Super Brewing Tea": "超级冲泡茶",
            "Super Alchemy Tea": "超级炼金茶",
            "Super Enhancing Tea": "超级强化茶",
            "Super Cheesesmithing Tea": "超级奶酪锻造茶",
            "Super Crafting Tea": "超级制作茶",
            "Super Tailoring Tea": "超级缝纫茶",
            "Ultra Milking Tea": "究极挤奶茶",
            "Ultra Foraging Tea": "究极采摘茶",
            "Ultra Woodcutting Tea": "究极伐木茶",
            "Ultra Cooking Tea": "究极烹饪茶",
            "Ultra Brewing Tea": "究极冲泡茶",
            "Ultra Alchemy Tea": "究极炼金茶",
            "Ultra Enhancing Tea": "究极强化茶",
            "Ultra Cheesesmithing Tea": "究极奶酪锻造茶",
            "Ultra Crafting Tea": "究极制作茶",
            "Ultra Tailoring Tea": "究极缝纫茶",
            "Gathering Tea": "采集茶",
            "Gourmet Tea": "美食茶",
            "Wisdom Tea": "经验茶",
            "Processing Tea": "加工茶",
            "Efficiency Tea": "效率茶",
            "Artisan Tea": "工匠茶",
            "Catalytic Tea": "催化茶",
            "Blessed Tea": "福气茶",
            "Stamina Coffee": "耐力咖啡",
            "Intelligence Coffee": "智力咖啡",
            "Defense Coffee": "防御咖啡",
            "Attack Coffee": "攻击咖啡",
            "Power Coffee": "力量咖啡",
            "Ranged Coffee": "远程咖啡",
            "Magic Coffee": "魔法咖啡",
            "Super Stamina Coffee": "超级耐力咖啡",
            "Super Intelligence Coffee": "超级智力咖啡",
            "Super Defense Coffee": "超级防御咖啡",
            "Super Attack Coffee": "超级攻击咖啡",
            "Super Power Coffee": "超级力量咖啡",
            "Super Ranged Coffee": "超级远程咖啡",
            "Super Magic Coffee": "超级魔法咖啡",
            "Ultra Stamina Coffee": "究极耐力咖啡",
            "Ultra Intelligence Coffee": "究极智力咖啡",
            "Ultra Defense Coffee": "究极防御咖啡",
            "Ultra Attack Coffee": "究极攻击咖啡",
            "Ultra Power Coffee": "究极力量咖啡",
            "Ultra Ranged Coffee": "究极远程咖啡",
            "Ultra Magic Coffee": "究极魔法咖啡",
            "Wisdom Coffee": "经验咖啡",
            "Lucky Coffee": "幸运咖啡",
            "Swiftness Coffee": "迅捷咖啡",
            "Channeling Coffee": "吟唱咖啡",
            "Critical Coffee": "暴击咖啡",
            "Poke": "破胆之刺",
            "Impale": "透骨之刺",
            "Puncture": "破甲之刺",
            "Penetrating Strike": "贯心之刺",
            "Scratch": "爪影斩",
            "Cleave": "分裂斩",
            "Maim": "血刃斩",
            "Crippling Slash": "致残斩",
            "Smack": "重碾",
            "Sweep": "重扫",
            "Stunning Blow": "重锤",
            "Fracturing Impact": "碎裂冲击",
            "Shield Bash": "盾击",
            "Quick Shot": "快速射击",
            "Aqua Arrow": "流水箭",
            "Flame Arrow": "烈焰箭",
            "Rain Of Arrows": "箭雨",
            "Silencing Shot": "沉默之箭",
            "Steady Shot": "稳定射击",
            "Pestilent Shot": "疫病射击",
            "Penetrating Shot": "贯穿射击",
            "Water Strike": "流水冲击",
            "Ice Spear": "冰枪术",
            "Frost Surge": "冰霜爆裂",
            "Mana Spring": "法力喷泉",
            "Entangle": "缠绕",
            "Toxic Pollen": "剧毒粉尘",
            "Nature's Veil": "自然菌幕",
            "Life Drain": "生命吸取",
            "Fireball": "火球",
            "Flame Blast": "熔岩爆裂",
            "Firestorm": "火焰风暴",
            "Smoke Burst": "烟爆灭影",
            "Minor Heal": "初级自愈术",
            "Heal": "自愈术",
            "Quick Aid": "快速治疗术",
            "Rejuvenate": "群体治疗术",
            "Taunt": "嘲讽",
            "Provoke": "挑衅",
            "Toughness": "坚韧",
            "Elusiveness": "闪避",
            "Precision": "精确",
            "Berserk": "狂暴",
            "Elemental Affinity": "元素增幅",
            "Frenzy": "狂速",
            "Spike Shell": "尖刺防护",
            "Arcane Reflection": "奥术反射",
            "Vampirism": "吸血",
            "Revive": "复活",
            "Insanity": "疯狂",
            "Invincible": "无敌",
            "Fierce Aura": "物理光环",
            "Aqua Aura": "流水光环",
            "Sylvan Aura": "自然光环",
            "Flame Aura": "火焰光环",
            "Speed Aura": "速度光环",
            "Critical Aura": "暴击光环",
            "Gobo Stabber": "哥布林长剑",
            "Gobo Slasher": "哥布林关刀",
            "Gobo Smasher": "哥布林狼牙棒",
            "Spiked Bulwark": "尖刺重盾",
            "Werewolf Slasher": "狼人关刀",
            "Griffin Bulwark": "狮鹫重盾",
            "Gobo Shooter": "哥布林弹弓",
            "Vampiric Bow": "吸血弓",
            "Cursed Bow": "咒怨之弓",
            "Gobo Boomstick": "哥布林火棍",
            "Cheese Bulwark": "奶酪重盾",
            "Verdant Bulwark": "翠绿重盾",
            "Azure Bulwark": "蔚蓝重盾",
            "Burble Bulwark": "深紫重盾",
            "Crimson Bulwark": "绛红重盾",
            "Rainbow Bulwark": "彩虹重盾",
            "Holy Bulwark": "神圣重盾",
            "Wooden Bow": "木弓",
            "Birch Bow": "桦木弓",
            "Cedar Bow": "雪松弓",
            "Purpleheart Bow": "紫心弓",
            "Ginkgo Bow": "银杏弓",
            "Redwood Bow": "红杉弓",
            "Arcane Bow": "神秘弓",
            "Stalactite Spear": "石钟长枪",
            "Granite Bludgeon": "花岗岩大棒",
            "Furious Spear": "狂怒长枪",
            "Regal Sword": "君王之剑",
            "Chaotic Flail": "混沌连枷",
            "Soul Hunter Crossbow": "灵魂猎手弩",
            "Sundering Crossbow": "裂空之弩",
            "Frost Staff": "冰霜法杖",
            "Infernal Battlestaff": "炼狱法杖",
            "Jackalope Staff": "鹿角兔之杖",
            "Rippling Trident": "涟漪三叉戟",
            "Blooming Trident": "绽放三叉戟",
            "Blazing Trident": "炽焰三叉戟",
            "Cheese Sword": "奶酪剑",
            "Verdant Sword": "翠绿剑",
            "Azure Sword": "蔚蓝剑",
            "Burble Sword": "深紫剑",
            "Crimson Sword": "绛红剑",
            "Rainbow Sword": "彩虹剑",
            "Holy Sword": "神圣剑",
            "Cheese Spear": "奶酪长枪",
            "Verdant Spear": "翠绿长枪",
            "Azure Spear": "蔚蓝长枪",
            "Burble Spear": "深紫长枪",
            "Crimson Spear": "绛红长枪",
            "Rainbow Spear": "彩虹长枪",
            "Holy Spear": "神圣长枪",
            "Cheese Mace": "奶酪钉头锤",
            "Verdant Mace": "翠绿钉头锤",
            "Azure Mace": "蔚蓝钉头锤",
            "Burble Mace": "深紫钉头锤",
            "Crimson Mace": "绛红钉头锤",
            "Rainbow Mace": "彩虹钉头锤",
            "Holy Mace": "神圣钉头锤",
            "Wooden Crossbow": "木弩",
            "Birch Crossbow": "桦木弩",
            "Cedar Crossbow": "雪松弩",
            "Purpleheart Crossbow": "紫心弩",
            "Ginkgo Crossbow": "银杏弩",
            "Redwood Crossbow": "红杉弩",
            "Arcane Crossbow": "神秘弩",
            "Wooden Water Staff": "木制水法杖",
            "Birch Water Staff": "桦木水法杖",
            "Cedar Water Staff": "雪松水法杖",
            "Purpleheart Water Staff": "紫心水法杖",
            "Ginkgo Water Staff": "银杏水法杖",
            "Redwood Water Staff": "红杉水法杖",
            "Arcane Water Staff": "神秘水法杖",
            "Wooden Nature Staff": "木制自然法杖",
            "Birch Nature Staff": "桦木自然法杖",
            "Cedar Nature Staff": "雪松自然法杖",
            "Purpleheart Nature Staff": "紫心自然法杖",
            "Ginkgo Nature Staff": "银杏自然法杖",
            "Redwood Nature Staff": "红杉自然法杖",
            "Arcane Nature Staff": "神秘自然法杖",
            "Wooden Fire Staff": "木制火法杖",
            "Birch Fire Staff": "桦木火法杖",
            "Cedar Fire Staff": "雪松火法杖",
            "Purpleheart Fire Staff": "紫心火法杖",
            "Ginkgo Fire Staff": "银杏火法杖",
            "Redwood Fire Staff": "红杉火法杖",
            "Arcane Fire Staff": "神秘火法杖",
            "Eye Watch": "掌上监工",
            "Snake Fang Dirk": "蛇牙短剑",
            "Vision Shield": "视觉盾",
            "Gobo Defender": "哥布林防御者",
            "Vampire Fang Dirk": "吸血鬼短剑",
            "Knight's Aegis": "骑士盾",
            "Treant Shield": "树人盾",
            "Manticore Shield": "蝎狮盾",
            "Tome Of Healing": "治疗之书",
            "Tome Of The Elements": "元素之书",
            "Watchful Relic": "警戒遗物",
            "Bishop's Codex": "主教法典",
            "Cheese Buckler": "奶酪圆盾",
            "Verdant Buckler": "翠绿圆盾",
            "Azure Buckler": "蔚蓝圆盾",
            "Burble Buckler": "深紫圆盾",
            "Crimson Buckler": "绛红圆盾",
            "Rainbow Buckler": "彩虹圆盾",
            "Holy Buckler": "神圣圆盾",
            "Wooden Shield": "木盾",
            "Birch Shield": "桦木盾",
            "Cedar Shield": "雪松盾",
            "Purpleheart Shield": "紫心盾",
            "Ginkgo Shield": "银杏盾",
            "Redwood Shield": "红杉盾",
            "Arcane Shield": "神秘盾",
            "Sinister Cape": "阴森斗篷",
            "Chimerical Quiver": "奇幻箭袋",
            "Enchanted Cloak": "秘法披风",
            "Red Culinary Hat": "红色厨师帽",
            "Snail Shell Helmet": "蜗牛壳头盔",
            "Vision Helmet": "视觉头盔",
            "Fluffy Red Hat": "蓬松红帽子",
            "Corsair Helmet": "掠夺者头盔",
            "Acrobatic Hood": "杂技师兜帽",
            "Magician's Hat": "魔术师帽",
            "Cheese Helmet": "奶酪头盔",
            "Verdant Helmet": "翠绿头盔",
            "Azure Helmet": "蔚蓝头盔",
            "Burble Helmet": "深紫头盔",
            "Crimson Helmet": "绛红头盔",
            "Rainbow Helmet": "彩虹头盔",
            "Holy Helmet": "神圣头盔",
            "Rough Hood": "粗糙兜帽",
            "Reptile Hood": "爬行动物兜帽",
            "Gobo Hood": "哥布林兜帽",
            "Beast Hood": "野兽兜帽",
            "Umbral Hood": "暗影兜帽",
            "Cotton Hat": "棉帽",
            "Linen Hat": "亚麻帽",
            "Bamboo Hat": "竹帽",
            "Silk Hat": "丝帽",
            "Radiant Hat": "光辉帽",
            "Dairyhand's Top": "挤奶工上衣",
            "Forager's Top": "采摘者上衣",
            "Lumberjack's Top": "伐木工上衣",
            "Cheesemaker's Top": "奶酪师上衣",
            "Crafter's Top": "工匠上衣",
            "Tailor's Top": "裁缝上衣",
            "Chef's Top": "厨师上衣",
            "Brewer's Top": "饮品师上衣",
            "Alchemist's Top": "炼金师上衣",
            "Enhancer's Top": "强化师上衣",
            "Gator Vest": "鳄鱼马甲",
            "Turtle Shell Body": "龟壳胸甲",
            "Colossus Plate Body": "巨像胸甲",
            "Demonic Plate Body": "恶魔胸甲",
            "Anchorbound Plate Body": "锚定胸甲",
            "Maelstrom Plate Body": "怒涛胸甲",
            "Marine Tunic": "海洋皮衣",
            "Revenant Tunic": "亡灵皮衣",
            "Griffin Tunic": "狮鹫皮衣",
            "Kraken Tunic": "克拉肯皮衣",
            "Icy Robe Top": "冰霜袍服",
            "Flaming Robe Top": "烈焰袍服",
            "Luna Robe Top": "月神袍服",
            "Royal Water Robe Top": "皇家水系袍服",
            "Royal Nature Robe Top": "皇家自然系袍服",
            "Royal Fire Robe Top": "皇家火系袍服",
            "Cheese Plate Body": "奶酪胸甲",
            "Verdant Plate Body": "翠绿胸甲",
            "Azure Plate Body": "蔚蓝胸甲",
            "Burble Plate Body": "深紫胸甲",
            "Crimson Plate Body": "绛红胸甲",
            "Rainbow Plate Body": "彩虹胸甲",
            "Holy Plate Body": "神圣胸甲",
            "Rough Tunic": "粗糙皮衣",
            "Reptile Tunic": "爬行动物皮衣",
            "Gobo Tunic": "哥布林皮衣",
            "Beast Tunic": "野兽皮衣",
            "Umbral Tunic": "暗影皮衣",
            "Cotton Robe Top": "棉布袍服",
            "Linen Robe Top": "亚麻袍服",
            "Bamboo Robe Top": "竹袍服",
            "Silk Robe Top": "丝绸袍服",
            "Radiant Robe Top": "光辉袍服",
            "Dairyhand's Bottoms": "挤奶工下装",
            "Forager's Bottoms": "采摘者下装",
            "Lumberjack's Bottoms": "伐木工下装",
            "Cheesemaker's Bottoms": "奶酪师下装",
            "Crafter's Bottoms": "工匠下装",
            "Tailor's Bottoms": "裁缝下装",
            "Chef's Bottoms": "厨师下装",
            "Brewer's Bottoms": "饮品师下装",
            "Alchemist's Bottoms": "炼金师下装",
            "Enhancer's Bottoms": "强化师下装",
            "Turtle Shell Legs": "龟壳腿甲",
            "Colossus Plate Legs": "巨像腿甲",
            "Demonic Plate Legs": "恶魔腿甲",
            "Anchorbound Plate Legs": "锚定腿甲",
            "Maelstrom Plate Legs": "怒涛腿甲",
            "Marine Chaps": "航海皮裤",
            "Revenant Chaps": "亡灵皮裤",
            "Griffin Chaps": "狮鹫皮裤",
            "Kraken Chaps": "克拉肯皮裤",
            "Icy Robe Bottoms": "冰霜袍裙",
            "Flaming Robe Bottoms": "烈焰袍裙",
            "Luna Robe Bottoms": "月神袍裙",
            "Royal Water Robe Bottoms": "皇家水系袍裙",
            "Royal Nature Robe Bottoms": "皇家自然系袍裙",
            "Royal Fire Robe Bottoms": "皇家火系袍裙",
            "Cheese Plate Legs": "奶酪腿甲",
            "Verdant Plate Legs": "翠绿腿甲",
            "Azure Plate Legs": "蔚蓝腿甲",
            "Burble Plate Legs": "深紫腿甲",
            "Crimson Plate Legs": "绛红腿甲",
            "Rainbow Plate Legs": "彩虹腿甲",
            "Holy Plate Legs": "神圣腿甲",
            "Rough Chaps": "粗糙皮裤",
            "Reptile Chaps": "爬行动物皮裤",
            "Gobo Chaps": "哥布林皮裤",
            "Beast Chaps": "野兽皮裤",
            "Umbral Chaps": "暗影皮裤",
            "Cotton Robe Bottoms": "棉袍裙",
            "Linen Robe Bottoms": "亚麻袍裙",
            "Bamboo Robe Bottoms": "竹袍裙",
            "Silk Robe Bottoms": "丝绸袍裙",
            "Radiant Robe Bottoms": "光辉袍裙",
            "Enchanted Gloves": "附魔手套",
            "Pincer Gloves": "蟹钳手套",
            "Panda Gloves": "熊猫手套",
            "Magnetic Gloves": "磁力手套",
            "Dodocamel Gauntlets": "渡渡驼护手",
            "Sighted Bracers": "瞄准护腕",
            "Marksman Bracers": "神射护腕",
            "Chrono Gloves": "时空手套",
            "Cheese Gauntlets": "奶酪护手",
            "Verdant Gauntlets": "翠绿护手",
            "Azure Gauntlets": "蔚蓝护手",
            "Burble Gauntlets": "深紫护手",
            "Crimson Gauntlets": "绛红护手",
            "Rainbow Gauntlets": "彩虹护手",
            "Holy Gauntlets": "神圣护手",
            "Rough Bracers": "粗糙护腕",
            "Reptile Bracers": "爬行动物护腕",
            "Gobo Bracers": "哥布林护腕",
            "Beast Bracers": "野兽护腕",
            "Umbral Bracers": "暗影护腕",
            "Cotton Gloves": "棉手套",
            "Linen Gloves": "亚麻手套",
            "Bamboo Gloves": "竹手套",
            "Silk Gloves": "丝手套",
            "Radiant Gloves": "光辉手套",
            "Collector's Boots": "收藏家靴",
            "Shoebill Shoes": "鲸头鹳鞋",
            "Black Bear Shoes": "黑熊鞋",
            "Grizzly Bear Shoes": "棕熊鞋",
            "Polar Bear Shoes": "北极熊鞋",
            "Centaur Boots": "半人马靴",
            "Sorcerer Boots": "巫师靴",
            "Cheese Boots": "奶酪靴",
            "Verdant Boots": "翠绿靴",
            "Azure Boots": "蔚蓝靴",
            "Burble Boots": "深紫靴",
            "Crimson Boots": "绛红靴",
            "Rainbow Boots": "彩虹靴",
            "Holy Boots": "神圣靴",
            "Rough Boots": "粗糙靴",
            "Reptile Boots": "爬行动物靴",
            "Gobo Boots": "哥布林靴",
            "Beast Boots": "野兽靴",
            "Umbral Boots": "暗影靴",
            "Cotton Boots": "棉靴",
            "Linen Boots": "亚麻靴",
            "Bamboo Boots": "竹靴",
            "Silk Boots": "丝靴",
            "Radiant Boots": "光辉靴",
            "Small Pouch": "小袋子",
            "Medium Pouch": "中袋子",
            "Large Pouch": "大袋子",
            "Giant Pouch": "巨大袋子",
            "Gluttonous Pouch": "贪食之袋",
            "Guzzling Pouch": "暴饮之囊",
            "Necklace Of Efficiency": "效率项链",
            "Fighter Necklace": "战士项链",
            "Ranger Necklace": "射手项链",
            "Wizard Necklace": "巫师项链",
            "Necklace Of Wisdom": "经验项链",
            "Necklace Of Speed": "速度项链",
            "Philosopher's Necklace": "贤者项链",
            "Earrings Of Gathering": "采集耳环",
            "Earrings Of Essence Find": "精华发现耳环",
            "Earrings Of Armor": "护甲耳环",
            "Earrings Of Regeneration": "恢复耳环",
            "Earrings Of Resistance": "抗性耳环",
            "Earrings Of Rare Find": "稀有发现耳环",
            "Earrings Of Critical Strike": "暴击耳环",
            "Philosopher's Earrings": "贤者耳环",
            "Ring Of Gathering": "采集戒指",
            "Ring Of Essence Find": "精华发现戒指",
            "Ring Of Armor": "护甲戒指",
            "Ring Of Regeneration": "恢复戒指",
            "Ring Of Resistance": "抗性戒指",
            "Ring Of Rare Find": "稀有发现戒指",
            "Ring Of Critical Strike": "暴击戒指",
            "Philosopher's Ring": "贤者戒指",
            "Basic Task Badge": "基础任务徽章",
            "Advanced Task Badge": "高级任务徽章",
            "Expert Task Badge": "专家任务徽章",
            "Celestial Brush": "星空刷子",
            "Cheese Brush": "奶酪刷子",
            "Verdant Brush": "翠绿刷子",
            "Azure Brush": "蔚蓝刷子",
            "Burble Brush": "深紫刷子",
            "Crimson Brush": "绛红刷子",
            "Rainbow Brush": "彩虹刷子",
            "Holy Brush": "神圣刷子",
            "Celestial Shears": "星空剪刀",
            "Cheese Shears": "奶酪剪刀",
            "Verdant Shears": "翠绿剪刀",
            "Azure Shears": "蔚蓝剪刀",
            "Burble Shears": "深紫剪刀",
            "Crimson Shears": "绛红剪刀",
            "Rainbow Shears": "彩虹剪刀",
            "Holy Shears": "神圣剪刀",
            "Celestial Hatchet": "星空斧头",
            "Cheese Hatchet": "奶酪斧头",
            "Verdant Hatchet": "翠绿斧头",
            "Azure Hatchet": "蔚蓝斧头",
            "Burble Hatchet": "深紫斧头",
            "Crimson Hatchet": "绛红斧头",
            "Rainbow Hatchet": "彩虹斧头",
            "Holy Hatchet": "神圣斧头",
            "Celestial Hammer": "星空锤子",
            "Cheese Hammer": "奶酪锤子",
            "Verdant Hammer": "翠绿锤子",
            "Azure Hammer": "蔚蓝锤子",
            "Burble Hammer": "深紫锤子",
            "Crimson Hammer": "绛红锤子",
            "Rainbow Hammer": "彩虹锤子",
            "Holy Hammer": "神圣锤子",
            "Celestial Chisel": "星空凿子",
            "Cheese Chisel": "奶酪凿子",
            "Verdant Chisel": "翠绿凿子",
            "Azure Chisel": "蔚蓝凿子",
            "Burble Chisel": "深紫凿子",
            "Crimson Chisel": "绛红凿子",
            "Rainbow Chisel": "彩虹凿子",
            "Holy Chisel": "神圣凿子",
            "Celestial Needle": "星空针",
            "Cheese Needle": "奶酪针",
            "Verdant Needle": "翠绿针",
            "Azure Needle": "蔚蓝针",
            "Burble Needle": "深紫针",
            "Crimson Needle": "绛红针",
            "Rainbow Needle": "彩虹针",
            "Holy Needle": "神圣针",
            "Celestial Spatula": "星空锅铲",
            "Cheese Spatula": "奶酪锅铲",
            "Verdant Spatula": "翠绿锅铲",
            "Azure Spatula": "蔚蓝锅铲",
            "Burble Spatula": "深紫锅铲",
            "Crimson Spatula": "绛红锅铲",
            "Rainbow Spatula": "彩虹锅铲",
            "Holy Spatula": "神圣锅铲",
            "Celestial Pot": "星空壶",
            "Cheese Pot": "奶酪壶",
            "Verdant Pot": "翠绿壶",
            "Azure Pot": "蔚蓝壶",
            "Burble Pot": "深紫壶",
            "Crimson Pot": "绛红壶",
            "Rainbow Pot": "彩虹壶",
            "Holy Pot": "神圣壶",
            "Celestial Alembic": "星空蒸馏器",
            "Cheese Alembic": "奶酪蒸馏器",
            "Verdant Alembic": "翠绿蒸馏器",
            "Azure Alembic": "蔚蓝蒸馏器",
            "Burble Alembic": "深紫蒸馏器",
            "Crimson Alembic": "绛红蒸馏器",
            "Rainbow Alembic": "彩虹蒸馏器",
            "Holy Alembic": "神圣蒸馏器",
            "Celestial Enhancer": "星空强化器",
            "Cheese Enhancer": "奶酪强化器",
            "Verdant Enhancer": "翠绿强化器",
            "Azure Enhancer": "蔚蓝强化器",
            "Burble Enhancer": "深紫强化器",
            "Crimson Enhancer": "绛红强化器",
            "Rainbow Enhancer": "彩虹强化器",
            "Holy Enhancer": "神圣强化器",
            "Milk": "牛奶",
            "Verdant Milk": "翠绿牛奶",
            "Azure Milk": "蔚蓝牛奶",
            "Burble Milk": "深紫牛奶",
            "Crimson Milk": "绛红牛奶",
            "Rainbow Milk": "彩虹牛奶",
            "Holy Milk": "神圣牛奶",
            "Cheese": "奶酪",
            "Verdant Cheese": "翠绿奶酪",
            "Azure Cheese": "蔚蓝奶酪",
            "Burble Cheese": "深紫奶酪",
            "Crimson Cheese": "绛红奶酪",
            "Rainbow Cheese": "彩虹奶酪",
            "Holy Cheese": "神圣奶酪",
            "Log": "原木",
            "Birch Log": "白桦原木",
            "Cedar Log": "雪松原木",
            "Purpleheart Log": "紫心原木",
            "Ginkgo Log": "银杏原木",
            "Redwood Log": "红杉原木",
            "Arcane Log": "神秘原木",
            "Lumber": "木板",
            "Birch Lumber": "白桦木板",
            "Cedar Lumber": "雪松木板",
            "Purpleheart Lumber": "紫心木板",
            "Ginkgo Lumber": "银杏木板",
            "Redwood Lumber": "红杉木板",
            "Arcane Lumber": "神秘木板",
            "Rough Hide": "粗糙兽皮",
            "Reptile Hide": "爬行动物皮",
            "Gobo Hide": "哥布林皮",
            "Beast Hide": "野兽皮",
            "Umbral Hide": "暗影皮",
            "Rough Leather": "粗糙皮革",
            "Reptile Leather": "爬行动物皮革",
            "Gobo Leather": "哥布林皮革",
            "Beast Leather": "野兽皮革",
            "Umbral Leather": "暗影皮革",
            "Cotton": "棉花",
            "Flax": "亚麻",
            "Bamboo Branch": "竹子",
            "Cocoon": "蚕茧",
            "Radiant Fiber": "光辉纤维",
            "Cotton Fabric": "棉花布料",
            "Linen Fabric": "亚麻布料",
            "Bamboo Fabric": "竹子布料",
            "Silk Fabric": "丝绸",
            "Radiant Fabric": "光辉布料",
            "Egg": "鸡蛋",
            "Wheat": "小麦",
            "Sugar": "糖",
            "Blueberry": "蓝莓",
            "Blackberry": "黑莓",
            "Strawberry": "草莓",
            "Mooberry": "哞莓",
            "Marsberry": "火星莓",
            "Spaceberry": "太空莓",
            "Apple": "苹果",
            "Orange": "橙子",
            "Plum": "李子",
            "Peach": "桃子",
            "Dragon Fruit": "火龙果",
            "Star Fruit": "杨桃",
            "Arabica Coffee Bean": "低级咖啡豆",
            "Robusta Coffee Bean": "中级咖啡豆",
            "Liberica Coffee Bean": "高级咖啡豆",
            "Excelsa Coffee Bean": "特级咖啡豆",
            "Fieriosa Coffee Bean": "火山咖啡豆",
            "Spacia Coffee Bean": "太空咖啡豆",
            "Green Tea Leaf": "绿茶叶",
            "Black Tea Leaf": "黑茶叶",
            "Burble Tea Leaf": "紫茶叶",
            "Moolong Tea Leaf": "哞龙茶叶",
            "Red Tea Leaf": "红茶叶",
            "Emp Tea Leaf": "虚空茶叶",
            "Catalyst Of Coinification": "点金催化剂",
            "Catalyst Of Decomposition": "分解催化剂",
            "Catalyst Of Transmutation": "转化催化剂",
            "Prime Catalyst": "至高催化剂",
            "Snake Fang": "蛇牙",
            "Shoebill Feather": "鲸头鹳羽毛",
            "Snail Shell": "蜗牛壳",
            "Crab Pincer": "蟹钳",
            "Turtle Shell": "乌龟壳",
            "Marine Scale": "海洋鳞片",
            "Treant Bark": "树皮",
            "Centaur Hoof": "半人马蹄",
            "Luna Wing": "月神翼",
            "Gobo Rag": "哥布林抹布",
            "Goggles": "护目镜",
            "Magnifying Glass": "放大镜",
            "Eye Of The Watcher": "观察者之眼",
            "Icy Cloth": "冰霜织物",
            "Flaming Cloth": "烈焰织物",
            "Sorcerer's Sole": "魔法师鞋底",
            "Chrono Sphere": "时空球",
            "Frost Sphere": "冰霜球",
            "Panda Fluff": "熊猫绒",
            "Black Bear Fluff": "黑熊绒",
            "Grizzly Bear Fluff": "棕熊绒",
            "Polar Bear Fluff": "北极熊绒",
            "Red Panda Fluff": "小熊猫绒",
            "Magnet": "磁铁",
            "Stalactite Shard": "钟乳石碎片",
            "Living Granite": "花岗岩",
            "Colossus Core": "巨像核心",
            "Vampire Fang": "吸血鬼之牙",
            "Werewolf Claw": "狼人之爪",
            "Revenant Anima": "亡者之魂",
            "Soul Fragment": "灵魂碎片",
            "Infernal Ember": "地狱余烬",
            "Demonic Core": "恶魔核心",
            "Griffin Leather": "狮鹫之皮",
            "Manticore Sting": "蝎狮之刺",
            "Jackalope Antler": "鹿角兔之角",
            "Dodocamel Plume": "渡渡驼之翎",
            "Griffin Talon": "狮鹫之爪",
            "Acrobat's Ribbon": "杂技师彩带",
            "Magician's Cloth": "魔术师织物",
            "Chaotic Chain": "混沌锁链",
            "Cursed Ball": "诅咒之球",
            "Royal Cloth": "皇家织物",
            "Knight's Ingot": "骑士之锭",
            "Bishop's Scroll": "主教卷轴",
            "Regal Jewel": "君王宝石",
            "Sundering Jewel": "裂空宝石",
            "Marksman Brooch": "神射胸针",
            "Corsair Crest": "掠夺者徽章",
            "Damaged Anchor": "破损船锚",
            "Maelstrom Plating": "怒涛甲片",
            "Kraken Leather": "克拉肯皮革",
            "Kraken Fang": "克拉肯之牙",
            "Butter Of Proficiency": "精通之油",
            "Thread Of Expertise": "专精之线",
            "Branch Of Insight": "洞察之枝",
            "Gluttonous Energy": "贪食能量",
            "Guzzling Energy": "暴饮能量",
            "Milking Essence": "挤奶精华",
            "Foraging Essence": "采摘精华",
            "Woodcutting Essence": "伐木精华",
            "Cheesesmithing Essence": "奶酪锻造精华",
            "Crafting Essence": "制作精华",
            "Tailoring Essence": "缝纫精华",
            "Cooking Essence": "烹饪精华",
            "Brewing Essence": "冲泡精华",
            "Alchemy Essence": "炼金精华",
            "Enhancing Essence": "强化精华",
            "Swamp Essence": "沼泽精华",
            "Aqua Essence": "海洋精华",
            "Jungle Essence": "丛林精华",
            "Gobo Essence": "哥布林精华",
            "Eyessence": "眼精华",
            "Sorcerer Essence": "法师精华",
            "Bear Essence": "熊熊精华",
            "Golem Essence": "魔像精华",
            "Twilight Essence": "暮光精华",
            "Abyssal Essence": "地狱精华",
            "Chimerical Essence": "奇幻精华",
            "Sinister Essence": "阴森精华",
            "Enchanted Essence": "秘法精华",
            "Pirate Essence": "海盗精华",
            "Task Crystal": "任务水晶",
            "Star Fragment": "星光碎片",
            "Pearl": "珍珠",
            "Amber": "琥珀",
            "Garnet": "石榴石",
            "Jade": "翡翠",
            "Amethyst": "紫水晶",
            "Moonstone": "月亮石",
            "Sunstone": "太阳石",
            "Philosopher's Stone": "贤者之石",
            "Crushed Pearl": "珍珠碎片",
            "Crushed Amber": "琥珀碎片",
            "Crushed Garnet": "石榴石碎片",
            "Crushed Jade": "翡翠碎片",
            "Crushed Amethyst": "紫水晶碎片",
            "Crushed Moonstone": "月亮石碎片",
            "Crushed Sunstone": "太阳石碎片",
            "Crushed Philosopher's Stone": "贤者之石碎片",
            "Shard Of Protection": "保护碎片",
            "Mirror Of Protection": "保护之镜"
            };
            
            return itemMap[itemName] || itemName;
        }
    };

    // 强化基础成功率 (来自MWITools)
    const ENHANCEMENT_BASE_RATES = [
        50, //+0 → +1
        45, //+1 → +2
        45, //+2 → +3
        40, //+3 → +4
        40, //+4 → +5
        40, //+5 → +6
        35, //+6 → +7
        35, //+7 → +8
        35, //+8 → +9
        35, //+9 → +10
        30, //+10 → +11
        30, //+11 → +12
        30, //+12 → +13
        30, //+13 → +14
        30, //+14 → +15
        30, //+15 → +16
        30, //+16 → +17
        30, //+17 → +18
        30, //+18 → +19
        30, //+19 → +20
    ];

    // MWI默认强化配置
    const DEFAULT_ENHANCEMENT_CONFIG = {
        enhancing_level: 120,        // 强化技能等级
        laboratory_level: 5,         // 房子等级
        enhancer_bonus: 5.00,        // 工具提高成功率 (10级工具)
        tea_enhancing: false,        // 强化茶
        tea_super_enhancing: false,  // 超级强化茶
        tea_ultra_enhancing: true,   // 终极强化茶
        tea_blessed: true,           // 祝福茶
        item_level: 95              // 默认装备等级
    };

    // 调试日志
    const log = (...args) => {
        if (CONFIG.DEBUG) {
            console.log('[强化运气统计]', ...args);
        }
    };

    const logInfo = (...args) => {
        if (CONFIG.DEBUG) {
            console.info('[强化运气统计][INFO]', ...args);
        }
    };

    const logWarn = (...args) => {
        if (CONFIG.DEBUG) {
            console.warn('[强化运气统计][WARN]', ...args);
        }
    };

    const logError = (...args) => {
        if (CONFIG.DEBUG) {
            console.error('[强化运气统计][ERROR]', ...args);
        }
    };

    // 存储管理
    class StorageManager {
        static getData() {
            try {
                logInfo('开始读取存储数据...');
                const data = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (data) {
                    const parsedData = JSON.parse(data);
                    logInfo('成功读取存储数据:', {
                        sessions: parsedData.sessions?.length || 0,
                        currentSessionEnhancements: parsedData.currentSession?.enhancements?.length || 0,
                        totalStatsKeys: Object.keys(parsedData.totalStats || {}).length
                    });
                    return parsedData;
                } else {
                    logInfo('未找到存储数据，创建默认数据结构');
                    return {
                        sessions: [],
                        currentSession: {
                            id: Date.now(),
                            startTime: Date.now(),
                            enhancements: []
                        },
                        totalStats: {}
                    };
                }
            } catch (error) {
                logError('读取存储数据失败:', error);
                return { sessions: [], currentSession: null, totalStats: {} };
            }
        }

        static saveData(data) {
            try {
                logInfo('开始保存数据...');
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
                logInfo('数据保存成功:', {
                    sessions: data.sessions?.length || 0,
                    currentSessionEnhancements: data.currentSession?.enhancements?.length || 0,
                    totalStatsKeys: Object.keys(data.totalStats || {}).length
                });
                return true;
            } catch (error) {
                logError('保存数据失败:', error);
                return false;
            }
        }
    }

    // 强化成功率计算器 (基于MWITools算法)
    class EnhancementRateCalculator {
        static calculateActualRate(level, config = DEFAULT_ENHANCEMENT_CONFIG) {
            // 获取基础成功率
            const baseRate = ENHANCEMENT_BASE_RATES[level] || 30;
            
            // 计算有效强化等级
            const effective_level = 
                config.enhancing_level +
                (config.tea_enhancing ? 3 : 0) +
                (config.tea_super_enhancing ? 6 : 0) +
                (config.tea_ultra_enhancing ? 8 : 0);
            
            // 计算总强化buff
            let total_bonus;
            if (effective_level >= config.item_level) {
                total_bonus = 1 + (0.05 * (effective_level + config.laboratory_level - config.item_level) + config.enhancer_bonus) / 100;
            } else {
                total_bonus = 1 - 0.5 * (1 - effective_level / config.item_level) + (0.05 * config.laboratory_level + config.enhancer_bonus) / 100;
            }
            
            // 计算最终成功率
            const finalRate = (baseRate / 100.0) * total_bonus;
            
            logInfo('强化成功率计算:', {
                level: level,
                baseRate: baseRate + '%',
                effective_level: effective_level,
                total_bonus: total_bonus.toFixed(1),
                finalRate: (finalRate * 100).toFixed(1) + '%'
            });
            
            return Math.min(finalRate, 1.0); // 最大100%
        }
    }

    // 运气计算器
    class LuckCalculator {
        static calculateLuck(actualSuccesses, totalAttempts, expectedRate) {
            logInfo('计算运气:', { actualSuccesses, totalAttempts, expectedRate });
            
            if (totalAttempts === 0) {
                logWarn('总尝试次数为0，返回默认运气数据');
                return { luck: 0, description: LANG.t('noData'), color: '#666' };
            }

            const actualRate = actualSuccesses / totalAttempts;
            const expectedSuccesses = totalAttempts * expectedRate;
            const luck = actualSuccesses - expectedSuccesses;
            const luckPercentage = ((actualRate - expectedRate) / expectedRate * 100);

            logInfo('运气计算中间值:', {
                actualRate: actualRate.toFixed(1),
                expectedSuccesses: expectedSuccesses.toFixed(1),
                luck: luck.toFixed(1),
                luckPercentage: luckPercentage.toFixed(1)
            });

            let description, color;
            if (Math.abs(luckPercentage) < 5) {
                description = LANG.t('luckNormal');
                color = '#FFA500'; // 橙色
            } else if (luckPercentage > 0) {
                if (luckPercentage > 20) {
                    description = LANG.t('luckExcellent');
                    color = '#00FF00'; // 绿色
                } else {
                    description = LANG.t('luckGood');
                    color = '#90EE90'; // 浅绿
                }
            } else {
                if (Math.abs(luckPercentage) > 20) {
                    description = LANG.t('luckTerrible');
                    color = '#FF0000'; // 红色
                } else {
                    description = LANG.t('luckBad');
                    color = '#FFA07A'; // 浅红
                }
            }

            const result = {
                luck: Math.round(luck * 10) / 10,
                luckPercentage: Math.round(luckPercentage * 10) / 10,
                actualRate: Math.round(actualRate * 1000) / 10,
                expectedRate: Math.round(expectedRate * 1000) / 10,
                description: description,
                color: color
            };

            logInfo('运气计算最终结果:', result);
            return result;
        }

        static calculateOverallLuck(enhancements) {
            logInfo('计算总体运气，强化记录数量:', enhancements.length);
            
            let totalExpected = 0;
            let totalActual = 0;
            let totalAttempts = 0;

            for (const enhancement of enhancements) {
                const expectedRate = EnhancementRateCalculator.calculateActualRate(enhancement.fromLevel);
                totalExpected += expectedRate;
                totalActual += enhancement.success ? 1 : 0;
                totalAttempts++;
                
                log('处理强化记录:', {
                    item: enhancement.itemName,
                    level: enhancement.fromLevel,
                    success: enhancement.success,
                    expectedRate: (expectedRate * 100).toFixed(1) + '%'
                });
            }

            logInfo('总体运气统计:', {
                totalAttempts,
                totalActual,
                totalExpected: totalExpected.toFixed(1),
                avgExpectedRate: totalAttempts > 0 ? (totalExpected / totalAttempts).toFixed(1) : 0
            });

            if (totalAttempts === 0) {
                logWarn('没有强化记录，返回默认运气');
                return this.calculateLuck(0, 0, 0);
            }

            const overallExpectedRate = totalExpected / totalAttempts;
            return this.calculateLuck(totalActual, totalAttempts, overallExpectedRate);
        }
    }

    // 强化数据收集器
    class EnhancementCollector {
        constructor() {
            logInfo('初始化强化数据收集器...');
            this.data = StorageManager.getData();
            this.setupWebSocketHook();
            logInfo('强化数据收集器初始化完成');
        }

        setupWebSocketHook() {
            logInfo('开始设置WebSocket Hook...');
            
            // 使用与MWITools相同的MessageEvent劫持方式
            const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
            if (!dataProperty || dataProperty.get.toString().includes('hookedGet')) {
                logWarn('WebSocket已被其他插件劫持，尝试链式处理');
                return;
            }

            const oriGet = dataProperty.get;
            const self = this;

            dataProperty.get = function hookedGet() {
                const socket = this.currentTarget;
                if (!(socket instanceof WebSocket)) {
                    return oriGet.call(this);
                }
                if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
                    return oriGet.call(this);
                }

                const message = oriGet.call(this);
                Object.defineProperty(this, "data", { value: message }); // 防止循环

                // 处理强化相关消息
                try {
                    const obj = JSON.parse(message);
                    if (obj && obj.type) {
                        log('接收到WebSocket消息:', obj.type);
                        if (obj.type === 'action_completed') {
                            log('捕获到action_completed消息');
                        }
                    }
                    self.handleGameMessage(obj);
                } catch (e) {
                    // 忽略非JSON消息
                    if (message.length < 1000) { // 只记录短消息的解析错误
                        log('JSON解析失败:', message.substring(0, 100));
                    }
                }

                return message;
            };

            Object.defineProperty(MessageEvent.prototype, "data", dataProperty);
            logInfo('WebSocket Hook 设置完成');
        }

        handleGameMessage(obj) {
            if (obj && obj.type === 'action_completed') {
                log('处理action_completed消息:', obj.type);
                if (this.isEnhancementAction(obj)) {
                    logInfo('识别到强化动作，开始处理...');
                    this.handleEnhancementAction(obj);
                } else {
                    log('非强化动作，忽略');
                }
            }
        }

        isEnhancementAction(actionObj) {
            const isEnhancement = actionObj.endCharacterAction && 
                   actionObj.endCharacterAction.actionHrid && 
                   actionObj.endCharacterAction.actionHrid.includes('enhancing');
            
            if (actionObj.endCharacterAction) {
                log('检查动作类型:', {
                    actionHrid: actionObj.endCharacterAction.actionHrid,
                    isEnhancement: isEnhancement
                });
            }
            
            return isEnhancement;
        }

        handleEnhancementAction(actionObj) {
            logInfo('开始处理强化动作:', {
                actionId: actionObj.endCharacterAction?.id,
                actionHrid: actionObj.endCharacterAction?.actionHrid,
                isDone: actionObj.endCharacterAction?.isDone
            });
            
            const action = actionObj.endCharacterAction;
            
            const enhancementData = this.parseEnhancementAction(action);
            if (enhancementData) {
                logInfo('成功解析强化数据:', enhancementData);
                this.recordEnhancement(enhancementData);
                this.updateUI();
                logInfo('强化动作处理完成');
            } else {
                logWarn('无法解析强化数据');
            }
        }

        parseEnhancementAction(action) {
            logInfo('开始解析强化动作数据...');
            
            if (!action || !action.actionHrid) {
                logWarn('动作数据无效:', { action: !!action, actionHrid: action?.actionHrid });
                return null;
            }

            log('动作详情:', {
                actionHrid: action.actionHrid,
                isDone: action.isDone,
                inputItems: action.inputItems?.length || 0,
                outputItems: action.outputItems?.length || 0
            });

            let itemName = '';
            let fromLevel = 0;
            let success = action.isDone === true;
            let blessed = false;
            let isProtected = false;

            // 尝试从不同字段获取数据
            if (action.inputItems && action.inputItems.length > 0) {
                const inputItem = action.inputItems[0];
                itemName = inputItem.itemHrid ? this.getItemNameFromHrid(inputItem.itemHrid) : '';
                fromLevel = inputItem.enhancementLevel || 0;
                
                log('输入物品信息:', {
                    itemHrid: inputItem.itemHrid,
                    itemName: itemName,
                    enhancementLevel: inputItem.enhancementLevel
                });
            }

            if (action.outputItems && action.outputItems.length > 0) {
                const outputItem = action.outputItems[0];
                blessed = outputItem.blessed || false;
                
                log('输出物品信息:', {
                    blessed: outputItem.blessed,
                    enhancementLevel: outputItem.enhancementLevel
                });
            }

            if (action.inputItems) {
                isProtected = action.inputItems.some(item => 
                    item.itemHrid && item.itemHrid.includes('protection')
                );
                log('保护道具检查:', { isProtected });
            }

            if (itemName) {
                const result = {
                    itemName,
                    fromLevel,
                    success,
                    blessed,
                    protected: isProtected,
                    timestamp: Date.now()
                };
                logInfo('解析结果:', result);
                return result;
            }

            logWarn('无法获取物品名称，解析失败');
            return null;
        }

        getItemNameFromHrid(hrid) {
            if (!hrid) return '';
            const parts = hrid.split('/');
            const itemId = parts[parts.length - 1];
            return itemId.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        recordEnhancement(enhancementData) {
            logInfo('开始记录强化数据:', enhancementData);
            
            // 记录到当前会话
            if (!this.data.currentSession) {
                logInfo('创建新的游戏会话');
                this.data.currentSession = {
                    id: Date.now(),
                    startTime: Date.now(),
                    enhancements: []
                };
            }

            this.data.currentSession.enhancements.push(enhancementData);
            logInfo('添加到当前会话，总记录数:', this.data.currentSession.enhancements.length);

            // 更新总统计
            const key = `${enhancementData.itemName}_${enhancementData.fromLevel}`;
            if (!this.data.totalStats[key]) {
                logInfo('创建新的统计项:', key);
                this.data.totalStats[key] = {
                    itemName: enhancementData.itemName,
                    level: enhancementData.fromLevel,
                    attempts: 0,
                    successes: 0,
                    blessed: 0,
                    'protected': 0
                };
            }

            const stats = this.data.totalStats[key];
            const oldStats = { ...stats };
            
            stats.attempts++;
            if (enhancementData.success) stats.successes++;
            if (enhancementData.blessed) stats.blessed++;
            if (enhancementData.protected) stats['protected']++;

            logInfo('统计更新:', {
                key: key,
                before: oldStats,
                after: { ...stats }
            });

            StorageManager.saveData(this.data);
            logInfo('强化数据记录完成');
        }

        updateUI() {
            logInfo('请求更新UI...');
            if (window.enhancementLuckUI) {
                window.enhancementLuckUI.updateStats();
                logInfo('UI更新请求已发送');
            } else {
                logWarn('enhancementLuckUI 未初始化');
            }
        }
    }

    // 运气统计UI
    class EnhancementLuckUI {
        constructor() {
            logInfo('初始化强化运气UI...');
            this.isInjected = false;
            this.popup = null;
            this.startPeriodicCheck();
            this.setupDOMObserver();
            logInfo('强化运气UI初始化完成');
        }

        startPeriodicCheck() {
            // 监听语言变化
            this.lastDetectedLang = LANG.getCurrentLang();
            
            setInterval(() => {
                // 检查语言是否变化
                const currentLang = LANG.refreshLanguage();
                if (currentLang !== this.lastDetectedLang) {
                    logInfo('检测到语言变化:', this.lastDetectedLang, '->', currentLang);
                    this.lastDetectedLang = currentLang;
                    // 语言变化时重新注入按钮和更新界面
                    this.isInjected = false;
                }
                
                this.checkAndInjectButton();
                this.updateStatsContainerLanguage();
            }, CONFIG.CHECK_INTERVAL);
            
            setTimeout(() => {
                this.checkAndInjectButton();
                this.updateStatsContainerLanguage();
            }, 1000);
        }

        setupDOMObserver() {
            // 监听DOM变化，当页面结构改变时重新检查按钮
            const observer = new MutationObserver((mutations) => {
                let shouldCheck = false;
                
                mutations.forEach((mutation) => {
                    // 检查是否有节点被添加或移除
                    if (mutation.type === 'childList') {
                        // 检查是否涉及标签容器的变化
                        const addedNodes = Array.from(mutation.addedNodes);
                        const removedNodes = Array.from(mutation.removedNodes);
                        
                        const relevantChange = [...addedNodes, ...removedNodes].some(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // 检查是否是标签容器相关的变化
                                const isTabsChange = node.classList?.contains('MuiTabs-flexContainer') ||
                                                   node.classList?.contains('TabsComponent_tabsContainer__3BDUp') ||
                                                   node.querySelector?.('.MuiTabs-flexContainer');
                                
                                // 检查是否包含强化相关的文本
                                const hasEnhancementText = node.textContent?.includes('强化') ||
                                                          node.textContent?.includes('当前行动') ||
                                                          node.textContent?.includes('Enhance') ||
                                                          node.textContent?.includes('Current Action');
                                
                                // 检查是否是我们的按钮
                                const isOurButton = node.classList?.contains('enhancement_luck_stats_btn');
                                
                                return (isTabsChange && hasEnhancementText) || isOurButton;
                            }
                            return false;
                        });
                        
                        if (relevantChange) {
                            shouldCheck = true;
                        }
                    }
                });
                
                if (shouldCheck) {
                    logInfo('检测到相关DOM变化，重新检查按钮');
                    setTimeout(() => this.checkAndInjectButton(), 100);
                }
            });
            
            // 开始观察整个文档的变化
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            logInfo('DOM观察器已设置');
        }

        checkAndInjectButton() {
            const enhancingComponent = this.findEnhancingComponent();
            const existingButton = document.querySelector('.enhancement_luck_stats_btn');
            
            if (enhancingComponent) {
                if (!existingButton) {
                    logInfo('找到强化组件但按钮不存在，准备注入统计按钮');
                    this.injectStatsButton(enhancingComponent);
                    this.isInjected = true;
                    logInfo('统计按钮注入完成');
                } else {
                    // 按钮存在，检查是否在正确的容器中
                    if (!enhancingComponent.contains(existingButton)) {
                        logInfo('按钮存在但不在强化界面容器中，移除并重新注入');
                        existingButton.remove();
                        this.injectStatsButton(enhancingComponent);
                    } else {
                        log('按钮已存在且位置正确，跳过注入');
                    }
                    this.isInjected = true;
                }
            } else {
                // 如果不在强化界面，移除可能存在的按钮
                if (existingButton) {
                    logInfo('不在强化界面，移除运气统计按钮');
                    existingButton.remove();
                }
                if (this.isInjected) {
                    logInfo('强化组件消失，重置注入状态');
                    this.isInjected = false;
                }
                log('未找到强化组件');
            }
        }

        findEnhancingComponent() {
            // 找到强化面板的标签容器
            log('搜索强化组件...');
            
            // 查找所有可能的标签容器
            const allTabsContainers = document.querySelectorAll('.MuiTabs-flexContainer[role="tablist"]');
            
            for (const container of allTabsContainers) {
                // 检查容器中是否包含"强化"或"Enhance"标签
                const tabs = container.querySelectorAll('button[role="tab"]');
                const hasEnhancementTab = Array.from(tabs).some(tab => {
                    const text = tab.textContent || '';
                    return (text.includes('强化') || text.includes('Enhance')) && !text.includes('运气统计') && !text.includes('Stats');
                });
                
                // 检查是否包含"当前行动"或"Current Action"标签（强化界面的特征）
                const hasCurrentActionTab = Array.from(tabs).some(tab => {
                    const text = tab.textContent || '';
                    return text.includes('当前行动') || text.includes('Current Action');
                });
                
                if (hasEnhancementTab && hasCurrentActionTab) {
                    log('找到强化界面的标签容器:', container);
                    log('容器中的标签:', Array.from(tabs).map(tab => tab.textContent));
                    return container;
                }
            }
            
            log('未找到强化界面的标签容器');
            return null;
        }

        injectStatsButton(tabsContainer) {
            logInfo('开始创建运气统计按钮...');

            // 创建统计按钮，样式与现有标签一致
            const statsButton = document.createElement('button');
            statsButton.className = 'MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary css-1q2h7u5 enhancement_luck_stats_btn';
            statsButton.setAttribute('tabindex', '-1');
            statsButton.setAttribute('type', 'button');
            statsButton.setAttribute('role', 'tab');
            statsButton.setAttribute('aria-selected', 'false');
            
            statsButton.style.cssText = `
                color: #90CAF9 !important;
                font-weight: 500;
                border-bottom: 2px solid transparent;
                transition: all 0.3s ease;
                margin-left: 8px;
            `;
            
            statsButton.innerHTML = `
                <span class="MuiBadge-root TabsComponent_badge__1Du26 css-1rzb3uu">
                    ${LANG.getCurrentLang() === 'en' ? 'Luck Stats' : '运气统计'}
                    <span class="MuiBadge-badge MuiBadge-standard MuiBadge-invisible MuiBadge-anchorOriginTopRight MuiBadge-anchorOriginTopRightRectangular MuiBadge-overlapRectangular css-vwo4eg"></span>
                </span>
                <span class="MuiTouchRipple-root css-w0pj6f"></span>
            `;

            // 点击事件
            statsButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                logInfo('运气统计按钮被点击');
                this.showLuckStatsPopup();
            });

            // 悬停效果
            statsButton.addEventListener('mouseenter', () => {
                statsButton.style.borderBottomColor = '#90CAF9';
                statsButton.style.backgroundColor = 'rgba(144, 202, 249, 0.1)';
            });

            statsButton.addEventListener('mouseleave', () => {
                statsButton.style.borderBottomColor = 'transparent';
                statsButton.style.backgroundColor = 'transparent';
            });

            // 插入到标签容器中
            try {
                tabsContainer.appendChild(statsButton);
                logInfo('运气统计按钮注入成功');
                log('按钮元素:', statsButton);
                log('父容器子元素数量:', tabsContainer.children.length);
            } catch (error) {
                logError('按钮注入失败:', error);
            }
        }

        showLuckStatsPopup() {
            logInfo('显示运气统计弹窗 - 读取实时强化数据');
            
            if (this.popup) {
                logInfo('关闭现有弹窗');
                this.popup.remove();
                this.popup = null;
                return;
            }

            // 每次显示弹窗时读取页面上的实时强化数据
            logInfo('读取页面实时强化数据...');
            const realTimeData = this.readRealTimeEnhancementData();
            logInfo('实时数据读取完成', realTimeData);

            logInfo('创建新的运气统计弹窗');
            this.popup = this.createLuckStatsPopup(realTimeData);
            document.body.appendChild(this.popup);
            logInfo('运气统计弹窗已显示');
        }

        readRealTimeEnhancementData() {
            logInfo('开始读取页面实时强化数据');
            
            const enhancementContainer = document.getElementById('enhancementParentContainer');
            if (!enhancementContainer) {
                logWarn('未找到强化数据容器');
                return { items: [], error: '未找到强化数据容器' };
            }

            const dropdown = document.getElementById('enhancementDropdown');
            if (!dropdown) {
                logWarn('未找到强化装备下拉菜单');
                return { items: [], error: '未找到强化装备下拉菜单' };
            }

            const statsContainer = document.getElementById('enhancementStatsContainer');
            if (!statsContainer) {
                logWarn('未找到强化统计容器');
                return { items: [], error: '未找到强化统计容器' };
            }

            // 读取当前选中的装备信息
            const selectedOption = dropdown.options[dropdown.selectedIndex];
            const itemText = selectedOption ? selectedOption.textContent : '';
            logInfo('当前选中装备:', itemText);

            // 解析装备名称和目标等级
            const itemNameMatch = itemText.match(/^([^(]+)/);
            const itemName = itemNameMatch ? itemNameMatch[1].trim() : '未知装备';
            
            // 解析目标等级 (支持中英文)
            const targetMatch = itemText.match(/(?:目标|Target):\s*(\d+)/) || itemText.match(/(?:目标|Target).*?(\d+)/);
            const targetLevel = targetMatch ? parseInt(targetMatch[1]) : 10;

            // 读取统计数据
            const statsData = [];
            const cells = statsContainer.querySelectorAll('div');
            
            // 跳过表头（前4个div）
            for (let i = 4; i < cells.length; i += 4) {
                if (i + 3 < cells.length) {
                    const level = cells[i].textContent.trim();
                    const successes = parseInt(cells[i + 1].textContent.trim()) || 0;
                    const failures = parseInt(cells[i + 2].textContent.trim()) || 0;
                    const rate = cells[i + 3].textContent.trim();
                    
                    if (level !== '总计' && level !== 'Total') { // 跳过总计行
                        const levelNum = parseInt(level);
                        if (!isNaN(levelNum)) {
                            statsData.push({
                                level: levelNum,
                                successes: successes,
                                failures: failures,
                                attempts: successes + failures,
                                actualRate: successes + failures > 0 ? (successes / (successes + failures) * 100).toFixed(1) : '0.0'
                            });
                        }
                    }
                }
            }

            logInfo('解析的强化数据:', {
                itemName: itemName,
                targetLevel: targetLevel,
                statsCount: statsData.length,
                stats: statsData
            });

            return {
                itemName: itemName,
                targetLevel: targetLevel,
                items: statsData,
                timestamp: Date.now()
            };
        }

        // 计算基于目标等级的权重
        calculateLevelWeight(currentLevel, targetLevel) {
            if (targetLevel <= 0) return 1.0;
            
            // 距离目标的等级差
            const distance = Math.abs(targetLevel - currentLevel);
            
            // 使用指数衰减函数计算权重
            // 距离目标越远，权重越低
            // 公式: weight = e^(-distance * decay_factor)
            const decayFactor = 0.3; // 衰减系数，可以调整
            const weight = Math.exp(-distance * decayFactor);
            
            // 为了让权重更明显，我们使用平方根来缓和衰减
            const adjustedWeight = Math.sqrt(weight);
            
            logInfo('等级权重计算:', {
                currentLevel: currentLevel,
                targetLevel: targetLevel,
                distance: distance,
                                    rawWeight: weight.toFixed(1),
                    adjustedWeight: adjustedWeight.toFixed(1)
            });
            
            return adjustedWeight;
        }

        calculateRealTimeLuck(items, targetLevel = 10) {
            logInfo('计算实时数据总体运气，目标等级:', targetLevel);
            
            let totalWeightedAttempts = 0;
            let totalWeightedSuccesses = 0;
            let totalWeightedExpected = 0;
            let totalWeight = 0;
            
            items.forEach(item => {
                if (item.attempts > 0) {
                    const expectedRate = EnhancementRateCalculator.calculateActualRate(item.level);
                    const weight = this.calculateLevelWeight(item.level, targetLevel);
                    
                    // 使用权重计算加权统计
                    const weightedAttempts = item.attempts * weight;
                    const weightedSuccesses = item.successes * weight;
                    const weightedExpected = item.attempts * expectedRate * weight;
                    
                    totalWeightedAttempts += weightedAttempts;
                    totalWeightedSuccesses += weightedSuccesses;
                    totalWeightedExpected += weightedExpected;
                    totalWeight += weight;
                    
                    logInfo('等级权重统计:', {
                        level: item.level,
                        attempts: item.attempts,
                        successes: item.successes,
                        weight: weight.toFixed(1),
                        weightedAttempts: weightedAttempts.toFixed(1),
                        weightedSuccesses: weightedSuccesses.toFixed(1)
                    });
                }
            });
            
            if (totalWeightedAttempts === 0 || totalWeight === 0) {
                return {
                    luck: 0,
                    luckPercentage: 0,
                    actualRate: 0,
                    expectedRate: 0,
                    description: LANG.t('noData'),
                    color: '#666666'
                };
            }
            
            // 计算加权平均
            const actualRate = (totalWeightedSuccesses / totalWeightedAttempts * 100);
            const expectedRate = (totalWeightedExpected / totalWeightedAttempts * 100);
            const luck = totalWeightedSuccesses - totalWeightedExpected;
            const luckPercentage = ((actualRate - expectedRate) / expectedRate * 100);
            
            logInfo('加权运气计算结果:', {
                totalWeightedAttempts: totalWeightedAttempts.toFixed(1),
                totalWeightedSuccesses: totalWeightedSuccesses.toFixed(1),
                totalWeightedExpected: totalWeightedExpected.toFixed(1),
                totalWeight: totalWeight.toFixed(1),
                actualRate: actualRate.toFixed(1),
                expectedRate: expectedRate.toFixed(1),
                luck: luck.toFixed(1),
                luckPercentage: luckPercentage.toFixed(1)
            });
            
            let description, color;
            if (luckPercentage >= 50) {
                description = LANG.t('luckExcellent');
                color = '#4CAF50';
            } else if (luckPercentage >= 20) {
                description = LANG.t('luckGood');
                color = '#8BC34A';
            } else if (luckPercentage >= -10) {
                description = LANG.t('luckNormal');
                color = '#FFC107';
            } else if (luckPercentage >= -30) {
                description = LANG.t('luckBad');
                color = '#FF9800';
            } else {
                description = LANG.t('luckTerrible');
                color = '#F44336';
            }
            
            return {
                luck: Math.round(luck * 10) / 10,
                luckPercentage: Math.round(luckPercentage * 10) / 10,
                actualRate: Math.round(actualRate * 10) / 10,
                expectedRate: Math.round(expectedRate * 10) / 10,
                description: description,
                color: color
            };
        }

        createLuckStatsPopup(realTimeData = null) {
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                max-height: 80vh;
                background: #1a1a2e;
                border: 2px solid #16213e;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.8);
                z-index: 10000;
                overflow-y: auto;
                color: #ffffff;
            `;

            // 使用实时数据或回退到存储数据
            let displayData, overallLuck;
            
            if (realTimeData && realTimeData.items && realTimeData.items.length > 0) {
                logInfo('使用页面实时强化数据');
                displayData = realTimeData;
                // 基于实时数据计算总体运气，传入目标等级
                overallLuck = this.calculateRealTimeLuck(realTimeData.items, realTimeData.targetLevel);
            } else {
                logInfo('回退到存储数据');
                const data = StorageManager.getData();
                const currentSession = data.currentSession || { enhancements: [] };
                overallLuck = LuckCalculator.calculateOverallLuck(currentSession.enhancements);
                displayData = { items: Object.values(data.totalStats || {}), itemName: '历史数据' };
            }
            
            logInfo('创建弹窗使用的数据统计', {
                dataSource: realTimeData ? '实时数据' : '存储数据',
                itemName: displayData.itemName,
                itemsCount: displayData.items.length,
                overallLuck: overallLuck
            });

            popup.innerHTML = `
                <div style="padding: 20px;">
                    <!-- 标题栏 -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--color-divider); padding-bottom: 15px;">
                        <h2 style="margin: 0; color: var(--color-accent); font-size: 24px;">⚡ ${LANG.t('statsTitle')}</h2>
                        <button id="closeLuckPopup" style="background: #ff4444; color: white; border: none; border-radius: 6px; padding: 8px 12px; cursor: pointer; font-size: 14px;">${LANG.getCurrentLang() === 'en' ? 'Close' : '关闭'}</button>
                    </div>

                    <!-- 总体运气 -->
                    <div style="background: linear-gradient(135deg, #2d3748, #4a5568); border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #4a5568;">
                        <h3 style="margin: 0 0 15px 0; color: #90caf9; font-size: 18px;">🎯 ${displayData.itemName} - ${LANG.t('statsTitle')}</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                            <div>
                                <div style="font-size: 24px; font-weight: bold; color: ${overallLuck.color};">${overallLuck.luck > 0 ? '+' : ''}${overallLuck.luck}</div>
                                <div style="font-size: 12px; color: #a0aec0;">${LANG.getCurrentLang() === 'en' ? 'Luck Value' : '运气值'}</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; font-weight: bold; color: ${overallLuck.color};">${overallLuck.luckPercentage > 0 ? '+' : ''}${overallLuck.luckPercentage}%</div>
                                <div style="font-size: 12px; color: #a0aec0;">${LANG.getCurrentLang() === 'en' ? 'Luck Variance' : '运气偏差'}</div>
                            </div>
                            <div>
                                <div style="font-size: 18px; font-weight: bold; color: ${overallLuck.color};">${overallLuck.description}</div>
                                <div style="font-size: 12px; color: #a0aec0;">${overallLuck.actualRate}% / ${overallLuck.expectedRate}%</div>
                            </div>
                        </div>
                    </div>

                    <!-- 详细统计 -->
                    <div style="background: #2d3748; border-radius: 10px; padding: 15px; border: 1px solid #4a5568;">
                        <h3 style="margin: 0 0 15px 0; color: #90caf9;">📊 ${LANG.getCurrentLang() === 'en' ? 'Detailed Statistics' : '详细统计'}</h3>
                        <div id="detailedStats">
                            ${this.generateRealTimeStats(displayData.items, displayData.targetLevel)}
                        </div>
                    </div>

                    <!-- 数据来源信息 -->
                    <div style="background: #2d3748; border-radius: 10px; padding: 15px; margin-top: 15px; border: 1px solid #4a5568;">
                        <h3 style="margin: 0 0 15px 0; color: #90caf9;">📊 ${LANG.getCurrentLang() === 'en' ? 'Data Source' : '数据来源'}</h3>
                        <div style="color: #a0aec0; font-size: 14px;">
                            <div>📍 ${LANG.getCurrentLang() === 'en' ? 'Data Source: Real-time enhancement statistics' : '数据来源: 页面实时强化统计'}</div>
                            <div>🕒 ${LANG.getCurrentLang() === 'en' ? 'Update Time' : '更新时间'}: ${new Date().toLocaleString()}</div>
                            <div>📈 ${LANG.getCurrentLang() === 'en' ? 'Statistics Items' : '统计项目'}: ${displayData.items.length} ${LANG.getCurrentLang() === 'en' ? 'enhancement levels' : '个强化等级'}</div>
                            <div>🎯 ${LANG.getCurrentLang() === 'en' ? 'Current Equipment' : '当前装备'}: ${displayData.itemName}</div>
                            <div>🎲 ${LANG.getCurrentLang() === 'en' ? 'Enhancement Target' : '强化目标'}: +${displayData.targetLevel || (LANG.getCurrentLang() === 'en' ? 'Unknown' : '未知')}</div>
                            <div>⚖️ ${LANG.getCurrentLang() === 'en' ? 'Weight Description: Closer to target level, higher luck score ratio' : '权重说明: 离目标等级越近，运气分数占比越高'}</div>
                        </div>
                    </div>
                </div>
            `;

            // 绑定关闭事件
            popup.querySelector('#closeLuckPopup').addEventListener('click', () => {
                popup.remove();
                this.popup = null;
            });

            // 点击外部关闭
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.remove();
                    this.popup = null;
                }
            });

            return popup;
        }

        generateRealTimeStats(items, targetLevel = 10) {
            logInfo('生成实时统计数据', { itemsCount: items.length, targetLevel: targetLevel });
            
            if (!items || items.length === 0) {
                return `<div style="text-align: center; color: #a0aec0; padding: 20px;">${LANG.getCurrentLang() === 'en' ? 'No enhancement data' : '暂无强化数据'}</div>`;
            }

            return items.map(item => {
                const expectedRate = EnhancementRateCalculator.calculateActualRate(item.level);
                const luck = LuckCalculator.calculateLuck(item.successes, item.attempts, expectedRate);
                const weight = this.calculateLevelWeight(item.level, targetLevel);
                
                return `
                    <div style="background: #1a202c; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid ${luck.color}; border: 1px solid #4a5568;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 5px; color: #ffffff;">+${item.level} ${LANG.getCurrentLang() === 'en' ? 'Enhancement' : '强化'} <span style="color: #90caf9; font-size: 12px;">(${LANG.getCurrentLang() === 'en' ? 'Weight' : '权重'}: ${(weight * 100).toFixed(1)}%)</span></div>
                                <div style="font-size: 12px; color: #a0aec0;">
                                    ${LANG.getCurrentLang() === 'en' ? 'Success' : '成功'}: ${item.successes}/${item.attempts} (${item.actualRate}%) | 
                                    ${LANG.getCurrentLang() === 'en' ? 'Expected' : '期望'}: ${luck.expectedRate}% | 
                                    <span style="color: ${luck.color}; font-weight: bold;">${luck.description}</span>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: bold; color: ${luck.color};">
                                    ${luck.luck > 0 ? '+' : ''}${luck.luck}
                                </div>
                                <div style="font-size: 12px; color: ${luck.color};">
                                    ${luck.luckPercentage > 0 ? '+' : ''}${luck.luckPercentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        generateDetailedStats() {
            // 重新获取最新数据
            const data = StorageManager.getData();
            const stats = data.totalStats || {};
            const items = Object.values(stats);
            
            logInfo('生成详细统计', {
                totalStatsCount: items.length,
                statsKeys: Object.keys(stats)
            });
            
            if (items.length === 0) {
                return `<div style="text-align: center; color: #a0aec0; padding: 20px;">${LANG.getCurrentLang() === 'en' ? 'No enhancement data' : '暂无强化数据'}</div>`;
            }

            return items.map(item => {
                const expectedRate = EnhancementRateCalculator.calculateActualRate(item.level);
                const luck = LuckCalculator.calculateLuck(item.successes, item.attempts, expectedRate);
                
                return `
                    <div style="background: #1a202c; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid ${luck.color}; border: 1px solid #4a5568;">
                        <div style="display: flex; justify-content: between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 5px; color: #ffffff;">${item.itemName} (+${item.level})</div>
                                <div style="font-size: 12px; color: #a0aec0;">
                                    ${LANG.getCurrentLang() === 'en' ? 'Success' : '成功'}: ${item.successes}/${item.attempts} (${luck.actualRate}%) | 
                                    ${LANG.getCurrentLang() === 'en' ? 'Expected' : '期望'}: ${luck.expectedRate}% | 
                                    <span style="color: ${luck.color}; font-weight: bold;">${luck.description}</span>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: bold; color: ${luck.color};">
                                    ${luck.luck > 0 ? '+' : ''}${luck.luck}
                                </div>
                                <div style="font-size: 12px; color: ${luck.color};">
                                    ${luck.luckPercentage > 0 ? '+' : ''}${luck.luckPercentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        generateRecentEnhancements(enhancements) {
            if (!enhancements || enhancements.length === 0) {
                return `<div style="text-align: center; color: #a0aec0; padding: 20px;">${LANG.getCurrentLang() === 'en' ? 'No enhancement records' : '暂无强化记录'}</div>`;
            }

            return enhancements.slice(-10).reverse().map(enhancement => {
                const time = new Date(enhancement.timestamp).toLocaleTimeString();
                const resultColor = enhancement.success ? '#4CAF50' : '#F44336';
                const resultText = enhancement.success ? 
                    (LANG.getCurrentLang() === 'en' ? 'Success' : '成功') : 
                    (LANG.getCurrentLang() === 'en' ? 'Failed' : '失败');
                const expectedRate = EnhancementRateCalculator.calculateActualRate(enhancement.fromLevel);
                
                return `
                    <div style="display: flex; justify-content: space-between; padding: 8px 12px; margin-bottom: 5px; background: #1a202c; border-radius: 6px; border-left: 3px solid ${resultColor}; border: 1px solid #4a5568;">
                        <div>
                            <span style="font-weight: bold; color: #ffffff;">${enhancement.itemName}</span>
                            <span style="color: #a0aec0;"> (+${enhancement.fromLevel} → +${enhancement.fromLevel + 1})</span>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: ${resultColor}; font-weight: bold;">${resultText}</span>
                            <span style="color: #a0aec0; font-size: 12px; margin-left: 10px;">${time}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        updateStats() {
            logInfo('开始更新统计数据...');
            
            // 更新页面中统计容器的语言
            this.updateStatsContainerLanguage();
            
            if (this.popup) {
                logInfo('弹窗已打开，更新内容');
                
                // 如果弹窗已打开，重新获取最新数据并更新内容
                const data = StorageManager.getData();
                const detailedStats = this.popup.querySelector('#detailedStats');
                const recentEnhancements = this.popup.querySelector('#recentEnhancements');
                
                if (detailedStats) {
                    logInfo('更新详细统计');
                    detailedStats.innerHTML = this.generateDetailedStats();
                }
                
                if (recentEnhancements) {
                    logInfo('更新最近强化记录');
                    const currentSession = data.currentSession || { enhancements: [] };
                    recentEnhancements.innerHTML = this.generateRecentEnhancements(currentSession.enhancements);
                }
                
                logInfo('统计数据更新完成');
            } else {
                logInfo('弹窗未打开，跳过更新');
            }
        }

        updateStatsContainerLanguage() {
            const enhancementContainer = document.getElementById('enhancementParentContainer');
            if (!enhancementContainer) return;

            logInfo('更新统计容器语言...');

            // 更新标题
            const titleDiv = enhancementContainer.querySelector('div[style*="font-weight: bold"][style*="text-align: center"]');
            if (titleDiv) {
                titleDiv.textContent = LANG.t('enhancementData');
                logInfo('已更新容器标题');
            }

            // 更新表头
            const statsContainer = document.getElementById('enhancementStatsContainer');
            if (statsContainer) {
                const headerCells = statsContainer.querySelectorAll('div[style*="font-weight: bold"]');
                if (headerCells.length >= 4) {
                    headerCells[0].textContent = LANG.t('level');
                    headerCells[1].textContent = LANG.t('success');
                    headerCells[2].textContent = LANG.t('failed');
                    headerCells[3].textContent = LANG.t('rate');
                    logInfo('已更新统计表头语言');
                }
            }

            // 更新下拉选项中的"目标"文本
            const dropdown = document.getElementById('enhancementDropdown');
            if (dropdown) {
                for (let option of dropdown.options) {
                    const text = option.textContent;
                    if (text.includes('目标:')) {
                        option.textContent = text.replace('目标:', LANG.getCurrentLang() === 'en' ? 'Target:' : '目标:');
                    } else if (text.includes('Target:') && LANG.getCurrentLang() === 'zh') {
                        option.textContent = text.replace('Target:', '目标:');
                    }
                    if (text.includes('总计:')) {
                        option.textContent = option.textContent.replace('总计:', LANG.getCurrentLang() === 'en' ? 'Total:' : '总计:');
                    } else if (text.includes('Total:') && LANG.getCurrentLang() === 'zh') {
                        option.textContent = option.textContent.replace('Total:', '总计:');
                    }
                }
                logInfo('已更新下拉选项语言');
            }
        }
    }

    // 初始化
    function init() {
        logInfo('=== 开始初始化强化运气统计插件 ===');
        
        // 检查环境和语言
        const currentLang = LANG.getCurrentLang();
        logInfo('检查运行环境:', {
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100),
            gameLanguage: localStorage.getItem("i18nextLng"),
            detectedLanguage: currentLang,
            timestamp: new Date().toISOString()
        });
        
        try {
            // 创建全局实例
            logInfo('创建全局实例...');
            window.enhancementCollector = new EnhancementCollector();
            window.enhancementLuckUI = new EnhancementLuckUI();
            logInfo('全局实例创建完成');
            
            logInfo('=== 强化运气统计插件初始化完成 ===');
            logInfo(`插件语言: ${currentLang === 'zh' ? '中文' : 'English'}`);
            
            // 延迟检查
            setTimeout(() => {
                logInfo('延迟检查插件状态...');
                logInfo('Collector存在:', !!window.enhancementCollector);
                logInfo('UI存在:', !!window.enhancementLuckUI);
                logInfo('当前数据:', StorageManager.getData());
                logInfo('当前语言:', LANG.getCurrentLang());
            }, 3000);
            
        } catch (error) {
            logError('插件初始化失败:', error);
        }
    }

    // 启动插件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 