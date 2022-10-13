import domtoimage from 'dom-to-image';

function toImage(node, callback) {
  domtoimage.toPng(node)
    .then(function (dataUrl) {
      var img = new Image();
      img.src = dataUrl;
      callback(image)
    })
    .catch(function (error) {
      console.error('dom-to-image error!', error);
    });
}