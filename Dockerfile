FROM dorowu/ubuntu-desktop-lxde-vnc
USER root

# ===============================
# OS Branding
# ===============================
RUN echo "XomxoOS" > /etc/hostname && \
    sed -i 's/Ubuntu/XomxoOS/g' /etc/os-release || true

# ===============================
# Core + WebView + Compositor
# ===============================
RUN apt-get update && apt-get install -y \
    python3 python3-gi \
    gir1.2-gtk-3.0 \
    webkit2gtk-4.0 gir1.2-webkit2-4.0 \
    picom \
    nginx openssl \
    curl wget ca-certificates gnupg \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# Google Chrome
# ===============================
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y google-chrome-stable

# ===============================
# WebView App Runtime
# ===============================
RUN mkdir -p /opt/os-apps
RUN cat << 'EOF' > /opt/os-apps/webview_app.py
#!/usr/bin/env python3
import gi, sys
gi.require_version("Gtk", "3.0")
gi.require_version("WebKit2", "4.0")
from gi.repository import Gtk, WebKit2

title, url = sys.argv[1], sys.argv[2]
win = Gtk.Window(title=title)
win.set_default_size(1280, 720)
web = WebKit2.WebView()
web.load_uri(url)
win.add(web)
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
EOF
RUN chmod +x /opt/os-apps/webview_app.py

# ===============================
# Fake Login Screen (Student Gate)
# ===============================
RUN cat << 'EOF' > /opt/os-apps/login.py
#!/usr/bin/env python3
import gi
gi.require_version("Gtk", "3.0")
from gi.repository import Gtk
def unlock(btn): Gtk.main_quit()
w = Gtk.Window(title="XomxoOS Student Login")
w.set_default_size(400,200)
b = Gtk.Button(label="Login as Student")
b.connect("clicked", unlock)
w.add(b); w.show_all(); Gtk.main()
EOF
RUN chmod +x /opt/os-apps/login.py

# ===============================
# Desktop Apps
# ===============================
RUN mkdir -p /home/ubuntu/Desktop

# PenguinMod
RUN echo '[Desktop Entry]
Name=PenguinMod
Exec=/opt/os-apps/webview_app.py PenguinMod https://penguinmod.com
Icon=/usr/share/icons/xomxo/penguin.png
Type=Application
Terminal=false' > /home/ubuntu/Desktop/PenguinMod.desktop

# Scratch Loader GX
RUN echo '[Desktop Entry]
Name=Scratch Loader GX
Exec=/opt/os-apps/webview_app.py "Scratch Loader GX" https://kabez.itch.io/scratch-loader-gx
Icon=/usr/share/icons/xomxo/scratch.png
Type=Application
Terminal=false' > /home/ubuntu/Desktop/ScratchLoaderGX.desktop

# Browser.lol (isolated cloud browser)
RUN echo '[Desktop Entry]
Name=Cloud Browser
Exec=/opt/os-apps/webview_app.py "Cloud Browser" https://browser.lol
Icon=/usr/share/icons/xomxo/browser.png
Type=Application
Terminal=false' > /home/ubuntu/Desktop/BrowserLOL.desktop

# Chrome
RUN echo '[Desktop Entry]
Name=Google Chrome
Exec=google-chrome --no-sandbox
Icon=google-chrome
Type=Application
Terminal=false' > /home/ubuntu/Desktop/Chrome.desktop

RUN chmod +x /home/ubuntu/Desktop/*.desktop && \
    chown -R ubuntu:ubuntu /home/ubuntu/Desktop

# ===============================
# Custom Icons
# ===============================
RUN mkdir -p /usr/share/icons/xomxo
# (replace these with your real PNGs later)
RUN cp /usr/share/icons/Adwaita/64x64/apps/web-browser.png /usr/share/icons/xomxo/browser.png && \
    cp /usr/share/icons/Adwaita/64x64/apps/utilities-terminal.png /usr/share/icons/xomxo/penguin.png && \
    cp /usr/share/icons/Adwaita/64x64/apps/accessories-text-editor.png /usr/share/icons/xomxo/scratch.png

# ===============================
# Mac-style Dock + Blur
# ===============================
RUN mkdir -p /home/ubuntu/.config/lxpanel/LXDE/panels
RUN cat << 'EOF' > /home/ubuntu/.config/lxpanel/LXDE/panels/panel
Global {
  edge=bottom
  allign=center
  widthtype=percent
  width=60
  height=56
  transparent=1
  alpha=70
  autohide=1
}
Plugin {
  type=launchbar
  Config {
    Button { id=/home/ubuntu/Desktop/PenguinMod.desktop }
    Button { id=/home/ubuntu/Desktop/ScratchLoaderGX.desktop }
    Button { id=/home/ubuntu/Desktop/BrowserLOL.desktop }
    Button { id=/home/ubuntu/Desktop/Chrome.desktop }
  }
}
EOF
RUN chown -R ubuntu:ubuntu /home/ubuntu/.config

# ===============================
# HTTPS + Domain Masking (NGINX)
# ===============================
RUN openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/xomxo.key \
  -out /etc/ssl/certs/xomxo.crt \
  -subj "/CN=xomxo.local"

RUN cat << 'EOF' > /etc/nginx/sites-enabled/default
server {
  listen 443 ssl;
  ssl_certificate /etc/ssl/certs/xomxo.crt;
  ssl_certificate_key /etc/ssl/private/xomxo.key;
  location / {
    proxy_pass http://localhost:6080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF

# ===============================
# Boot Flow
# ===============================
ENV RESOLUTION=1366x768
ENV VNC_PASSWORD=
EXPOSE 443 5900

CMD /opt/os-apps/login.py && service nginx start && /startup.sh
