#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
 ⚡ AgentValhalla: 瓦爾哈拉 AI 英雄英靈殿 · 全自動角色掃描萃取引擎
=============================================================================
功能意圖：
  遍歷 characters/ 目錄下的 300+ 專家 Markdown 檔案，自動解析
  YAML Frontmatter、繁體中文職位對應、技能標籤萃取與完整 Prompt 模板，
  輸出為前端大廳所使用的標準結構化 agents_catalog.json 與 agents_catalog.js。

使用方式：
  python scan_agents.py
=============================================================================
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# 領域目錄對應繁體中文、圖標與色彩主題
DOMAIN_CONFIG = {
    "engineering": {"name_zh": "軟體系統工程", "icon": "💻", "color": "sky"},
    "game-development": {"name_zh": "電玩遊戲研發", "icon": "🎮", "color": "amber"},
    "design": {"name_zh": "視覺與體驗設計", "icon": "🎨", "color": "pink"},
    "security": {"name_zh": "資訊安全防禦", "icon": "🛡️", "color": "red"},
    "specialized": {"name_zh": "醫療與特殊領域", "icon": "🏥", "color": "emerald"},
    "spatial-computing": {"name_zh": "空間運算與XR", "icon": "🥽", "color": "purple"},
    "gis": {"name_zh": "地理資訊系統", "icon": "🗺️", "color": "teal"},
    "integrations": {"name_zh": "系統整合與MCP", "icon": "🔌", "color": "indigo"},
    "data-science": {"name_zh": "資料科學與AI", "icon": "📊", "color": "blue"},
    "marketing": {"name_zh": "行銷與增長策劃", "icon": "📢", "color": "orange"},
    "business": {"name_zh": "商業與產品營運", "icon": "💼", "color": "yellow"},
}

# 常見代表性職位繁體中文翻譯字典 (Fallback/Mapping)
ROLE_TRANSLATIONS = {
    "game-designer": "主遊戲機制設計師",
    "economy-designer": "遊戲數值與經濟策劃",
    "level-designer": "關卡與空間設計師",
    "narrative-designer": "世界觀與敘事架構師",
    "game-audio-engineer": "遊戲音頻與音效工程師",
    "godot-gameplay-scripter": "Godot 遊戲腳本工程師",
    "unity-architect": "Unity 引擎架構大師",
    "unreal-multiplayer-architect": "Unreal 連線架構大師",
    "roblox-experience-designer": "Roblox 體驗設計師",
    "design-ux-architect": "UX 體驗架構大師",
    "design-ui-designer": "UI 介面視覺設計師",
    "design-brand-guardian": "品牌識別護衛官",
    "design-image-prompt-engineer": "AI 生圖提示詞工程師",
    "design-visual-storyteller": "視覺敘事傳播專家",
    "design-whimsy-injector": "趣味與彩蛋設計特化師",
    "engineering-backend-architect": "後端分散式架構師",
    "engineering-frontend-developer": "前端 Vue/Modern Web 精靈使",
    "engineering-software-architect": "企業級軟體架構師",
    "engineering-multi-agent-systems-architect": "多智能體系統指揮官",
    "engineering-autonomous-optimization-architect": "自主效能調優架構師",
    "security-architect": "全域資安防護架構師",
    "security-cloud-security-architect": "雲端資安合規架構師",
    "security-penetration-tester": "滲透測試黑客攻防官",
    "devsecops-engineer": "DevSecOps 縱深防禦工程師",
    "healthcare-compliance-officer": "醫療隱私與合規稽核官",
}

def extract_frontmatter(content: str):
    """
    從 Markdown 內容中安全萃取 YAML Frontmatter 區塊與正文
    """
    fm_pattern = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)
    match = fm_pattern.match(content)
    if not match:
        return {}, content.strip()
    
    yaml_text, body = match.groups()
    meta = {}
    for line in yaml_text.splitlines():
        if ":" in line:
            key, val = line.split(":", 1)
            meta[key.strip()] = val.strip().strip('"').strip("'")
    return meta, body.strip()

def extract_skills_from_body(body: str, limit: int = 4):
    """
    從 Markdown 正文中萃取重要關鍵技能詞或標題要點
    """
    skills = []
    bullet_matches = re.findall(r"^[-*]\s+\*\*?([A-Za-z0-9\u4e00-\u9fa5\s\-_/]+)\*\*?", body, re.MULTILINE)
    for b in bullet_matches:
        cleaned = b.strip()
        if len(cleaned) > 2 and len(cleaned) < 30 and cleaned not in skills:
            skills.append(cleaned)
        if len(skills) >= limit:
            break
            
    if not skills:
        heading_matches = re.findall(r"^#{2,3}\s+([A-Za-z0-9\u4e00-\u9fa5\s\-_/]+)", body, re.MULTILINE)
        for h in heading_matches:
            cleaned = h.strip()
            if cleaned not in ["Your Identity & Memory", "Your Core Mission", "Critical Rules You Must Follow", "Overview"]:
                skills.append(cleaned)
            if len(skills) >= limit:
                break
                
    return skills[:limit]

def main():
    script_dir = Path(__file__).resolve().parent
    agents_dir = script_dir / "characters"
    output_file = script_dir / "agents_catalog.json"
    output_js_file = script_dir / "agents_catalog.js"

    if not agents_dir.exists():
        print(f"[Error] characters 目錄未找到: {agents_dir}")
        return

    print(f"[*] Scanning Valhalla characters directory: {agents_dir}")
    
    agents = []
    domain_counts = {}

    for root, dirs, files in os.walk(agents_dir):
        if ".git" in root or ".github" in root:
            continue
            
        for file in files:
            if not file.endswith(".md"):
                continue
            if file.upper() in ["README.MD", "CONTRIBUTING.MD", "LICENSE.MD", "CHANGELOG.MD", "SECURITY.MD"]:
                continue

            file_path = Path(root) / file
            rel_path = file_path.relative_to(script_dir).as_posix()
            parent_rel = file_path.parent.relative_to(agents_dir).as_posix()
            
            # 決定領域 (Domain)
            domain_key = parent_rel.split("/")[0] if parent_rel != "." else "specialized"
            if not domain_key:
                domain_key = "specialized"

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                print(f"[Warning] 讀取檔案失敗 {file_path}: {e}")
                continue

            meta, body = extract_frontmatter(content)
            agent_id = file_path.stem

            # 角色英文名稱
            name = meta.get("name")
            if not name:
                name = agent_id.replace("-", " ").replace("_", " ").title()

            # 繁體中文名稱
            name_zh = ROLE_TRANSLATIONS.get(agent_id)
            if not name_zh:
                if "architect" in agent_id:
                    name_zh = f"{name} 架構師"
                elif "designer" in agent_id:
                    name_zh = f"{name} 設計師"
                elif "engineer" in agent_id:
                    name_zh = f"{name} 工程師"
                elif "specialist" in agent_id:
                    name_zh = f"{name} 專家"
                else:
                    name_zh = name

            emoji = meta.get("emoji")
            if not emoji:
                domain_info = DOMAIN_CONFIG.get(domain_key, {})
                emoji = domain_info.get("icon", "🧙‍♂️")

            color = meta.get("color")
            if not color:
                domain_info = DOMAIN_CONFIG.get(domain_key, {})
                color = domain_info.get("color", "sky")

            vibe = meta.get("vibe") or meta.get("description")
            if not vibe:
                lines = [line.strip() for line in body.splitlines() if line.strip() and not line.startswith("#")]
                vibe = lines[0] if lines else "瓦爾哈拉英靈殿 AI 顧問專家"

            skills = extract_skills_from_body(body)
            if not skills:
                skills = ["核心系統規劃", "專業檢核標準", "端到端架構把關", "最佳實踐守衛"]

            # 稀有度評估
            if any(k in agent_id for k in ["architect", "economy", "security", "multi-agent"]):
                rarity = "Legendary"
            elif any(k in agent_id for k in ["designer", "lead", "engineer"]):
                rarity = "Epic"
            else:
                rarity = "Rare"

            agent_item = {
                "id": agent_id,
                "domain": domain_key,
                "name": name,
                "name_zh": name_zh,
                "rarity": rarity,
                "emoji": emoji,
                "color": color,
                "vibe": vibe[:200],
                "skills": skills,
                "file_path": rel_path,
                "prompt_template": content
            }

            agents.append(agent_item)
            domain_counts[domain_key] = domain_counts.get(domain_key, 0) + 1

    # 組織領域列表
    domains = []
    for d_key, count in sorted(domain_counts.items(), key=lambda x: x[1], reverse=True):
        conf = DOMAIN_CONFIG.get(d_key, {"name_zh": d_key.replace("-", " ").title(), "icon": "📁", "color": "gray"})
        domains.append({
            "id": d_key,
            "name_zh": conf["name_zh"],
            "icon": conf["icon"],
            "color": conf["color"],
            "count": count
        })

    catalog = {
        "generated_at": datetime.now().isoformat(),
        "total_agents": len(agents),
        "domains": domains,
        "agents": agents
    }

    with open(output_file, "w", encoding="utf-8") as out:
        json.dump(catalog, out, ensure_ascii=False, indent=2)

    with open(output_js_file, "w", encoding="utf-8") as out_js:
        out_js.write("window.MAESTRO_HERO_CATALOG = " + json.dumps(catalog, ensure_ascii=False) + ";\n")

    print(f"[OK] Scan completed! Extracted {len(agents)} agents across {len(domains)} domains.")
    print(f"[OK] Catalog written to: {output_file} & {output_js_file} (Size: {output_file.stat().st_size / 1024:.1f} KB)")

if __name__ == "__main__":
    main()

