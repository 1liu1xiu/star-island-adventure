import { BookOpen, ChevronRight, Clock3, Gamepad2, Gem, Heart, HelpCircle, Map, Play, Settings, Sparkles } from 'lucide-react'
import type { PlayerProgress } from '../types/game'
import { EntitySprite, HeroSprite, SceneBackdrop } from './PixelArt'

interface Props {
  progress: PlayerProgress
  onPlay: () => void
  onMap: () => void
  onSettings: () => void
  onHelp: () => void
}

export default function HomeScreen({ progress, onPlay, onMap, onSettings, onHelp }: Props) {
  const completed = Object.keys(progress.completed).length
  const hasProgress = completed > 0
  return (
    <main className="home-screen">
      <SceneBackdrop worldIndex={0} />
      <header className="home-header">
        <div className="mini-brand"><span><Sparkles size={20} /></span>星岛小队</div>
        <div className="home-header-actions">
          <button className="soft-button" onClick={onHelp}><HelpCircle size={20} /><span>怎么玩</span></button>
          <button className="soft-button" onClick={onSettings}><Settings size={20} /><span>家长设置</span></button>
        </div>
      </header>

      <section className="home-content">
        <div className="home-copy">
          <div className="eyebrow"><span /> 会学习的冒险，才更闪亮</div>
          <h1><span>星岛</span><br />答题大冒险</h1>
          <p>挥起小镐，打败怪兽！<br />每一道题，都是前进的超能力。</p>
          <div className="subject-pills">
            <span className="pill-math">＋ 数学</span><span className="pill-chinese">文 语文</span><span className="pill-english">A 英语</span>
          </div>
          <div className="home-actions">
            <button className="primary-cta" onClick={onPlay}><Play fill="currentColor" size={25} />{hasProgress ? `继续第 ${progress.unlocked} 关` : '开始冒险'}<ChevronRight size={24} /></button>
            <button className="secondary-cta" onClick={onMap}><Map size={23} />冒险地图</button>
          </div>
          <div className="home-progress"><span><b>{completed}</b> / 30 关已完成</span><div><i style={{ width: `${completed / 30 * 100}%` }} /></div></div>
        </div>

        <div className="home-adventure" aria-label="小冒险家和森林怪兽">
          <div className="floating-label label-one"><PickaxeIcon />挖矿</div>
          <div className="floating-label label-two"><SwordsIcon />打怪</div>
          <div className="home-star star-one">★</div><div className="home-star star-two">★</div>
          <div className="home-hero"><HeroSprite /></div>
          <div className="home-slime"><EntitySprite kind="slime" /></div>
          <div className="home-ore"><EntitySprite kind="crystal" /></div>
          <div className="adventure-platform"><i /><i /><i /><i /><i /></div>
        </div>
      </section>

      <section className="home-features">
        <div><span className="feature-icon green"><Gamepad2 size={23} /></span><p><b>30 关大冒险</b><small>5 座岛屿，慢慢探索</small></p></div>
        <div><span className="feature-icon orange"><Clock3 size={23} /></span><p><b>限时答题挑战</b><small>想清楚，再出手</small></p></div>
        <div><span className="feature-icon red"><Heart size={23} fill="currentColor" /></span><p><b>血量与复活</b><small>答错不害怕，再来一次</small></p></div>
        <div><span className="feature-icon purple"><Gem size={23} /></span><p><b>终极神秘奖励</b><small>打败龙王就能解锁</small></p></div>
      </section>
      <footer className="home-footer"><BookOpen size={15} />适合小学 1–2 年级 · 进度自动保存在本机</footer>
    </main>
  )
}

function PickaxeIcon() { return <span className="tiny-pixel-icon">⛏</span> }
function SwordsIcon() { return <span className="tiny-pixel-icon">⚔</span> }
