export type Mode = "longyan" | "xiamen";
export type Rarity = "silver" | "gold" | "prismatic";

export type Effect = {
  name: string;
  effect: string;
  origin: string;
};

const cityPools: Record<"universal" | Mode, Effect[]> = {
  universal: [
    { name: "班德尔交换站", effect: "每位玩家本局第一次出牌前，可以重铸一张非金、非花手牌。", origin: "通用城邦" },
    { name: "铁匠工坊", effect: "本局首次完成杠牌的玩家获得一层护盾，每名玩家限一次。", origin: "通用城邦" },
    { name: "花神庭院", effect: "每名玩家本局补到第一张花时获得一层护盾。", origin: "通用城邦" },
    { name: "赏金码头", effect: "开场随机公布一种字牌；用它作将、刻子或杠并胡牌时额外获得一分。", origin: "通用城邦" },
  ],
  longyan: [
    { name: "分饼广场", effect: "本局第一次成功分饼时，完成跟牌的闲家各获得一层护盾。", origin: "龙岩专属" },
    { name: "金色回廊", effect: "单游胡牌额外增加一分；双游、三游不重复增加。", origin: "龙岩专属" },
    { name: "十三门", effect: "起手有五种不同幺九字牌获一层护盾；十三幺胡牌再加三分。", origin: "龙岩专属" },
    { name: "抢杠峡谷", effect: "抢杠胡成功者额外获得一分，本局限一次。", origin: "龙岩专属" },
  ],
  xiamen: [
    { name: "鹭岛集市", effect: "本局第一次吃牌后，可以公开一张非金手牌并获得一层护盾。", origin: "厦门专属" },
    { name: "跟打长街", effect: "每名玩家本局第一次完成强制跟打时获得一层护盾。", origin: "厦门专属" },
    { name: "金门渡口", effect: "持金状态下自摸胡牌，倍率结算后额外增加一分。", origin: "厦门专属" },
    { name: "白鹭书院", effect: "白板以金牌原牌身份参与组牌并胡牌时，倍率结算后额外增加一分。", origin: "厦门专属" },
  ],
};

const augmentPools: Record<"universal" | Mode, Record<Rarity, Effect[]>> = {
  universal: {
    silver: [
      { name: "稳健经营", effect: "起手没有金时，第一次出牌前可重铸一张非金、非花手牌。", origin: "通用" },
      { name: "庄家之徽", effect: "若本局是庄家，开局获得一层仅限本局的护盾。", origin: "通用" },
      { name: "花开富贵", effect: "本局补到自己的第一张花时获得一层护盾。", origin: "通用" },
    ],
    gold: [
      { name: "潘多拉手牌", effect: "本局第一次出牌前可以重铸一张非金、非花手牌。", origin: "通用" },
      { name: "门清学派", effect: "未吃、碰、明杠并胡牌时额外获得一分。", origin: "通用" },
      { name: "三色研究", effect: "胡牌时万、筒、条都至少组成一组面子，额外获得一分。", origin: "通用" },
    ],
    prismatic: [
      { name: "四季同行", effect: "补到第二张花时获得一层护盾；集齐四季或四君子并胡牌再加两分。", origin: "通用" },
      { name: "双重保险", effect: "本局第一次触发海克斯奖励时，可放弃奖励并改为获得两层护盾。", origin: "通用" },
      { name: "后来居上", effect: "牌墙进入最后四分之一且尚未听牌时，获得一层仅限本局的护盾。", origin: "通用" },
    ],
  },
  longyan: {
    silver: [
      { name: "分饼大师", effect: "本局第一次成功参与分饼时获得一层护盾。", origin: "龙岩专属" },
      { name: "半自摸专家", effect: "本局普通自摸胡牌时额外获得一分。", origin: "龙岩专属" },
      { name: "金牌管理", effect: "本局第一次打出金牌后获得一层仅限本局的护盾。", origin: "龙岩专属" },
    ],
    gold: [
      { name: "金色单骑", effect: "单游胡牌时额外获得一分。", origin: "龙岩专属" },
      { name: "抢金先锋", effect: "抢金成功时额外获得一分。", origin: "龙岩专属" },
      { name: "无食专精", effect: "整局未碰、未明杠并胡牌时额外获得一分。", origin: "龙岩专属" },
    ],
    prismatic: [
      { name: "盖宝秘术", effect: "盖宝抢金成功时额外获得一分；发动失败则本局失效。", origin: "龙岩专属" },
      { name: "十三门徒", effect: "起手有五种不同幺九字牌获一层护盾；十三幺胡牌再加三分。", origin: "龙岩专属" },
      { name: "三重加冕", effect: "起手有两张金获一层护盾；三游胡牌再加三分。", origin: "龙岩专属" },
    ],
  },
  xiamen: {
    silver: [
      { name: "鹭岛食客", effect: "本局第一次吃牌后获得一层仅限本局的护盾。", origin: "厦门专属" },
      { name: "跟打专家", effect: "本局第一次完成强制跟打后获得一层护盾。", origin: "厦门专属" },
      { name: "平和防线", effect: "自己没有金时，本局点炮支付减少两分，最低减至零。", origin: "厦门专属" },
    ],
    gold: [
      { name: "无金平和", effect: "无金状态下平胡，倍率结算后额外获得一分。", origin: "厦门专属" },
      { name: "一金修行", effect: "恰好持有一张金并自摸，倍率结算后额外获得一分。", origin: "厦门专属" },
      { name: "白板航标", effect: "白板以金牌原牌身份完成顺子并胡牌，额外获得一分。", origin: "厦门专属" },
    ],
    prismatic: [
      { name: "门清鹭影", effect: "全局未吃、未碰、未明杠并胡牌时额外获得两分。", origin: "厦门专属" },
      { name: "双游船票", effect: "起手有一张金获一层护盾；双游胡牌再加两分。", origin: "厦门专属" },
      { name: "三游归航", effect: "起手有两张金获一层护盾；三游胡牌再加三分。", origin: "厦门专属" },
    ],
  },
};

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

export function chooseCity(mode: Mode): Effect {
  return randomItem(Math.random() < 0.5 ? cityPools.universal : cityPools[mode]);
}

export function chooseRarity(): Rarity {
  const roll = Math.random();
  return roll < 0.5 ? "silver" : roll < 0.85 ? "gold" : "prismatic";
}

export function createCandidates(mode: Mode, rarity: Rarity): Effect[] {
  const universal = augmentPools.universal[rarity];
  const specific = augmentPools[mode][rarity];
  const first = randomItem(universal);
  const second = randomItem(specific);
  const remaining = [...universal, ...specific].filter(
    (item) => item.name !== first.name && item.name !== second.name,
  );
  return shuffle([first, second, randomItem(remaining)]);
}
