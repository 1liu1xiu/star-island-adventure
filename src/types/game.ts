export type Subject = 'math' | 'chinese' | 'english'
export type Screen = 'home' | 'map' | 'game'
export type EntityKind = 'rock' | 'crystal' | 'slime' | 'mushroom' | 'crab' | 'bat' | 'golem' | 'boss'
export type RewardType = 'gem' | 'potion' | 'ipad' | 'none'

export interface Question {
  id: string
  subject: Subject
  prompt: string
  options: string[]
  answer: string
  tip?: string
}

export interface GameEntity {
  id: string
  kind: EntityKind
  x: number
  hp: number
  maxHp: number
  subject: Subject
}

export interface Reward {
  type: RewardType
  amount: number
}

export interface LevelConfig {
  id: number
  worldIndex: number
  name: string
  isBoss: boolean
  reward: Reward
  coins: number
}

export interface WorldConfig {
  name: string
  subtitle: string
  className: string
}

export interface GameSettings {
  timeLimit: number
  sound: boolean
  autoRead: boolean
}

export interface PlayerProgress {
  unlocked: number
  completed: Record<number, number>
  coins: number
  gems: number
  potions: number
  ipadReward: boolean
  ipadRedeemed: boolean
  settings: GameSettings
}

export interface LevelStats {
  correct: number
  mistakes: number
}
