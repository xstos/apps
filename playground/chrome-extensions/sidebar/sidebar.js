var sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.innerHTML = '<div id="floating-button">Button</div>';
document.body.appendChild(sidebar);

// Add styles to the floating button
var floatingButton = document.getElementById('floating-button');
floatingButton.style.backgroundColor = 'blue';
floatingButton.style.color = 'white';
floatingButton.style.width = '100px';
floatingButton.style.height = '50px';
floatingButton.style.position = 'absolute';
floatingButton.style.right = '10px';
floatingButton.style.bottom = '10px';
floatingButton.style.cursor = 'pointer';
floatingButton.style.textAlign = 'center';
floatingButton.style.lineHeight = '50px';

// Make the floating button draggable
floatingButton.addEventListener('mousedown', function(event) {
  var initialX = event.clientX;
  var initialY = event.clientY;
  var initialButtonX = parseFloat(floatingButton.style.right);
  var initialButtonY = parseFloat(floatingButton.style.bottom);
  var dragging = true;
  
  document.addEventListener('mouseup', function() {
    dragging = false;
  });
  
  document.addEventListener('mousemove', function(event) {
    if (dragging) {
      var newX = event.clientX;
      var newY = event.clientY;
      var deltaX = newX - initialX;
      var deltaY = newY - initialY;
      floatingButton.style.right = (initialButtonX - deltaX) + 'px';
      floatingButton.style.bottom = (initialButtonY - deltaY) + 'px';
    }
  });
});
