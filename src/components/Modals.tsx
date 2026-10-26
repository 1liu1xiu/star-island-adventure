import { useState } from 'react'
import { Check, Clock3, Gamepad2, Gem, HelpCircle, Pickaxe, RotateCcw, Settings, ShieldCheck, Sparkles, Swords, Volume2, X } from 'lucide-react'
import type { GameSettings, PlayerProgress } from '../types/game'

function ModalShell({ title, icon, children, onClose, className = '' }: { title: string; icon: React.ReactNode; children: React.ReactNode; onClose: () => void; className?: string }) {
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title} onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <div className={`standard-modal ${className}`}>
      <div className="modal-heading"><span>{icon}</span><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭"><X size={23} /></button></div>
      {children}
    </div>
  </div>
}

export function HowToModal({ onClose }: { onClose: () => void }) {
  return <ModalShell title="冒险小指南" icon={<HelpCircle size={24} />} onClose={onClose}>
    <p className="modal-intro">三个小步骤，马上成为星岛小勇士！</p>
    <div className="howto-steps">
      <div><span className="step-number">1</span><span className="howto-icon blue"><Gamepad2 size={29} /></span><section><b>自由探索方块世界</b><p>按住方向键上下左右移动，看小地图寻找矿石或怪兽。</p></section></div>
      <div><span className="step-number">2</span><span className="howto-icon orange"><Pickaxe size={29} /></span><section><b>答题再出手</b><p>点“挖掘”或“攻击”，答对题目就能成功。</p></section></div>
      <div><span className="step-number">3</span><span className="howto-icon red"><Swords size={29} /></span><section><b>保护好血量</b><p>答错或超时扣 1 颗心，血量归零要重新挑战。</p></section></div>
    </div>
    <div className="howto-tip"><Gem size={24} /><span><b>别忘记道具</b>草莓药水可以回血，复活宝石会在危险时自动帮你。</span></div>
    <button className="primary-cta modal-primary" onClick={onClose}>知道啦，出发！</button>
  </ModalShell>
}

interface SettingsProps {
  progress: PlayerProgress
  onChange: (settings: GameSettings) => void
  onReset: () => void
  onRedeem: () => void
  onClose: () => void
}

export function SettingsModal({ progress, onChange, onReset, onRedeem, onClose }: SettingsProps) {
  const [confirmReset, setConfirmReset] = useState(false)
  const settings = progress.settings
  return <ModalShell title="家长设置" icon={<Settings size={24} />} onClose={onClose} className="settings-modal">
    {progress.ipadReward && <div className="parent-reward-ticket"><div className="ticket-icon">🏆</div><div><small>孩子已赢得终极奖励</small><h3>iPad 自由畅玩 1 小时</h3><p>{progress.ipadRedeemed ? '这张奖励券已兑换，别忘了为小小冒险家鼓掌！' : '由家长安排时间并兑现，游戏不会控制其他 App。'}</p></div>{!progress.ipadRedeemed && <button onClick={onRedeem}><Check size={18} />确认已兑换</button>}</div>}
    <div className="setting-section"><div className="setting-label"><Clock3 size={21} /><div><b>每题作答时间</b><small>默认 30 秒，可按孩子节奏调整</small></div></div><div className="time-options">{[20, 30, 40].map(time => <button key={time} className={settings.timeLimit === time ? 'active' : ''} onClick={() => onChange({ ...settings, timeLimit: time })}>{time} 秒{settings.timeLimit === time && <Check size={16} />}</button>)}</div></div>
    <div className="setting-row"><div><Volume2 size={21} /><span><b>游戏音效</b><small>答题、攻击和奖励提示音</small></span></div><button role="switch" aria-checked={settings.sound} className={`toggle ${settings.sound ? 'on' : ''}`} onClick={() => onChange({ ...settings, sound: !settings.sound })}><i /></button></div>
    <div className="setting-row"><div><Sparkles size={21} /><span><b>自动朗读题目</b><small>也可以随时点题目旁的喇叭</small></span></div><button role="switch" aria-checked={settings.autoRead} className={`toggle ${settings.autoRead ? 'on' : ''}`} onClick={() => onChange({ ...settings, autoRead: !settings.autoRead })}><i /></button></div>
    <div className="parent-note"><ShieldCheck size={23} /><p><b>给家长的小提示</b>题目覆盖一二年级基础内容。建议每次游玩 15–20 分钟，休息眼睛后再继续。</p></div>
    <div className="reset-zone">{confirmReset ? <><span>确定清空所有关卡和道具吗？</span><button className="danger-button" onClick={onReset}>确定清空</button><button onClick={() => setConfirmReset(false)}>取消</button></> : <button onClick={() => setConfirmReset(true)}><RotateCcw size={17} />重新开始全部冒险</button>}</div>
  </ModalShell>
}
