const fs = require('fs'),
  cors = require('cors'), //https://expressjs.com/en/resources/middleware/cors.html
  http = require('http'),
  https = require('https'),
  express = require('express');

const dbPath = __dirname + '/db/db.json';
const port = 8000;

const options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
};

const app = express();
app.use(cors())
app.use(express.json());

const server = https.createServer(options, app)
  .listen(port, () => {
  console.log("Express server listening on port " + port);
});

app.get('/', (req, res) => {
  res.writeHead(200);
  res.end("hello world\n");
});

app.get('/api/db', (req, res) => {
  res.sendFile(dbPath)
});

app.post('/api/db',  (req, res) => {
  console.log("post",req.url, req.body)
  if (req.body && req.body.todos) {
    fs.writeFileSync(dbPath, JSON.stringify(req.body))
  } else {
    console.log("bad data")
  }
  res.end()
})
