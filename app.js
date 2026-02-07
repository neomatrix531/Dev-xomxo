/*
  Simple Web OS Dock with draggable windows:
  - Icons magnify based on pointer proximity (macOS-like).
  - Clicking an icon toggles a sample app window.
  - Windows can be dragged by their title bar using pointer events.
*/

const dock = document.getElementById('dock');
const items = Array.from(dock.querySelectorAll('.dock-item'));
const windows = Array.from(document.querySelectorAll('.window'));

/* -- App open/close logic -- */

/* Ensure window has usable left/top; if not, center it.
   Moved to top-level so other functions (openApp) can call it safely. */
function ensureWindowPosition(win){
  // if left/top are not set, center it
  if(!win.style.left && !win.style.top){
    // temporarily show to measure if hidden
    const wasHidden = win.classList.contains('hidden');
    if(wasHidden){
      win.classList.remove('hidden');
    }
    const rect = win.getBoundingClientRect();
    win.style.left = `${Math.round((window.innerWidth - rect.width)/2)}px`;
    win.style.top = `${Math.round((window.innerHeight - rect.height)/4)}px`;
    win.style.transform = 'none';
    if(wasHidden){
      win.classList.add('hidden');
    }
  }
}

function openApp(name){
  const win = windows.find(w=>w.dataset.app===name);
  if(!win) return;
  const isHidden = win.classList.contains('hidden');
  // hide other windows
  windows.forEach(w=>w.classList.add('hidden'));
  if(isHidden){
    ensureWindowPosition(win);
    win.classList.remove('hidden');
  } else {
    win.classList.add('hidden');
  }
}



/* -- Click to toggle apps -- */
items.forEach(it=>{
  it.addEventListener('click', e=>{
    const app = it.dataset.app;
    openApp(app);
  });
});

/* -- Magnification behavior -- */
const MAX_SCALE = 1.9; // maximum multiplier for icon size
const NEAR = 120;      // distance (px) at which magnification starts

function onPointerMove(e){
  const pointerX = e.clientX;
  items.forEach(it=>{
    const r = it.getBoundingClientRect();
    const centerX = r.left + r.width/2;
    const dist = Math.abs(pointerX - centerX);
    if(dist > NEAR){
      it.style.setProperty('--scale', 1);
      return;
    }
    const k = 1 - (dist / NEAR); // 0..1
    const s = 1 + (MAX_SCALE - 1) * easeOutCubic(k);
    it.style.setProperty('--scale', s.toFixed(3));
  });
}

function onPointerLeave(){
  items.forEach(it=>{
    it.style.setProperty('--scale', 1);
  });
}

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

dock.addEventListener('pointermove', onPointerMove);
dock.addEventListener('pointerleave', onPointerLeave);

/* -- Keyboard accessibility for dock -- */
let focusedIndex = -1;
dock.addEventListener('keydown', (e)=>{
  const key = e.key;
  if(key === 'ArrowRight' || key === 'ArrowLeft'){
    e.preventDefault();
    const dir = key === 'ArrowRight' ? 1 : -1;
    focusedIndex = Math.max(0, Math.min(items.length-1, (focusedIndex === -1 ? 0 : focusedIndex) + dir));
    items[focusedIndex].focus();
  } else if(key === 'Enter' || key === ' '){
    document.activeElement?.click();
  }
});

items.forEach(it => it.tabIndex = 0);

/* -- Preload icons (local icons folder expected) -- */
const iconNames = ['helios','penguinmod','waterbottle'];
const faviconMap = {
  helios: 'https://helios-browser.vercel.app/favicon.ico',
  penguinmod: 'https://penguinmod.com/favicon.ico',
  // waterbottle has no external icon; leave blank to avoid network fetch
  waterbottle: ''
};
iconNames.forEach(n=>{
  const img = new Image();
  img.src = faviconMap[n] || '';
});

/* -- Draggable windows using pointer events -- */
windows.forEach(win => {
  const title = win.querySelector('.title');
  if(!title) return;

  // Prevent traffic light buttons from starting a drag (they should be clickable separately)
  const trafficBtns = title.querySelectorAll('.traffic-btn');
  trafficBtns.forEach(btn=>{
    btn.addEventListener('pointerdown', (ev) => {
      // stop header drag initiation and let the button handle clicks
      ev.stopPropagation();
    });
    // Prevent pointer events on buttons from changing window focus/drag behavior
    btn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      // simple placeholder behaviors: close/minimize/maximize
      if(btn.classList.contains('red')){
        win.classList.add('hidden');
      } else if(btn.classList.contains('yellow')){
        // minimize -> move offscreen (simple visual)
        win.classList.add('hidden');
      } else if(btn.classList.contains('green')){
        // maximize toggle: store/restore previous geometry and fill viewport when maximized
        if(win.classList.contains('maximized')){
          // restore
          win.classList.remove('maximized');
          const prev = win.dataset.prevGeometry && JSON.parse(win.dataset.prevGeometry);
          if(prev){
            win.style.left = prev.left;
            win.style.top = prev.top;
            win.style.width = prev.width;
            win.style.height = prev.height;
            win.style.transform = prev.transform || '';
          } else {
            // fallback: clear inline sizing to let CSS decide
            win.style.left = '';
            win.style.top = '';
            win.style.width = '';
            win.style.height = '';
            win.style.transform = '';
          }
          delete win.dataset.prevGeometry;
        } else {
          // save current geometry
          const rect = win.getBoundingClientRect();
          const prev = {
            left: win.style.left || `${Math.round(rect.left)}px`,
            top: win.style.top || `${Math.round(rect.top)}px`,
            width: win.style.width || `${Math.round(rect.width)}px`,
            height: win.style.height || `${Math.round(rect.height)}px`,
            transform: win.style.transform || getComputedStyle(win).transform
          };
          win.dataset.prevGeometry = JSON.stringify(prev);

          // maximize to fill viewport with small padding so dock remains visible
          const pad = 8;
          const targetLeft = pad;
          const targetTop = pad;
          const targetWidth = Math.max(320, window.innerWidth - pad * 2);
          const targetHeight = Math.max(240, window.innerHeight - pad * 2);

          win.classList.add('maximized');
          // make sure window uses absolute pixels
          win.style.left = `${targetLeft}px`;
          win.style.top = `${targetTop}px`;
          win.style.width = `${targetWidth}px`;
          win.style.height = `${targetHeight}px`;
          win.style.transform = 'none';
        }
      }
    });
  });

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  title.addEventListener('pointerdown', (e) => {
    // Only respond to primary button
    if (e.button && e.button !== 0) return;
    // Make sure window has explicit positioning
    ensureWindowPosition(win);

    dragging = true;
    win.classList.add('dragging');
    // capture pointer so move/up events stay on this element
    title.setPointerCapture(e.pointerId);

    startX = e.clientX;
    startY = e.clientY;
    // parse current left/top
    origLeft = parseFloat(win.style.left || win.getBoundingClientRect().left);
    origTop = parseFloat(win.style.top || win.getBoundingClientRect().top);

    // raise window z-order by moving it to end of DOM
    win.parentElement.appendChild(win);
  });

  title.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = origLeft + dx;
    let newTop = origTop + dy;

    // clamp to viewport with some padding
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = win.getBoundingClientRect();
    newLeft = Math.min(Math.max(pad, newLeft), vw - rect.width - pad);
    newTop = Math.min(Math.max(pad, newTop), vh - rect.height - pad);

    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;
  });

  title.addEventListener('pointerup', (e) => {
    if(!dragging) return;
    dragging = false;
    win.classList.remove('dragging');
    try { title.releasePointerCapture(e.pointerId); } catch {}
  });

  title.addEventListener('pointercancel', (e) => {
    if(!dragging) return;
    dragging = false;
    win.classList.remove('dragging');
    try { title.releasePointerCapture(e.pointerId); } catch {}
  });

  // also support double/tap to center when opened: if user double clicks title, center window
  title.addEventListener('dblclick', () => {
    centerWindow(win);
  });
});

/* Utility: center a window on screen and set explicit left/top */
function centerWindow(win){
  const rect = win.getBoundingClientRect();
  const left = Math.round((window.innerWidth - rect.width) / 2);
  const top = Math.round((window.innerHeight - rect.height) / 4);
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  win.style.transform = 'none';
}

/* --- Custom cursor handling --- */
(function setupCustomCursor(){
  const cursor = document.getElementById('custom-cursor');
  if(!cursor) return;

  let visible = false;
  const showCursor = () => { cursor.style.opacity = '1'; visible = true; };
  const hideCursor = () => { cursor.style.opacity = '0'; visible = false; };

  // accept numeric x,y and append "px" here to avoid double "px" issues
  function moveTo(x, y){
    // small offset so the PNG "tip" appears where pointer is; adjust as needed
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }

  // pointer events (mouse, stylus, touch)
  window.addEventListener('pointermove', (e) => {
    moveTo(e.clientX, e.clientY);
    showCursor();
  }, {passive:true});

  // support touchmove for touch devices
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if(t) {
      moveTo(t.clientX, t.clientY);
      showCursor();
    }
  }, {passive:true});

  // hide when pointer leaves window (optional)
  window.addEventListener('pointerleave', hideCursor);
  window.addEventListener('blur', hideCursor);

  // ensure cursor is visible over iframes by keeping it at very high z-index
  // and preventing pointer capture; pointer-events:none was set in CSS so clicks pass through.

  // On initial load position cursor near center so it doesn't flash at 0,0
  requestAnimationFrame(() => {
    moveTo(window.innerWidth/2, window.innerHeight/2);
  });

  // keep cursor positioned correctly when page is resized (no jump)
  window.addEventListener('resize', () => {
    // nothing needed — the transform uses viewport coords provided by pointer events.
  });
})();

