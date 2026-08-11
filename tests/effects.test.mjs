import assert from "node:assert/strict";
import test from "node:test";
import effects from "../cloudfunctions/mahjong-room/effects.cjs";

const { catalogs, chooseCity, chooseRarity, createCandidates } = effects;
const modes = ["longyan", "xiamen"];
const rarities = ["silver", "gold", "prismatic"];

function allEntries() {
  const cityEntries = Object.values(catalogs.cities).flat();
  const augmentEntries = Object.values(catalogs.augments)
    .flatMap((pool) => Object.values(pool).flat());
  return { cityEntries, augmentEntries, entries: [...cityEntries, ...augmentEntries] };
}

test("v2 catalog contains 18 cities and 54 augments", () => {
  const { cityEntries, augmentEntries } = allEntries();

  assert.equal(cityEntries.length, 18);
  assert.equal(augmentEntries.length, 54);
  for (const pool of Object.values(catalogs.cities)) assert.equal(pool.length, 6);
  for (const pool of Object.values(catalogs.augments)) {
    for (const rarity of rarities) assert.equal(pool[rarity].length, 6);
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

test("each offer has three unique choices with universal and local options", () => {
  for (const mode of modes) {
    for (const rarity of rarities) {
      const choices = createCandidates(mode, rarity, () => 0.2);
      assert.equal(choices.length, 3);
      assert.equal(new Set(choices.map((choice) => choice.name)).size, 3);
      assert.ok(choices.some((choice) => choice.origin === "通用"));
      assert.ok(choices.some((choice) => choice.origin === (mode === "longyan" ? "龙岩专属" : "厦门专属")));
      assert.ok(choices.every((choice) => choice.category));
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
