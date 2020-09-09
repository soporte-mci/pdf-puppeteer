const express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    convertHTMLToPDF = require('pdf-puppeteer'),
    convertURLToPDF = require('pdf-puppeteer')
    ;

const app = express();
const router = express.Router();
const nodemailer = require('nodemailer');


const request = require('request');

let url = 'http://localhost:3000/dailyReport'

let options = {csv: true};



// prevent cors issue for the test html by file ref
// don't use in production
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,[content-type]'
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});



// Example PDF route, can be used with the postman profile
// to test different option configurations, for example:
// changing the remoteContent option to false will allow the "GiantPDF"
// to load faster, but without the remote images.
router.route('/chart').post(async function(req, res) {
  // to download to loacl filesystem with custom name pass a
  // "path" option. see the page.pdf docs for more info
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
  console.log('antes de la llamada a convertURLToPDF')
  let result = await convertURLToPDF(
      'http://localhost:3000/alertsLastWeekHtmlWithMap',
      pdf => {
          res.setHeader('Content-Type', 'application/pdf');
          console.log('typeof pdf ' + typeof pdf)

          nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.1and1.es',
                port: 25,
                secure: false,
                auth: {
                    user: 'travel@geoboxtraveltracker.com',
                    pass: 'Soporte1234'
                }
            });
            let mailOptions = {
              from: 'travel@geoboxtraveltracker.com', // sender address
              to: 'ivan.espin@mcimanager.com',
              subject: 'Test of fcc reports',
              html: 'Test of fcc reports',
              attachments: [{ // binary buffer as an attachment
                filename: 'testFcc.pdf',
                content: pdf
              }]      
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Correo enviado a antonio@mcimanager.com' );
             // 
            });    
          
          });

          res.send(pdf);
      },
      null,
      null,
      true
  ).catch(err => {
      console.log(err);
      res.status(500).send(err);
  });
  console.log('despues de la llamada a convertURLToPDF')
  //var pdfGenerated = Buffer.concat(result)



  console.log('configuro email')
  // console.log('res= ' )
  // console.log(res)
  
});



router.route('/csv').post(async function(req, res) {
  
  request(url, options, (error, res, body) => {
    if (error) {
        return  console.log(error)
    };

    if (!error && res.statusCode == 200) {
        // do something with JSON, using the 'body' variable

        nodemailer.createTestAccount((err, account) => {
          let transporter = nodemailer.createTransport({
              host: 'smtp.1and1.es',
              port: 25,
              secure: false,
              auth: {
                  user: 'travel@geoboxtraveltracker.com',
                  pass: 'Soporte1234'
              }
          });
          let mailOptions = {
            from: 'travel@geoboxtraveltracker.com', // sender address
            to: 'ivan.espin@mcimanager.com',
            subject: 'Test of fcc reports',
            html: 'Test of fcc reports',
            attachments: [{ // binary buffer as an attachment
              filename: 'testFcc.csv',
              content: body
            }]      
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Correo enviado a ivan.espin@mcimanager.com' );
           // 
          });    
        
        });        
    };
  });

  console.log('configuro email csv')
  // console.log('res= ' )
  // console.log(res)
  
});




// Example PDF route, can be used with the postman profile
// to test different option configurations, for example:
// changing the remoteContent option to false will allow the "GiantPDF"
// to load faster, but without the remote images.
router.route('/pdf').post(async function(req, res) {
    // to download to loacl filesystem with custom name pass a
    // "path" option. see the page.pdf docs for more info
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
    convertHTMLToPDF(
        req.body,
        pdf => {
            res.setHeader('Content-Type', 'application/pdf');
            console.log('Antes de hacer el send del pdf')
            res.send(pdf); 
            console.log('Despues de hacer el send del pdf')            
        },
        null,
        null,
        true
    ).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
    console.log('tengo result')
    
          
    

})


// Test route
router.route('/ping').get(async function(req, res) {
    res.send('Hello World');
});

app.use(
    bodyParser.text({
        limit: '50mb'
    })
);

app.use('/api', router);

// Start the server.
var port = 3001;
http.createServer(app).listen(port);
console.log('Server listening on port ' + port)
