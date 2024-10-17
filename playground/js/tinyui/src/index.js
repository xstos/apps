//https://codesandbox.io/p/sandbox/wplqwc
var { html, reactive } = window.arrowJs;

var model = {
  progress: 0,
};

var upload = reactive(model);

function incrementProgress() {
  if (upload.progress >= 100) return;
  upload.progress++;
}
//make the template
var template = html`
  <progress value="${() => upload.progress}" max="100"></progress>
  <button @click="${() => (upload.progress = 0)}">reset</button>
`;

//insert template into dom
template(document.getElementById("app"));

setInterval(incrementProgress, 100);
