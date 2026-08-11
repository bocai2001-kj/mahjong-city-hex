"use strict";

const cities = {
  universal: [
    ["班德尔交换站", "每位玩家本局第一次出牌前，可以重铸一张非金、非花手牌。", "通用城邦"],
    ["铁匠工坊", "本局首次完成杠牌的玩家获得一层护盾，每名玩家限一次。", "通用城邦"],
    ["花神庭院", "每名玩家本局补到第一张花时获得一层护盾。", "通用城邦"],
    ["赏金码头", "开场随机公布一种字牌；用它作将、刻子或杠并胡牌时额外获得一分。", "通用城邦"],
  ],
  longyan: [
    ["分饼广场", "本局第一次成功分饼时，完成跟牌的闲家各获得一层护盾。", "龙岩专属"],
    ["金色回廊", "单游胡牌额外增加一分；双游、三游不重复增加。", "龙岩专属"],
    ["十三门", "起手有五种不同幺九字牌获一层护盾；十三幺胡牌再加三分。", "龙岩专属"],
    ["抢杠峡谷", "抢杠胡成功者额外获得一分，本局限一次。", "龙岩专属"],
  ],
  xiamen: [
    ["鹭岛集市", "本局第一次吃牌后，可以公开一张非金手牌并获得一层护盾。", "厦门专属"],
    ["跟打长街", "每名玩家本局第一次完成强制跟打时获得一层护盾。", "厦门专属"],
    ["金门渡口", "持金状态下自摸胡牌，倍率结算后额外增加一分。", "厦门专属"],
    ["白鹭书院", "白板以金牌原牌身份参与组牌并胡牌时，倍率结算后额外增加一分。", "厦门专属"],
  ],
};

const augments = {
  universal: {
    silver: [
      ["稳健经营", "起手没有金时，第一次出牌前可重铸一张非金、非花手牌。", "通用"],
      ["庄家之徽", "若本局是庄家，开局获得一层仅限本局的护盾。", "通用"],
      ["花开富贵", "本局补到自己的第一张花时获得一层护盾。", "通用"],
    ],
    gold: [
      ["潘多拉手牌", "本局第一次出牌前可以重铸一张非金、非花手牌。", "通用"],
      ["门清学派", "未吃、碰、明杠并胡牌时额外获得一分。", "通用"],
      ["三色研究", "胡牌时万、筒、条都至少组成一组面子，额外获得一分。", "通用"],
    ],
    prismatic: [
      ["四季同行", "补到第二张花时获得一层护盾；集齐四季或四君子并胡牌再加两分。", "通用"],
      ["双重保险", "本局第一次触发海克斯奖励时，可放弃奖励并改为获得两层护盾。", "通用"],
      ["后来居上", "牌墙进入最后四分之一且尚未听牌时，获得一层仅限本局的护盾。", "通用"],
    ],
  },
  longyan: {
    silver: [
      ["分饼大师", "本局第一次成功参与分饼时获得一层护盾。", "龙岩专属"],
      ["半自摸专家", "本局普通自摸胡牌时额外获得一分。", "龙岩专属"],
      ["金牌管理", "本局第一次打出金牌后获得一层仅限本局的护盾。", "龙岩专属"],
    ],
    gold: [
      ["金色单骑", "单游胡牌时额外获得一分。", "龙岩专属"],
      ["抢金先锋", "抢金成功时额外获得一分。", "龙岩专属"],
      ["无食专精", "整局未碰、未明杠并胡牌时额外获得一分。", "龙岩专属"],
    ],
    prismatic: [
      ["盖宝秘术", "盖宝抢金成功时额外获得一分；发动失败则本局失效。", "龙岩专属"],
      ["十三门徒", "起手有五种不同幺九字牌获一层护盾；十三幺胡牌再加三分。", "龙岩专属"],
      ["三重加冕", "起手有两张金获一层护盾；三游胡牌再加三分。", "龙岩专属"],
    ],
  },
  xiamen: {
    silver: [
      ["鹭岛食客", "本局第一次吃牌后获得一层仅限本局的护盾。", "厦门专属"],
      ["跟打专家", "本局第一次完成强制跟打后获得一层护盾。", "厦门专属"],
      ["平和防线", "自己没有金时，本局点炮支付减少两分，最低减至零。", "厦门专属"],
    ],
    gold: [
      ["无金平和", "无金状态下平胡，倍率结算后额外获得一分。", "厦门专属"],
      ["一金修行", "恰好持有一张金并自摸，倍率结算后额外获得一分。", "厦门专属"],
      ["白板航标", "白板以金牌原牌身份完成顺子并胡牌，额外获得一分。", "厦门专属"],
    ],
    prismatic: [
      ["门清鹭影", "全局未吃、未碰、未明杠并胡牌时额外获得两分。", "厦门专属"],
      ["双游船票", "起手有一张金获一层护盾；双游胡牌再加两分。", "厦门专属"],
      ["三游归航", "起手有两张金获一层护盾；三游胡牌再加三分。", "厦门专属"],
    ],
  },
};

const effect = ([name, text, origin]) => ({ name, effect: text, origin });
const randomItem = (items, random = Math.random) => items[Math.floor(random() * items.length)];

function chooseCity(mode, random = Math.random) {
  return effect(randomItem(random() < 0.5 ? cities.universal : cities[mode], random));
}

function chooseRarity(random = Math.random) {
  const roll = random();
  return roll < 0.5 ? "silver" : roll < 0.85 ? "gold" : "prismatic";
}

function createCandidates(mode, rarity, random = Math.random) {
  const universal = augments.universal[rarity];
  const specific = augments[mode][rarity];
  const first = randomItem(universal, random);
  const second = randomItem(specific, random);
  const remaining = [...universal, ...specific].filter((item) => item[0] !== first[0] && item[0] !== second[0]);
  const chosen = [first, second, randomItem(remaining, random)];
  return chosen.sort(() => random() - 0.5).map(effect);
}

module.exports = { chooseCity, chooseRarity, createCandidates };
