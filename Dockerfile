FROM dorowu/ubuntu-desktop-lxde-vnc

USER root

# ===============================
# OS Branding
# ===============================
RUN echo "XomxoOS" > /etc/hostname && \
    sed -i 's/Ubuntu/XomxoOS/g' /etc/os-release || true

# ===============================
# Core + WebView stack
# ===============================
RUN apt-get update && apt-get install -y \
    python3 \
    python3-gi \
    gir1.2-gtk-3.0 \
    webkit2gtk-4.0 \
    gir1.2-webkit2-4.0 \
    curl \
    wget \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# Google Chrome
# ===============================
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable

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

title = sys.argv[1]
url = sys.argv[2]

win = Gtk.Window(title=title)
win.set_default_size(1280, 720)
win.set_position(Gtk.WindowPosition.CENTER)

webview = WebKit2.WebView()
webview.load_uri(url)

win.add(webview)
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
EOF

RUN chmod +x /opt/os-apps/webview_app.py

# ===============================
# Desktop Apps
# ===============================
RUN mkdir -p /home/ubuntu/Desktop

RUN cat << 'EOF' > /home/ubuntu/Desktop/PenguinMod.desktop
[Desktop Entry]
Name=PenguinMod
Exec=/opt/os-apps/webview_app.py PenguinMod https://penguinmod.com
Icon=applications-graphics
Type=Application
Terminal=false
EOF

RUN cat << 'EOF' > /home/ubuntu/Desktop/ScratchLoaderGX.desktop
[Desktop Entry]
Name=Scratch Loader GX
Exec=/opt/os-apps/webview_app.py "Scratch Loader GX" https://kabez.itch.io/scratch-loader-gx
Icon=applications-games
Type=Application
Terminal=false
EOF

RUN cat << 'EOF' > /home/ubuntu/Desktop/Proxy.desktop
[Desktop Entry]
Name=Web Proxy
Exec=/opt/os-apps/webview_app.py "Web Proxy" https://hecka-browser.vercel.app
Icon=applications-internet
Type=Application
Terminal=false
EOF

RUN cat << 'EOF' > /home/ubuntu/Desktop/Docs.desktop
[Desktop Entry]
Name=Docs
Exec=/opt/os-apps/webview_app.py Docs https://docs.google.com
Icon=applications-office
Type=Application
Terminal=false
EOF

RUN chmod +x /home/ubuntu/Desktop/*.desktop && \
    chown -R ubuntu:ubuntu /home/ubuntu/Desktop

# ===============================
# Mac-Style Dock (LXPanel)
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
  alpha=60
  autohide=1
  heightwhenhidden=2
}

Plugin {
  type=launchbar
  Config {
    Button { id=/home/ubuntu/Desktop/PenguinMod.desktop }
    Button { id=/home/ubuntu/Desktop/ScratchLoaderGX.desktop }
    Button { id=google-chrome.desktop }
    Button { id=/home/ubuntu/Desktop/Proxy.desktop }
    Button { id=/home/ubuntu/Desktop/Docs.desktop }
  }
}

Plugin { type=tray }
Plugin { type=clock }
EOF

RUN chown -R ubuntu:ubuntu /home/ubuntu/.config

# ===============================
# noVNC
# ===============================
ENV RESOLUTION=1366x768
ENV VNC_PASSWORD=

EXPOSE 6080 5900
CMD ["/startup.sh"]
