const puppeteer = require('puppeteer')

let convertURLToPDF = async (url, callback, options = null, puppeteerArgs = null, remoteContent = true) => {
  const browser = await puppeteer.launch({ headless: true })

  const page = await browser.newPage()
  if (!options) {
    options = { format: 'A4' }
  }
 console.log('url=' + url)
  if (remoteContent === true) {
    await page.goto(url, { waitUntil: 'networkidle0' })
  } else {
    // page.setContent will be faster than page.goto if html is a static
    await page.setContent('ERROR')
  }

  await page.pdf(options).then(callback, function (error) {
    console.log('error= ' + error)
  })
  await browser.close()
}

module.exports = convertURLToPDF
