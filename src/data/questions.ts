import type { Question, Subject } from '../types/game'

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)

function numericOptions(answer: number) {
  const values = new Set<number>([answer])
  const offsets = shuffle([1, -1, 2, -2, 3, -3, 10, -10])
  for (const offset of offsets) {
    if (values.size >= 3) break
    if (answer + offset >= 0) values.add(answer + offset)
  }
  let extra = answer + 4
  while (values.size < 3) values.add(extra++)
  return shuffle([...values].map(String))
}

function makeQuestion(subject: Subject, prompt: string, answer: string, options?: string[], tip?: string): Question {
  return {
    id: `${Date.now()}-${Math.random()}`,
    subject,
    prompt,
    answer,
    options: shuffle(options ?? [answer]),
    tip,
  }
}

function mathQuestion(level: number): Question {
  const late = level >= 21
  const kind = late ? randomInt(0, 4) : randomInt(0, 3)

  if (kind === 3) {
    const start = randomInt(2, level < 13 ? 10 : 25)
    const step = pick([1, 2, 5, 10])
    const answer = start + step * 2
    return makeQuestion('math', `找规律：${start}，${start + step}，？`, String(answer), numericOptions(answer), `每次都多 ${step}`)
  }

  if (kind === 4 && late) {
    const a = randomInt(2, 5)
    const b = randomInt(2, 5)
    const answer = a * b
    return makeQuestion('math', `${a} × ${b} = ?`, String(answer), numericOptions(answer), `可以想成 ${b} 个 ${a} 相加`)
  }

  if (kind === 2) {
    const a = randomInt(2, level < 13 ? 20 : 90)
    let b = randomInt(1, level < 13 ? 20 : 99)
    if (a === b) b = b === 1 ? b + 1 : b - 1
    const bigger = Math.max(a, b)
    const smaller = Math.min(a, b)
    const askBigger = Math.random() > 0.5
    const answer = askBigger ? bigger : smaller
    let third = askBigger ? bigger - 1 : smaller + 1
    while (third === a || third === b) third += askBigger ? -1 : 1
    return makeQuestion('math', `${askBigger ? '哪个数更大' : '哪个数更小'}？`, String(answer), shuffle([String(a), String(b), String(third)]))
  }

  if (level <= 3) {
    if (kind === 1) {
      const a = randomInt(2, 10)
      const b = randomInt(1, a)
      return makeQuestion('math', `${a} − ${b} = ?`, String(a - b), numericOptions(a - b))
    }
    const a = randomInt(1, 8)
    const b = randomInt(1, 10 - a)
    return makeQuestion('math', `${a} + ${b} = ?`, String(a + b), numericOptions(a + b))
  }

  if (level <= 12) {
    if (kind === 1) {
      const a = randomInt(6, 20)
      const b = randomInt(1, a)
      return makeQuestion('math', `${a} − ${b} = ?`, String(a - b), numericOptions(a - b))
    }
    const a = randomInt(2, 17)
    const b = randomInt(1, 20 - a)
    return makeQuestion('math', `${a} + ${b} = ?`, String(a + b), numericOptions(a + b))
  }

  if (kind === 1) {
    const a = randomInt(20, 99)
    const b = randomInt(5, a)
    return makeQuestion('math', `${a} − ${b} = ?`, String(a - b), numericOptions(a - b))
  }
  const a = randomInt(12, 75)
  const b = randomInt(5, 99 - a)
  return makeQuestion('math', `${a} + ${b} = ?`, String(a + b), numericOptions(a + b))
}

const chineseBasic = [
  ['“上”的反义词是什么？', '下', ['下', '左', '大']],
  ['“小”的反义词是什么？', '大', ['大', '多', '高']],
  ['选择正确的量词：一（ ）小鸟', '只', ['只', '本', '朵']],
  ['选择正确的量词：一（ ）书', '本', ['本', '只', '条']],
  ['选择正确的量词：一（ ）花', '朵', ['朵', '本', '个']],
  ['“日”字加一笔，可以变成哪个字？', '目', ['目', '大', '土']],
  ['“大”字加一笔，可以变成哪个字？', '天', ['天', '小', '口']],
  ['“太阳”的“太”读什么？', 'tài', ['tài', 'dà', 'rì']],
  ['哪个字的读音是“mā”？', '妈', ['妈', '马', '木']],
  ['“明”是由哪两个字组成的？', '日和月', ['日和月', '口和鸟', '山和水']],
  ['“花”的偏旁是什么？', '艹', ['艹', '口', '木']],
  ['下面哪个是水果？', '苹果', ['苹果', '铅笔', '桌子']],
  ['哪个词语表示很开心？', '高兴', ['高兴', '难过', '生气']],
  ['把句子补充完整：我在公园里____。', '跑步', ['跑步', '苹果', '红色']],
  ['哪个词语可以用来形容月亮？', '弯弯', ['弯弯', '跑步', '唱歌']],
] as const

const chineseAdvanced = [
  ['哪个词和“美丽”意思相近？', '漂亮', ['漂亮', '伤心', '缓慢']],
  ['“许多”的近义词是什么？', '很多', ['很多', '很少', '唯一']],
  ['“寒冷”的反义词是什么？', '温暖', ['温暖', '冰凉', '阴暗']],
  ['下面哪句话是完整的句子？', '小鸟在天上飞。', ['小鸟在天上飞。', '在公园里', '一朵红花']],
  ['选择正确的字：____天开学了。', '今', ['今', '令', '心']],
  ['选择正确的量词：一（ ）小河', '条', ['条', '本', '朵']],
  ['“快乐”的反义词是什么？', '难过', ['难过', '高兴', '开心']],
  ['“朋友”的“友”读什么？', 'yǒu', ['yǒu', 'yōu', 'yòu']],
  ['下面哪个词语和动物有关？', '飞翔', ['飞翔', '书桌', '铅笔']],
  ['把句子补充完整：雨后的空气真____。', '清新', ['清新', '飞快', '许多']],
] as const

const englishBasic = [
  ['哪个是小写字母 a？', 'a', ['a', 'e', 'b']],
  ['字母 B 后面是哪个字母？', 'C', ['C', 'A', 'D']],
  ['🍎 这个水果用英语怎么说？', 'apple', ['apple', 'banana', 'cat']],
  ['cat 是什么动物？', '猫', ['猫', '狗', '鸟']],
  ['dog 是什么动物？', '狗', ['狗', '猫', '兔子']],
  ['red 是什么颜色？', '红色', ['红色', '蓝色', '黄色']],
  ['blue 是什么颜色？', '蓝色', ['蓝色', '绿色', '红色']],
  ['one 表示数字几？', '1', ['1', '2', '3']],
  ['哪个单词表示“书”？', 'book', ['book', 'look', 'bag']],
  ['哪个单词以字母 s 开头？', 'sun', ['sun', 'moon', 'cat']],
  ['🍌 这个水果用英语怎么说？', 'banana', ['banana', 'apple', 'orange']],
] as const

const englishAdvanced = [
  ['早上见面，可以说什么？', 'Good morning!', ['Good morning!', 'Good night!', 'Thank you!']],
  ['别人对你说 Thank you，你可以回答：', "You're welcome!", ["You're welcome!", 'Good night!', 'Goodbye!']],
  ['两个苹果，应该说：', 'two apples', ['two apples', 'two apple', 'one apple']],
  ['哪个单词表示“妈妈”？', 'mother', ['mother', 'father', 'sister']],
  ['“我有一支铅笔”用英语怎么说？', 'I have a pencil.', ['I have a pencil.', 'I am a pencil.', 'I like a book.']],
  ['哪个单词表示“学校”？', 'school', ['school', 'house', 'park']],
  ['yellow 是什么颜色？', '黄色', ['黄色', '紫色', '黑色']],
  ['three 表示数字几？', '3', ['3', '2', '5']],
  ['晚上睡觉前，可以说什么？', 'Good night!', ['Good night!', 'Good morning!', 'Hello!']],
  ['哪个单词表示“老师”？', 'teacher', ['teacher', 'student', 'doctor']],
] as const

export function generateQuestion(subject: Subject, level: number): Question {
  if (subject === 'math') return mathQuestion(level)
  const pool: readonly (readonly [string, string, readonly string[]])[] = subject === 'chinese'
    ? (level < 16 || Math.random() < 0.55 ? chineseBasic : chineseAdvanced)
    : (level < 13 || Math.random() < 0.5 ? englishBasic : englishAdvanced)
  const [prompt, answer, options] = pick(pool)
  return makeQuestion(subject, prompt, answer, [...options])
}
