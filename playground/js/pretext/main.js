import {prepare, layout, prepareWithSegments, layoutWithLines} from 'https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.5/+esm'
await document.fonts.ready
const bigtxt = await (await fetch('big.txt')).text();
window.bigtxt = bigtxt
var txt = "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. How vexingly quick daft zebras jump!"
txt="A"
const prepared = prepareWithSegments(txt, '')

const l = layout(prepared, 200, 20)
//var e = getEl("foo")
//e.innerHTML = txt

prepared.segments.forEach((seg, i) => {
    console.log(`[${prepared.kinds[i]}] "${seg}" — ${prepared.widths[i].toFixed(1)}px`)
})
window.prep=prepared
window.lay = l

const container = document.createElement('div');
container.className = 'character-grid';
document.body.appendChild(container);

// Generate 1500 character divs
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
const totalDivs = 12000;

// Use DocumentFragment for batch DOM insertion
const fragment = document.createDocumentFragment();

for (let i = 0; i < totalDivs; i++) {
    const div = document.createElement('div');
    div.className = 'character';
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    div.textContent = randomChar;
    //fragment.appendChild(div);
}

container.appendChild(fragment);

const grid = document.querySelector('.character-grid');

//console.log(document.body.offsetWidth)
addEventListener("resize", (event) => {
    const computedStyle = getComputedStyle(grid);
// Get explicit grid definitions
    const gridTemplateColumns = computedStyle.gridTemplateColumns;
    const gridTemplateRows = computedStyle.gridTemplateRows;

// Parse the number of columns/rows from template
    const columns = gridTemplateColumns.split(' ').length;
    const rows = gridTemplateRows.split(' ').length;
    console.log(columns,rows)

})