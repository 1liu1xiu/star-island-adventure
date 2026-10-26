import { generateQuestion } from '../src/data/questions.ts'
import { getLevel, levels } from '../src/data/levels.ts'
import { createLevelWorld, getWorldChallengeCount } from '../src/data/world.ts'

let checked = 0
const subjects = ['math', 'chinese', 'english']
const assert = (condition, message) => { if (!condition) throw new Error(message) }

for (let level = 1; level <= 30; level++) {
  for (const subject of subjects) {
    for (let index = 0; index < 150; index++) {
      const question = generateQuestion(subject, level)
      checked++
      assert(question.options.length === 3, `选项数量错误：${question.prompt}`)
      assert(new Set(question.options).size === 3, `选项重复：${question.prompt} / ${question.options}`)
      assert(question.options.includes(question.answer), `缺少正确答案：${question.prompt}`)
      assert(!question.options.some(option => /NaN|undefined/.test(option)), `无效选项：${question.prompt}`)
      assert(!/NaN|undefined/.test(question.prompt), `无效题干：${question.prompt}`)

      if (subject === 'math') {
        let match = question.prompt.match(/^(\d+) \+ (\d+) = \?$/)
        if (match) assert(Number(question.answer) === Number(match[1]) + Number(match[2]), `加法错误：${question.prompt}`)
        match = question.prompt.match(/^(\d+) − (\d+) = \?$/)
        if (match) {
          assert(Number(question.answer) === Number(match[1]) - Number(match[2]), `减法错误：${question.prompt}`)
          assert(Number(question.answer) >= 0, `出现负数：${question.prompt}`)
        }
        match = question.prompt.match(/^(\d+) × (\d+) = \?$/)
        if (match) assert(Number(question.answer) === Number(match[1]) * Number(match[2]), `乘法错误：${question.prompt}`)
        if (question.prompt.includes('哪个数更')) {
          const values = question.options.map(Number)
          const expected = question.prompt.includes('更大') ? Math.max(...values) : Math.min(...values)
          assert(Number(question.answer) === expected, `比较错误：${question.prompt} / ${question.options}`)
        }
        match = question.prompt.match(/^找规律：(\d+)，(\d+)，？$/)
        if (match) assert(Number(question.answer) === Number(match[2]) * 2 - Number(match[1]), `数列错误：${question.prompt}`)
      }
    }
  }
}

assert(levels.length === 30, '关卡不是30关')
for (const level of levels) {
  const world = createLevelWorld(level)
  const allIds = [...world.entities, ...world.decorations].map(item => item.id)
  const inBounds = (item) => item.x >= 0 && item.x <= world.width && item.y >= 0 && item.y <= world.height

  assert(world.width === 2400 && world.height === 1700, `世界尺寸错误：第${level.id}关`)
  assert(inBounds(world.spawn), `出生点越界：第${level.id}关`)
  assert(world.entities.every(entity => entity.hp > 0 && entity.maxHp >= entity.hp && inBounds(entity)), `角色配置错误：第${level.id}关`)
  assert(world.decorations.length === 88 && world.decorations.every(inBounds), `地表装饰错误：第${level.id}关`)
  assert(new Set(allIds).size === allIds.length, `实体ID重复：第${level.id}关`)
  assert(getWorldChallengeCount(level) >= 6, `挑战太少：第${level.id}关`)
}
assert(getLevel(30).isBoss && getLevel(30).reward.type === 'ipad', '终极奖励配置错误')
assert(createLevelWorld(getLevel(30)).entities.find(entity => entity.kind === 'boss')?.hp === 10, '终极BOSS血量错误')

console.log(`内容校验通过：${checked.toLocaleString()} 道题，30 张开放地图配置全部有效。`)
