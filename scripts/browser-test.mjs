import { chromium } from 'playwright-core'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { generateQuestion } from '../src/data/questions.ts'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const ARTIFACTS = fileURLToPath(new URL('../artifacts/', import.meta.url))
await mkdir(ARTIFACTS, { recursive: true })

const knownAnswers = new Map()
for (const subject of ['chinese', 'english']) {
  for (const level of [1, 30]) {
    for (let index = 0; index < 500; index++) {
      const question = generateQuestion(subject, level)
      knownAnswers.set(question.prompt, question.answer)
    }
  }
}

function solve(prompt) {
  if (knownAnswers.has(prompt)) return knownAnswers.get(prompt)
  let match = prompt.match(/^(\d+) \+ (\d+) = \?$/)
  if (match) return String(Number(match[1]) + Number(match[2]))
  match = prompt.match(/^(\d+) − (\d+) = \?$/)
  if (match) return String(Number(match[1]) - Number(match[2]))
  match = prompt.match(/^(\d+) × (\d+) = \?$/)
  if (match) return String(Number(match[1]) * Number(match[2]))
  match = prompt.match(/^找规律：(\d+)，(\d+)，？$/)
  if (match) return String(Number(match[2]) * 2 - Number(match[1]))
  throw new Error(`无法自动作答：${prompt}`)
}

const server = await createServer({ root: ROOT, logLevel: 'error', server: { host: '127.0.0.1', port: 7100, strictPort: true } })
await server.listen()
const browser = await chromium.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true })
const errors = []
const assert = (condition, message) => { if (!condition) throw new Error(message) }

function watch(page) {
  page.on('pageerror', error => errors.push(error.message))
}

async function answerCurrent(page, correct = true) {
  await page.locator('.quiz-card').waitFor()
  const prompt = await page.locator('.quiz-question h2').innerText()
  const options = await page.locator('.answer-button strong').allTextContents()
  let answer
  if (prompt.includes('哪个数更')) {
    const values = options.map(Number)
    answer = String(prompt.includes('更大') ? Math.max(...values) : Math.min(...values))
  } else {
    answer = solve(prompt)
  }
  const index = correct ? options.indexOf(answer) : options.findIndex(option => option !== answer)
  assert(index >= 0, `找不到选项：${prompt} / ${answer}`)
  await page.locator('.answer-button').nth(index).click()
  await page.locator('.quiz-card').waitFor({ state: 'detached', timeout: 5000 })
}

async function holdDirection(page, direction, milliseconds = 190) {
  const button = page.locator(`[data-direction="${direction}"]`)
  await button.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(milliseconds)
  await button.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(70)
}

async function playerPoint(page) {
  const player = page.locator('[data-testid="player"]')
  return { x: Number(await player.getAttribute('data-x')), y: Number(await player.getAttribute('data-y')) }
}

async function moveTowardNearest(page) {
  const first = page.locator('.sandbox-entity').first()
  const id = await first.getAttribute('data-entity-id')
  for (const axis of ['x', 'y']) {
    for (let step = 0; step < 35; step++) {
      const target = page.locator(`[data-entity-id="${id}"]`)
      const targetPoint = { x: Number(await target.getAttribute('data-x')), y: Number(await target.getAttribute('data-y')) }
      const current = await playerPoint(page)
      const delta = targetPoint[axis] - current[axis]
      if (Math.abs(delta) < 65) break
      const direction = axis === 'x' ? (delta > 0 ? 'right' : 'left') : (delta > 0 ? 'down' : 'up')
      await holdDirection(page, direction)
    }
  }
  assert(await page.locator('.action-button.ready').count() > 0, `移动到目标附近后仍无法互动：${id}`)
}

async function playCurrentLevel(page, maxSteps = 80) {
  for (let step = 0; step < maxSteps; step++) {
    if (await page.locator('.complete-modal').count()) {
      await page.waitForTimeout(400)
      return
    }
    if (await page.locator('.quiz-card').count()) {
      await answerCurrent(page)
      continue
    }
    if (await page.locator('.wave-clear-banner').count()) {
      await page.waitForTimeout(1050)
      continue
    }
    if (await page.locator('.action-button.ready').count()) {
      await page.locator('.action-button').click()
      continue
    }
    await moveTowardNearest(page)
  }
  throw new Error('关卡未能在预期步骤内完成')
}

async function openFreshLevel(page) {
  await page.goto('http://127.0.0.1:7100/', { waitUntil: 'networkidle' })
  await page.locator('.home-actions .primary-cta').click()
  await page.locator('.level-intro-card .primary-cta').click()
}

try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  watch(page)
  await page.goto('http://127.0.0.1:7100/', { waitUntil: 'networkidle' })
  await page.locator('.home-copy h1').waitFor()
  await page.screenshot({ path: `${ARTIFACTS}home-ipad.png`, fullPage: true })
  await page.locator('.home-actions .secondary-cta').click()
  await page.locator('.map-main-panel').waitFor()
  assert(await page.locator('.level-node').count() === 6, '地图未显示6个关卡')
  await page.screenshot({ path: `${ARTIFACTS}map-ipad.png`, fullPage: true })
  await page.locator('.round-back').click()

  await openFreshLevel(page)
  await page.locator('.voxel-world').waitFor()
  assert(await page.locator('.sandbox-entity').count() === 6, '第一关的6个目标没有同时存在于开放地图')
  assert(await page.locator('.minimap-dot').count() === 6, '小地图目标数量不正确')
  assert(await page.locator('.action-button.ready').count() === 0, '出生点不应直接碰到远处目标')
  await page.screenshot({ path: `${ARTIFACTS}game-ipad.png` })
  const initialPoint = await playerPoint(page)
  const initialCamera = await page.locator('.voxel-world').getAttribute('style')
  await holdDirection(page, 'right', 260)
  assert((await playerPoint(page)).x > initialPoint.x, '向右移动无效')
  assert((await page.locator('.voxel-world').getAttribute('style')) !== initialCamera, '镜头没有跟随角色')
  await holdDirection(page, 'left', 260)
  await holdDirection(page, 'up', 260)
  assert((await playerPoint(page)).y < initialPoint.y, '向上移动无效')
  await holdDirection(page, 'down', 260)
  await moveTowardNearest(page)
  await page.locator('.action-button').click()
  await page.locator('.quiz-card').waitFor()
  await page.screenshot({ path: `${ARTIFACTS}quiz-ipad.png` })
  await answerCurrent(page)
  assert((await page.locator('.hud-progress span').innerText()).startsWith('1 /'), '答对后进度未增加')
  await playCurrentLevel(page)
  await page.locator('.complete-modal').waitFor()
  await page.screenshot({ path: `${ARTIFACTS}complete-ipad.png` })
  await page.locator('.result-actions .primary-cta').click()
  await page.locator('.level-intro-card').waitFor()
  assert((await page.locator('.level-intro-card h2').innerText()) === '苔痕矿洞', '下一关未正确解锁')
  await page.locator('.level-intro-card .primary-cta').click()
  await moveTowardNearest(page)
  await page.locator('.action-button').click()
  await answerCurrent(page, false)
  assert(await page.locator('.hp-hearts .full').count() === 4, '答错后未扣1颗心')
  await page.locator('.potion-button').click()
  assert(await page.locator('.hp-hearts .full').count() === 5, '药水未恢复血量')
  assert((await page.locator('.potion-button b').innerText()) === '0', '药水数量未扣减')
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${ARTIFACTS}game-ipad-portrait.png` })
  console.log('通过：开放地图、四方向移动、镜头跟随、小地图、答题、通关、下一关、扣血与药水。')
  await context.close()

  const reviveContext = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, reducedMotion: 'reduce' })
  await reviveContext.addInitScript(() => {
    localStorage.setItem('star-island-adventure-v1', JSON.stringify({ unlocked: 1, completed: {}, coins: 0, gems: 1, potions: 0, ipadReward: false, ipadRedeemed: false, settings: { timeLimit: 1, sound: false, autoRead: false } }))
  })
  const revivePage = await reviveContext.newPage()
  watch(revivePage)
  await openFreshLevel(revivePage)
  await moveTowardNearest(revivePage)
  for (let index = 0; index < 5; index++) {
    await revivePage.locator('.action-button').click()
    await revivePage.locator('.quiz-feedback.timeout').waitFor({ timeout: 5000 })
    if (index < 4) await revivePage.locator('.quiz-card').waitFor({ state: 'detached', timeout: 5000 })
  }
  await revivePage.locator('.revive-modal').waitFor({ timeout: 6000 })
  await revivePage.locator('.revive-modal .primary-cta').click()
  assert(await revivePage.locator('.hp-hearts .full').count() === 3, '复活后未恢复3颗心')
  assert((await revivePage.locator('.hud-gem b').innerText()) === '0', '复活宝石未消耗')
  for (let index = 0; index < 3; index++) {
    await revivePage.locator('.action-button').click()
    await revivePage.locator('.quiz-feedback.timeout').waitFor({ timeout: 5000 })
    if (index < 2) await revivePage.locator('.quiz-card').waitFor({ state: 'detached', timeout: 5000 })
  }
  await revivePage.locator('.result-modal').waitFor({ timeout: 6000 })
  await revivePage.getByRole('button', { name: '重新挑战' }).waitFor()
  console.log('通过：题目超时、自动复活、宝石消耗、血量归零与重新挑战。')
  await reviveContext.close()

  const finalContext = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, reducedMotion: 'reduce' })
  await finalContext.addInitScript(() => {
    localStorage.setItem('star-island-adventure-v1', JSON.stringify({ unlocked: 30, completed: {}, coins: 0, gems: 0, potions: 0, ipadReward: false, ipadRedeemed: false, settings: { timeLimit: 30, sound: false, autoRead: false } }))
  })
  const finalPage = await finalContext.newPage()
  watch(finalPage)
  await openFreshLevel(finalPage)
  await playCurrentLevel(finalPage, 80)
  await finalPage.getByRole('heading', { name: '你打败了暗影龙王！' }).waitFor()
  await finalPage.screenshot({ path: `${ARTIFACTS}final-reward-ipad.png` })
  const finalProgress = await finalPage.evaluate(() => JSON.parse(localStorage.getItem('star-island-adventure-v1')))
  assert(finalProgress.ipadReward === true, '终极奖励未写入进度')
  await finalPage.locator('.result-actions .primary-cta').click()
  await finalPage.locator('.ipad-unlocked-banner').click()
  await finalPage.locator('.parent-reward-ticket').waitFor()
  await finalPage.getByRole('button', { name: '确认已兑换' }).click()
  const redeemed = await finalPage.evaluate(() => JSON.parse(localStorage.getItem('star-island-adventure-v1')).ipadRedeemed)
  assert(redeemed === true, '奖励兑换状态未保存')
  console.log('通过：终极BOSS、iPad奖励券、家长确认兑换与进度保存。')
  await finalContext.close()

  assert(errors.length === 0, `浏览器运行错误：${errors.join('；')}`)
  console.log('全部浏览器试玩检查通过，未发现页面运行错误。')
} finally {
  await browser.close()
  await server.close()
}
