import type { GameEntity, LevelConfig, Subject } from '../types/game'

export const WORLD_WIDTH = 2400
export const WORLD_HEIGHT = 1700
export const WORLD_SPAWN = { x: 1200, y: 850 }

export interface WorldEntity extends GameEntity {
  y: number
}

export type DecorationKind = 'tree' | 'grass' | 'flower' | 'stone' | 'water' | 'lava' | 'crystal' | 'pillar'

export interface WorldDecoration {
  id: string
  kind: DecorationKind
  x: number
  y: number
  scale: number
}

export interface LevelWorld {
  entities: WorldEntity[]
  decorations: WorldDecoration[]
  width: number
  height: number
  spawn: typeof WORLD_SPAWN
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed)
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

const subjects: Subject[] = ['math', 'chinese', 'english']
const firstPositions = [
  { x: 1450, y: 850 },
  { x: 940, y: 720 },
  { x: 1220, y: 510 },
  { x: 1540, y: 1190 },
  { x: 790, y: 1130 },
  { x: 1790, y: 570 },
]

const decorationKinds: DecorationKind[][] = [
  ['tree', 'tree', 'grass', 'grass', 'flower', 'stone', 'water'],
  ['tree', 'grass', 'stone', 'water', 'water', 'crystal'],
  ['stone', 'stone', 'grass', 'crystal', 'pillar', 'water'],
  ['stone', 'pillar', 'lava', 'lava', 'crystal', 'grass'],
  ['pillar', 'crystal', 'stone', 'grass', 'crystal', 'water'],
]

export function createLevelWorld(level: LevelConfig): LevelWorld {
  const random = mulberry32(level.id * 997 + 41)
  const entities: WorldEntity[] = []

  if (level.isBoss) {
    const bossHp = level.id === 30 ? 10 : 4 + level.worldIndex
    entities.push(
      { id: `${level.id}-crystal`, kind: 'crystal', x: 1040, y: 560, hp: 1, maxHp: 1, subject: 'english' },
      { id: `${level.id}-boss`, kind: 'boss', x: 1590, y: 850, hp: bossHp, maxHp: bossHp, subject: 'math' },
      { id: `${level.id}-rock`, kind: 'rock', x: 1000, y: 1210, hp: 1, maxHp: 1, subject: 'chinese' },
    )
  } else {
    const stage = (level.id - 1) % 6
    const count = 6 + level.worldIndex + Math.floor(stage / 2)
    const enemyKinds = [
      ['slime', 'mushroom'],
      ['crab', 'slime'],
      ['bat', 'golem'],
      ['golem', 'mushroom'],
      ['bat', 'golem'],
    ] as const

    for (let index = 0; index < count; index++) {
      const isOre = index % 3 === 0
      const kind = isOre ? (level.worldIndex > 0 ? 'crystal' : 'rock') : enemyKinds[level.worldIndex][index % 2]
      const hp = !isOre && level.worldIndex >= 2 && index % 5 === 4 ? 2 : 1
      let position = firstPositions[index]
      if (!position) {
        let attempts = 0
        do {
          position = { x: 220 + random() * 1960, y: 210 + random() * 1280 }
          attempts++
        } while (attempts < 80 && entities.some(entity => Math.hypot(entity.x - position.x, entity.y - position.y) < 230))
      }
      entities.push({
        id: `${level.id}-${index}`,
        kind,
        x: position.x,
        y: position.y,
        hp,
        maxHp: hp,
        subject: subjects[(index + level.worldIndex) % 3],
      })
    }
  }

  const decorations: WorldDecoration[] = []
  const kinds = decorationKinds[level.worldIndex]
  for (let index = 0; index < 88; index++) {
    const kind = kinds[Math.floor(random() * kinds.length)]
    decorations.push({
      id: `${level.id}-decor-${index}`,
      kind,
      x: 70 + random() * (WORLD_WIDTH - 140),
      y: 80 + random() * (WORLD_HEIGHT - 160),
      scale: 0.7 + random() * 0.75,
    })
  }

  return { entities, decorations, width: WORLD_WIDTH, height: WORLD_HEIGHT, spawn: WORLD_SPAWN }
}

export function getWorldChallengeCount(level: LevelConfig) {
  return createLevelWorld(level).entities.reduce((sum, entity) => sum + entity.maxHp, 0)
}
