var express = require('express')
var app = express()

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

var cors = require('cors')
const fs = require('fs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(cors())
// app.options('*', cors()) // include before other routes

app.use(express.static('public'))

app.post('/mic/:id', function (req, res) {
  console.log(req.params['id']);
  var filename = './' + new Date().getTime() + '.webm';
  var data = Buffer.from(req.body.data.replace('data:audio/webm;codecs=opus;base64,', ''), 'base64');
  console.log(filename);
  console.log(req.body.data);
  console.log(data.length, data);
  fs.writeFileSync(filename, data, "binary");
  res.send('POST request to the homepage');
})

app.listen(9999);