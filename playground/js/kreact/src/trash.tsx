//http://gotocon.com/dl/goto-amsterdam-2014/slides/SergiMansilla_ConqueringTimeWithFunctionalReactiveProgramming.pdf
var mouseup = fromEvent(dragTarget, 'mouseup');
var mousemove = fromEvent(document, 'mousemove');
var mousedown = fromEvent(dragTarget, 'mousedown');
var mousedrag = mousedown.selectMany(md => {
  var startX = md.clientX + window.scrollX,
    startY = md.clientY + window.scrollY,
    startLeft = parseInt(md.target.style.left, 10) || 0,
    startTop = parseInt(md.target.style.top, 10) || 0;
  // Calculate delta with mousemove until mouseup
  return mousemove.map(mm => {
    mm.preventDefault();
    return {
      left: startLeft + mm.clientX - startX,
      top: startTop + mm.clientY - startY
    };
  }).takeUntil(mouseup);
});
subscription = mousedrag.subscribe(pos => {
  dragTarget.style.top = pos.top + 'px';
  dragTarget.style.left = pos.left + 'px';
});