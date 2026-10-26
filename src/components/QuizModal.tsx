import { useEffect, useRef, useState } from 'react'
import { Check, Clock3, Lightbulb, Volume2, X } from 'lucide-react'
import type { GameSettings, Question } from '../types/game'
import { playSound, speak } from '../lib/sound'

const subjectInfo = {
  math: { name: '数学能量', icon: '＋', className: 'math' },
  chinese: { name: '语文能量', icon: '文', className: 'chinese' },
  english: { name: '英语能量', icon: 'A', className: 'english' },
}

interface Props {
  question: Question
  settings: GameSettings
  onComplete: (correct: boolean) => void
}

export default function QuizModal({ question, settings, onComplete }: Props) {
  const [remaining, setRemaining] = useState(settings.timeLimit)
  const [result, setResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const info = subjectInfo[question.subject]

  useEffect(() => {
    if (settings.autoRead) speak(question.prompt, true)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [question.id, settings.autoRead, question.prompt])

  useEffect(() => {
    if (result) return
    let seconds = settings.timeLimit
    const timer = setInterval(() => {
      if (document.hidden) return
      seconds = Math.max(0, seconds - 1)
      setRemaining(seconds)
      if (seconds === 0) {
        clearInterval(timer)
        setResult('timeout')
        playSound('wrong', settings.sound)
        timeoutRef.current = setTimeout(() => onComplete(false), 1700)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [result, question.id, onComplete, settings.sound, settings.timeLimit])

  function answer(value: string) {
    if (result) return
    const correct = value === question.answer
    setSelected(value)
    setResult(correct ? 'correct' : 'wrong')
    playSound(correct ? 'correct' : 'wrong', settings.sound)
    timeoutRef.current = setTimeout(() => onComplete(correct), correct ? 800 : 1700)
  }

  function readQuestion() {
    speak(`${question.prompt}。选项：${question.options.join('，')}`, true)
  }

  return (
    <div className="modal-layer quiz-layer" role="dialog" aria-modal="true" aria-label="答题挑战">
      <div className="quiz-card">
        <div className="quiz-topline">
          <div className={`subject-chip ${info.className}`}><span>{info.icon}</span>{info.name}</div>
          <button className="icon-button read-button" onClick={readQuestion} aria-label="朗读题目"><Volume2 size={24} /></button>
          <div className={`timer-chip ${remaining <= 5 ? 'danger' : ''}`}><Clock3 size={21} /><b>{remaining}</b><span>秒</span></div>
        </div>
        <div className="timer-track"><div className={remaining <= 5 ? 'danger' : ''} style={{ width: `${(remaining / settings.timeLimit) * 100}%` }} /></div>

        <div className="quiz-question">
          <div className="question-kicker">答对就能{question.subject === 'math' ? '释放星星力量' : question.subject === 'chinese' ? '点亮汉字力量' : '唤醒单词力量'}！</div>
          <h2>{question.prompt}</h2>
        </div>

        <div className="answer-grid">
          {question.options.map((option, index) => {
            const isAnswer = option === question.answer
            const isSelected = option === selected
            const className = result
              ? isAnswer ? 'answer-correct' : isSelected ? 'answer-wrong' : 'answer-muted'
              : ''
            return (
              <button key={`${option}-${index}`} className={`answer-button ${className}`} onClick={() => answer(option)} disabled={!!result}>
                <span className="answer-index">{String.fromCharCode(65 + index)}</span>
                <strong>{option}</strong>
                {result && isAnswer && <Check className="answer-state" size={26} />}
                {result && isSelected && !isAnswer && <X className="answer-state" size={26} />}
              </button>
            )
          })}
        </div>

        <div className={`quiz-feedback ${result ? `show ${result}` : ''}`} aria-live="polite">
          {!result && <><Lightbulb size={19} /><span>想一想，再点答案</span></>}
          {result === 'correct' && <><Check size={22} /><b>答对啦，漂亮一击！</b></>}
          {result === 'wrong' && <><span>正确答案是 <b>{question.answer}</b>{question.tip ? ` · ${question.tip}` : ''}</span></>}
          {result === 'timeout' && <><Clock3 size={20} /><span>时间到！正确答案是 <b>{question.answer}</b></span></>}
        </div>
      </div>
    </div>
  )
}
