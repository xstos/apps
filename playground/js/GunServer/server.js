const Gun = require('gun');
const express = require('express')

const port = (process.env.PORT || 12345);

const app = express()
app.use(Gun.serve)
const server = app.listen(port)
const file =`${__dirname}\\gundb`
console.log(file)
const gun = Gun({ file: file, web: server })

