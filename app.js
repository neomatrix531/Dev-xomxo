/*
  Simple mobile-friendly WebOS shell with a draggable window that embeds
  https://helios-browser.vercel.app as the "Helios Browser" app.
*/

const HELIOS_URL = "https://helios-browser.vercel.app";
const PENGUIN_URL = "https://penguinmod.com";
const TERMINAL_URL = "https://terminal.usw-1.sealos.io/";
const NAUTILUS_URL = "https://nautius-os.vercel.app/";
const DEVBOX_URL = "https://devbox.usw-1.sealos.io/en";
const DAEDAL_URL = "https://dustinbrett.com/";
const PANG_URL = "/PangBrowser.html";
const SETTINGS_URL = "/"; // base for trying an icon (not required for settings content)


const windowContainer = document.getElementById("window-container");
const openBtn = document.getElementById("open-helios");
const openPenguin = document.getElementById("open-penguin");
const openTerminal = document.getElementById("open-terminal");
const openNautilus = document.getElementById("open-nautilus");
const openDevbox = document.getElementById("open-devbox");
const openDaedal = document.getElementById("open-daedal");
const openPang = document.getElementById("open-pangbrowser");
const openSettings = document.getElementById("open-settings");

const timeEl = document.getElementById("time");

// Utility to try likely favicon locations and replace the button content when found.
function setAppIcon(btn, baseUrl, accessibleName = "App") {
  if (!btn) return;
  const img = document.createElement("img");
  img.alt = accessibleName;
  img.style.width = "32px";
  img.style.height = "32px";
  img.style.objectFit = "contain";
  img.style.borderRadius = "6px";
  img.style.display = "block";
  img.style.flexShrink = "0";

  const candidates = [
    baseUrl.replace(/\/$/, "") + "/favicon.ico",
    baseUrl.replace(/\/$/, "") + "/favicon.png",
    baseUrl.replace(/\/$/, "") + "/favicon.svg"
  ];

  let tried = 0;
  function tryNext() {
    if (tried >= candidates.length) return;
    img.src = candidates[tried++];
    img.onload = () => {
      btn.innerHTML = "";
      btn.appendChild(img);
      const label = document.createElement("span");
      label.className = "icon-label";
      label.textContent = accessibleName;
      btn.appendChild(label);
    };
    img.onerror = tryNext;
  }
  tryNext();
}

 // Try to fetch favicons for apps (best-effort).
 setAppIcon(openBtn, HELIOS_URL, "Helios");
 setAppIcon(openPenguin, PENGUIN_URL, "PenguinMod");
 setAppIcon(openTerminal, TERMINAL_URL, "Terminal");
setAppIcon(openNautilus, NAUTILUS_URL, "Nautilus OS VM");
setAppIcon(openDevbox, DEVBOX_URL, "DevBox");
setAppIcon(openDaedal, DAEDAL_URL, "DaedalOS");
setAppIcon(openPang, PANG_URL, "PangBrowser");
setAppIcon(openSettings, SETTINGS_URL, "Settings");


function formatTime(){
  const d = new Date();
  return d.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"});
}
setInterval(()=> timeEl.textContent = formatTime(), 1000);
timeEl.textContent = formatTime();

openBtn.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='helios']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "helios", title: "Helios Browser", url: HELIOS_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});



openPenguin.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='penguin']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "penguin", title: "PenguinMod - Intranet", url: PENGUIN_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});

openTerminal.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='terminal']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "terminal", title: "Terminal", url: TERMINAL_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});

openNautilus.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='nautilus']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "nautilus", title: "Nautilus OS VM", url: NAUTILUS_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});

openDevbox.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='devbox']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "devbox", title: "DevBox", url: DEVBOX_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});

openDaedal.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='daedal']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "daedal", title: "DaedalOS", url: DAEDAL_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});

openPang.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='pangbrowser']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "pangbrowser", title: "PangBrowser - The Ultimate browser built for the web", url: PANG_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});

openSettings.addEventListener("click", () => {
  const existing = document.querySelector(".window[data-app='settings']");
  if (existing) { bringToFront(existing); return; }
  const win = createWindow({ appId: "settings", title: "Settings", url: SETTINGS_URL });
  windowContainer.appendChild(win);
  requestAnimationFrame(()=> bringToFront(win));
});



let zIndexCounter = 10;
function bringToFront(el){
  zIndexCounter++;
  el.style.zIndex = zIndexCounter;
  el.classList.add("active");
  // remove active from siblings
  document.querySelectorAll(".window").forEach(w=>{
    if(w!==el) w.classList.remove("active");
  });
}

function createWindow({appId, title, url}){
  const win = document.createElement("div");
  win.className = "window";
  win.setAttribute("data-app", appId);
  win.style.zIndex = ++zIndexCounter;

  // Titlebar
  const titlebar = document.createElement("div");
  titlebar.className = "titlebar";
  const ctrls = document.createElement("div");
  ctrls.className = "controls";
  const btnClose = document.createElement("span");
  btnClose.className = "ctrl close";
  const btnMin = document.createElement("span");
  btnMin.className = "ctrl min";
  const btnMax = document.createElement("span");
  btnMax.className = "ctrl max";
  ctrls.appendChild(btnClose);
  ctrls.appendChild(btnMin);
  ctrls.appendChild(btnMax);

  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.textContent = title;

  titlebar.appendChild(ctrls);
  titlebar.appendChild(titleEl);

  // Content
  const content = document.createElement("div");
  content.className = "content";

  // If this is the SealOS-deployed Firefox instance, show a warning banner inside the app window.
  if (appId === "firefox") {
    const warn = document.createElement("div");
    warn.style.position = "absolute";
    warn.style.left = "12px";
    warn.style.right = "12px";
    warn.style.top = "12px";
    warn.style.padding = "10px 12px";
    warn.style.background = "linear-gradient(90deg, rgba(255,90,54,0.12), rgba(255,200,120,0.06))";
    warn.style.color = "#ffd9c9";
    warn.style.border = "1px solid rgba(255,120,80,0.12)";
    warn.style.borderRadius = "10px";
    warn.style.zIndex = "20";
    warn.style.fontSize = "13px";
    warn.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";
    warn.textContent = "May be down because this person's SealOS deployment has a free trial for 7 days.";
    content.appendChild(warn);

    // push iframe content below the warning visually by adding padding-top
    content.style.paddingTop = "56px";
  }

  // Settings app: present a simple settings list (no iframe)
  if (appId === "settings") {
    // remove default iframe and replace with settings UI below (we will not append the iframe)
    const panel = document.createElement("div");
    panel.style.padding = "14px";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.gap = "12px";

    const header = document.createElement("div");
    header.style.fontSize = "15px";
    header.style.color = "#e6eef6";
    header.textContent = "Settings";

    panel.appendChild(header);

    // Note: sharing option removed
    const note = document.createElement("div");
    note.style.fontSize = "13px";
    note.style.color = "var(--muted)";
    note.textContent = "Sharing option has been removed.";
    panel.appendChild(note);

    // clear any iframe usage and append the settings panel
    content.innerHTML = "";
    content.appendChild(panel);

    // make sure we don't append the iframe below (return early)
    // but keep the rest of window setup (positioning etc.)
    // return the window element after creating non-iframe content
    // (we still allow container to append win)
    // skip creating the iframe further down
    // mark that we handled content
    win._handledContent = true;
  }

  // For settings we already replaced content above and marked it handled.
  if (!win._handledContent) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    // common permissions
    iframe.setAttribute("allow", "geolocation; microphone; camera; clipboard-read; clipboard-write; fullscreen; encrypted-media");
    iframe.setAttribute("loading", "lazy");

    // Force the iframe element itself to hide the native cursor so the follower stays visible.
    iframe.style.cursor = "none";
    // give iframe a low z-index so the fixed follower (very high z-index) is always on top.
    iframe.style.position = "relative";
    iframe.style.zIndex = "1";

    // Try to set cursor:none inside same-origin frames after they load (best-effort; will silently fail cross-origin).
    iframe.addEventListener("load", () => {
      try {
        if (iframe.contentDocument && iframe.contentDocument.documentElement) {
          iframe.contentDocument.documentElement.style.cursor = "none";
        }
      } catch (e) {
        // ignore cross-origin access errors
      }
    });

    content.appendChild(iframe);

    // Also ensure the window titlebar and control dots keep the native cursor hidden so only the PNG shows.
    // (titlebar & ctrl exist by this point)
    const tb = win.querySelector(".titlebar");
    if (tb) tb.style.cursor = "none";
    win.querySelectorAll(".ctrl").forEach(c => c.style.cursor = "none");
  }

  win.appendChild(titlebar);
  win.appendChild(content);

  // Controls behavior
  // Use pointerup for more reliable touch/mouse interaction and keep animations.
  btnClose.addEventListener("pointerup", ()=> {
    // Animate a graceful close similar to minimize then remove
    win.style.transition = "transform .18s ease, opacity .12s ease";
    win.style.transform = "scale(0.92) translateY(24px)";
    win.style.opacity = "0";
    // small delay to allow animation before removal
    setTimeout(()=> {
      if(win.parentNode) win.remove();
    }, 180);
  });
  btnMin.addEventListener("pointerup", ()=> {
    // animate shrink to dock
    win.style.transition = "transform .18s ease, opacity .12s ease";
    win.style.transform = "scale(0.9) translateY(30px)";
    win.style.opacity = "0.0";
    setTimeout(()=> {
      if(win.parentNode) win.remove();
    }, 180);
  });
  btnMax.addEventListener("pointerup", ()=> {
    if(win.classList.contains("max")){
      // restore
      win.classList.remove("max");
      win.style.left = win.dataset.prevLeft || "";
      win.style.top = win.dataset.prevTop || "";
      win.style.width = win.dataset.prevWidth || "";
      win.style.height = win.dataset.prevHeight || "";
      titlebar.style.cursor = "grab";
    } else {
      // save
      win.dataset.prevLeft = win.style.left;
      win.dataset.prevTop = win.style.top;
      win.dataset.prevWidth = win.style.width;
      win.dataset.prevHeight = win.style.height;
      win.classList.add("max");
      win.style.left = "2%";
      win.style.top = "4%";
      win.style.width = "96%";
      win.style.height = "92%";
    }
  });

  // Dragging (works for touch & mouse)
  let dragging = false;
  let startX=0, startY=0, startLeft=0, startTop=0;
  // Start dragging only when pointerdown happens outside the control buttons.
  // This prevents the titlebar from capturing pointer events when user taps the close/min/max dots.
  titlebar.addEventListener("pointerdown", (ev)=>{
    // if pointer started on a control, don't begin a drag here
    if (ev.target && ev.target.closest && ev.target.closest(".controls")) {
      return;
    }
    ev.preventDefault();
    bringToFront(win);
    dragging = true;
    try { titlebar.setPointerCapture(ev.pointerId); } catch(e){}
    startX = ev.clientX;
    startY = ev.clientY;
    // ensure px values
    const rect = win.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    // stop if maximized
    if(win.classList.contains("max")) return;
    win.style.transition = "none";
  });
  window.addEventListener("pointermove", (ev)=>{
    if(!dragging) return;
    if(win.classList.contains("max")) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;
    // clamp to viewport
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = win.offsetWidth, h = win.offsetHeight;
    newLeft = Math.max(6, Math.min(newLeft, vw - w - 6));
    newTop = Math.max(6, Math.min(newTop, vh - h - 6));
    win.style.left = newLeft + "px";
    win.style.top = newTop + "px";
    // store as inline style so restore can use it
  });
  window.addEventListener("pointerup", (ev)=>{
    if(dragging){
      dragging = false;
      try{ titlebar.releasePointerCapture(ev.pointerId) }catch(e){}
      win.style.transition = "";
    }
  });

  // Tap to focus
  win.addEventListener("pointerdown", ()=> bringToFront(win));

  // Positioning: center-ish with slight offset
  const vw = window.innerWidth, vh = window.innerHeight;
  const width = Math.min(920, Math.round(vw * 0.92));
  const height = Math.min(820, Math.round(vh * 0.76));
  const left = Math.round((vw - width) / 2);
  const top = Math.round((vh - height) / 2 - Math.min(40, vh*0.03));
  win.style.left = left + "px";
  win.style.top = top + "px";
  win.style.width = width + "px";
  win.style.height = height + "px";

  // Make window responsive to double-tap on title to maximize/restore
  titlebar.addEventListener("dblclick", ()=> btnMax.click());

  // Prevent iframe from swallowing gestures for our drag/tap interactions:
  // When pointerdown happens on titlebar we set pointer capture so it's fine.
  // For accessibility, allow keyboard to close app (Escape).
  win.tabIndex = 0;
  win.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") win.remove();
  });

  return win;
}

// Start with one sample app icon hint (no instructions shown per mobile guidelines)

// Custom visible cursor follower using the purple PNG.
// Creates an absolutely positioned img that follows pointer and touch coordinates.
// The follower ignores pointer events so it won't interfere with clicks/taps.
(function installCursorFollower(){
  const cursorImgPath = "/ChatGPT Image May 23, 2025, 08_32_09 PM.png";
  const follower = document.createElement("img");
  follower.src = cursorImgPath;
  follower.alt = "cursor";
  follower.style.position = "fixed";
  follower.style.zIndex = "2147483647";
  follower.style.width = "34px";
  follower.style.height = "34px";
  follower.style.pointerEvents = "none";
  follower.style.transform = "translate(-50%,-50%)";
  follower.style.transition = "transform 0.02s linear";
  follower.style.willChange = "transform, top, left";
  follower.style.display = "none"; // hidden until pointer moves
  document.body.appendChild(follower);

  let visible = false;
  let suppressBecauseOverControl = false;

  function setFollowerVisible(show){
    if(show && !suppressBecauseOverControl){
      follower.style.display = "block";
      visible = true;
    } else {
      follower.style.display = "none";
      visible = false;
    }
  }

  function updatePosition(x, y){
    follower.style.left = x + "px";
    follower.style.top = y + "px";

    // If pointer is over a window control (.ctrl), hide follower so clicks land reliably.
    const under = document.elementFromPoint(x, y);
    if(under && under.closest && under.closest(".ctrl")){
      suppressBecauseOverControl = true;
      setFollowerVisible(false);
    }else{
      suppressBecauseOverControl = false;
      if(!visible) setFollowerVisible(true);
    }
  }

  // Pointer moves (mouse, stylus, and many touch pointers)
  window.addEventListener("pointermove", (ev)=>{
    updatePosition(ev.clientX, ev.clientY);
  }, {passive:true});

  // For older touch events fallback (if any)
  window.addEventListener("touchmove", (ev)=>{
    if(ev.touches && ev.touches[0]){
      updatePosition(ev.touches[0].clientX, ev.touches[0].clientY);
    }
  }, {passive:true});

  // Hide follower when pointer leaves viewport and show again when enters
  window.addEventListener("pointerleave", ()=> {
    follower.style.display = "none";
    visible = false;
  });

  // On pointerdown temporarily hide the follower for hit-testing reliability, and add small scale feedback.
  // This ensures the follower never blocks or interferes with clicks/taps on underlying elements.
  window.addEventListener("pointerdown", (ev)=> {
    try{
      // hide immediately to guarantee underlying element receives the hit
      suppressBecauseOverControl = true;
      follower.style.display = "none";
      // small visual feedback later (non-blocking)
      follower.style.transition = "transform 0.08s";
      follower.style.transform = "translate(-50%,-50%) scale(0.92)";
    }catch(e){}
  }, {passive:true});

  // Restore follower on pointerup (slight delay to avoid stealing the event)
  window.addEventListener("pointerup", (ev)=>{
    setTimeout(()=> {
      // position at release point if available
      const x = (ev && typeof ev.clientX === "number") ? ev.clientX : null;
      const y = (ev && typeof ev.clientY === "number") ? ev.clientY : null;
      if(x !== null && y !== null){
        follower.style.left = x + "px";
        follower.style.top = y + "px";
        // check if pointer is currently over a control; if so keep hidden briefly
        const under = document.elementFromPoint(x, y);
        if(under && under.closest && under.closest(".ctrl")){
          suppressBecauseOverControl = true;
          follower.style.display = "none";
          visible = false;
          return;
        }
      }
      suppressBecauseOverControl = false;
      follower.style.display = "block";
      follower.style.transform = "translate(-50%,-50%) scale(1)";
      visible = true;
    }, 8);
  }, {passive:true});

  // Ensure the follower doesn't block focusability or accessibility:
  follower.setAttribute("aria-hidden", "true");
})();

// Ensure native cursor stays hidden while pointer is inside the app shell or over app icons/windows.
// Some macOS browsers will still show the system cursor in certain hover contexts; force it off
// on pointerenter and restore on pointerleave. Also make created iframes request a none cursor.
(function enforceHiddenNativeCursor(){
  const body = document.documentElement || document.body;

  // Helper to force none cursor on the document element
  function hideNativeCursor() { try{ body.style.cursor = "none"; }catch(e){} }
  function restoreNativeCursor() { try{ body.style.cursor = "none"; }catch(e){} } // keep none by default

  // Keep native cursor hidden on pointerenter for key areas
  document.addEventListener("pointerenter", (ev)=>{
    const target = ev.target;
    if (!target) return;
    // If entering an app icon, a window, the titlebar, or any control, force-hide native cursor
    if (target.closest && (target.closest(".app-icon") || target.closest(".window") || target.closest(".titlebar") || target.closest(".ctrl"))) {
      hideNativeCursor();
    }
  }, {passive:true});

  // Also hide when pointer moves anywhere inside desktop - prevents flicker on macOS
  document.getElementById("desktop").addEventListener("pointermove", hideNativeCursor, {passive:true});

  // When new windows are created ensure their iframe element explicitly sets cursor:none
  const origCreateWindow = createWindow;
  window.createWindow = function(opts){
    const win = origCreateWindow(opts);
    // find iframe inside and set its style to none to reduce native cursor bleed when hovering over iframe element
    const iframe = win.querySelector("iframe");
    if(iframe){
      iframe.style.cursor = "none";
      // also add pointer listeners to keep document cursor none while interacting
      iframe.addEventListener("pointerenter", hideNativeCursor, {passive:true});
      iframe.addEventListener("pointermove", hideNativeCursor, {passive:true});
    }

    // also ensure the window's titlebar and controls keep the native cursor hidden
    const titlebar = win.querySelector(".titlebar");
    if(titlebar){
      titlebar.style.cursor = "none";
      titlebar.addEventListener("pointerenter", hideNativeCursor, {passive:true});
    }
    win.querySelectorAll(".ctrl").forEach(c=>{
      c.style.cursor = "none";
      c.addEventListener("pointerenter", hideNativeCursor, {passive:true});
    });

    return win;
  };

  // For existing app-icon buttons, enforce pointer listeners too (dock icons)
  document.querySelectorAll(".app-icon").forEach(btn=>{
    btn.addEventListener("pointerenter", hideNativeCursor, {passive:true});
    btn.addEventListener("pointermove", hideNativeCursor, {passive:true});
    btn.addEventListener("pointerleave", hideNativeCursor, {passive:true});
  });
})();