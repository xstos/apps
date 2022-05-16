import ReactDOM = require('react-dom');
import './index.css';
import hyperactiv from 'hyperactiv'

const {observe, computed, dispose} = hyperactiv
let c=null
const app = <canvas style={{width:'100vw', height: '100vh'}} ref={(r)=>{
    c=r
}}>

</canvas>

ReactDOM.render(
    app,
    document.getElementById('root')
)
c.width=window.innerWidth
c.height=window.innerHeight
var ctx = c.getContext("2d");
ctx.scale(10,10)
ctx.font='48px sans serif'
ctx.strokeStyle = "#FF0000"
ctx.fillStyle = "#FF0000"
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();

function v() {
    ctx.fillText('YOOOOOO', 30,30)
}
v()
const foo = [
    ['text', 'the quick brown'],
    ['collision', {
        x: 'vw'
    }, 'vwcoll'],
    ['bind', 'text', 'vwcoll']

]

const obs = observe(foo)

function Render() {
    const metrics = ctx.measureText('y')
    let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    console.log({
        fontHeight,
        actualHeight
    })
}

Render()