import { chromium } from 'playwright-core'
import { preview } from 'vite'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await preview({ root, logLevel: 'error', preview: { host: '127.0.0.1', port: 0 } })
const address = server.httpServer.address()
if (!address || typeof address === 'string') throw new Error('无法获取离线测试端口')
const browser = await chromium.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true })

try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'networkidle' })
  await page.locator('.home-copy h1').waitFor()
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload({ waitUntil: 'networkidle' })
  const cached = await page.evaluate(async () => (await caches.keys()).includes('star-island-v1'))
  if (!cached) throw new Error('离线缓存未建立')
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.home-copy h1').waitFor({ timeout: 10000 })
  await page.locator('.home-actions .primary-cta').click()
  await page.locator('.level-intro-card').waitFor()
  console.log('正式版离线检查通过：缓存建立成功，断网后可打开首页并进入关卡。')
  await context.close()
} finally {
  await browser.close()
  await server.close()
}
