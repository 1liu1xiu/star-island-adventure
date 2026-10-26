import type { GameEntity, LevelConfig, Reward, Subject, WorldConfig } from '../types/game'

export const worlds: WorldConfig[] = [
  { name: '青芽森林', subtitle: '在树影间学会冒险', className: 'forest' },
  { name: '水晶海岸', subtitle: '浪花下藏着亮晶晶', className: 'coast' },
  { name: '云朵矿山', subtitle: '向漂浮的高山出发', className: 'cloud' },
  { name: '熔岩堡垒', subtitle: '勇敢穿过暖暖峡谷', className: 'lava' },
  { name: '星空王城', subtitle: '点亮最后的星星', className: 'space' },
]

const levelNames = [
  ['森林入口', '苔痕矿洞', '蘑菇小径', '树藤山坡', '月光营地', '古树守卫'],
  ['贝壳浅滩', '珊瑚石林', '螃蟹沙滩', '海星洞窟', '潮汐矿脉', '巨浪蟹王'],
  ['风车山脚', '浮云栈道', '回声矿洞', '飞鸟断崖', '雷云平台', '巨石守卫'],
  ['火花峡谷', '赤岩阶梯', '熔岩地道', '烈焰矿场', '城堡大门', '熔岩魔像'],
  ['星光断桥', '银河回廊', '月亮矿坑', '陨石花园', '王城之巅', '暗影龙王'],
]

function rewardFor(id: number): Reward {
  if (id === 30) return { type: 'ipad', amount: 1 }
  if (id % 6 === 0) return { type: 'gem', amount: 1 }
  if (id % 4 === 0) return { type: 'potion', amount: 1 }
  if (id % 3 === 0) return { type: 'gem', amount: 1 }
  return { type: 'none', amount: 0 }
}

export const levels: LevelConfig[] = Array.from({ length: 30 }, (_, index) => {
  const id = index + 1
  const worldIndex = Math.floor(index / 6)
  const stage = index % 6
  const isBoss = stage === 5
  return {
    id,
    worldIndex,
    name: levelNames[worldIndex][stage],
    isBoss,
    reward: rewardFor(id),
    coins: 15 + worldIndex * 5 + (isBoss ? 15 : 0),
  }
})

export function getLevel(id: number) {
  return levels[Math.max(0, Math.min(29, id - 1))]
}

const subjects: Subject[] = ['math', 'chinese', 'english']
const positions = [28, 57, 84]

export function createLevelWaves(level: LevelConfig): GameEntity[][] {
  if (level.isBoss) {
    const bossHp = level.id === 30 ? 10 : 4 + level.worldIndex
    return [[
      { id: `${level.id}-crystal`, kind: 'crystal', x: 25, hp: 1, maxHp: 1, subject: 'english' },
      { id: `${level.id}-boss`, kind: 'boss', x: 60, hp: bossHp, maxHp: bossHp, subject: 'math' },
      { id: `${level.id}-rock`, kind: 'rock', x: 86, hp: 1, maxHp: 1, subject: 'chinese' },
    ]]
  }

  const stage = (level.id - 1) % 6
  const count = 6 + level.worldIndex + Math.floor(stage / 2)
  const enemyKinds = [
    ['slime', 'mushroom'],
    ['crab', 'slime'],
    ['bat', 'golem'],
    ['golem', 'mushroom'],
    ['bat', 'golem'],
  ] as const

  const entities: GameEntity[] = Array.from({ length: count }, (_, i) => {
    const isOre = i % 3 === 0
    const kind = isOre
      ? (level.worldIndex > 0 ? 'crystal' : 'rock')
      : enemyKinds[level.worldIndex][i % 2]
    const hp = !isOre && level.worldIndex >= 2 && i % 5 === 4 ? 2 : 1
    return {
      id: `${level.id}-${i}`,
      kind,
      x: 0,
      hp,
      maxHp: hp,
      subject: subjects[(i + level.worldIndex) % subjects.length],
    }
  })

  const waves: GameEntity[][] = []
  for (let i = 0; i < entities.length; i += 3) {
    waves.push(entities.slice(i, i + 3).map((entity, j) => ({
      ...entity,
      x: positions[j],
      subject: subjects[(i + j + level.worldIndex) % subjects.length],
    })))
  }
  return waves
}

export function getChallengeCount(level: LevelConfig) {
  return createLevelWaves(level).flat().reduce((sum, entity) => sum + entity.maxHp, 0)
}

export function rewardLabel(level: LevelConfig) {
  switch (level.reward.type) {
    case 'gem': return '复活宝石 × 1'
    case 'potion': return '草莓药水 × 1'
    case 'ipad': return 'iPad 畅玩 1 小时券'
    default: return '本关无额外道具'
  }
}
