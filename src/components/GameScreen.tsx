import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronLeft, Coins, Gem, Gift, Heart, Home, Pickaxe, RotateCcw, Shield, Sparkles, Star, Swords, Trophy } from 'lucide-react'
import { rewardLabel, worlds } from '../data/levels'
import { createLevelWorld, getWorldChallengeCount, type WorldEntity } from '../data/world'
import { generateQuestion } from '../data/questions'
import { playSound } from '../lib/sound'
import type { LevelConfig, LevelStats, PlayerProgress, Question, Subject } from '../types/game'
import { EntitySprite, HeroSprite } from './PixelArt'
import { MiniMap, VoxelDecoration } from './VoxelWorld'
import QuizModal from './QuizModal'

const isOre = (entity: WorldEntity) => entity.kind === 'rock' || entity.kind === 'crystal'
const entityName = (entity: WorldEntity) => isOre(entity) ? (entity.kind === 'crystal' ? '水晶矿' : '矿石') : entity.kind === 'boss' ? '岛屿守卫' : '小怪兽'
const interactionRange = (entity: WorldEntity) => entity.kind === 'boss' ? 175 : 130
const distanceTo = (entity: WorldEntity, player: { x: number; y: number }) => Math.hypot(entity.x - player.x, entity.y - player.y)

type Direction = 'up' | 'down' | 'left' | 'right'
type Phase = 'intro' | 'playing' | 'transition' | 'complete' | 'gameover' | 'revive'

const keyDirections: Record<string, Direction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
}

interface Props {
  level: LevelConfig
  progress: PlayerProgress
  onExit: () => void
  onComplete: (id: number, stars: number, stats: LevelStats) => void
  onUsePotion: () => void
  onConsumeGem: () => void
  onNext: (id: number) => void
}

export default function GameScreen({ level, progress, onExit, onComplete, onUsePotion, onConsumeGem, onNext }: Props) {
  const world = useMemo(() => createLevelWorld(level), [level])
  const [entities, setEntities] = useState<WorldEntity[]>(() => world.entities.map(entity => ({ ...entity })))
  const [player, setPlayer] = useState({ ...world.spawn })
  const [viewport, setViewport] = useState({ width: 1024, height: 600 })
  const [hp, setHp] = useState(5)
  const [facing, setFacing] = useState(1)
  const [action, setAction] = useState('idle')
  const [quiz, setQuiz] = useState<{ targetId: string; question: Question } | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [stats, setStats] = useState<LevelStats>({ correct: 0, mistakes: 0 })
  const [stars, setStars] = useState(0)
  const [message, setMessage] = useState('从营地出发，自由寻找矿石和怪兽吧！')
  const stageRef = useRef<HTMLElement>(null)
  const heldDirections = useRef<Record<Direction, boolean>>({ up: false, down: false, left: false, right: false })
  const actionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const totalChallenges = getWorldChallengeCount(level)

  const living = entities.filter(entity => entity.hp > 0)
  const nearest = living.length ? living.reduce((best, entity) => distanceTo(entity, player) < distanceTo(best, player) ? entity : best) : null
  const nearestInRange = nearest && distanceTo(nearest, player) <= interactionRange(nearest) ? nearest : null
  const cameraX = Math.max(0, Math.min(world.width - viewport.width, player.x - viewport.width / 2))
  const cameraY = Math.max(0, Math.min(world.height - viewport.height, player.y - viewport.height / 2))

  function stopDirections() {
    heldDirections.current = { up: false, down: false, left: false, right: false }
  }

  useEffect(() => {
    const element = stageRef.current
    if (!element) return
    const update = () => {
      const rect = element.getBoundingClientRect()
      setViewport({ width: rect.width, height: rect.height })
    }
    const frame = requestAnimationFrame(update)
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [])

  useEffect(() => {
    if (phase !== 'playing' || quiz) return
    let frame = 0
    let last = performance.now()
    let wasMoving = false
    const tick = (now: number) => {
      const delta = Math.min(0.04, (now - last) / 1000)
      last = now
      const held = heldDirections.current
      let dx = Number(held.right) - Number(held.left)
      let dy = Number(held.down) - Number(held.up)
      const moving = dx !== 0 || dy !== 0
      if (moving) {
        const length = Math.hypot(dx, dy)
        dx /= length
        dy /= length
        const speed = 285
        setPlayer(current => ({
          x: Math.max(45, Math.min(world.width - 45, current.x + dx * speed * delta)),
          y: Math.max(55, Math.min(world.height - 45, current.y + dy * speed * delta)),
        }))
        if (dx !== 0) setFacing(dx > 0 ? 1 : -1)
        if (!wasMoving) { setAction('walk'); wasMoving = true }
      } else if (wasMoving) {
        setAction('idle')
        wasMoving = false
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase, quiz, world.width, world.height])

  useEffect(() => {
    const stop = () => {
      stopDirections()
      setAction(value => value === 'walk' ? 'idle' : value)
    }
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
      if (actionTimer.current) clearTimeout(actionTimer.current)
    }
  }, [])

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const direction = keyDirections[event.key]
      if (!direction || phase !== 'playing' || quiz) return
      event.preventDefault()
      heldDirections.current[direction] = true
    }
    const keyUp = (event: KeyboardEvent) => {
      const direction = keyDirections[event.key]
      if (direction) heldDirections.current[direction] = false
    }
    const blur = () => stopDirections()
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', blur)
    }
  }, [phase, quiz])

  useEffect(() => {
    if (phase !== 'transition') return
    playSound('clear', progress.settings.sound)
    const timer = setTimeout(() => {
      const earnedStars = hp >= 4 ? 3 : hp >= 2 ? 2 : 1
      setStars(earnedStars)
      setPhase('complete')
      onComplete(level.id, earnedStars, stats)
      playSound('reward', progress.settings.sound)
    }, 950)
    return () => clearTimeout(timer)
  }, [phase, hp, level.id, onComplete, stats, progress.settings.sound])

  function flashAction(nextAction: string) {
    setAction(nextAction)
    if (actionTimer.current) clearTimeout(actionTimer.current)
    actionTimer.current = setTimeout(() => setAction('idle'), 520)
  }

  function pressDirection(direction: Direction, pressed: boolean) {
    if (pressed && (phase !== 'playing' || quiz)) return
    heldDirections.current[direction] = pressed
  }

  function interact(target: WorldEntity | null) {
    if (phase !== 'playing' || quiz) return
    if (!target || target.hp <= 0 || distanceTo(target, player) > interactionRange(target)) {
      setMessage('目标还在远处，按住方向键继续靠近它！')
      return
    }
    stopDirections()
    const bossSubjects: Subject[] = ['math', 'chinese', 'english']
    const subject = target.kind === 'boss' ? bossSubjects[(target.maxHp - target.hp) % 3] : target.subject
    setQuiz({ targetId: target.id, question: generateQuestion(subject, level.id) })
  }

  function finishAnswer(correct: boolean) {
    if (!quiz) return
    const target = entities.find(entity => entity.id === quiz.targetId)
    setQuiz(null)
    setStats(value => ({ correct: value.correct + (correct ? 1 : 0), mistakes: value.mistakes + (correct ? 0 : 1) }))
    if (!target) return

    if (correct) {
      flashAction(isOre(target) ? 'mine' : 'attack')
      playSound('hit', progress.settings.sound)
      setEntities(value => value.map(entity => entity.id === target.id ? { ...entity, hp: Math.max(0, entity.hp - 1) } : entity))
      setMessage(target.hp === 1 ? `${entityName(target)}挑战成功！可以继续自由探索。` : '命中！再答一题就能继续攻击。')
      if (target.hp === 1 && entities.every(entity => entity.id === target.id || entity.hp <= 0)) {
        stopDirections()
        setPhase('transition')
      }
      return
    }

    const nextHp = Math.max(0, hp - 1)
    setHp(nextHp)
    flashAction('hurt')
    if (nextHp === 0) {
      stopDirections()
      if (progress.gems > 0) {
        onConsumeGem()
        setHp(3)
        setPhase('revive')
      } else {
        setPhase('gameover')
      }
    } else {
      setMessage('没关系，看清正确答案再试一次！')
    }
  }

  function usePotion() {
    if (phase !== 'playing' || quiz || hp >= 5 || progress.potions <= 0) return
    onUsePotion()
    setHp(value => Math.min(5, value + 2))
    playSound('correct', progress.settings.sound)
    setMessage('草莓药水让你恢复了 2 颗心！')
  }

  function retry() {
    setEntities(world.entities.map(entity => ({ ...entity })))
    setPlayer({ ...world.spawn })
    setHp(5)
    setStats({ correct: 0, mistakes: 0 })
    setStars(0)
    setQuiz(null)
    stopDirections()
    setPhase('playing')
    setMessage('重新回到营地，这次一定行！')
  }

  const actionLabel = nearestInRange ? (isOre(nearestInRange) ? '挖掘' : '攻击') : '靠近目标'
  const directionButtons = [
    { direction: 'up' as const, label: '向上移动', icon: ArrowUp },
    { direction: 'left' as const, label: '向左移动', icon: ArrowLeft },
    { direction: 'down' as const, label: '向下移动', icon: ArrowDown },
    { direction: 'right' as const, label: '向右移动', icon: ArrowRight },
  ]

  return (
    <main className={`game-screen sandbox-game game-world-${level.worldIndex}`}>
      <header className="game-hud">
        <button className="hud-back" onClick={onExit} aria-label="返回地图"><ChevronLeft size={25} /></button>
        <div className="hud-level"><small>{worlds[level.worldIndex].name} · 开放世界</small><b>第 {level.id} 关 · {level.name}</b></div>
        <div className="hud-progress"><div><i style={{ width: `${Math.min(100, stats.correct / totalChallenges * 100)}%` }} /></div><span>{stats.correct} / {totalChallenges}</span></div>
        <div className="hud-items">
          <div className="hp-hearts" aria-label={`剩余 ${hp} 颗心`}>{[1, 2, 3, 4, 5].map(heart => <Heart key={heart} size={25} fill={heart <= hp ? 'currentColor' : 'none'} className={heart <= hp ? 'full' : ''} />)}</div>
          <span className="hud-gem" title="复活宝石"><Gem size={21} /><b>{progress.gems}</b></span>
          <button className="potion-button" onClick={usePotion} disabled={hp >= 5 || progress.potions <= 0} title="草莓药水：恢复2颗心"><span>🍓</span><b>{progress.potions}</b><small>+2</small></button>
        </div>
      </header>

      <section className="game-stage sandbox-stage" ref={stageRef}>
        <div className={`voxel-world voxel-biome-${level.worldIndex}`} style={{ width: world.width, height: world.height, transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)` }}>
          <div className="world-grid-overlay" />
          {world.decorations.map(decoration => <VoxelDecoration key={decoration.id} decoration={decoration} worldIndex={level.worldIndex} />)}
          <div className="spawn-camp" style={{ left: world.spawn.x, top: world.spawn.y, zIndex: Math.round(world.spawn.y) - 10 }}><i /><i /><i /><i /><span>营地</span></div>

          {entities.map(entity => entity.hp > 0 && <button
            key={entity.id}
            className={`sandbox-entity entity-${entity.kind} ${nearestInRange?.id === entity.id ? 'in-range' : ''}`}
            style={{ left: entity.x, top: entity.y, zIndex: Math.round(entity.y) + 10 }}
            data-entity-id={entity.id}
            data-x={Math.round(entity.x)}
            data-y={Math.round(entity.y)}
            onClick={() => interact(entity)}
            aria-label={`${entityName(entity)}，${isOre(entity) ? '挖掘' : '攻击'}`}
          >
            {nearestInRange?.id === entity.id && <span className="target-ring" />}
            <span className="entity-tag">{isOre(entity) ? <Pickaxe size={14} /> : <Swords size={14} />}{entityName(entity)}</span>
            <EntitySprite kind={entity.kind} boss={level.id === 30} />
            {entity.maxHp > 1 && <span className="entity-health"><i style={{ width: `${entity.hp / entity.maxHp * 100}%` }} /><b>{entity.hp} / {entity.maxHp}</b></span>}
          </button>)}

          <div className="sandbox-player" data-testid="player" data-x={Math.round(player.x)} data-y={Math.round(player.y)} style={{ left: player.x, top: player.y, zIndex: Math.round(player.y) + 20 }}><HeroSprite action={action} facing={facing} /><span className="player-name">小勇士</span></div>
          {action === 'hurt' && <div className="sandbox-damage" style={{ left: player.x, top: player.y - 115, zIndex: Math.round(player.y) + 30 }}>−1 ❤</div>}
        </div>

        <div className="sandbox-objective"><span>{level.isBoss ? 'BOSS 区域' : '自由探索'}</span><b>{living.length}</b><small>个目标剩余</small></div>
        <div className="scene-message" aria-live="polite"><Sparkles size={16} />{message}</div>
        <MiniMap entities={entities} player={player} width={world.width} height={world.height} />
        {phase === 'transition' && <div className="wave-clear-banner"><Sparkles size={27} /><b>整片区域探索完成！</b><span>正在打开奖励宝箱</span></div>}
      </section>

      <footer className="touch-controls sandbox-controls">
        <div className="sandbox-dpad" aria-label="移动方向">
          {directionButtons.map(({ direction, label, icon: Icon }) => <button
            key={direction}
            className={`dpad-${direction}`}
            data-direction={direction}
            aria-label={label}
            onPointerDown={event => { event.preventDefault(); pressDirection(direction, true) }}
            onPointerUp={() => pressDirection(direction, false)}
            onPointerCancel={() => pressDirection(direction, false)}
            onPointerLeave={() => pressDirection(direction, false)}
          ><Icon size={29} /></button>)}
        </div>
        <div className="control-tip"><b>{nearestInRange ? `${entityName(nearestInRange)}就在身边` : '在整张地图里自由走动'}</b><span>{nearestInRange ? '点击右侧按钮，答对就能出手' : '看右上方小地图，亮点的位置就是目标'}</span><small>也支持键盘方向键和 WASD</small></div>
        <button className={`action-button ${nearestInRange ? 'ready' : ''}`} onClick={() => interact(nearestInRange)} disabled={phase !== 'playing' || !!quiz}>
          <span>{nearestInRange && !isOre(nearestInRange) ? <Swords size={32} /> : <Pickaxe size={32} />}</span><b>{actionLabel}</b><small>先答一题</small>
        </button>
      </footer>

      {phase === 'intro' && <div className="modal-layer"><div className="level-intro-card">
        <div className="intro-ribbon">{level.isBoss ? '⚔ BOSS 挑战' : `LEVEL ${level.id}`}</div>
        <div className="intro-icon">{level.isBoss ? <EntitySprite kind="boss" boss={level.id === 30} /> : <EntitySprite kind={level.worldIndex > 0 ? 'crystal' : 'rock'} />}</div>
        <small>{worlds[level.worldIndex].name}</small><h2>{level.name}</h2><p>{level.isBoss ? '在开放地图里找到守卫，集中精神打败它！' : '从营地出发，在同一张地图里自由挖矿、寻找怪兽！'}</p>
        <div className="intro-stats"><span><b>{totalChallenges}</b>次答题</span><span><b>5</b>颗爱心</span><span><b>1</b>张开放地图</span></div>
        <div className={`intro-reward ${level.reward.type === 'none' ? 'empty' : ''}`}><Gift size={21} />{rewardLabel(level)}</div>
        <button className="primary-cta modal-primary" onClick={() => { setPhase('playing'); playSound('click', progress.settings.sound) }}>进入方块世界<ArrowRight size={23} /></button>
        <button className="text-button" onClick={onExit}>先回地图看看</button>
      </div></div>}

      {phase === 'revive' && <div className="modal-layer"><div className="result-modal revive-modal"><div className="result-icon gem-bg"><Gem size={62} /></div><small>复活宝石发光了！</small><h2>小勇士，继续加油！</h2><p>已经自动消耗 1 颗复活宝石，<br />恢复 3 颗爱心，当前地图进度保留。</p><button className="primary-cta modal-primary" onClick={() => setPhase('playing')}><Shield size={22} />继续冒险</button></div></div>}

      {phase === 'gameover' && <div className="modal-layer"><div className="result-modal"><div className="result-icon tired">💪</div><small>差一点点就成功了</small><h2>休息一下，再来一次！</h2><p>答对 {stats.correct} 题，已经比刚才更厉害啦。<br />重新挑战会回到营地，并回满血。</p><button className="primary-cta modal-primary" onClick={retry}><RotateCcw size={22} />重新挑战</button><button className="secondary-cta" onClick={onExit}><Home size={20} />返回地图</button></div></div>}

      {phase === 'complete' && <div className="modal-layer"><div className={`result-modal complete-modal ${level.id === 30 ? 'final-complete' : ''}`}>
        <div className="confetti"><i /><i /><i /><i /><i /><i /></div>
        <div className="result-icon trophy-bg">{level.id === 30 ? <span>🏆</span> : <Trophy size={56} />}</div>
        <small>{level.id === 30 ? '星岛恢复了光明！' : `第 ${level.id} 关完成`}</small><h2>{level.id === 30 ? '你打败了暗影龙王！' : '太棒了，闯关成功！'}</h2>
        <div className="earned-stars">{[1, 2, 3].map(star => <Star key={star} size={40} fill={star <= stars ? 'currentColor' : 'none'} className={star <= stars ? 'earned' : ''} />)}</div>
        <div className="result-stats"><span>答对 <b>{stats.correct}</b> 题</span><span>剩余 <b>{hp}</b> 颗心</span><span><Coins size={18} /> + <b>{level.coins}</b></span></div>
        <div className={`result-reward ${level.reward.type === 'ipad' ? 'ipad-reward' : ''}`}><Gift size={27} /><div><small>{level.id === 30 ? '终极奖励已解锁' : '获得过关奖励'}</small><b>{rewardLabel(level)}</b>{level.id === 30 && <p>给家长看一眼，兑换属于小勇士的快乐时光！</p>}</div></div>
        <div className="result-actions"><button className="secondary-cta" onClick={onExit}>返回地图</button>{level.id < 30 ? <button className="primary-cta" onClick={() => onNext(level.id + 1)}>下一关<ArrowRight size={22} /></button> : <button className="primary-cta" onClick={onExit}>查看奖励券<ArrowRight size={22} /></button>}</div>
      </div></div>}

      {quiz && <QuizModal key={quiz.question.id} question={quiz.question} settings={progress.settings} onComplete={finishAnswer} />}
    </main>
  )
}
