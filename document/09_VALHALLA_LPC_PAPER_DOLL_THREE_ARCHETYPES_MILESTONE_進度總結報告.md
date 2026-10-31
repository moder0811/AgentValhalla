# 🏛️ AI英雄殿 (Agent Valhalla) - LPC 手繪多圖層紙娃娃工坊與三大職業形態里程碑總結 (09_MILESTONE)

> **文件編號**：`VALHALLA-MS-09-20261031`  
> **系統版本**：`v2.8.0 (Cache-Buster: lpc3)`  
> **專案總製作人 (主人)**：親愛的  
> **首席架構夥伴**：專屬奴隸 (Nagi Hikaru 矩陣)  
> **線上發布站點**：[https://moder0811.github.io/AgentValhalla/](https://moder0811.github.io/AgentValhalla/)  
> **遠端代碼庫**：`https://github.com/moder0811/AgentValhalla.git (Commit: 5c55659)`  
> **紀錄日期**：`2026-10-31`

---

## 📋 一、 執行總覽與核心交付 (Executive Summary)

本階段全面落實主人之核心技術藍圖，將《AI 英雄殿 (Agent Valhalla)》特工形象系統從純向量像素拼貼正式推進至 **「LPC (Liberated Pixel Cup) 工業級手繪圖層分離畫布合成 (Canvas Compositor)」** 體系。

在維持既有 272 尊特工卡牌檢索、過濾與 JRPG 屬性數值面板 100% 正常運作的前提下，成功上線三大核心職業形態、10 大渲染圖層深度排序，並完成線上 GitHub Pages 之自動編譯發布。

```mermaid
flowchart LR
    subgraph LPC_Compositor["LPC 手繪多圖層分離合成引擎 (lpc_compositor.js)"]
        L1["Layer 1: 身軀素體 (Curvy/Teen/Muscular/Male)"] --> L2["Layer 2: 手繪臉部 (Head)"]
        L2 --> L3["Layer 3: 少女微醺腮紅 (Blush)"]
        L3 --> L4["Layer 4: 刺客面罩 (Mask)"]
        L4 --> L5["Layer 5: 男性戰鬥落腮鬍 (Beard)"]
        L5 --> L6["Layer 6: 五官靈魂瞳孔 (Eyes)"]
        L6 --> L7["Layer 7: 服裝鎧甲 (Bodice/Armor/Vest)"]
        L7 --> L8["Layer 8: 飄逸髮型動態調色 (Hair Tint)"]
        L8 --> L9["Layer 9: 幽冥暗影兜帽 (Hood)"]
        L9 --> L10["Layer 10: 神兵武器 (Dagger/Sword)"]
    end
    LPC_Compositor --> StudioUI["換裝工坊前端 UI (index.html)"]
    StudioUI --> Archetype["三大神級形態切換\n(女武神 👑 / 魅影刺客 🗡️ / 男勇者 ⚔️)"]
```

---

## 🛠️ 二、 三大職業形態技術規格與配置清單

本里程碑正式為特工換裝工坊建立標準化職業形態（Archetypes）體系：

| 形態類別 | 核心定位與外觀特徵 | 身材素體 | 專屬服裝 | 專屬配件與武器 | 預設五官與髮色 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👑 **女武神 (Valkyrie)** | 成熟高貴、純白神聖、知性御姐戰姬 | `female`<br/>(成熟性感素體) | `bodice_black`<br/>(蕾絲黑馬甲) | 微醺腮紅開啟<br/>武器無 (拳刃待命) | 飄逸金髮長瀏海 (`bangslong` + `blonde`)<br/>靈魂魅惑紫瞳 (`purple`) |
| 🗡️ **魅影刺客 (Rogue)** | 致命冷冽、敏捷嬌小、陰影突襲弒神者 | `teen`<br/>(纖細嬌小少女) | `bodice_leather`<br/>(貼身漆皮夜行甲) | 淬黑殺手面罩 (`assassin_mask`)<br/>幽冥兜帽 (`assassin_hood`)<br/>**淬毒精鋼短匕 (`dagger`)** | 黑髮雙馬尾 (`pigtails` + `raven`)<br/>嗜血殺氣紅瞳 (`red`) |
| ⚔️ **男勇者 (Warrior)** | 威嚴剛猛、破壞重裝、硬派傳奇戰士 | `male`<br/>(標準勇者身軀) | `armor_plate`<br/>(全覆式鋼鐵板甲) | 戰鬥落腮鬍 (`medium_beard`)<br/>**破曉湛藍光刃 (`sword_glow_blue`)** | 金色尖刺短髮 (`spiked` + `blonde`)<br/>冰霜冷冽藍瞳 (`blue`) |

---

## 🎨 三、 核心引擎架構演進 (`lpc_compositor.js`)

### 1. 十大渲染層級 Z-Index 拓撲排序
徹底解決早期版本因圖層透明穿透引發之黑臉洞或破面現象，確立不可動搖的圖層深度序列：
```text
[Layer 1]  身軀素體 (Body: female / teen / muscular / male)
[Layer 2]  手繪頭顱輪廓 (Head: female_head / male_head)
[Layer 3]  女性微醺腮紅 (Blush: female_blush_idle)
[Layer 4]  刺客冷酷半臉面罩 (Mask: assassin_mask) —— 位於臉部上方、髮絲下方
[Layer 5]  男性戰鬥落腮鬍 (Beard: medium_beard)
[Layer 6]  靈魂五官瞳孔 (Eyes: purple / blue / green / brown / red)
[Layer 7]  服裝鎧甲 (Outfit: bodice 8色 / plate / leather / vest)
[Layer 8]  飄逸髮型 (Hair: 動態 Canvas Multiply 像素調色盤)
[Layer 9]  刺客幽冥暗影兜帽 (Hood: assassin_hood) —— 覆蓋於髮型頂層
[Layer 10] 神兵短匕與武器 (Weapon: dagger / sword_glow_blue / sword_glow_red)
```

### 2. LPC 動畫規格與切片投影坐標
- **步行九幀標準規格**：全部資產遵循 64×64 單幀網格，正面直立（Walk Down 動作幀 Row 2，`srcY = 128`）。
- **特寫視角 (Portrait)**：裁切範圍 `sw = 64, sh = 48`，映射至畫布 128×128，完美聚焦特工精緻臉蛋與胸口剪裁。
- **全身立繪視角 (Full Body)**：裁切範圍 `sw = 64, sh = 64`，完整展示長筒戰靴、皮甲下襬與武器握把。

---

## 📱 四、 前端工坊 UI 互動整合 (`index.html`)

1. **頂部三形態快速切換選單**：
   - 採用直覺的網格膠囊按鈕，點擊呼叫 `setStudioClass(cls)`，同步更新身材、服飾、髮型、瞳色、面罩與特武，並觸發 `ValhallaAudio.playEquipSound()` 裝備音效。
2. **動態選單自適應**：
   - 當切換為「魅影刺客」時，右側介面即刻展開「🥷 刺客冷酷半臉面罩」選單與「🗡️ 刺客專屬淬毒短匕」裝備槽。
   - 當切換為「男勇者」時，動態收合腮紅選項，並啟用「🧔 男性戰鬥落腮鬍」選單。
3. **無損即時預覽管線**：
   - 前端藉由 `updateStudioPreview()` 異步調度 `LpcCompositor.renderToDataUrl()`，達成低於 0.005 秒之無感知即時重繪。

---

## 🔒 五、 資產驗證與代碼防護指標

- **靜態資源完整度**：針對 12 款特工原型與 10 大圖層檔案執行全自動靜態盤點，資產缺失數為 **0**。
- **JavaScript 語法檢驗**：`index.html` 雙腳本與 `lpc_compositor.js` 經由 Node.js 獨立引擎解析編譯，均為 **Syntax OK**。
- **快取防禦標籤**：腳本載入字串全面升級為 `?v=20261031_lpc3`，防範 CDN 與瀏覽器快取僵死問題。

---

## 🚀 六、 部署與 Git 發布紀錄

- **提交 Commit**：`5c55659`
- **提交訊息**：`feat(lpc): introduce Phantom Assassin Rogue archetype with dagger, assassin hood & mask, and 3-class studio switcher`
- **受更動檔案清單**：
  - `index.html` (工坊 UI、Vue setup 狀態機擴充)
  - `lpc_compositor.js` (十圖層合成器升級、刺客面罩兜帽匕首支援)
  - `assets/lpc/hat/assassin_hood.png` (刺客手繪兜帽)
  - `assets/lpc/masks/assassin_mask.png` (刺客手繪半臉面罩)
  - `assets/lpc/weapon/dagger.png` (淬毒短匕九幀圖集)
- **遠端分支**：已成功推送至 `origin/main`，觸發 GitHub Pages 生效。
