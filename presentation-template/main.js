/* Local Reveal controller; each advance uses the native fragment lifecycle. */
const status = document.getElementById('status');
const scene = window.createFactory(document.getElementById('factory'), message => { status.textContent = message; });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const index = document.getElementById('index');
const slides = Array.from(document.querySelectorAll('.slides > section'));

function sync() {
  const slide = Reveal.getCurrentSlide();
  scene.setScene(slide.dataset.scene || 'signals');
  document.getElementById('counter').textContent = `${slides.indexOf(slide) + 1} / ${slides.length}`;
}
function updateMotion() {
  Reveal.configure({ transition: reduced.matches ? 'none' : 'slide' });
}
function updateSceneVisibility() {
  scene.setActive(!document.hidden && !index.open);
}
Reveal.on('slidechanged', sync);
Reveal.initialize({
  embedded: true, width: '100%', height: '100%', margin: 0,
  disableLayout: true, center: false, hash: true, controls: false,
  progress: false, overview: false, transition: reduced.matches ? 'none' : 'slide',
  transitionSpeed: 'default', keyboardCondition: () => !index.open,
  keyboard: { 70: () => document.getElementById('fullscreen').click(), 73: () => document.getElementById('open-index').click() }
}).then(() => { sync(); updateSceneVisibility(); });

slides.forEach((slide, position) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.textContent = slide.querySelector('h1, h2').textContent.replace(/\s+/g, ' ');
  button.addEventListener('click', () => { index.close(); Reveal.slide(position); });
  item.append(button);
  document.getElementById('index-list').append(item);
});
document.getElementById('previous').addEventListener('click', () => Reveal.prev());
document.getElementById('next').addEventListener('click', () => Reveal.next());
document.getElementById('open-index').addEventListener('click', () => { index.showModal(); updateSceneVisibility(); });
document.getElementById('close-index').addEventListener('click', () => index.close());
index.addEventListener('close', updateSceneVisibility);
document.getElementById('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { status.textContent = 'El navegador no permitió activar la pantalla completa.'; }
});
addEventListener('resize', () => { scene.resize(); Reveal.layout(); });
document.addEventListener('visibilitychange', updateSceneVisibility);
reduced.addEventListener('change', updateMotion);
addEventListener('beforeprint', () => scene.setActive(false));
addEventListener('afterprint', updateSceneVisibility);
