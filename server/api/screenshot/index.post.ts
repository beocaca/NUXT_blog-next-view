import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { getFileHashSync, uploadToR2, uuidv4 } from '~/composables/fileUpload'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body)
    return new Response('Bad Request, url require', { status: 400 })
  const url = body.url
  if (!url)
    return new Response('Bad Request, url require', { status: 400 })

  let browser
  try {
    // const endpoint = 'violet-browserless.zeabur.app';
    const endpoint = process.env.SCREEN_URL
    if (!endpoint)
      return new Response('SCREEN_URL is null, func disabled', { status: 400 })

    browser = await puppeteer.connect({
      browserWSEndpoint: `ws://${endpoint}`,
      defaultViewport: { width: 1600, height: 900 },
    })

    const page = await browser.newPage()
    // page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.goto(url)

    const file = await page.screenshot({
      type: 'webp',
      quality: 75,
      clip: {
        width: 1600,
        height: 900,
        x: 0,
        y: 0,
      },
    })

    browser.close()

    const publicDir = path.join(process.cwd(), 'public')
    const filePath = path.join(publicDir, `${uuidv4()}.png`)

    // 将 fs.writeFile 包装成 Promise
    const writeFilePromise = new Promise((resolve, reject) => {
      fs.writeFile(filePath, file, 'binary', (err) => {
        if (err) {
          console.error('save screen fail', err)
          reject(err)
        }
        else {
          const fileHash = getFileHashSync(filePath)
          const previewUrl = uploadToR2(filePath, `${fileHash}.png`, 'screenshot')
          console.warn('previewUrl:', previewUrl)
          resolve(previewUrl)
        }
      })
    })
    // 等待写入操作完成，并返回 previewUrl
    const previewUrl = await writeFilePromise

    return previewUrl
  }
  catch (error) {
    if (browser)
      browser.close()

    return new Response(error as string, { status: 500 })
  }
})
