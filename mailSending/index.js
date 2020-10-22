
require('dotenv').config({ path: '../config/.env' })
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const convertHTMLToPDF = require('pdf-puppeteer')
const convertURLToPDF = require('pdf-puppeteer')
const app = express()
const router = express.Router()
const nodemailer = require('nodemailer')
const request = require('request')
const options = { csv: true }

const transporter = nodemailer.createTransport({
  host: process.env.mailHost,
  port: process.env.mailPort,
  secure: false,
  auth: {
    user: process.env.mailUserAuth,
    pass: process.env.passUserAuth
  }
})

// prevent cors issue for the test html by file ref
// don't use in production
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,[content-type]'
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
app.use(express.json())

// Example PDF route, can be used with the postman profile
// to test different option configurations, for example:
// changing the remoteContent option to false will allow the "GiantPDF"
// to load faster, but without the remote images.
router.route('/chart').post(async function (req, res) {
  // to download to loacl filesystem with custom name pass a
  // "path" option. see the page.pdf docs for more info
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
  console.log('antes de la llamada a convertURLToPDF')
  let result = await convertURLToPDF(
    'http://localhost:3000/alertsLastWeekHtmlWithMap',
    pdf => {
      res.setHeader('Content-Type', 'application/pdf')

      nodemailer.createTestAccount((err, account) => {
        if (err) {
          console.log(err)
          return err
        }

        let mailOptions = {
          from: 'travel@geoboxtraveltracker.com', // sender address
          to: 'ivan.espin@mcimanager.com',
          subject: 'Test of fcc reports',
          html: 'Test of fcc reports',
          attachments: [{ // binary buffer as an attachment
            filename: 'testFcc.pdf',
            content: pdf
          }]
        }

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error)
          }
          console.log('Correo enviado')
        })
      })
      res.status(200).send('OK')
    },
    null,
    null,
    true
  ).catch(err => {
    console.log(err)
    res.status(500).send(err)
  })
})

router.route('/csv').post(async function (req, response) {
  //console.log(req.body)
  let url = process.env.urlReportsService + process.env.portReportsService + '/'
  let objBody = req.body
  let report = objBody.report
  let computedUrl = url + report

  console.log('url:' + computedUrl)
  request(computedUrl, options, (error, res, body) => {
    if (error) {
      console.log(error)
      return response.status(500).send(error)
    }

    if (!error && res.statusCode == 200) {
      nodemailer.createTestAccount((err, account) => {
        if (err) {
          console.log(err)
        }

        let mailOptions = {
          from: process.env.mailOptionsFrom, // sender address
          to: 'ivan.espin@mcimanager.com',
          subject: 'Test of fcc reports',
          html: 'Test of fcc reports',
          attachments: [{ // binary buffer as an attachment
            filename: 'testFcc.csv',
            content: body
          }]
        }
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error)
            return response.status(500).send(error)
          }
          console.log('Correo enviado a ivan.espin@mcimanager.com')
          return response.status(200).send('Mail sent')
        })
      })
    }
  })
  console.log('configuro email csv')
})

// Example PDF route, can be used with the postman profile
// to test different option configurations, for example:
// changing the remoteContent option to false will allow the "GiantPDF"
// to load faster, but without the remote images.
router.route('/pdf').post(async function (req, res) {
  // to download to loacl filesystem with custom name pass a
  // "path" option. see the page.pdf docs for more info
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
  convertHTMLToPDF(
    req.body,
    pdf => {
      res.setHeader('Content-Type', 'application/pdf')
      res.send(pdf)
    },
    null,
    null,
    true
  ).catch(err => {
    console.log(err)
    res.status(500).send(err)
  })
  console.log('tengo result')
})

app.use(
  bodyParser.text({
    limit: '50mb'
  })
)

app.use('/api', router)

// Start the server.
var port = process.env.port || 3001
http.createServer(app).listen(port)
console.log('Server listening on port ' + port)
// console.log('.env numero: ' + process.env.numero)
