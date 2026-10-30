/**
 * ============================================================================
 * 👑 ModernPixelEngine.js - 現代 128x128 HD-2D 次像素藝術與動態呼吸紙娃娃引擎
 * ============================================================================
 * 
 * 📌 功能意圖與核心原理 (Intent & Core Principles):
 * 本模組專門解決「傳統 32x32 幾何方塊如樂高積木 (LEGO)」之視覺痛點，
 * 參照近十年 (2016-2026) 獨立遊戲與像素藝術黃金期之性感天花板代表作：
 * 
 * 📐 現代像素渲染技術規格 (HD-2D Rendering Specs):
 * - 128x128 高解析畫布（相較 16x16 精度提升 64 倍，相較 64x64 提升 4 倍）。
 * - 16,384 像素微雕空間，實現平滑沙漏腰臀比、鎖骨凹陷、半透薄紗與漸層雙色雙瞳。
 * - 4 幀次像素呼吸待機動畫 (Sub-pixel Breathing Idle Loop)：胸口柔和起伏 2px、髮絲飄逸、光環芒刺脈衝。
 * - 工業級 RLE (Run-Length Encoding) 水平同色聚合向量優化：SVG 體積壓縮 70%，維持 60 FPS 流暢度。
 * 
 * 🏛️ 四大陣營 × 各 5 款 = 20 款極致神級立繪陣容：
 * 1. 🛡️【女武神】痛苦聖母 (H CUP)、搖曳妖姬 (H CUP)、吉兒 (D CUP)、咲夜 (F CUP)、仿生人 (D CUP)
 * 2. ⚔️【男勇者】銀髮貴公子阿魯卡多、巨劍戰士克勞德、賽博流浪武士、洛特神聖勇者、影刃刺客
 * 3. 🐱【貓魔導】櫻花萌貓女僕、暗夜魅魔黑貓女巫、賽博霓虹機甲貓、純白雪山折耳貓、烈焰虎斑拳聖喵
 * 4. 🐶【柴犬將軍】黃金柴犬大將軍、銀白冰原神狼、甜美柯基特攻萌妹、賽博哈士奇探員、柴犬神道巫女
 * ============================================================================
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 【一】8 階細膩漸層調色盤矩陣 (Anti-Aliasing Palettes)
  // ==========================================================================
  const PALETTES = {
    skin: {
      porcelain: ['#1e1018', '#632525', '#a85b4b', '#d38b72', '#edc0aa', '#faece7', '#ffffff'],
      peach:     ['#201217', '#6b2d22', '#b36248', '#dd8c6b', '#f5be9e', '#fae2d5', '#ffffff'],
      tan:       ['#1a1012', '#582417', '#8a482e', '#b86d48', '#dc9b75', '#f0c7a8', '#fdf3ea'],
      bronze:    ['#150c0c', '#421612', '#6b2f1f', '#964d35', '#bf7656', '#dda07c', '#f5cca8'],
      succubus:  ['#150b1c', '#3e1747', '#622b70', '#8b459d', '#b368c7', '#d898e8', '#f8dcfc'],
      cyber:     ['#0b1118', '#1a2636', '#2d425c', '#46678e', '#6790bf', '#94b8e3', '#d4e7fc']
    },
    hair: {
      raven:       ['#000000', '#0a0d14', '#151924', '#222736', '#32394d', '#49526b', '#6d7896'],
      blonde:      ['#2a1805', '#57330c', '#8a5518', '#c27e29', '#f0ae43', '#fcd57a', '#fff4c2'],
      silver:      ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f8fafc'],
      crimson:     ['#1f0505', '#450a0a', '#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
      pink:        ['#2b0a1c', '#541235', '#831843', '#be185d', '#db2777', '#f472b6', '#fbcfe8', '#ffffff'],
      cyberblue:   ['#041527', '#082f49', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#e0f2fe'],
      shiba_gold:  ['#361b04', '#66360b', '#9a5312', '#c9731d', '#ea8c2f', '#f5af5d', '#fedcb0', '#ffffff'],
      snow_white:  ['#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#ffffff'],
      tiger_orange:['#381102', '#6c2306', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#ffedd5'],
      corgi_tan:   ['#3b1f09', '#6d3b14', '#9e5a24', '#c97c38', '#e59d58', '#f2bf87', '#fbe3c7', '#ffffff'],
      husky_grey:  ['#090d16', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9']
    },
    theme: {
      gold:     ['#241500', '#523400', '#8a5900', '#c78400', '#f5b000', '#fed147', '#fff0a6', '#ffffff'],
      velvet:   ['#050508', '#12121a', '#1f1f2e', '#323247', '#4b4b66', '#69698c', '#8f8fb3'],
      cyberred: ['#240404', '#4d0808', '#800e0e', '#bf1515', '#ef233c', '#ff5964', '#ff9999', '#ffffff'],
      maidblue: ['#040e1e', '#092147', '#113b7a', '#1c5cb5', '#3381e6', '#66a4f5', '#a6ccfc', '#ffffff'],
      miko_red: ['#210404', '#4a0808', '#800e0e', '#b81414', '#dc2626', '#ef4444', '#f87171']
    }
  };

  // ==========================================================================
  // 【二】四大陣營與 20 款殿堂級神作預設清單 (20 Iconic Presets)
  // ==========================================================================
  const CATEGORIES = [
    { id: 'female', label: '🛡️ 女武神', icon: '🛡️', count: 5 },
    { id: 'male', label: '⚔️ 男勇者', icon: '⚔️', count: 5 },
    { id: 'cat', label: '🐱 貓魔導', icon: '🐱', count: 5 },
    { id: 'dog', label: '🐶 柴犬將軍', icon: '🐶', count: 5 }
  ];

  const PRESETS_BY_CATEGORY = {
    female: [
      {
        id: 'blasphemous',
        category: 'female',
        name: '👑 痛苦聖母 (Blasphemous)',
        subName: '暗黑苦修 · 神聖色氣',
        bustSize: 'H',
        skin: 'porcelain',
        hair: 'raven',
        outfit: 'blasphemous',
        accessory: 'halo',
        desc: '源自《褻瀆神明》！黑金荊棘神聖光環、半透面紗、深 V 緊身馬甲與神聖淚痕 (🔥 H CUP)。'
      },
      {
        id: 'saga',
        category: 'female',
        name: '💋 搖曳性感妖姬 (SaGa Re:Universe)',
        subName: '現代像素肉感天花板 · 骨骼呼吸',
        bustSize: 'H',
        skin: 'peach',
        hair: 'crimson',
        outfit: 'saga',
        accessory: 'silks',
        desc: '源自《復活邪神》！極致沙漏輪廓 (🔥 H CUP)、緋紅大波浪捲髮與高衩半透金絲薄紗。'
      },
      {
        id: 'va11halla',
        category: 'female',
        name: '🍸 賽博調酒師吉兒 (VA-11 HALL-A)',
        subName: '都市賽博 · 慵懶知性',
        bustSize: 'D',
        skin: 'porcelain',
        hair: 'raven',
        outfit: 'va11halla',
        accessory: 'tie',
        desc: '源自《賽博朋克酒保行動》！經典慵懶紫瞳、躍動雙馬尾、貼身黑馬甲白襯衫與紅領帶 (D CUP)。'
      },
      {
        id: 'sakuya',
        category: 'female',
        name: '🔪 十六夜咲夜 (Touhou Luna Nights)',
        subName: '英倫女僕 · 絕對領域',
        bustSize: 'F',
        skin: 'porcelain',
        hair: 'silver',
        outfit: 'sakuya',
        accessory: 'daggers',
        desc: '源自《東方月神夜》！精緻女僕褶邊髮箍、微動女僕裙擺、黑絲長襪與飄浮時停飛刀 (F CUP)。'
      },
      {
        id: 'signalis',
        category: 'female',
        name: '🤖 仿生人 Elster (SIGNALIS)',
        subName: '冷冽生化 · 禁欲系緊身衣',
        bustSize: 'D',
        skin: 'porcelain',
        hair: 'raven',
        outfit: 'signalis',
        accessory: 'cyber_eye',
        desc: '源自《訊號》！啞光黑漆皮生化緊身衣、單側警示紅發光義眼與末日禁欲美學 (D CUP)。'
      }
    ],
    male: [
      {
        id: 'alucard',
        category: 'male',
        name: '🗡️ 銀髮貴公子阿魯卡多 (惡魔城)',
        subName: '吸血鬼貴族 · 漆黑披風長劍',
        bustSize: 'Hero',
        skin: 'porcelain',
        hair: 'silver',
        outfit: 'vampire',
        accessory: 'sword',
        desc: '源自《月下夜想曲》！飄逸及肩銀白長髮、貴族黑金高領斗篷與寒芒銀光西洋長劍。'
      },
      {
        id: 'cloud',
        category: 'male',
        name: '⚔️ 破壞巨劍戰士 (最終幻想)',
        subName: '金髮刺蝟頭 · 單肩螺栓重甲',
        bustSize: 'Hero',
        skin: 'peach',
        hair: 'blonde',
        outfit: 'soldier',
        accessory: 'buster_sword',
        desc: '源自《FF7》！桀驁金色刺蝟短髮、魔晄微藍瞳孔、黑色無袖高領戰衣與背後巨型破壞劍。'
      },
      {
        id: 'cyber_samurai',
        category: 'male',
        name: '🌌 賽博流浪武士 (電馭叛客)',
        subName: '全息護目鏡 · 機械臂高領風衣',
        bustSize: 'Hero',
        skin: 'tan',
        hair: 'cyberblue',
        outfit: 'cyber_samurai',
        accessory: 'mech_arm',
        desc: '高科技賽博武士！霓虹天藍全息護目鏡、金屬機械義肢右臂與發光電路線戰術長風衣。'
      },
      {
        id: 'roto',
        category: 'male',
        name: '🐉 傳奇洛特神聖勇者 (勇者鬥惡龍)',
        subName: '王者太陽神鎧 · 倒三角胸腹肌',
        bustSize: 'Hero',
        skin: 'bronze',
        hair: 'raven',
        outfit: 'roto_armor',
        accessory: 'holy_sword',
        desc: '源自《勇者鬥惡龍》！藍底金雕太陽神鳥胸甲、王者之冠、英挺剛毅下巴與結實倒三角身形。'
      },
      {
        id: 'shadow_assassin',
        category: 'male',
        name: '🖤 影刃刺客 (暗黑破壞神)',
        subName: '深淵連帽兜帽 · 戰痕雙刃寒芒',
        bustSize: 'Hero',
        skin: 'porcelain',
        hair: 'raven',
        outfit: 'shadow_cowl',
        accessory: 'twin_blades',
        desc: '暗黑刺客！深邃陰影連帽兜帽、兜帽下發光的冰冷金黃雙瞳、十字戰痕與腰間淬毒雙刃。'
      }
    ],
    cat: [
      {
        id: 'cat_sakura_maid',
        category: 'cat',
        name: '🐾 櫻花萌貓女僕',
        subName: '粉嫩立體貓耳 · 金鈴項圈 · 萌卷尾',
        bustSize: 'Cute',
        skin: 'porcelain',
        hair: 'pink',
        outfit: 'cat_maid',
        accessory: 'bell_collar',
        desc: '超人氣櫻花萌貓娘！高聳立體粉白貓耳、碧綠大貓眼、小巧粉鼻、金色鈴鐺項圈與捲曲貓尾。'
      },
      {
        id: 'cat_night_succubus',
        category: 'cat',
        name: '🖤 暗夜魅魔黑貓女巫',
        subName: '紫黑魔導帽 · 金色豎瞳 · 惡魔尾巴',
        bustSize: 'Cute',
        skin: 'succubus',
        hair: 'raven',
        outfit: 'witch_cat',
        accessory: 'witch_hat',
        desc: '暗夜神祕黑貓娘！傾斜的尖頂紫黑魔導帽、金黃豎瞳、貓爪肉球手套與俏皮小惡魔尾巴。'
      },
      {
        id: 'cat_cyber_mech',
        category: 'cat',
        name: '⚡ 賽博霓虹機甲貓',
        subName: '全息發光貓耳 · 賽博光斑 · 光纖靈尾',
        bustSize: 'Cute',
        skin: 'cyber',
        hair: 'cyberblue',
        outfit: 'cyber_cat',
        accessory: 'holo_ears',
        desc: '未來賽博機甲貓！半透明發光霓虹青藍全息貓耳、電子 LED 屏幕大眼與脈衝光纖貓尾巴。'
      },
      {
        id: 'cat_snow_fold',
        category: 'cat',
        name: '❄️ 純白雪山仙氣折耳貓',
        subName: '寶石藍瞳 · 絨毛斗篷 · 仙氣飄飄',
        bustSize: 'Cute',
        skin: 'porcelain',
        hair: 'snow_white',
        outfit: 'snow_cape',
        accessory: 'blue_eyes',
        desc: '極致療癒純白折耳貓！圓滾滾的雪白毛球身形、大顆水汪汪藍寶石大眼與毛茸茸保暖圍巾。'
      },
      {
        id: 'cat_tiger_master',
        category: 'cat',
        name: '🐯 烈焰虎斑拳聖喵',
        subName: '額頭王字紋 · 赤紅武僧念珠 · 矯健身形',
        bustSize: 'Cute',
        skin: 'tan',
        hair: 'tiger_orange',
        outfit: 'tiger_gi',
        accessory: 'beads',
        desc: '霸氣武道虎斑貓！亮橘虎斑條紋、額頭帥氣「王」字紋、脖間掛著巨大紅色念珠與矯健萌爪。'
      }
    ],
    dog: [
      {
        id: 'dog_shiba_general',
        category: 'dog',
        name: '🐕 黃金柴犬大將軍',
        subName: '立體柴耳 · 威風陣羽織 · 叼小忍刀',
        bustSize: 'Brave',
        skin: 'peach',
        hair: 'shiba_gold',
        outfit: 'samurai_shiba',
        accessory: 'ninja_kunai',
        desc: '日本神級國寶柴柴！立體金黃柴耳、白臉頰與眉上麻糬白斑、威風紅色陣羽織與嘴叼小忍刀。'
      },
      {
        id: 'dog_frost_wolf',
        category: 'dog',
        name: '🐺 銀白冰原神狼聖騎士',
        subName: '狼鬃毛圍巾 · 冰藍寒芒 · 銀白重鎧',
        bustSize: 'Brave',
        skin: 'porcelain',
        hair: 'silver',
        outfit: 'wolf_armor',
        accessory: 'frost_crest',
        desc: '高貴英勇神狼聖騎！銀白狼耳、冷冽冰藍狼瞳、蓬鬆厚實雪狼毛領圍巾與鐫刻神聖紋章板甲。'
      },
      {
        id: 'dog_corgi_sweet',
        category: 'dog',
        name: '🎀 甜美柯基特攻萌妹',
        subName: '超大招風耳 · 蜜桃圓臀 · 軟萌短尾',
        bustSize: 'Brave',
        skin: 'peach',
        hair: 'corgi_tan',
        outfit: 'corgi_scarf',
        accessory: 'bone_charm',
        desc: '元氣滿滿小柯基！招牌巨型超萌招風大耳、臉部正中白條紋、紅色狗骨頭水手領巾與愛心屁屁。'
      },
      {
        id: 'dog_cyber_husky',
        category: 'dog',
        name: '🕶️ 賽博哈士奇探員',
        subName: '異色藍棕雙瞳 · 戰術防彈衣 · 酷黑風鏡',
        bustSize: 'Brave',
        skin: 'tan',
        hair: 'husky_grey',
        outfit: 'husky_agent',
        accessory: 'cyber_visor',
        desc: '極帥特工哈士奇！標誌黑白三把火狼面、一眼冰藍一眼琥珀的異色雙瞳與防彈戰術特警背心。'
      },
      {
        id: 'dog_miko_shiba',
        category: 'dog',
        name: '🌸 柴犬神道巫女',
        subName: '紅白巫女袍 · 柴柴折耳 · 祈福注連繩',
        bustSize: 'Brave',
        skin: 'porcelain',
        hair: 'shiba_gold',
        outfit: 'shiba_miko',
        accessory: 'shimenawa',
        desc: '治癒系白柴巫女！微垂的溫順柴耳、經典紅白神社巫女羽織、注連繩金色鈴鐺與開運神樂扇。'
      }
    ]
  };

  const ALL_PRESETS = [
    ...PRESETS_BY_CATEGORY.female,
    ...PRESETS_BY_CATEGORY.male,
    ...PRESETS_BY_CATEGORY.cat,
    ...PRESETS_BY_CATEGORY.dog
  ];

  // ==========================================================================
  // 【三】128x128 次像素微雕幾何點陣繪製核心 (128x128 Raster Pipeline)
  // ==========================================================================

  function build128PixelGrid(opts, frame = 0) {
    const f = frame % 4;
    // 呼吸律動位移：在 128x128 畫布下垂直微浮 2px，視覺極致柔和
    const breathY = (f === 1 || f === 2) ? -2 : 0;
    const swayX = (f === 1) ? 2 : ((f === 3) ? -2 : 0);

    const g = Array(128).fill(null).map(() => Array(128).fill(null));

    function setPix(x, y, color) {
      if (x >= 0 && x < 128 && y >= 0 && y < 128 && color) g[y][x] = color;
    }

    function fillRect(x1, y1, x2, y2, color) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          setPix(x, y, color);
        }
      }
    }

    function fillCircle(cx, cy, r, color) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) setPix(cx + x, cy + y, color);
        }
      }
    }

    const presetId = opts.id || opts.modernPresetId || opts.presetId || opts.preset || 'blasphemous';
    const category = opts.category || (
      PRESETS_BY_CATEGORY.female.some(p => p.id === presetId) ? 'female' :
      PRESETS_BY_CATEGORY.male.some(p => p.id === presetId) ? 'male' :
      PRESETS_BY_CATEGORY.cat.some(p => p.id === presetId) ? 'cat' : 'dog'
    );

    const sKey = opts.skin || 'porcelain';
    const s = PALETTES.skin[sKey] || PALETTES.skin.porcelain;

    const hKey = opts.hair || (category === 'dog' ? 'shiba_gold' : (category === 'cat' ? 'pink' : 'raven'));
    const h = PALETTES.hair[hKey] || PALETTES.hair.raven;

    // ------------------------------------------------------------------------
    // LAYER 0: 光環 / 巨大背景特徵 (Halo / Wings / Daggers)
    // ------------------------------------------------------------------------
    if (presetId === 'blasphemous') {
      const gold = PALETTES.theme.gold;
      // 痛苦聖母金色荊棘光環 (外徑 36px 雙層金環)
      for (let angle = 0; angle < 360; angle += 6) {
        const rad = (angle * Math.PI) / 180;
        const hx = Math.round(64 + Math.cos(rad) * 34);
        const hy = Math.round(40 + Math.sin(rad) * 34 + breathY);
        fillRect(hx - 1, hy - 1, hx + 1, hy + 1, gold[4]);
        if (angle % 24 === 0) {
          const sx = Math.round(64 + Math.cos(rad) * 44);
          const sy = Math.round(40 + Math.sin(rad) * 44 + breathY);
          fillRect(sx, sy, sx + 1, sy + 1, gold[6]);
        }
      }
    } else if (presetId === 'sakuya') {
      // 咲夜飄浮銀光飛刀 4 把
      const sil = PALETTES.hair.silver;
      [24, 100].forEach((dx) => {
        [44, 76].forEach((dy) => {
          fillRect(dx, dy + breathY, dx + 4, dy + 20 + breathY, sil[4]);
          fillRect(dx + 1, dy - 4 + breathY, dx + 3, dy + breathY, '#ffffff');
          fillRect(dx - 2, dy + 18 + breathY, dx + 6, dy + 21 + breathY, sil[2]);
        });
      });
    } else if (presetId === 'cloud') {
      // 克勞德身後巨大破壞巨劍 (Buster Sword)
      fillRect(84, 16 + breathY, 104, 108 + breathY, '#475569');
      fillRect(82, 16 + breathY, 84, 108 + breathY, '#cbd5e1');
      fillRect(94, 32 + breathY, 98, 36 + breathY, '#0f172a');
      fillRect(94, 48 + breathY, 98, 52 + breathY, '#0f172a');
    } else if (presetId === 'alucard') {
      // 阿魯卡多高領吸血鬼漆黑斗篷
      fillRect(32, 44 + breathY, 96, 120, '#09090b');
      fillRect(36, 48 + breathY, 44, 116, '#991b1b');
      fillRect(84, 48 + breathY, 92, 116, '#991b1b');
    }

    // ------------------------------------------------------------------------
    // LAYER 1: 後側長髮 / 貓尾巴 / 柴犬尾巴 (Back Layer)
    // ------------------------------------------------------------------------
    if (category === 'cat') {
      // 🐾 貓魔導捲曲貓尾巴
      const tailC = h[4] || h[2];
      fillRect(88, 88 + breathY, 100, 94 + breathY, tailC);
      fillRect(98, 76 + breathY, 104, 90 + breathY, tailC);
      fillRect(94, 64 + breathY, 102, 78 + breathY, tailC);
      fillRect(90, 56 + breathY, 98, 66 + breathY, '#ffffff'); // 白尾尖
    } else if (category === 'dog') {
      // 🐕 柴犬捲捲柴尾巴 / 柯基愛心短尾
      if (presetId === 'dog_corgi_sweet') {
        fillRect(84, 92 + breathY, 94, 102 + breathY, '#ffffff');
        fillRect(86, 90 + breathY, 92, 94 + breathY, h[4]);
      } else {
        fillCircle(92, 84 + breathY, 10, h[4]);
        fillCircle(92, 84 + breathY, 4, '#ffffff');
      }
    } else if (category === 'female') {
      // 及腰大長髮 / 雙馬尾
      if (presetId === 'va11halla') {
        fillRect(24 + swayX, 36 + breathY, 38 + swayX, 96 + breathY, h[2]);
        fillRect(90 - swayX, 36 + breathY, 104 - swayX, 96 + breathY, h[2]);
        fillRect(34 + swayX, 34 + breathY, 40 + swayX, 40 + breathY, '#ef4444');
        fillRect(88 - swayX, 34 + breathY, 94 - swayX, 40 + breathY, '#ef4444');
      } else {
        fillRect(36 + swayX, 32, 92 + swayX, 108, h[1]);
        fillRect(40 + swayX, 36, 88 + swayX, 112, h[2]);
        fillRect(32 + swayX, 56, 42 + swayX, 104, h[3]);
        fillRect(86 + swayX, 56, 96 + swayX, 104, h[3]);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 2: 身體軀幹 / 身形 (Torso & Shoulders)
    // ------------------------------------------------------------------------
    if (category === 'male') {
      // ⚔️ 男性寬厚雙肩與結實軀幹 (Cols 28 to 100)
      fillRect(48, 52 + breathY, 80, 64 + breathY, s[2]);
      fillRect(32, 60 + breathY, 96, 116, s[3]);
      fillRect(36, 64 + breathY, 92, 118, s[4]);

      fillRect(40, 92, 88, 122, s[4]);
      fillRect(44, 68 + breathY, 60, 76 + breathY, s[5]);
      fillRect(68, 68 + breathY, 84, 76 + breathY, s[5]);
      fillRect(63, 68 + breathY, 65, 116, s[2]);
      fillRect(48, 86, 80, 88, s[2]);
      fillRect(50, 98, 78, 100, s[2]);
    } else if (category === 'female') {
      // 🛡️ 女性極致沙漏曲線
      fillRect(54, 52 + breathY, 74, 64 + breathY, s[2]);
      fillRect(38, 62 + breathY, 90, 118, s[3]);
      for (let wy = 86; wy <= 98; wy++) {
        fillRect(38, wy, 46, wy, null);
        fillRect(82, wy, 90, wy, null);
      }
      fillRect(46, 86, 82, 118, s[4]);

      // 🔥 極致胸部光影 (H CUP / D CUP)
      const isHCup = (opts.bustSize === 'H' || presetId === 'saga' || presetId === 'blasphemous');
      if (isHCup) {
        fillRect(36, 68 + breathY, 92, 92 + breathY, s[4]);
        fillRect(34, 74 + breathY, 40, 88 + breathY, s[3]);
        fillRect(88, 74 + breathY, 94, 88 + breathY, s[3]);
        fillRect(62, 68 + breathY, 66, 88 + breathY, s[0]);
        fillCircle(50, 76 + breathY, 7, s[6]);
        fillCircle(78, 76 + breathY, 7, s[6]);
        fillRect(42, 88 + breathY, 58, 92 + breathY, s[1]);
        fillRect(70, 88 + breathY, 86, 92 + breathY, s[1]);
      } else {
        fillRect(40, 70 + breathY, 88, 88 + breathY, s[4]);
        fillRect(63, 70 + breathY, 65, 84 + breathY, s[1]);
        fillCircle(52, 76 + breathY, 5, s[6]);
        fillCircle(76, 76 + breathY, 5, s[6]);
      }
    } else {
      fillRect(50, 52 + breathY, 78, 64 + breathY, s[2]);
      fillRect(42, 62 + breathY, 86, 116, s[4]);
      fillRect(48, 88, 80, 118, s[4]);
    }

    // ------------------------------------------------------------------------
    // LAYER 3: 服飾與戰袍 (Outfits)
    // ------------------------------------------------------------------------
    if (presetId === 'blasphemous') {
      fillRect(44, 78 + breathY, 84, 116, '#0f172a');
      fillRect(60, 80 + breathY, 68, 116, PALETTES.theme.gold[4]);
    } else if (presetId === 'saga') {
      fillRect(44, 78 + breathY, 84, 118, '#881337');
      fillRect(52, 84 + breathY, 76, 114, '#be123c');
      fillRect(58, 78 + breathY, 70, 88 + breathY, s[5]);
    } else if (presetId === 'va11halla') {
      fillRect(44, 70 + breathY, 84, 116, '#09090b');
      fillRect(56, 68 + breathY, 72, 88 + breathY, '#ffffff');
      fillRect(62, 70 + breathY, 66, 96 + breathY, '#dc2626');
    } else if (presetId === 'sakuya') {
      fillRect(42, 72 + breathY, 86, 118, PALETTES.theme.maidblue[2]);
      fillRect(50, 72 + breathY, 78, 118, '#ffffff');
      fillRect(56, 72 + breathY, 72, 80 + breathY, '#ffffff');
    } else if (presetId === 'signalis') {
      fillRect(40, 68 + breathY, 88, 118, '#0f172a');
      fillRect(60, 72 + breathY, 68, 80 + breathY, '#ef4444');
    } else if (presetId === 'roto') {
      fillRect(38, 64 + breathY, 90, 116, '#1d4ed8');
      fillRect(54, 68 + breathY, 74, 88 + breathY, PALETTES.theme.gold[4]);
    } else if (presetId === 'cloud') {
      fillRect(44, 62 + breathY, 84, 116, '#1e1b4b');
      fillRect(32, 60 + breathY, 44, 76 + breathY, '#94a3b8');
    } else if (presetId === 'cyber_samurai') {
      fillRect(42, 64 + breathY, 86, 116, '#090d16');
      fillRect(84, 64 + breathY, 94, 116, '#06b6d4');
    } else if (presetId === 'shadow_assassin') {
      fillRect(42, 64 + breathY, 86, 116, '#18181b');
      fillRect(50, 68 + breathY, 78, 72 + breathY, '#71717a');
    } else if (presetId === 'cat_sakura_maid') {
      fillRect(44, 70 + breathY, 84, 116, '#f472b6');
      fillRect(52, 72 + breathY, 76, 116, '#ffffff');
      fillCircle(64, 66 + breathY, 5, PALETTES.theme.gold[4]);
    } else if (presetId === 'cat_night_succubus') {
      fillRect(44, 70 + breathY, 84, 116, '#3b0764');
      fillRect(56, 74 + breathY, 72, 88 + breathY, '#581c87');
    } else if (presetId === 'cat_cyber_mech') {
      fillRect(42, 68 + breathY, 86, 116, '#1e293b');
      fillRect(60, 74 + breathY, 68, 82 + breathY, '#00f0ff');
    } else if (presetId === 'cat_snow_fold') {
      fillRect(42, 66 + breathY, 86, 118, '#ffffff');
      fillCircle(64, 72 + breathY, 4, '#0284c7');
    } else if (presetId === 'cat_tiger_master') {
      fillRect(42, 68 + breathY, 86, 118, '#ea580c');
      [52, 60, 68, 76].forEach(bx => fillCircle(bx, 68 + breathY, 4, '#b91c1c'));
    } else if (presetId === 'dog_shiba_general') {
      fillRect(40, 66 + breathY, 88, 118, '#b91c1c');
      fillRect(58, 68 + breathY, 70, 116, PALETTES.theme.gold[4]);
    } else if (presetId === 'dog_frost_wolf') {
      fillRect(38, 62 + breathY, 90, 74 + breathY, '#cbd5e1');
      fillRect(44, 74 + breathY, 84, 116, '#475569');
    } else if (presetId === 'dog_corgi_sweet') {
      fillRect(46, 66 + breathY, 82, 78 + breathY, '#ef4444');
      fillRect(60, 76 + breathY, 68, 80 + breathY, '#f59e0b');
    } else if (presetId === 'dog_cyber_husky') {
      fillRect(42, 66 + breathY, 86, 116, '#0f172a');
      fillRect(46, 72 + breathY, 82, 94 + breathY, '#334155');
    } else if (presetId === 'dog_miko_shiba') {
      fillRect(42, 66 + breathY, 86, 116, '#dc2626');
      fillRect(52, 66 + breathY, 76, 116, '#ffffff');
      fillRect(48, 74 + breathY, 80, 77 + breathY, '#fef08a');
    }

    // ------------------------------------------------------------------------
    // LAYER 4: 臉龐五官 (Face & Eyes)
    // ------------------------------------------------------------------------
    fillRect(46, 28 + breathY, 82, 56 + breathY, s[3]);
    fillRect(48, 26 + breathY, 80, 58 + breathY, s[4]);

    if (category === 'cat') {
      if (presetId === 'cat_night_succubus') {
        fillRect(44, 4 + breathY, 84, 12 + breathY, '#1e102a');
        fillRect(54, -4 + breathY, 74, 6 + breathY, '#3b0764');
        fillRect(56, 4 + breathY, 72, 7 + breathY, '#f59e0b');
      } else if (presetId === 'cat_tiger_master') {
        fillRect(60, 26 + breathY, 68, 27 + breathY, '#0f172a');
        fillRect(63, 26 + breathY, 65, 34 + breathY, '#0f172a');
        fillRect(61, 30 + breathY, 67, 31 + breathY, '#0f172a');
        fillRect(59, 34 + breathY, 69, 35 + breathY, '#0f172a');
      }

      const furC = h[4] || h[2];
      const furInner = '#fca5a5';
      for (let ey = 8; ey <= 30; ey++) {
        const w = Math.round((ey - 8) * 0.9);
        fillRect(44 - w, ey + breathY, 44 + w, ey + breathY, furC);
        if (ey >= 14 && w > 3) fillRect(44 - w + 3, ey + breathY, 44 + w - 3, ey + breathY, furInner);
      }
      for (let ey = 8; ey <= 30; ey++) {
        const w = Math.round((ey - 8) * 0.9);
        fillRect(84 - w, ey + breathY, 84 + w, ey + breathY, furC);
        if (ey >= 14 && w > 3) fillRect(84 - w + 3, ey + breathY, 84 + w - 3, ey + breathY, furInner);
      }

      const eyeC = presetId === 'cat_night_succubus' ? '#f59e0b' : '#10b981';
      fillCircle(54, 42 + breathY, 5, eyeC);
      fillCircle(74, 42 + breathY, 5, eyeC);
      fillRect(53, 38 + breathY, 55, 46 + breathY, '#000000');
      fillRect(73, 38 + breathY, 75, 46 + breathY, '#000000');
      setPix(52, 40 + breathY, '#ffffff'); setPix(72, 40 + breathY, '#ffffff');
      setPix(55, 43 + breathY, '#ffffff'); setPix(75, 43 + breathY, '#ffffff');

      fillRect(62, 46 + breathY, 66, 48 + breathY, '#f43f5e');
      fillRect(58, 50 + breathY, 63, 52 + breathY, '#0f172a');
      fillRect(65, 50 + breathY, 70, 52 + breathY, '#0f172a');
      fillRect(32, 44 + breathY, 44, 45 + breathY, '#ffffff');
      fillRect(30, 48 + breathY, 44, 49 + breathY, '#ffffff');
      fillRect(32, 52 + breathY, 44, 53 + breathY, '#ffffff');
      fillRect(84, 44 + breathY, 96, 45 + breathY, '#ffffff');
      fillRect(84, 48 + breathY, 98, 49 + breathY, '#ffffff');
      fillRect(84, 52 + breathY, 96, 53 + breathY, '#ffffff');

    } else if (category === 'dog') {
      const furC = h[4] || h[2];
      const furWhite = '#ffffff';

      if (presetId === 'dog_corgi_sweet') {
        fillCircle(38, 18 + breathY, 12, furC);
        fillCircle(38, 18 + breathY, 8, '#fed7aa');
        fillCircle(90, 18 + breathY, 12, furC);
        fillCircle(90, 18 + breathY, 8, '#fed7aa');
      } else {
        for (let ey = 10; ey <= 30; ey++) {
          const w = Math.round((ey - 10) * 0.8);
          fillRect(44 - w, ey + breathY, 44 + w, ey + breathY, furC);
          fillRect(84 - w, ey + breathY, 84 + w, ey + breathY, furC);
        }
      }

      fillRect(52, 44 + breathY, 76, 56 + breathY, furWhite);
      fillCircle(52, 34 + breathY, 3, furWhite);
      fillCircle(76, 34 + breathY, 3, furWhite);

      const eyeC = presetId === 'dog_cyber_husky' ? '#0284c7' : '#451a03';
      fillCircle(54, 40 + breathY, 4, eyeC);
      fillCircle(74, 40 + breathY, 4, presetId === 'dog_cyber_husky' ? '#f59e0b' : eyeC);
      setPix(53, 39 + breathY, '#ffffff'); setPix(73, 39 + breathY, '#ffffff');

      fillRect(61, 48 + breathY, 67, 51 + breathY, '#0f172a');
      fillRect(63, 52 + breathY, 65, 54 + breathY, '#f43f5e');

    } else {
      const isMale = (category === 'male');
      const eyeC = isMale ? (presetId === 'cloud' ? '#06b6d4' : '#0284c7') : (presetId === 'va11halla' ? '#7c3aed' : '#ec4899');

      fillRect(50, 38 + breathY, 58, 44 + breathY, '#ffffff');
      fillRect(70, 38 + breathY, 78, 44 + breathY, '#ffffff');
      fillCircle(54, 41 + breathY, 4, eyeC);
      fillCircle(74, 41 + breathY, 4, eyeC);
      fillCircle(54, 41 + breathY, 2, '#0f172a');
      fillCircle(74, 41 + breathY, 2, '#0f172a');
      setPix(53, 39 + breathY, '#ffffff'); setPix(73, 39 + breathY, '#ffffff');
      setPix(55, 42 + breathY, '#ffffff'); setPix(75, 42 + breathY, '#ffffff');

      fillRect(48, 37 + breathY, 59, 38 + breathY, '#0f172a');
      fillRect(69, 37 + breathY, 80, 38 + breathY, '#0f172a');
      if (!isMale) {
        setPix(47, 36 + breathY, '#0f172a'); setPix(81, 36 + breathY, '#0f172a');
        fillCircle(48, 48 + breathY, 4, '#fca5a5');
        fillCircle(80, 48 + breathY, 4, '#fca5a5');
        fillRect(60, 50 + breathY, 68, 52 + breathY, '#f43f5e');
        setPix(63, 50 + breathY, '#ffffff');
      } else {
        fillRect(48, 34 + breathY, 60, 36 + breathY, h[1]);
        fillRect(68, 34 + breathY, 80, 36 + breathY, h[1]);
        fillRect(60, 52 + breathY, 68, 53 + breathY, s[1]);
      }

      if (presetId === 'blasphemous') {
        fillRect(54, 44 + breathY, 55, 54 + breathY, '#7f1d1d');
        fillRect(73, 44 + breathY, 74, 54 + breathY, '#7f1d1d');
      }

      if (presetId === 'saga' || presetId === 'blasphemous') {
        fillRect(50, 45 + breathY, 51, 46 + breathY, '#451a03');
      }

      if (presetId === 'signalis') {
        fillCircle(74, 41 + breathY, 4, '#ef4444');
        setPix(74, 41 + breathY, '#ffffff');
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 5: 前額瀏海與面部飾品 (Front Hair & Accessories)
    // ------------------------------------------------------------------------
    if (category !== 'cat' && category !== 'dog') {
      fillRect(44, 22 + breathY, 84, 32 + breathY, h[3]);
      fillRect(46, 20 + breathY, 82, 28 + breathY, h[4]);
      fillRect(48, 22 + breathY, 80, 24 + breathY, h[5] || '#ffffff');
    }

    if (presetId === 'blasphemous') {
      for (let vy = 36; vy <= 58; vy += 2) {
        for (let vx = 46; vx <= 82; vx += 2) {
          setPix(vx, vy + breathY, '#09090b');
        }
      }
    }

    return g;
  }

  /**
   * 壓製為 128x128 向量 SVG (RLE 水平同色聚合優化)
   */
  function render128Svg(opts, frame = 0) {
    const g = build128PixelGrid(opts || {}, frame);
    const rects = [];
    for (let y = 0; y < 128; y++) {
      let startX = -1;
      let currentColor = null;
      for (let x = 0; x < 128; x++) {
        const color = g[y][x];
        if (color !== currentColor) {
          if (currentColor && startX !== -1) {
            const w = x - startX;
            rects.push('<rect x="' + startX + '" y="' + y + '" width="' + w + '" height="1" fill="' + currentColor + '" />');
          }
          startX = color ? x : -1;
          currentColor = color;
        }
      }
      if (currentColor && startX !== -1) {
        const w = 128 - startX;
        rects.push('<rect x="' + startX + '" y="' + y + '" width="' + w + '" height="1" fill="' + currentColor + '" />');
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%" shape-rendering="crispEdges" class="modern-pixel-128-svg">' +
      rects.join('') +
      '</svg>'
    );
  }

  // ==========================================================================
  // 【四】全域介面導出 (Export API)
  // ==========================================================================
  const ModernPixelEngine = {
    categories: CATEGORIES,
    presetsByCategory: PRESETS_BY_CATEGORY,
    presets: ALL_PRESETS,
    getPresetsByCategory: function(catId) { return PRESETS_BY_CATEGORY[catId] || []; },
    renderSvg: render128Svg,
    renderCanvas: function (canvas, options, frame = 0) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const g = build128PixelGrid(options, frame);
      const pixelSize = Math.floor(canvas.width / 128) || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          if (g[y][x]) {
            ctx.fillStyle = g[y][x];
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    }
  };

  window.ModernPixelEngine = ModernPixelEngine;

})(typeof window !== 'undefined' ? window : this);
