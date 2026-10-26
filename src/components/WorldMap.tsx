import { useState } from 'react'
import { ArrowRight, Check, ChevronLeft, Cloud, Coins, Flame, Gem, Gift, Heart, LockKeyhole, Map as MapIcon, Settings, Sparkles, Star, Trees, Waves } from 'lucide-react'
import { getChallengeCount, getLevel, levels, rewardLabel, worlds } from '../data/levels'
import type { PlayerProgress } from '../types/game'

const worldIcons = [Trees, Waves, Cloud, Flame, Sparkles]

interface Props {
  progress: PlayerProgress
  onBack: () => void
  onStart: (id: number) => void
  onSettings: () => void
}

export default function WorldMap({ progress, onBack, onStart, onSettings }: Props) {
  const [worldIndex, setWorldIndex] = useState(Math.floor((progress.unlocked - 1) / 6))
  const [selectedId, setSelectedId] = useState(progress.unlocked)
  const selected = getLevel(selectedId)
  const worldLevels = levels.filter(level => level.worldIndex === worldIndex)
  const selectedLocked = selectedId > progress.unlocked

  function chooseWorld(index: number) {
    setWorldIndex(index)
    const first = index * 6 + 1
    const last = first + 5
    setSelectedId(Math.max(first, Math.min(progress.unlocked, last)))
  }

  return (
    <main className={`map-screen map-${worlds[worldIndex].className}`}>
      <header className="map-header">
        <button className="round-back" onClick={onBack} aria-label="返回首页"><ChevronLeft size={27} /></button>
        <div className="map-title"><span><MapIcon size={22} /></span><div><h1>星岛冒险地图</h1><p>选择关卡，继续你的旅程</p></div></div>
        <div className="inventory-bar">
          <span className="inventory-chip coin"><Coins size={20} /><b>{progress.coins}</b></span>
          <span className="inventory-chip gem"><Gem size={20} /><b>{progress.gems}</b></span>
          <span className="inventory-chip potion"><Heart size={20} /><b>{progress.potions}</b></span>
          <button className="icon-button" onClick={onSettings} aria-label="家长设置"><Settings size={22} /></button>
        </div>
      </header>

      <div className="map-body">
        <nav className="world-tabs" aria-label="选择岛屿">
          {worlds.map((world, index) => {
            const Icon = worldIcons[index]
            const locked = index * 6 + 1 > progress.unlocked
            const done = levels.slice(index * 6, index * 6 + 6).filter(level => progress.completed[level.id]).length
            return <button key={world.name} disabled={locked} className={worldIndex === index ? 'active' : ''} onClick={() => chooseWorld(index)}>
              <span className={`world-tab-icon ${world.className}`}>{locked ? <LockKeyhole size={21} /> : <Icon size={22} />}</span>
              <span><b>{world.name}</b><small>{locked ? '尚未解锁' : `${done} / 6 已完成`}</small></span>
              {worldIndex === index && <i />}
            </button>
          })}
        </nav>

        <section className="map-main-panel">
          <div className="map-panel-heading"><div><span>第 {worldIndex + 1} 座岛屿</span><h2>{worlds[worldIndex].name}</h2><p>{worlds[worldIndex].subtitle}</p></div><div className="world-progress-ring"><b>{worldLevels.filter(level => progress.completed[level.id]).length}</b><span>/ 6</span></div></div>
          <div className="level-path">
            {worldLevels.map((level, index) => {
              const locked = level.id > progress.unlocked
              const stars = progress.completed[level.id] || 0
              const active = selectedId === level.id
              return (
                <button key={level.id} className={`level-node ${active ? 'selected' : ''} ${locked ? 'locked' : ''} ${level.isBoss ? 'boss-node' : ''}`} onClick={() => !locked && setSelectedId(level.id)} disabled={locked}>
                  {index < worldLevels.length - 1 && <span className={`path-line ${progress.completed[level.id] ? 'done' : ''}`} />}
                  <span className="level-badge">
                    {locked ? <LockKeyhole size={24} /> : stars ? <Check size={29} strokeWidth={3} /> : level.isBoss ? <span className="boss-crown">♛</span> : <b>{level.id}</b>}
                  </span>
                  <span className="level-node-copy"><small>{level.isBoss ? '岛屿 BOSS' : `第 ${level.id} 关`}</small><b>{level.name}</b><span className="node-stars">{[1, 2, 3].map(star => <Star key={star} size={13} fill={star <= stars ? 'currentColor' : 'none'} />)}</span></span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="level-detail-card">
          <div className={`detail-illustration detail-${worlds[selected.worldIndex].className}`}>
            <span className="detail-number">{selected.isBoss ? 'BOSS' : `LEVEL ${selected.id}`}</span>
            <div className="detail-island"><i /><i /><i /></div>
            <span className="detail-spark s1">★</span><span className="detail-spark s2">★</span>
          </div>
          <div className="detail-copy"><span className="detail-kicker">{worlds[selected.worldIndex].name} · {selected.isBoss ? '守卫战' : `第 ${(selected.id - 1) % 6 + 1} 站`}</span><h2>{selected.name}</h2></div>
          <div className="detail-stats"><div><b>{getChallengeCount(selected)}</b><span>答题挑战</span></div><div><b>5</b><span>初始血量</span></div><div><b>{progress.completed[selected.id] || '—'}</b><span>最佳星级</span></div></div>
          <div className={`reward-preview ${selected.reward.type === 'none' ? 'empty' : ''}`}><Gift size={23} /><div><small>过关奖励</small><b>{rewardLabel(selected)}</b><span>另有星币 × {selected.coins}</span></div></div>
          <button className="start-level-button" disabled={selectedLocked} onClick={() => onStart(selected.id)}>{selectedLocked ? <><LockKeyhole size={22} />先完成前面的关卡</> : <>{progress.completed[selected.id] ? '再次挑战' : '准备出发'}<ArrowRight size={23} /></>}</button>
          <p className="detail-note">每关开始血量回满 · 答题超时会扣血</p>
        </aside>
      </div>
      {progress.ipadReward && <button className="ipad-unlocked-banner" onClick={onSettings}><span>🏆</span><div><b>终极奖励已解锁！</b><small>iPad 畅玩 1 小时券，点这里查看</small></div><ArrowRight size={22} /></button>}
    </main>
  )
}
