const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'series');
console.log(dir)
fs.readdir(dir,{}, (err,files)=>{
    files.filter((f)=>f.endsWith('.json')).forEach(f=>{
        const data = fs.readFileSync(dir+'\\'+ f)
        const parsed = JSON.parse(data)
        debugger
    })

})