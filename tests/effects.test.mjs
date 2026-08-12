import assert from "node:assert/strict";
import test from "node:test";
import effects from "../cloudfunctions/mahjong-room/effects.cjs";

const { catalogs, chooseCity, chooseRarity, drawHex } = effects;
const modes = ["longyan", "xiamen"];
const rarities = ["silver", "gold", "prismatic"];

function allEntries() {
  const cityEntries = Object.values(catalogs.cities).flat();
  const augmentEntries = Object.values(catalogs.augments)
    .flatMap((pool) => Object.values(pool).flat());
  return { cityEntries, augmentEntries, entries: [...cityEntries, ...augmentEntries] };
}

test("v4 catalog contains 24 cities and 90 augments", () => {
  const { cityEntries, augmentEntries } = allEntries();

  assert.equal(cityEntries.length, 24);
  assert.equal(augmentEntries.length, 90);
  for (const pool of Object.values(catalogs.cities)) assert.equal(pool.length, 8);
  for (const pool of Object.values(catalogs.augments)) {
    for (const rarity of rarities) assert.equal(pool[rarity].length, 10);
  }
});

test("v4 adds six cities and eighteen mission, river, or counterplay augments", () => {
  const cityNames = new Set(Object.values(catalogs.cities).flat().map(([name]) => name));
  for (const name of ["双向码头", "三色回收站", "分饼公证处", "盖宝观察席", "跟打转运站", "花港补给线"]) {
    assert.equal(cityNames.has(name), true, `new city missing: ${name}`);
  }

  const expected = {
    universal: {
      silver: ["三色脚印", "静默观察"],
      gold: ["故地重游", "以牙还牙"],
      prismatic: ["回旋镖", "截断协议"],
    },
    longyan: {
      silver: ["分饼伏笔", "盖宝旁听"],
      gold: ["十三悬赏", "分饼反拍"],
      prismatic: ["盖宝对赌", "金库钥匙"],
    },
    xiamen: {
      silver: ["跟打伏笔", "花牌预约"],
      gold: ["白板回声", "吃牌改口"],
      prismatic: ["游金封航", "双游夺舵"],
    },
  };

  for (const [poolName, pools] of Object.entries(expected)) {
    for (const [rarity, names] of Object.entries(pools)) {
      const actualNames = new Set(catalogs.augments[poolName][rarity].map(([name]) => name));
      for (const name of names) assert.equal(actualNames.has(name), true, `new effect missing: ${name}`);
    }
  }

  const addedNames = new Set([
    ...["双向码头", "三色回收站", "分饼公证处", "盖宝观察席", "跟打转运站", "花港补给线"],
    ...Object.values(expected).flatMap((pools) => Object.values(pools).flat()),
  ]);
  const { entries } = allEntries();
  for (const [name, rules] of entries.filter(([name]) => addedNames.has(name))) {
    assert.doesNotMatch(rules, /打出金|将金打出|弃金/, `new effect treats gold as a normal discard: ${name}`);
  }
});

test("v3 adds two physical-table effects to every mode and rarity pool", () => {
  const expected = {
    universal: {
      silver: ["旧货回收", "随机抽查"],
      gold: ["顺手牵羊", "指定进货"],
      prismatic: ["偷天换日", "任意货架"],
    },
    longyan: {
      silver: ["分饼竞猜", "分饼留牌"],
      gold: ["分饼替身", "金牌借路"],
      prismatic: ["金牌转租", "游金追潮"],
    },
    xiamen: {
      silver: ["延迟跟打", "白板回收"],
      gold: ["跟打回响", "顺子改签"],
      prismatic: ["游金截航", "三金续命"],
    },
  };

  for (const [poolName, pools] of Object.entries(expected)) {
    for (const [rarity, names] of Object.entries(pools)) {
      const actualNames = new Set(catalogs.augments[poolName][rarity].map(([name]) => name));
      for (const name of names) assert.equal(actualNames.has(name), true, `new effect missing: ${name}`);
    }
  }
});

test("every effect is named, categorized, unique, and shield-free", () => {
  const { entries } = allEntries();
  const names = new Set();

  for (const [name, rules, origin, category] of entries) {
    assert.ok(name && rules && origin && category);
    assert.equal(names.has(name), false, `duplicate effect name: ${name}`);
    assert.doesNotMatch(rules, /护盾/);
    names.add(name);
  }

  const directScoreEffects = entries.filter(([, rules]) => /额外加\d分/.test(rules));
  assert.ok(directScoreEffects.length <= 6, "direct score effects should remain a small minority");
});

test("player-facing rules use 出牌 instead of the formal term 弃牌", () => {
  const { entries } = allEntries();
  for (const [name, rules] of entries) {
    assert.doesNotMatch(rules, /弃牌/, `formal wording remains in: ${name}`);
  }
});

test("audit replacements remove the ten low-impact or duplicate effects", () => {
  const { entries } = allEntries();
  const names = new Set(entries.map(([name]) => name));
  const removed = [
    "盖宝剧场",
    "白鹭书院",
    "先知",
    "幺九罗盘",
    "游金路标",
    "龙津换客",
    "分饼号令",
    "金蝉脱壳",
    "吃牌借位",
    "三游归航",
  ];
  const replacements = [
    "龙津擂台",
    "白鹭主修课",
    "岔路预感",
    "幺九换轨",
    "游金航标",
    "龙津喊价",
    "分饼洗牌",
    "金蝉留壳",
    "暗吃入席",
    "三游导航",
  ];

  for (const name of removed) assert.equal(names.has(name), false, `retired effect remains: ${name}`);
  for (const name of replacements) assert.equal(names.has(name), true, `replacement effect missing: ${name}`);
});

test("audit revisions strengthen and clarify sixteen disputed effects", () => {
  const { entries } = allEntries();
  const rulesByName = new Map(entries.map(([name, rules]) => [name, rules]));
  const revised = new Map([
    ["十三门", /四种.*牌墙尾.*交换/],
    ["金色回廊", /牌河.*取回.*正常出牌/],
    ["龙津暗市", /东与西.*南与北.*双方均选择交易/],
    ["金门渡口", /牌墙尾两张.*加入手牌.*正常出牌/],
    ["镜像装置", /通用海克斯.*获得一次同名效果的使用权.*不能复制/],
    ["炼金牌", /指定另一种花色.*固定视为.*不能参与吃牌/],
    ["双重回响", /第一次吃或碰.*牌墙尾两张.*交换.*正常出牌/],
    ["半自摸节拍", /放弃胡牌.*牌墙顶两张.*选择一张/],
    ["盖宝预演", /庄家决定是否盖宝前.*两张随机手牌.*牌墙尾两张/],
    ["抢杠警报", /宣布杠后.*牌墙尾两张.*选择一张作为.*补牌/],
    ["盖宝密室", /盖宝失败.*海克斯持有者.*牌墙尾两张.*交换/],
    ["十三奇谋", /六种不同幺九字牌.*只能胡十三幺.*牌墙顶与牌墙尾/],
    ["鹭岛食客", /第一次吃牌.*上家两张随机手牌.*公开/],
    ["白板侦察", /第一次.*摸到白板.*牌墙顶与牌墙尾.*交换/],
    ["白板拓印", /公开一张.*作为样本.*固定视为样本牌/],
    ["双游船票", /进入双游.*其余三家.*牌墙顶与牌墙尾.*决定.*摸取/],
  ]);

  assert.equal(rulesByName.has("白板万用章"), false);
  for (const [name, pattern] of revised) {
    assert.match(rulesByName.get(name) ?? "", pattern, `revision missing or unclear: ${name}`);
  }
});

test("random draws cover universal and local pools at every rarity", () => {
  for (const mode of modes) {
    for (const rarity of rarities) {
      const universal = drawHex(mode, rarity, () => 0);
      const local = drawHex(mode, rarity, () => 0.999);
      assert.equal(universal.origin, "通用");
      assert.equal(local.origin, mode === "longyan" ? "龙岩专属" : "厦门专属");
      assert.ok(universal.category);
      assert.ok(local.category);
    }
  }
});

test("city and rarity random boundaries remain stable", () => {
  const universalCity = chooseCity("longyan", (() => {
    const rolls = [0.49, 0];
    return () => rolls.shift();
  })());
  const localCity = chooseCity("xiamen", (() => {
    const rolls = [0.5, 0];
    return () => rolls.shift();
  })());

  assert.equal(universalCity.origin, "通用城邦");
  assert.equal(localCity.origin, "厦门专属");
  assert.equal(chooseRarity(() => 0.49), "silver");
  assert.equal(chooseRarity(() => 0.5), "gold");
  assert.equal(chooseRarity(() => 0.85), "prismatic");
});
