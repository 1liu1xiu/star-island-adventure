export type SoundName = 'click' | 'correct' | 'wrong' | 'hit' | 'clear' | 'reward'

let audioContext: AudioContext | null = null

export function playSound(name: SoundName, enabled = true) {
  if (!enabled) return
  try {
    audioContext ??= new AudioContext()
    const now = audioContext.currentTime
    const notes: Record<SoundName, number[]> = {
      click: [420],
      correct: [523, 659, 784],
      wrong: [220, 174],
      hit: [130, 90],
      clear: [523, 659, 784, 1047],
      reward: [659, 784, 988, 1319],
    }
    notes[name].forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator()
      const gain = audioContext!.createGain()
      oscillator.type = name === 'wrong' || name === 'hit' ? 'square' : 'sine'
      oscillator.frequency.value = frequency
      const start = now + index * 0.09
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
      oscillator.connect(gain)
      gain.connect(audioContext!.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.18)
    })
  } catch {
    // Audio is optional; gameplay continues if the browser blocks it.
  }
}

export function speak(text: string, enabled = true) {
  if (!enabled || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.replaceAll('−', '减').replaceAll('×', '乘').replaceAll('？', ''))
  utterance.lang = 'zh-CN'
  utterance.rate = 0.88
  utterance.pitch = 1.08
  window.speechSynthesis.speak(utterance)
}
