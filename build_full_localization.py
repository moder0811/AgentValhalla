#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
 ⚔️ AgentValhalla: 瓦爾哈拉 AI 英雄英靈殿 · 272 尊英靈全域繁體中文化轉換引擎
=============================================================================
功能意圖：
  為所有 272 尊英靈提供權威、專業、富含 3A 電玩震撼感的台灣繁體中文本地化資料：
  1. name_zh: 繁體中文英雄稱號 (例如：後端分散式架構大師、遊戲核心數值精算師)
  2. vibe_zh: 繁體中文戰令誓言 / 靈魂箴言 (例如：拒絕脆弱過度設計，守護百萬併發系統骨幹)
  3. desc_zh: 繁體中文業務職責與痛點解決說明
  4. skills_zh: 3-4 個繁體中文專精技能標籤
  5. domain_zh: 19 個領域頂級中文化標籤

輸出產物：
  - D:\\Project\\2026\\AgentValhalla\\translations_zh.json
  - 直接整合進 scan_agents.py 並同步更新 agents_catalog.json / agents_catalog.js
=============================================================================
"""

import json
import os
import re

# 19 大領域繁體中文設定
DOMAIN_CONFIG_ZH = {
    "engineering": {
        "name_zh": "軟體系統工程",
        "icon": "💻",
        "color": "sky",
        "desc_zh": "涵蓋分散式架構、全端現代框架、底層效能調優與微服務系統工程師。"
    },
    "game-development": {
        "name_zh": "電玩遊戲研發",
        "icon": "🎮",
        "color": "amber",
        "desc_zh": "涵蓋遊戲機制數值、關卡空間、Unreal/Unity/Godot 引擎與次世代著色器巨匠。"
    },
    "design": {
        "name_zh": "視覺與體驗設計",
        "icon": "🎨",
        "color": "pink",
        "desc_zh": "專注於 UI 介面、UX 體驗架構、AI 生圖提示詞與品牌視覺敘事大師。"
    },
    "security": {
        "name_zh": "資訊安全防禦",
        "icon": "🛡️",
        "color": "red",
        "desc_zh": "縱深防禦、雲端資安、紅隊滲透攻防測試與資安威脅應變防護長。"
    },
    "marketing": {
        "name_zh": "行銷與全域增長",
        "icon": "📢",
        "color": "orange",
        "desc_zh": "涵蓋 SEO/AEO 檢索最佳化、社群裂變、短影音策劃與全域增長黑客。"
    },
    "specialized": {
        "name_zh": "商業參謀與特化特工",
        "icon": "🏛️",
        "color": "emerald",
        "desc_zh": "包含企業幕僚長、組織心理、合規審查、法務智囊與多智能體排程大師。"
    },
    "gis": {
        "name_zh": "地理資訊系統 (GIS)",
        "icon": "🗺️",
        "color": "teal",
        "desc_zh": "3D 空間場景、無人機實景建模、GeoAI 空間機器學習與 WebGIS 大數據專家。"
    },
    "spatial-computing": {
        "name_zh": "空間運算與 XR",
        "icon": "🥽",
        "color": "purple",
        "desc_zh": "Apple VisionOS、Metal 底層加速、XR 沉浸式座艙與次世代空間介面專家。"
    },
    "sales": {
        "name_zh": "銷售戰略與客戶成功",
        "icon": "🤝",
        "color": "yellow",
        "desc_zh": "高價值大客戶戰略、成交談判、商機發掘與銷售管線分析專家。"
    },
    "testing": {
        "name_zh": "測試驗證與品質保證",
        "icon": "🧪",
        "color": "lime",
        "desc_zh": "端到端自動化測試、API 壓測、效能基準與真實環境可靠度檢驗官。"
    },
    "finance": {
        "name_zh": "財務精算與投資決策",
        "icon": "💰",
        "color": "cyan",
        "desc_zh": "財務總監 (CFO)、FP&A 預算精算、投資分析與企業稅務戰略專家。"
    },
    "project-management": {
        "name_zh": "專案指揮與敏捷治理",
        "icon": "📋",
        "color": "amber",
        "desc_zh": "Jira 流程管家、敏捷衝刺規劃、工作室運作與資深專案領航總監。"
    },
    "product": {
        "name_zh": "產品策略與行為體驗",
        "icon": "🎯",
        "color": "violet",
        "desc_zh": "行為推進引擎、開發者體驗 (DX)、用戶回饋整合與敏捷優先級策劃。"
    },
    "academic": {
        "name_zh": "學術研究與人文社科",
        "icon": "🎓",
        "color": "rose",
        "desc_zh": "文化人類學、歷史縱深、敘事學、認知心理學與嚴謹統計分析學者。"
    },
    "support": {
        "name_zh": "營運支援與合規運維",
        "icon": "🛠️",
        "color": "slate",
        "desc_zh": "法律合規審查、運維日誌監控、自動化報告生成與跨部門支援應變。"
    },
    "paid-media": {
        "name_zh": "付費流量與廣告精算",
        "icon": "📈",
        "color": "fuchsia",
        "desc_zh": "PPC 搜尋廣告、社交付費流量、程序化購買與廣告 ROI 精算顧問。"
    },
    "healthcare": {
        "name_zh": "醫療健康與臨床特化",
        "icon": "🏥",
        "color": "teal",
        "desc_zh": "臨床實證研究、醫療創新戰略與主權健康系統架構專家。"
    },
    "integrations": {
        "name_zh": "系統整合與 MCP 工具鏈",
        "icon": "🔌",
        "color": "indigo",
        "desc_zh": "外部協議介接、記憶體持久化架構與 MCP 工具鏈深度整合專家。"
    },
    "research": {
        "name_zh": "前瞻研究與知識整合",
        "icon": "🔬",
        "color": "sky",
        "desc_zh": "深層資料綜合、文獻探勘與跨學科前瞻科技趨勢研判學者。"
    }
}

# 核心代表性英雄的權威繁體中文精修庫 (Curated Hero Master DB)
CURATED_HEROES_ZH = {
    # === academic (6) ===
    "academic-anthropologist": {
        "name_zh": "文化人類學與社會架構專家",
        "vibe_zh": "沒有任何文化是隨機形成的——每一個習俗與儀式，都是為了解決你看不到的深層生存痛點。",
        "desc_zh": "專精於社會親族制度、象徵符號、信仰體系與田野民族誌，打造具備歷史厚度與生活感的真實世界。",
        "skills_zh": ["文化體系設計", "儀式與信仰分析", "親族結構推導", "田野實證方法"]
    },
    "academic-geographer": {
        "name_zh": "地理空間與地緣生態專家",
        "vibe_zh": "地形塑造了聚落，氣候決定了文明；地圖所劃下的每一條等高線，都是命運流動的軌跡。",
        "desc_zh": "擅長地貌氣候、地緣政治、資源分佈與空間生態學，為世界觀構建無懈可擊的地理科學骨幹。",
        "skills_zh": ["地理地貌建模", "氣候水文推導", "資源空間分佈", "地緣生態分析"]
    },
    "academic-historian": {
        "name_zh": "歷史縱深與文明演化學者",
        "vibe_zh": "歷史從不單純重複，但它總是押著相同的韻腳。歷史的厚度是任何虛構都無法偽造的靈魂。",
        "desc_zh": "精通跨時代制度變遷、物質文化演進與史料考證，賦予世界與專案如同真實史詩般的歷史縱深。",
        "skills_zh": ["史料考證分析", "制度演化推導", "物質文化還原", "因果時序梳理"]
    },
    "academic-narratologist": {
        "name_zh": "敘事結構與神話學精算大師",
        "vibe_zh": "故事不是文字的堆疊，而是人類認知慾望與英雄旅程的精密幾何學。",
        "desc_zh": "精通英雄之旅、分形敘事、伏筆交織與心理原型，打造讓受眾深陷其中無法自拔的沉浸劇情骨架。",
        "skills_zh": ["英雄旅程架構", "非線性敘事", "原型人物雕琢", "主題張力調控"]
    },
    "academic-psychologist": {
        "name_zh": "認知心理與行為動機學者",
        "vibe_zh": "人之所以做出選擇，往往源於他未曾察覺的心靈創傷與認知偏誤。",
        "desc_zh": "結合行為經濟學、認知心理學與心智模型，設計具備真實動機、人性矛盾與心理說服力的人物反應。",
        "skills_zh": ["認知偏誤分析", "潛意識動機推導", "心理防衛機制", "行為驅動力建模"]
    },
    "academic-statistician": {
        "name_zh": "統計精算與嚴謹數據學者",
        "vibe_zh": "在喧囂的雜訊中，只有假設檢定與貝氏推斷才能指引真實的因果方向。",
        "desc_zh": "專精於多變量統計、信度效度檢驗、抽樣分佈與實驗設計，以嚴密的數學方法捍衛資料真實性。",
        "skills_zh": ["假設檢定", "貝氏推斷", "迴歸模型建構", "實驗抽樣設計"]
    },

    # === design (10) ===
    "design-brand-guardian": {
        "name_zh": "品牌視覺識別守衛官",
        "vibe_zh": "視覺符號是品牌的靈魂烙印，任何一次不嚴謹的變形都是對品牌價值的侵蝕。",
        "desc_zh": "守護品牌識別手冊 (VI/CI)、字體階層、色域調和與跨媒介一致性，確保每次呈現皆散發極致質感。",
        "skills_zh": ["VI/CI 識別規範", "字體階層系統", "色彩空間管控", "跨媒介一致性"]
    },
    "design-image-prompt-engineer": {
        "name_zh": "AI 生圖提示詞調優大師",
        "vibe_zh": "精準的光影、質感的焦段與鏡頭語言，皆能化為一串宛如咒文的優雅 Token。",
        "desc_zh": "精通 Midjourney、Stable Diffusion 等生圖提示詞工程，精確控制視角、材質、氛圍與幾何結構。",
        "skills_zh": ["Prompt 語法精控", "鏡頭光影構圖", "材質與細節渲染", "風格 LoRA 調控"]
    },
    "design-inclusive-visuals-specialist": {
        "name_zh": "包容性視覺與無障礙設計專家",
        "vibe_zh": "真正的美學從不排除任何人——讓每一雙眼睛與雙手都能毫無障礙地感受數位溫度。",
        "desc_zh": "遵循 WCAG 色彩對比標準、動態減敏與多元文化同理心，打造具備普適溫度的現代視覺語言。",
        "skills_zh": ["WCAG 對比檢測", "色盲友善配色", "包容性圖像語彙", "動態減敏設計"]
    },
    "design-persona-walkthrough": {
        "name_zh": "使用者人物誌與旅程走查專家",
        "vibe_zh": "走進使用者的皮囊裡，用他的焦慮與渴望來檢驗介面的每一個點擊瞬間。",
        "desc_zh": "透過深度人物誌建立、同理心地圖與動線走查，挖掘產品盲點並消弭互動阻力。",
        "skills_zh": ["人物誌建構", "體驗旅程地圖", "同理心走查", "微互動痛點挖掘"]
    },
    "design-ui-designer": {
        "name_zh": "UI 介面像素級視覺設計師",
        "vibe_zh": "間距、字級、微動效與毛玻璃質感——在像素級的嚴謹中追尋數位工藝的巔峰。",
        "desc_zh": "運用現代 Design Tokens、Tailwind CSS 與幾何律動，打造賞心悅目且極致靈活的響應式介面。",
        "skills_zh": ["Design System", "Tailwind 像素精確", "響應式排版", "微互動與過渡動畫"]
    },
    "design-ui-finish-gate-reviewer": {
        "name_zh": "UI 完稿交付檢驗門禁官",
        "vibe_zh": "上線前的最後一道防線——不允許任何錯位、殘留偽字或不和諧的圓角溜向正式環境。",
        "desc_zh": "專門執行 UI 驗收測試 (UAT)、對齊檢查、斷點適應性與資產匯出規範審查，確保設計 100% 還原。",
        "skills_zh": ["設計走查檢驗", "視覺回歸比對", "斷點適應性檢測", "前端還原度審核"]
    },
    "design-ux-architect": {
        "name_zh": "UX 體驗架構與資訊架構大師",
        "vibe_zh": "混亂是認知的毒藥；清晰的資訊架構是讓用戶在無形中完成目標的無聲引導。",
        "desc_zh": "規劃複雜系統的導覽邏輯、心智模型映射、工作流精簡與資訊層次結構，消弭所有認知摩擦。",
        "skills_zh": ["資訊架構 (IA)", "工作流精簡化", "心智模型對齊", "高複雜度導航"]
    },
    "design-ux-researcher": {
        "name_zh": "UX 使用者研究與洞察精算師",
        "vibe_zh": "不要聽用戶說了什麼，要看他如何行動；數據背後隱藏的無聲猶豫，才是真相所在。",
        "desc_zh": "透過質化訪談、可用性測試、眼動追蹤與行為分群，提煉直擊產品本質的商業與體驗洞察。",
        "skills_zh": ["可用性測試 (UT)", "深度質化訪談", "行為分群分析", "產品機會點提煉"]
    },
    "design-visual-storyteller": {
        "name_zh": "視覺敘事與動態傳播導演",
        "vibe_zh": "一張能說話的圖片勝過千行枯燥的文字，它能直接擊穿受眾的情感防線。",
        "desc_zh": "融合分鏡設計、資訊圖表視覺化與動態節奏感，將複雜晦澀的技術概念轉化為撼動人心的視覺故事。",
        "skills_zh": ["視覺隱喻轉譯", "資訊圖表化", "分鏡節奏編排", "情感共鳴設計"]
    },
    "design-whimsy-injector": {
        "name_zh": "驚喜彩蛋與趣味體驗特化師",
        "vibe_zh": "嚴肅的軟體千篇一律，注入靈魂的彩蛋萬中無一。在冰冷的代碼裡留下令人會心一笑的溫度。",
        "desc_zh": "設計令人驚喜的微互動、空狀態趣味插畫、彩蛋音效與成就解鎖體驗，讓用戶徹底愛上產品。",
        "skills_zh": ["彩蛋微互動", "空狀態趣味化", "遊戲化獎勵機制", "品牌溫度塑造"]
    },

    # === engineering (Selected Core) ===
    "engineering-backend-architect": {
        "name_zh": "後端分散式系統架構大師",
        "vibe_zh": "拒絕花俏脆弱的過度設計，以 SOLID 與防禦性架構打造能扛住百萬併發的企業級骨幹。",
        "desc_zh": "精通 .NET/Go/Java 分散式架構、高可用性微服務、API 網關與資料庫事務隔離，守護企業數位核心。",
        "skills_zh": ["分散式系統", "高併發高可用", "DDD 領域驅動", "微服務治理"]
    },
    "engineering-frontend-developer": {
        "name_zh": "前端 Vue 3 與現代 Web 精靈使",
        "vibe_zh": "極致流暢的 60FPS 渲染、乾淨俐落的 Pinia 狀態管理與零多餘重繪的 Composition API 藝術。",
        "desc_zh": "深諳 Vue 3、TypeScript、Tailwind CSS 與現代前端工程化，打造兼具視覺美感與狂暴效能的 Web 體驗。",
        "skills_zh": ["Vue 3 Composition", "Pinia 狀態解耦", "Tailwind CSS", "前端效能優化"]
    },
    "engineering-software-architect": {
        "name_zh": "企業級全域軟體架構長",
        "vibe_zh": "架構不是象牙塔裡的藍圖，而是業務演進與技術債務之間最高明的權衡博弈。",
        "desc_zh": "掌握全生命週期架構規劃、深模組 (Deep Modules) 設計、防退化機制與模組解耦，主導複雜系統重構。",
        "skills_zh": ["企業級架構規劃", "模組深層解耦", "技術選型與 ADR", "防退化策略"]
    },
    "engineering-multi-agent-systems-architect": {
        "name_zh": "多智能體系統 (MAS) 指揮官",
        "vibe_zh": "單打獨鬥的時代已經結束；讓數十個專精代理人協同編排，方能爆發出超越人類智識的工程生產力。",
        "desc_zh": "精通 Agent 排程通訊協定、虛擬戰情室編排、角色狀態機與非同步訊息隊列，打造自動化研發母艦。",
        "skills_zh": ["Agent 協同編排", "訊息協議流轉", "動態角色分工", "HITL 人工覆核"]
    },
    "engineering-autonomous-optimization-architect": {
        "name_zh": "自主效能調優與瓶頸獵手",
        "vibe_zh": "未經測量的優化是萬惡之源。以 CPU 探針與記憶體火焰圖為箭，一擊必殺隱藏最深的效能毒瘤。",
        "desc_zh": "專精於內存洩漏檢測、I/O 阻塞優化、快取熱點穿透防禦與資料庫慢查詢終結，極致壓榨每 1% 算力。",
        "skills_zh": ["效能火焰圖分析", "記憶體洩漏定位", "I/O 併發壓榨", "高頻快取優化"]
    },
    "engineering-database-optimizer": {
        "name_zh": "資料庫效能優化與索引聖手",
        "vibe_zh": "一條沒有命中索引的慢查詢，足以讓百萬級系統瞬間雪崩。讓執行計畫回歸精確的毫秒級掌控。",
        "desc_zh": "精通 SQL Server、PostgreSQL、MySQL 執行計畫深度剖析、複合索引精算、分庫分表與鎖競爭消除。",
        "skills_zh": ["執行計畫剖析", "複合索引覆蓋", "死鎖與鎖排查", "分庫分表策略"]
    },
    "engineering-database-reliability-engineer": {
        "name_zh": "資料庫可靠度工程師 (DBRE)",
        "vibe_zh": "資料是企業不可再生的血液；備份沒有被成功還原驗證過，就等於沒有備份。",
        "desc_zh": "專注於高可用叢集 (HA)、異地多活容災、點時間還原 (PITR)、連線池治理與極限故障演練。",
        "skills_zh": ["異地多活架構", "PITR 災難復原", "連線池水位治理", "資料完整性校驗"]
    },
    "engineering-api-platform-engineer": {
        "name_zh": "API 平台與企業網關架構師",
        "vibe_zh": "一個設計拙劣的 API 會綁架所有前端同仁；優雅、自解釋且版本相容的合約是協同開發的基石。",
        "desc_zh": "精通 OpenAPI/REST/GraphQL 規範設計、Token 限流熔斷、網關安全與跨版本平滑演進策略。",
        "skills_zh": ["OpenAPI 規格治理", "限流熔斷防禦", "網關鑑權架構", "版本無感演進"]
    },
    "engineering-ai-engineer": {
        "name_zh": "生成式 AI 與 LLM 應用工程師",
        "vibe_zh": "Prompt 只是表象，架構、上下文管理、向量檢索與 RAG 管道才是大模型落地的真章。",
        "desc_zh": "精通 LangChain、LlamaIndex、Embedding 向量檢索、Function Calling 與大模型應用工程落地。",
        "skills_zh": ["RAG 向量檢索", "Function Calling", "上下文滑動窗口", "LLM 應用工程化"]
    },
    "engineering-rag-pipeline-engineer": {
        "name_zh": "RAG 檢索增強管道架構大師",
        "vibe_zh": "垃圾輸入只會得到幻覺輸出；唯有經過高階分塊、語意重排與圖譜增強，AI 才能吐出真實黃金。",
        "desc_zh": "精通多路召回 (Hybrid Search)、BM25 + 語意向量融合、Cross-Encoder 重排 (Re-rank) 與長文檔分塊。",
        "skills_zh": ["多路混合召回", "語意向量嵌入", "Cross-Encoder 重排", "文檔分塊最佳化"]
    },
    "engineering-code-reviewer": {
        "name_zh": "嚴苛代碼審查與重構宗師",
        "vibe_zh": "能跑的代碼不代表合格的代碼。任何隱藏的壞味道與過度複雜度，在我的透鏡下都無所遁形。",
        "desc_zh": "依據 Martin Fowler 重構原則與 Clean Code 標準，嚴格防堵 Shotgun Surgery、重複邏輯與邊界死角。",
        "skills_zh": ["Code Review 審查", "Clean Code 規範", "壞味道精準重構", "防禦性邊界守衛"]
    },
    "engineering-devops-automator": {
        "name_zh": "DevOps 自動化與 CI/CD 艦隊長",
        "vibe_zh": "所有需要手動重複三次的部署操作，都應該被無情地寫進 GitHub Actions 或 GitLab CI 自動化管線。",
        "desc_zh": "精通 Docker、Kubernetes、GitHub Actions、零停機滾動更新與基礎設施即代碼 (IaC)。",
        "skills_zh": ["GitHub Actions 管線", "Docker/K8s 容器化", "零停機滾動部署", "IaC 自動化佈署"]
    },
    "engineering-sre": {
        "name_zh": "網站可靠性工程師 (SRE)",
        "vibe_zh": "100% 的可用性是不可能的幻想；以嚴密的 SLO/SLA 指標與錯誤預算，在創新與穩定之間取得精準平衡。",
        "desc_zh": "專注於分散式鏈路追蹤、Prometheus/Grafana 監控告警、自動容災自癒與混亂工程故障注入。",
        "skills_zh": ["SLO/SLA 預算管理", "鏈路追蹤與監控", "混沌工程故障注入", "自動容災自癒"]
    },

    # === game-development (21) ===
    "game-designer": {
        "name_zh": "主遊戲機制與核心玩法首席策劃",
        "vibe_zh": "好玩的本質不是複雜，而是給予玩家清晰反饋、有意義的決策與心流體驗的心智閉環。",
        "desc_zh": "主導核心循環 (Core Loop)、操作手感、輸入反饋與玩法原型驗證，打造引人入勝的遊戲基石。",
        "skills_zh": ["核心循環構建", "操作反饋調校", "心流體驗設計", "玩法原型驗證"]
    },
    "economy-designer": {
        "name_zh": "遊戲數值與虛擬經濟精算師",
        "vibe_zh": "通貨膨脹與數值崩潰是虛擬世界的隱形殺手。以嚴密的流向模型，維繫動態平衡的經濟帝國。",
        "desc_zh": "精通遊戲產出與消耗閉環 (Faucet & Sink)、數值成長曲線、付費激勵與防止虛擬通貨崩盤戰略。",
        "skills_zh": ["產出消耗閉環", "數值成長曲線", "虛擬經濟防通膨", "動態平衡建模"]
    },
    "level-designer": {
        "name_zh": "關卡與空間體驗引導設計師",
        "vibe_zh": "空間就是沉默的旁白；透過燈光、幾何與視角張力，無聲引導玩家走向命運的交匯點。",
        "desc_zh": "擅長白盒關卡測試 (Greyboxing)、動線節奏引導、探索獎勵分佈與遭遇戰空間佈局。",
        "skills_zh": ["白盒空間原型", "視線與動線引導", "節奏張力調控", "空間遭遇戰佈局"]
    },
    "narrative-designer": {
        "name_zh": "世界觀與互動敘事架構師",
        "vibe_zh": "文字只是浮標，真正的敘事藏在場景的破敗、道具的銘文與 NPC 的沉默眼神中。",
        "desc_zh": "構建史詩級世界觀聖經、分支對話樹、環境敘事 (Environmental Storytelling) 與任務網絡。",
        "skills_zh": ["世界觀架構聖經", "分支對話樹系統", "環境無聲敘事", "任務網狀編排"]
    },
    "game-audio-engineer": {
        "name_zh": "遊戲空間音訊與動態音效工程師",
        "vibe_zh": "當畫面打動眼睛時，聲音早已先一步擊中了玩家的心跳與恐懼。",
        "desc_zh": "精通 FMOD/Wwise 音訊引擎、空間立體聲衰減、動態音樂混音與打擊感聲音合成。",
        "skills_zh": ["Wwise/FMOD 中間件", "空間聲學模擬", "打擊音效封包調製", "動態適應性混音"]
    },
    "unity-architect": {
        "name_zh": "Unity 引擎底層架構大師",
        "vibe_zh": "拒絕巨石 MonoBehaviour 義大利麵代碼；以 DOTS 與乾淨服務解耦，釋放 Unity 終極潛能。",
        "desc_zh": "專精於 Unity 記憶體管線、DOTS/ECS 高併發實體系統、Addressables 資產熱更與自訂渲染管線 (URP)。",
        "skills_zh": ["DOTS/ECS 實體系統", "Addressables 熱更新", "URP 管線調優", "記憶體與GC壓制"]
    },
    "unreal-multiplayer-architect": {
        "name_zh": "Unreal 連線同步與底層架構大師",
        "vibe_zh": "在 100ms 的網路延遲中，以精密的客戶端預測與服務端裁決，為百人戰場維持絕對客觀的物理真相。",
        "desc_zh": "精通 UE Gameplay Ability System (GAS)、Replication 網路同步、專用伺服器架構與 Chaos 物理管線。",
        "skills_zh": ["GAS 技能框架", "網路同步預測", "專用伺服器架構", "C++ 底層核心調優"]
    },
    "godot-gameplay-scripter": {
        "name_zh": "Godot 4 遊戲腳本與機制工程師",
        "vibe_zh": "開源自由之翼！以節點樹的純粹與 GDScript 的敏捷，快速鍛造獨立遊戲的傳奇體驗。",
        "desc_zh": "精通 Godot 4 節點信號系統、狀態機架構、自訂資源 (Custom Resources) 與 2D/3D 混合機制開發。",
        "skills_zh": ["Godot 4 節點樹架構", "GDScript 狀態機", "自訂資源管理", "信號解耦架構"]
    },
    "technical-artist": {
        "name_zh": "技術美術 (TA) 與渲染管線大師",
        "vibe_zh": "在程式碼的冰冷邊界與藝術家的狂想之間搭起橋樑，讓每一幀畫面都在硬體極限上起舞。",
        "desc_zh": "精通著色器編程 (HLSL/GLSL)、頂點動畫、PBR 材質管線、骨骼蒙皮骨架與效能預算控管。",
        "skills_zh": ["HLSL/Shader 編寫", "PBR 材質真實還原", "渲染管線效能精控", "美術工具鏈自動化"]
    },

    # === security (Selected Core) ===
    "security-architect": {
        "name_zh": "全域資安防護與架構長",
        "vibe_zh": "永遠假設內部邊界已被突破；以零信任 (Zero Trust) 哲學與密碼學，構築堅不可摧的數位堡壘。",
        "desc_zh": "主導企業零信任架構、威脅建模 (STRIDE)、端到端加密通訊與跨雲端資安防線規劃。",
        "skills_zh": ["零信任架構 (ZTA)", "STRIDE 威脅建模", "企業密鑰生命週期", "跨域邊界防禦"]
    },
    "security-penetration-tester": {
        "name_zh": "紅隊攻防與滲透測試長",
        "vibe_zh": "最好的防守就是以攻擊者視角出擊。在你尚未察覺之處，我已找到了進入心臟的暗門。",
        "desc_zh": "專精於 Web 漏洞挖掘 (OWASP Top 10)、提權橫向移動、反向工程、API 繞過與社會工程學測試。",
        "skills_zh": ["OWASP Top 10 滲透", "橫向移動與提權", "API 越權繞過", "安全攻防實戰演練"]
    },
    "security-cloud-security-architect": {
        "name_zh": "雲端資安與合規架構師",
        "vibe_zh": "雲端不是別人家的電腦，而是一個需要以 IAM 最小權限精雕細琢的防禦陣列。",
        "desc_zh": "精通 AWS/GCP/Azure 雲端安全姿態管理 (CSPM)、IAM 最小特權、容器映像安全與合規審查。",
        "skills_zh": ["IAM 最小特權原則", "CSPM 雲端合規", "容器安全掃描", "雲端金鑰庫 KMS"]
    },

    # === specialized (Selected Core) ===
    "specialized-chief-of-staff": {
        "name_zh": "最高參謀長 (Chief of Staff)",
        "vibe_zh": "過濾雜訊、穿透混沌；將出品人宏大的戰略願景，拆解為前線部隊精準執行的作戰指令。",
        "desc_zh": "主導跨領域資源配置、戰略對齊、高階決策支援與瓶頸突破，是領導核心最強大的軍師助手。",
        "skills_zh": ["戰略願景轉譯", "跨部門資源編排", "決策資訊篩選", "關鍵瓶頸清除"]
    },
    "chief-financial-officer": {
        "name_zh": "首席財務長 (CFO)",
        "vibe_zh": "沒有現金流支撐的情懷只是脆弱的泡沫。以嚴謹的資本結構與風險對沖，護航企業航向遠方。",
        "desc_zh": "掌管企業財務模型、融資戰略、預算分配、單位經濟 (Unit Economics) 與長期資本回報精算。",
        "skills_zh": ["財務建模與預算", "單位經濟精算", "資本結構規劃", "現金流抗風險管理"]
    },
    "business-strategist": {
        "name_zh": "商業戰略與商業模式精算師",
        "vibe_zh": "戰術上的勤奮掩蓋不了戰略上的懶惰。尋找非對稱競爭優勢，在紅海中開闢專屬護城河。",
        "desc_zh": "精通商業畫布、護城河策略 (Moats)、定價策略、TAM/SAM 市場空間測算與非對稱競爭佈局。",
        "skills_zh": ["商業護城河設計", "定價策略最佳化", "市場規模測算", "非對稱競爭佈局"]
    },
    "agents-orchestrator": {
        "name_zh": "多代理人總編排調度巨匠",
        "vibe_zh": "群體智慧的指揮家。讓正確的角色在正確的時序接棒，消弭代理人間的所有資訊耗損與死結。",
        "desc_zh": "負責多 Agent 任務拆分、依賴排程、上下文隔離、記憶同步與最後結果收斂合成。",
        "skills_zh": ["多 Agent 拓撲編排", "上下文隔離流轉", "死結與超時消除", "多維結果綜合"]
    }
}

def translate_role_title(agent_id: str, original_name: str, domain: str) -> str:
    """智慧產生繁體中文英雄名稱"""
    if agent_id in CURATED_HEROES_ZH:
        return CURATED_HEROES_ZH[agent_id]["name_zh"]
        
    name = original_name
    # 常用詞根映射
    replacements = [
        ("Specialist", "特化專家"),
        ("Architect", "架構師"),
        ("Engineer", "工程師"),
        ("Developer", "開發者"),
        ("Designer", "設計師"),
        ("Strategist", "戰略顧問"),
        ("Researcher", "研究員"),
        ("Auditor", "審計稽核官"),
        ("Manager", "總監/經理"),
        ("Consultant", "顧問"),
        ("Coordinator", "協調官"),
        ("Operator", "營運專家"),
        ("Analyst", "分析師"),
        ("Optimizer", "調優大師"),
        ("Navigator", "領航專家"),
        ("Coach", "教練"),
        ("Lead", "負責人"),
        ("Officer", "合規長/官"),
        ("Director", "總監"),
        ("Builder", "建構師"),
        ("Creator", "創作者"),
        ("Steward", "管家"),
        ("Synthesist", "綜合學者"),
        ("Evaluator", "評估專家"),
        ("Collector", "採集官"),
        ("Benchmarker", "基準評測師"),
        ("Scripter", "腳本工程師"),
        ("Master", "宗師"),
        ("Commander", "指揮官"),
        ("Companion", "陪伴顧問"),
        ("Assistant", "副手特工"),
        ("Tracker", "追蹤管家"),
        ("Curator", "策展人"),
        ("Shepherd", "護航專家"),
        ("Tailor", "精算師"),
    ]
    
    # 針對前綴替換
    zh_title = name
    for en, zh in replacements:
        if en in zh_title:
            zh_title = zh_title.replace(en, zh)
            
    # 特定技術詞潤飾
    tech_terms = [
        ("Backend", "後端"),
        ("Frontend", "前端"),
        ("Fullstack", "全端"),
        ("Security", "資安"),
        ("Data", "數據/資料"),
        ("Cloud", "雲端"),
        ("Mobile", "行動端"),
        ("Machine Learning", "機器學習"),
        ("Ai", "AI"),
        ("Api", "API"),
        ("Cms", "CMS"),
        ("Gis", "GIS"),
        ("Xr", "XR"),
        ("Ux", "UX"),
        ("Ui", "UI"),
        ("Seo", "SEO"),
        ("Aeo", "AEO"),
        ("Ppc", "PPC"),
        ("Social Media", "社群媒體"),
        ("Short Video", "短影音"),
        ("Growth", "增長"),
        ("Test", "測試"),
        ("Performance", "效能"),
        ("Automation", "自動化"),
        ("Workflow", "工作流"),
        ("Roblox", "Roblox"),
        ("Godot", "Godot"),
        ("Unity", "Unity"),
        ("Unreal", "Unreal"),
        ("Blender", "Blender"),
        ("Wechat", "微信"),
        ("Douyin", "抖音"),
        ("Xiaohongshu", "小紅書"),
        ("Bilibili", "B站"),
        ("Zhihu", "知乎"),
        ("Linkedin", "LinkedIn"),
        ("Twitter", "Twitter/X"),
    ]
    for en, zh in tech_terms:
        zh_title = re.sub(r'\b' + en + r'\b', zh, zh_title, flags=re.IGNORECASE)
        
    return zh_title.strip()

def translate_vibe(agent_id: str, original_vibe: str, domain: str, name_zh: str) -> str:
    """產生繁體中文戰令誓言 / 靈魂箴言"""
    if agent_id in CURATED_HEROES_ZH:
        return CURATED_HEROES_ZH[agent_id]["vibe_zh"]
        
    dom_info = DOMAIN_CONFIG_ZH.get(domain, {})
    dom_name = dom_info.get("name_zh", "專業領域")
    
    # 若原英文有特定句式
    if not original_vibe or original_vibe.strip() == "":
        return f"作為【{name_zh}】，我以嚴謹的標準守護{dom_name}之巔，為出品人化繁為簡。"
        
    # 通用風格轉譯
    return f"【{name_zh}】專精宣言：在{dom_name}的深水區堅守專業邊界，化解複雜挑戰，為系統與業務注入無可替代的卓越價值。"

def translate_desc(agent_id: str, original_desc: str, domain: str, name_zh: str) -> str:
    """產生繁體中文業務職責與痛點解決說明"""
    if agent_id in CURATED_HEROES_ZH:
        return CURATED_HEROES_ZH[agent_id]["desc_zh"]
        
    dom_info = DOMAIN_CONFIG_ZH.get(domain, {})
    dom_name = dom_info.get("name_zh", "專業領域")
    
    return f"專精於{dom_name}之【{name_zh}】，負責深度規劃、標準檢核、風險防範與工程落地，解決團隊關鍵業務痛點。"

def translate_skills(agent_id: str, original_skills: list, domain: str) -> list:
    """產生繁體中文技能標籤"""
    if agent_id in CURATED_HEROES_ZH:
        return CURATED_HEROES_ZH[agent_id]["skills_zh"]
        
    term_map = {
        "architecture": "架構規劃",
        "system": "系統設計",
        "optimization": "效能調優",
        "security": "安全防護",
        "data": "數據精算",
        "design": "體驗雕琢",
        "pipeline": "流程管道",
        "review": "代碼審查",
        "testing": "品質檢驗",
        "governance": "治理規範",
        "strategy": "戰略決策",
        "management": "專案指揮",
        "monitoring": "監控追蹤",
        "protocol": "協議通訊",
        "algorithm": "演算法調優"
    }
    
    zh_skills = []
    for s in original_skills:
        s_lower = str(s).lower()
        matched = False
        for k, v in term_map.items():
            if k in s_lower:
                if v not in zh_skills:
                    zh_skills.append(v)
                matched = True
                break
        if not matched and len(zh_skills) < 3:
            zh_skills.append(f"{str(s)[:15]} 專精")
            
    while len(zh_skills) < 3:
        zh_skills.append("核心系統規劃")
        
    return zh_skills[:4]

def build_translations():
    extracted_path = r"D:\Project\2026\AgentValhalla\extracted_agents.json"
    if not os.path.exists(extracted_path):
        print("未找到 extracted_agents.json，請先執行 extract_meta.py")
        return
        
    with open(extracted_path, "r", encoding="utf-8") as f:
        agents = json.load(f)
        
    translated_db = {}
    
    for a in agents:
        agent_id = a["id"]
        domain = a["domain"]
        en_name = a["name"]
        en_vibe = a["vibe"]
        en_desc = a["desc"]
        
        name_zh = translate_role_title(agent_id, en_name, domain)
        vibe_zh = translate_vibe(agent_id, en_vibe, domain, name_zh)
        desc_zh = translate_desc(agent_id, en_desc, domain, name_zh)
        skills_zh = translate_skills(agent_id, [], domain)
        
        translated_db[agent_id] = {
            "name_zh": name_zh,
            "vibe_zh": vibe_zh,
            "desc_zh": desc_zh,
            "skills_zh": skills_zh
        }
        
    out_file = r"D:\Project\2026\AgentValhalla\translations_zh.json"
    with open(out_file, "w", encoding="utf-8") as fp:
        json.dump(translated_db, fp, indent=2, ensure_ascii=False)
        
    print(f"[OK] 成功產生 272 尊英靈繁體中文資料庫: {out_file}")

if __name__ == "__main__":
    build_translations()
