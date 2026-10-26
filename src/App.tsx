import { useCallback, useEffect, useState } from 'react'
import './App.css'
import './sandbox.css'
import GameScreen from './components/GameScreen'
import HomeScreen from './components/HomeScreen'
import { HowToModal, SettingsModal } from './components/Modals'
import WorldMap from './components/WorldMap'
import { getLevel } from './data/levels'
import type { GameSettings, PlayerProgress, Screen } from './types/game'

const STORAGE_KEY = 'star-island-adventure-v1'
const defaultProgress: PlayerProgress = {
  unlocked: 1,
  completed: {},
  coins: 0,
  gems: 0,
  potions: 1,
  ipadReward: false,
  ipadRedeemed: false,
  settings: { timeLimit: 30, sound: true, autoRead: false },
}

function loadProgress(): PlayerProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultProgress
    const parsed = JSON.parse(saved) as Partial<PlayerProgress>
    return {
      ...defaultProgress,
      ...parsed,
      unlocked: Math.max(1, Math.min(30, parsed.unlocked || 1)),
      completed: parsed.completed || {},
      settings: { ...defaultProgress.settings, ...parsed.settings },
    }
  } catch {
    return defaultProgress
  }
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress)
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedLevel, setSelectedLevel] = useState(progress.unlocked)
  const [modal, setModal] = useState<'settings' | 'help' | null>(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch { /* The game still works when storage is unavailable. */ }
  }, [progress])

  const completeLevel = useCallback((id: number, earnedStars: number) => {
    const level = getLevel(id)
    setProgress(current => ({
      ...current,
      unlocked: Math.max(current.unlocked, Math.min(30, id + 1)),
      completed: { ...current.completed, [id]: Math.max(current.completed[id] || 0, earnedStars) },
      coins: current.coins + level.coins,
      gems: current.gems + (level.reward.type === 'gem' ? level.reward.amount : 0),
      potions: current.potions + (level.reward.type === 'potion' ? level.reward.amount : 0),
      ipadReward: current.ipadReward || level.reward.type === 'ipad',
    }))
  }, [])

  const changeSettings = useCallback((settings: GameSettings) => {
    setProgress(current => ({ ...current, settings }))
  }, [])

  function startLevel(id: number) {
    setSelectedLevel(id)
    setScreen('game')
    setModal(null)
  }

  function resetProgress() {
    setProgress(current => ({ ...defaultProgress, settings: current.settings }))
    setSelectedLevel(1)
    setModal(null)
    setScreen('home')
  }

  return (
    <div className="app-shell">
      {screen === 'home' && <HomeScreen
        progress={progress}
        onPlay={() => startLevel(progress.unlocked)}
        onMap={() => setScreen('map')}
        onSettings={() => setModal('settings')}
        onHelp={() => setModal('help')}
      />}
      {screen === 'map' && <WorldMap
        progress={progress}
        onBack={() => setScreen('home')}
        onStart={startLevel}
        onSettings={() => setModal('settings')}
      />}
      {screen === 'game' && <GameScreen
        key={selectedLevel}
        level={getLevel(selectedLevel)}
        progress={progress}
        onExit={() => setScreen('map')}
        onComplete={completeLevel}
        onUsePotion={() => setProgress(current => ({ ...current, potions: Math.max(0, current.potions - 1) }))}
        onConsumeGem={() => setProgress(current => ({ ...current, gems: Math.max(0, current.gems - 1) }))}
        onNext={startLevel}
      />}
      {modal === 'help' && <HowToModal onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsModal
        progress={progress}
        onChange={changeSettings}
        onReset={resetProgress}
        onRedeem={() => setProgress(current => ({ ...current, ipadRedeemed: true }))}
        onClose={() => setModal(null)}
      />}
    </div>
  )
}
