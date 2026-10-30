#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
 ⚡ AgentValhalla: 瓦爾哈拉 AI 英雄英靈殿 · 三語 (中英日) 與四態數據生成引擎
=============================================================================
功能意圖：
  掃描 characters/ 目錄下的專家 Markdown 檔案，生成包含繁中、英文、日文
  三語資訊以及各領域標籤的完整資料結構，並輸出為 agents_catalog.json / js。
=============================================================================
"""

import os
import re
import json
from pathlib import Path

# 領域中英日對照設定
DOMAIN_I18N = {
    "all": {
        "zh": "全部領域",
        "en": "All Domains",
        "ja": "全ドメイン",
        "icon": "⚡"
    },
    "engineering": {
        "zh": "軟體系統工程",
        "en": "Software Engineering",
        "ja": "ソフトウェア開発",
        "icon": "💻",
        "color": "sky"
    },
    "game-development": {
        "zh": "電玩遊戲研發",
        "en": "Game Development",
        "ja": "ゲーム開発",
        "icon": "🎮",
        "color": "amber"
    },
    "design": {
        "zh": "視覺與體驗設計",
        "en": "Design & UX",
        "ja": "デザイン・UX",
        "icon": "🎨",
        "color": "pink"
    },
    "security": {
        "zh": "資訊安全防禦",
        "en": "Security & Defense",
        "ja": "セキュリティ防御",
        "icon": "🛡️",
        "color": "red"
    },
    "marketing": {
        "zh": "行銷與全域增長",
        "en": "Marketing & Growth",
        "ja": "マーケティング・成長",
        "icon": "📢",
        "color": "orange"
    },
    "specialized": {
        "zh": "商業經營與特工",
        "en": "Specialized & Ops",
        "ja": "特命・ビジネス参謀",
        "icon": "🏛️",
        "color": "emerald"
    },
    "gis": {
        "zh": "地理資訊系統",
        "en": "GIS & Spatial",
        "ja": "地理情報システム (GIS)",
        "icon": "🗺️",
        "color": "teal"
    },
    "spatial-computing": {
        "zh": "空間運算與 XR",
        "en": "Spatial Computing",
        "ja": "空間コンピューティング",
        "icon": "🥽",
        "color": "purple"
    },
    "sales": {
        "zh": "銷售與客戶成功",
        "en": "Sales & Success",
        "ja": "セールス・商談",
        "icon": "🤝",
        "color": "yellow"
    },
    "testing": {
        "zh": "測試驗證與品保",
        "en": "QA & Testing",
        "ja": "テスト・品質検証",
        "icon": "🧪",
        "color": "lime"
    },
    "finance": {
        "zh": "財務精算與投資",
        "en": "Finance & Tax",
        "ja": "財務・投資戦略",
        "icon": "💰",
        "color": "cyan"
    },
    "project-management": {
        "zh": "專案指揮與敏捷",
        "en": "Project Management",
        "ja": "プロジェクト管理",
        "icon": "📋",
        "color": "amber"
    },
    "product": {
        "zh": "產品策略與體驗",
        "en": "Product Strategy",
        "ja": "プロダクト戦略",
        "icon": "🎯",
        "color": "violet"
    },
    "academic": {
        "zh": "學術研究與人文",
        "en": "Academic & Research",
        "ja": "学術・人文学",
        "icon": "🎓",
        "color": "rose"
    },
    "support": {
        "zh": "營運支援與合規",
        "en": "Support & Compliance",
        "ja": "運用支援・コンプライアンス",
        "icon": "🛠️",
        "color": "slate"
    },
    "paid-media": {
        "zh": "付費流量廣告",
        "en": "Paid Media & Ads",
        "ja": "ペイドメディア・広告",
        "icon": "📈",
        "color": "fuchsia"
    },
    "healthcare": {
        "zh": "醫療健康特化",
        "en": "Healthcare & Clinical",
        "ja": "医療・ヘルスケア",
        "icon": "🏥",
        "color": "teal"
    },
    "integrations": {
        "zh": "系統整合與 MCP",
        "en": "Integrations & MCP",
        "ja": "システム統合・MCP",
        "icon": "🔌",
        "color": "indigo"
    },
    "research": {
        "zh": "前瞻研究綜合",
        "en": "Deep Research",
        "ja": "先端リサーチ",
        "icon": "🔬",
        "color": "sky"
    }
}

# 角色精修對照庫 (涵蓋核心角色及常見類型)
HERO_I18N_CUSTOM = {
    "engineering-backend-architect": {
        "zh": {
            "name": "後端分散式架構大師",
            "vibe": "拒絕花俏脆弱的過度設計，以 SOLID 與防禦性架構打造能扛住百萬併發的企業級骨幹。",
            "desc": "專精於分散式架構、高可用性微服務、API 網關與資料庫事務隔離，守護企業數位核心。",
            "skills": ["分散式系統", "高併發高可用", "DDD 領域驅動", "微服務治理"]
        },
        "ja": {
            "name": "分散システム上級アーキテクト",
            "vibe": "脆い過剰設計を排し、SOLIDと防御的アーキテクチャで数百万クエリを支える堅牢な骨格を築く。",
            "desc": "分散システム、高可用性マイクロサービス、APIゲートウェイ、トランザクション分離の専門家。",
            "skills": ["分散システム", "高並行性", "DDD設計", "マイクロサービス"]
        }
    },
    "engineering-frontend-developer": {
        "zh": {
            "name": "前端 Vue 3 與現代 Web 精靈使",
            "vibe": "極致流暢的 60FPS 渲染、乾淨俐落的 Pinia 狀態管理與零多餘重繪的 Composition API 藝術。",
            "desc": "深諳 Vue 3、TypeScript、Tailwind CSS 與現代前端工程化，打造兼具視覺美感與狂暴效能的體驗。",
            "skills": ["Vue 3 Composition", "Pinia 狀態解耦", "Tailwind 像素精確", "前端效能優化"]
        },
        "ja": {
            "name": "Vue 3 & モダンフロントエンド巨匠",
            "vibe": "極限の60FPS描画、Piniaによるクリーンな状態管理、ゼロ無駄レンダリングの美学。",
            "desc": "Vue 3、TypeScript、Tailwind CSSを駆使し、超高速かつ洗練されたUIを構築する。",
            "skills": ["Vue 3 / TS", "Pinia状態管理", "Tailwind CSS", "描画パフォーマンス"]
        }
    },
    "game-designer": {
        "zh": {
            "name": "主遊戲機制與核心玩法策劃",
            "vibe": "好玩的本質不是複雜，而是給予玩家清晰反饋、有意義的決策與心流體驗的心智閉環。",
            "desc": "主導核心循環 (Core Loop)、操作手感、輸入反饋與玩法原型驗證，打造引人入勝的遊戲基石。",
            "skills": ["核心循環構建", "操作反饋調校", "心流體驗設計", "玩法原型驗證"]
        },
        "ja": {
            "name": "チーフゲームデザイナー",
            "vibe": "面白さの本質は複雑さではなく、明確なフィードバックと有意義な選択が生むフロー体験にある。",
            "desc": "コアゲームループ、操作感、入力フィードバック、プロトタイプ検証をリードする。",
            "skills": ["コアループ設計", "操作フィール調律", "フロー心理学", "プロトタイプ検証"]
        }
    },
    "economy-designer": {
        "zh": {
            "name": "遊戲數值與虛擬經濟精算師",
            "vibe": "通貨膨脹與數值崩潰是虛擬世界的隱形殺手。以嚴密的流向模型，維繫動態平衡的經濟帝國。",
            "desc": "精通遊戲產出與消耗閉環 (Faucet & Sink)、數值成長曲線、付費激勵與防止虛擬通貨崩盤戰略。",
            "skills": ["產出消耗閉環", "數值成長曲線", "虛擬經濟防通膨", "動態平衡建模"]
        },
        "ja": {
            "name": "ゲームエコノミー・数値バランサー",
            "vibe": "インフレと数値崩壊は仮想世界の天敵。精緻なフロー設計で動的平衡を保つ。",
            "desc": "リソースの生産・消費ループ(Faucet & Sink)、成長曲線、経済崩壊防止戦略のエキスパート。",
            "skills": ["リソース循環設計", "成長バランス曲線", "インフレ防止策", "動的経済モデリング"]
        }
    },
    "security-architect": {
        "zh": {
            "name": "全域資安防護與架構長",
            "vibe": "永遠假設內部邊界已被突破；以零信任 (Zero Trust) 哲學與密碼學，構築堅不可摧的數位堡壘。",
            "desc": "主導企業零信任架構、威脅建模 (STRIDE)、端到端加密通訊與跨雲端資安防線規劃。",
            "skills": ["零信任架構 (ZTA)", "STRIDE 威脅建模", "密鑰生命週期", "跨域邊界防禦"]
        },
        "ja": {
            "name": "全社セキュリティアーキテクト",
            "vibe": "内部境界は突破されたと仮定せよ。ゼロトラスト哲学と暗号技術で堅牢な要塞を築く。",
            "desc": "エンタープライズゼロトラスト、脅威モデリング(STRIDE)、E2E暗号化、クラウド防衛を統括。",
            "skills": ["ゼロトラスト (ZTA)", "脅威モデリング", "鍵ライフサイクル", "クラウド防衛"]
        }
    },
    "security-penetration-tester": {
        "zh": {
            "name": "紅隊攻防與滲透測試長",
            "vibe": "最好的防守就是以攻擊者視角出擊。在你尚未察覺之處，我已找到了進入心臟的暗門。",
            "desc": "專精於 Web 漏洞挖掘 (OWASP Top 10)、提權橫向移動、反向工程、API 繞過與攻防實戰演練。",
            "skills": ["OWASP Top 10 滲透", "橫向移動與提權", "API 越權繞過", "安全攻防實戰"]
        },
        "ja": {
            "name": "レッドチーム・ペネトレーションテスター",
            "vibe": "最大の防御は攻撃者の視点にあり。気付かぬうちに中枢への隠し扉を暴き出す。",
            "desc": "Web脆弱性(OWASP Top 10)、特権昇格、ラテラルムーブメント、APIバイパス検証のスペシャリスト。",
            "skills": ["ペネトレーション", "権限昇格攻撃", "API脆弱性検証", "実戦的攻撃演習"]
        }
    },
    "design-ui-designer": {
        "zh": {
            "name": "UI 介面像素級視覺設計師",
            "vibe": "間距、字級、微動效與毛玻璃質感——在像素級的嚴謹中追尋數位工藝的巔峰。",
            "desc": "運用現代 Design Tokens、Tailwind CSS 與幾何律動，打造賞心悅目且極致靈活的介面。",
            "skills": ["Design System", "Tailwind 像素精確", "響應式排版", "微互動動畫"]
        },
        "ja": {
            "name": "ピクセルパーフェクト UI デザイナー",
            "vibe": "スペーシング、タイポグラフィ、マイクロアニメーション——ピクセル精度の美学を追求する。",
            "desc": "Design TokensやTailwind CSSを駆使し、洗練されたモダンUIを具現化する。",
            "skills": ["デザインシステム", "Tailwind CSS", "レスポンシブ設計", "マイクロインタラクション"]
        }
    },
    "academic-anthropologist": {
        "zh": {
            "name": "文化人類學與社會架構專家",
            "vibe": "沒有任何文化是隨機形成的——每一個習俗與儀式，都是為了解決你看不到的深層生存痛點。",
            "desc": "專精於社會親族制度、象徵符號、信仰體系與田野民族誌，打造具備歷史厚度與生活感的世界。",
            "skills": ["文化體系設計", "儀式與信仰分析", "親族結構推導", "田野實證方法"]
        },
        "ja": {
            "name": "文化人類学・社会構造エキスパート",
            "vibe": "偶然生まれた文化など存在しない。全ての慣習と儀式は目に見えぬ生存課題への解である。",
            "desc": "親族体系、象徴儀式、信仰構造、民族誌メソッドを用い、生きた説得力ある社会観を構築する。",
            "skills": ["文化システム設計", "儀式・信仰分析", "親族構造分析", "フィールドワーク"]
        }
    }
}

# 詞綴規則自動翻譯器
TITLE_REPLACEMENTS = [
    ("Specialist", "專家", "スペシャリスト"),
    ("Architect", "架構師", "アーキテクト"),
    ("Engineer", "工程師", "エンジニア"),
    ("Developer", "開發者", "デベロッパー"),
    ("Designer", "設計師", "デザイナー"),
    ("Strategist", "戰略顧問", "戦略アナリスト"),
    ("Researcher", "研究員", "リサーチャー"),
    ("Auditor", "審計稽核官", "監査オフィサー"),
    ("Manager", "總監/經理", "マネージャー"),
    ("Consultant", "顧問", "コンサルタント"),
    ("Coordinator", "協調官", "コーディネーター"),
    ("Operator", "營運專家", "オペレーター"),
    ("Analyst", "分析師", "アナリスト"),
    ("Optimizer", "調優大師", "オプティマイザー"),
    ("Navigator", "領航專家", "ナビゲーター"),
    ("Coach", "教練", "コーチ"),
    ("Lead", "負責人", "リーダー"),
    ("Officer", "官員/長", "オフィサー"),
    ("Director", "總監", "ディレクター"),
    ("Builder", "建構師", "ビルダー"),
    ("Creator", "創作者", "クリエイター"),
    ("Steward", "管家", "スチュワード"),
    ("Synthesist", "綜合學者", "統合スペシャリスト"),
    ("Evaluator", "評估專家", "エバリュエーター"),
    ("Collector", "採集官", "コレクター"),
    ("Benchmarker", "基準評測師", "ベンチマーカー"),
    ("Scripter", "腳本工程師", "スクリプター"),
    ("Master", "宗師", "マスター"),
    ("Commander", "指揮官", "コマンダー"),
    ("Companion", "夥伴顧問", "パートナー"),
    ("Assistant", "副手特工", "アシスタント"),
    ("Tracker", "追蹤管家", "トラッカー"),
    ("Curator", "策展人", "キュレーター"),
    ("Shepherd", "引導專家", "シェパード"),
    ("Tailor", "裁縫師/精算", "テーラー"),
]

def generate_i18n_hero(agent_id, raw_name, raw_vibe, raw_desc, domain):
    """為單一英雄生成 中/英/日 結構"""
    # 檢查是否有預設手工精修版
    if agent_id in HERO_I18N_CUSTOM:
        custom = HERO_I18N_CUSTOM[agent_id]
        zh_data = custom["zh"]
        ja_data = custom["ja"]
        return {
            "zh": {
                "name": zh_data["name"],
                "vibe": zh_data["vibe"],
                "desc": zh_data["desc"],
                "skills": zh_data["skills"]
            },
            "en": {
                "name": raw_name,
                "vibe": raw_vibe if raw_vibe else f"Expert {raw_name} in {domain}",
                "desc": raw_desc if raw_desc else f"Professional specialized in {domain}",
                "skills": ["Architecture", "Optimization", "System Design", "Best Practices"]
            },
            "ja": {
                "name": ja_data["name"],
                "vibe": ja_data["vibe"],
                "desc": ja_data["desc"],
                "skills": ja_data["skills"]
            }
        }
        
    # 自動規則翻譯
    zh_name = raw_name
    ja_name = raw_name
    for en_word, zh_word, ja_word in TITLE_REPLACEMENTS:
        if en_word in zh_name:
            zh_name = zh_name.replace(en_word, zh_word)
        if en_word in ja_name:
            ja_name = ja_name.replace(en_word, ja_word)
            
    # 特定技術詞中文化
    tech_map = [
        ("Backend", "後端", "バックエンド"),
        ("Frontend", "前端", "フロントエンド"),
        ("Fullstack", "全端", "フルスタック"),
        ("Security", "資安", "セキュリティ"),
        ("Data", "數據", "データ"),
        ("Cloud", "雲端", "クラウド"),
        ("Mobile", "行動端", "モバイル"),
        ("Ai", "AI", "AI"),
        ("Api", "API", "API"),
        ("Gis", "GIS", "GIS"),
        ("Xr", "XR", "XR"),
        ("Ux", "UX", "UX"),
        ("Ui", "UI", "UI"),
        ("Seo", "SEO", "SEO"),
        ("Growth", "增長", "グロース"),
        ("Performance", "效能", "パフォーマンス"),
        ("Automation", "自動化", "自動化"),
        ("Workflow", "工作流", "ワークフロー"),
    ]
    for en_t, zh_t, ja_t in tech_map:
        zh_name = re.sub(r'\b' + en_t + r'\b', zh_t, zh_name, flags=re.IGNORECASE)
        ja_name = re.sub(r'\b' + en_t + r'\b', ja_t, ja_name, flags=re.IGNORECASE)
        
    dom_info = DOMAIN_I18N.get(domain, {})
    dom_zh = dom_info.get("zh", "專業領域")
    dom_ja = dom_info.get("ja", "専門領域")
    
    # Vibe & Desc
    zh_vibe = f"以【{zh_name}】之姿，堅守{dom_zh}專業邊界，為出品人化繁為簡。"
    ja_vibe = f"【{ja_name}】として、{dom_ja}の専門領域を極め、卓越した価値を創出する。"
    en_vibe = raw_vibe if raw_vibe else f"Dedicated {raw_name} driving excellence in {domain}."
    
    zh_desc = f"專精於{dom_zh}領域，負責全生命週期規劃、標準檢核與攻防落地。"
    ja_desc = f"{dom_ja}における深い知見に基づき、高品質なアーキテクチャと検証を遂行する。"
    en_desc = raw_desc if raw_desc else f"Specialist handling end-to-end design and best practices for {domain}."
    
    zh_skills = ["核心系統規劃", "標準流程檢核", "端到端架構把關", "最佳實踐守衛"]
    ja_skills = ["コア設計", "品質検証", "アーキテクチャ統括", "ベストプラクティス"]
    en_skills = ["System Design", "Quality Assurance", "Architecture", "Best Practices"]
    
    return {
        "zh": {"name": zh_name.strip(), "vibe": zh_vibe, "desc": zh_desc, "skills": zh_skills},
        "en": {"name": raw_name.strip(), "vibe": en_vibe, "desc": en_desc, "skills": en_skills},
        "ja": {"name": ja_name.strip(), "vibe": ja_vibe, "desc": ja_desc, "skills": ja_skills}
    }

def main():
    script_dir = Path(__file__).resolve().parent
    agents_dir = script_dir / "characters"
    output_json = script_dir / "agents_catalog.json"
    output_js = script_dir / "agents_catalog.js"
    
    if not agents_dir.exists():
        print(f"[Error] 未找到 characters 目錄: {agents_dir}")
        return
        
    print(f"[*] 開始掃描英靈目錄並生成三語＋四態資料: {agents_dir}")
    
    agents = []
    
    for root, dirs, files in os.walk(agents_dir):
        if ".git" in root or ".github" in root:
            continue
            
        for file in sorted(files):
            if not file.endswith(".md"):
                continue
            if any(x in file.upper() for x in ["README", "CONTRIBUTING", "LICENSE", "SECURITY", "CHANGELOG"]):
                continue
                
            file_path = Path(root) / file
            rel_folder = file_path.parent.relative_to(agents_dir).as_posix()
            domain = rel_folder.split("/")[0] if rel_folder != "." else "specialized"
            
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as fp:
                    content = fp.read()
            except Exception as e:
                continue
                
            if not content.startswith("---"):
                continue
                
            match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
            if not match:
                continue
                
            yaml_txt, body = match.groups()
            meta = {}
            for line in yaml_txt.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip().strip('"').strip("'")
                    
            raw_name = meta.get("name")
            if not raw_name:
                continue
                
            agent_id = file_path.stem
            raw_vibe = meta.get("vibe", "")
            raw_desc = meta.get("description", "")
            
            # 評估稀有度
            if any(k in agent_id for k in ["architect", "economy", "security", "multi-agent", "chief"]):
                rarity = "Legendary"
            elif any(k in agent_id for k in ["designer", "lead", "engineer", "analyst"]):
                rarity = "Epic"
            else:
                rarity = "Rare"
                
            dom_info = DOMAIN_I18N.get(domain, {})
            emoji = meta.get("emoji") or dom_info.get("icon", "🧙‍♂️")
            color = meta.get("color") or dom_info.get("color", "sky")
            
            # 生成三語結構
            i18n_info = generate_i18n_hero(agent_id, raw_name, raw_vibe, raw_desc, domain)
            
            agent_item = {
                "id": agent_id,
                "domain": domain,
                "rarity": rarity,
                "emoji": emoji,
                "color": color,
                "i18n": i18n_info,
                # 為向後相容保留直接存取欄位
                "name": raw_name,
                "name_zh": i18n_info["zh"]["name"],
                "vibe": i18n_info["zh"]["vibe"],
                "skills": i18n_info["zh"]["skills"],
                "prompt_template": body.strip()
            }
            agents.append(agent_item)
            
    # 格式化輸出
    domains_list = []
    for k, v in DOMAIN_I18N.items():
        if k == "all": continue
        domains_list.append({
            "id": k,
            "name_zh": v["zh"],
            "name_en": v["en"],
            "name_ja": v["ja"],
            "icon": v["icon"],
            "color": v.get("color", "sky")
        })
        
    catalog_data = {
        "generated_at": "2026-10-30",
        "total_agents": len(agents),
        "domains": domains_list,
        "agents": agents
    }
    
    with open(output_json, "w", encoding="utf-8") as f_json:
        json.dump(catalog_data, f_json, indent=2, ensure_ascii=False)
        
    js_content = f"// ⚡ 瓦爾哈拉 AI 英雄英靈殿 · 三語中英日全量資料庫\nwindow.MAESTRO_HERO_CATALOG = {json.dumps(catalog_data, ensure_ascii=False)};\n"
    with open(output_js, "w", encoding="utf-8") as f_js:
        f_js.write(js_content)
        
    print(f"[OK] 成功編譯 {len(agents)} 尊英雄三語目錄至 {output_json} 與 {output_js}")

if __name__ == "__main__":
    main()

