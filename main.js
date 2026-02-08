document.addEventListener('DOMContentLoaded', () => {
  
  const form = document.querySelector('.search-form');
  const input = document.querySelector('.search-input');
  const button = form.querySelector('.search-button');
  
  // Search engine configurations
  const searchEngines = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search?q='
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q='
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search?q='
    },
    yahoo: {
      name: 'Yahoo',
      url: 'https://search.yahoo.com/search?p='
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = input.value.trim();
    const searchEngine = document.getElementById('search-engine').value;
    
    // Show loading animation on button
    button.innerHTML = `
      <svg class="loading-spinner" viewBox="0 0 50 50" style="width: 20px; height: 20px;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="white" stroke-width="5" stroke-dasharray="60 20">
          <animateTransform 
            attributeName="transform" 
            type="rotate"
            from="0 25 25"
            to="360 25 25" 
            dur="1s"
            repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    button.disabled = true;

    try {
      // Add https:// if no protocol specified
      let finalUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (!url.includes('.') || url.includes(' ')) {
          finalUrl = searchEngines[searchEngine].url + encodeURIComponent(url);
        } else {
          finalUrl = 'https://' + url;
        }
      }

      // Enhanced URL handling for various services
      if (finalUrl.includes('google.com/search')) {
        finalUrl += '&safe=off&filter=0';
      } else if (finalUrl.includes('youtube.com')) {
        finalUrl = finalUrl.replace('youtube.com', 'youtube-nocookie.com');
      }

      // Create proxy URL with fallback proxies
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(finalUrl)}`,
        `https://cors-anywhere.herokuapp.com/${finalUrl}`,
        `https://api.codetabs.com/v1/proxy?quest=${finalUrl}`
      ];

      let content = null;
      let successfulProxy = null;

      // Try each proxy until one works
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) {
            content = await response.text();
            successfulProxy = proxyUrl;
            break;
          }
        } catch (err) {
          console.log(`Proxy ${proxyUrl} failed, trying next...`);
        }
      }

      if (!content) {
        throw new Error('All proxies failed');
      }

      // Enhanced content processing
      let modifiedContent = content;
      
      // Fix relative URLs
      modifiedContent = modifiedContent.replace(
        /(src|href)=["'](\/[^"']*|(?:(?!http|https|javascript|data:)[^"'])+)["']/gi,
        (match, attr, path) => {
          const base = new URL(finalUrl).origin;
          return `${attr}="${base}${path.startsWith('/') ? path : '/' + path}"`;
        }
      );

      // Fix dynamic scripts
      modifiedContent = modifiedContent.replace(
        /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
        (match, script) => {
          let newScript = script.replace(
            /window\.location/g,
            'window.parent.postMessage({type: "navigate", url: location.href}, "*")'
          );
          return `<script>${newScript}</script>`;
        }
      );

      // Add custom style fixes
      modifiedContent = `
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          img { max-width: 100%; height: auto; }
          video { max-width: 100%; }
        </style>
        ${modifiedContent}
      `;

      // Show the content
      const proxyFrame = document.getElementById('proxy-frame');
      proxyFrame.srcdoc = modifiedContent;
      
      document.querySelector('.proxy-container').style.display = 'none';
      proxyFrame.style.display = 'block';

      // Add frame message handling
      proxyFrame.addEventListener('message', (event) => {
        if (event.data.type === 'navigate') {
          input.value = event.data.url;
          form.dispatchEvent(new Event('submit'));
        }
      });

    } catch (error) {
      console.error('Proxy error:', error);
      button.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;">
          <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      `;
      setTimeout(() => {
        button.textContent = 'Go';
        button.disabled = false;
      }, 2000);
      
      alert('Failed to load page. Trying alternate proxy...');
    }
  });

  // Add home button functionality
  const homeButton = document.getElementById('home-button');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      document.querySelector('.proxy-container').style.display = 'flex';
      document.getElementById('proxy-frame').style.display = 'none';
      const extHangerContainer = document.querySelector('.ext-hanger-container');
      if (extHangerContainer) {
        extHangerContainer.style.display = 'none';
      }
    });
  }

  // Add settings button functionality 
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      document.querySelector('.settings-container').style.display = 'block';
    });
  }

  // Handle tab cloaking
  const tabCloakSelect = document.getElementById('tab-cloak');
  const cloakingOptions = {
    'classroom': {
      title: 'Google Classroom',
      icon: 'https://ssl.gstatic.com/classroom/favicon.png'
    },
    'docs': {
      title: 'Google Docs',
      icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
    },
    'blank': {
      title: '',
      icon: ''
    }
  };

  // Function to update tab appearance
  function updateTabAppearance(option) {
    const selected = cloakingOptions[option];
    if (selected) {
      document.title = selected.title;
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.type = 'image/x-icon';
      favicon.rel = 'icon';
      favicon.href = selected.icon;
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon);
      }
    }
  }

  // Helper function to adjust color brightness
  function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Handle theme customization
  function applyTheme(bgColor, buttonColor) {
    const gradientColor = `linear-gradient(45deg, ${buttonColor}, ${adjustColor(buttonColor, 30)})`;
    
    document.documentElement.style.setProperty('--button-gradient', gradientColor);
    document.body.style.background = bgColor;
    
    const buttons = document.querySelectorAll('.home-button, .settings-button, .ext-hanger-button, .search-button');
    buttons.forEach(button => {
      button.style.background = gradientColor;
    });
  }

  // Add ExtHanger button functionality
  const extHangerButton = document.getElementById('ext-hanger-button');
  if (extHangerButton) {
    extHangerButton.addEventListener('click', () => {
      // Hide other containers
      document.querySelector('.proxy-container').style.display = 'none';
      document.querySelector('.settings-container').style.display = 'none';
      document.getElementById('proxy-frame').style.display = 'none';
      
      // Create and show ExtHanger container if it doesn't exist
      let extHangerContainer = document.querySelector('.ext-hanger-container');
      if (!extHangerContainer) {
        extHangerContainer = document.createElement('div');
        extHangerContainer.className = 'ext-hanger-container';
        extHangerContainer.innerHTML = `
          <div class="ext-hanger-box">
            <h2>ExtHanger URL</h2>
            <div class="code-box">
              <pre><code>data:text/html;charset=utf-8,%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang%3D%22en%22%3E%0A%3Chead%3E%0A%20%20%3Cmeta%20charset%3D%22UTF-8%22%3E%0A%20%20%3Cmeta%20name%3D%22viewport%22%20content%3D%22width%3Ddevice-width%2C%20initial-scale%3D1.0%22%3E%0A%20%20%3Ctitle%3EExtHang3r%3C%2Ftitle%3E%0A%20%20%3Clink%20rel%3D%22shortcut%20icon%22%20type%3D%22image%2Fpng%22%20href%3D%22data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAANYAAADWCAYAAACt43wuAAAAAXNSR0IArs4c6QAAIABJREFUeF7tfQl4XEeV7l%2F3qlvyvsryInmJZUu3ZTu2ZSdYJhtDXhIIwxYgMxMcyBuYAfIeBGbeBHh8kzAPGF4yfJCQkGEJZIMkEEjIQhJiy5Yt2Y4ldcuSl0SSHe92tHer%2B573nSu1LVlL37X7dqvq%2B%2FrrKK46deqv%2Bru2c84JyCQRkAi4joBwXaIUKBGQCEASSw4CiYAHCEhieQCqFCkRkMSSY0Ai4AECklgegCpFSgQkseQYkAh4gIAklgegSpESAUksOQYkAh4gIInlAahSpERAEkuOAYmABwhIYnkAqhQpEZDEkmNAIuABApJYHoAqRUoEJLHkGJAIeICAJJYHoEqREgFJLDkGJAIeICCJ5QGoUqREQBJLjgGJgAcISGJ5AKoUKRGQxJJjQCLgAQKSWB6AOpbINcfWTIn1xgoVRSnWVX0mgDlCFyVCEbMAzNZJXyxIzFQVNQaBeJ6ad0oValxV1HcgEFOEckInvQfAcQj0KHHlaB7yusRkcXTq1Kkdz4nnomlsjqxqHAQksRwMj6WHlxYUoGC%2BCIj5gsQsXejzACxkcggh5hFoERHxfxeCsAhAwG51QggoQoGqqFCFCkVRjL%2BHJiFEJ4AeEDp06F0CokNAvEOgTp30s0IRnQlKnBQQnTr0E3pc78yjvLf1gN6xp3DPUbu6yXIjEZDEsjAqtFbtSghsERDXEGihGUVyPU%2F31m60%2FtVASPDS0lIsWWLpOacR8PC9Fd9fccqKKEx2O5jjC3YrcGION07VTKq%2Frq%2BoH%2FepVTuqe0qsUFvoSQLZihlgpzF%2BL3Pkc0fQ8WwHVFU1fLQ4gIydxIE4a2pqDNvAbInCZKed58vEAeMxBHe36jEI3NwQanjKkW5jFPaUWFqb1gCgwgvFs1Fm%2F9v9OHTVIei9OoqKirBq1SpbzUhaskMBljy%2BBJMv996J0paiLhZy2Tg3Ch03OQ0jPV7zvCMWQdXaNX5TJzsdg1wcFENFnf7haZz4txPG%2F2JLDD6Ct5L4wIKXgBzhNtst2a20m%2FO65FLSS6CP2A1rZlZnz4iltWkrADSbVWSi5OOL4sPvPWyEjrZyr8XLv4MHD6K9vd0gVXBJEMteWAZlclpOzfzRPewdwXaE9h%2Fs7BFCfNCO46JVADwjVvmR8g8IXfzWqkITIb%2FVey2epXj5x3sqTkyqRQ8sMmLAT7RkWGX0KHbCpHUJRdxYr9W%2Flg7MPCOW1qb9I4B%2FT0cjsq2OoWZOixcvNizfA4HAiGYwodiqgkNFG0kBZt86G4V3Fk6smeoiZGxcHp9WhHLjvtA%2Bfok0LckzYpW3l%2F%2BXIHFrWlqRhZUk77VYdb7TmjVr1rBTwq7uLnR2DBIKME7%2Fiu4qmhAHFWa604IFfKtIiOvq19Q3mZHrVh5PiFW2tWyaMls5jGlIXwhYtxBJk5zo%2FiiOf%2BM4erb3jHjqZ6gKTKi5d8z1%2F2shacItWY3hu8dLwvEDfDaoeer1Tp7jsdssT4ilVWsPQcVtWDDRrQRTdwsvCzv%2F2ImeXcMfJedZbOr1UyWhxoNwnMMMUuhMoC%2BwfO%2B6vedS94L7OVwnltatfRjAbwxV%2Benvae4rLSVKBM4jMEqMDMoj6JP0cGRxJGN3qK4SS%2FuztgAq9kFgwI2VQxcslINAIuAtAkMvjylIoAKOlEJdkZJIxn7W3SMWQZRvL%2F%2BDgLh%2BGIx8%2FznFW2CldIkAXx6TQqD8C89BJtREYfNCe8FgnCLqGrHKq8tvFxD3jVCIHVo5OJFrNTltsiw%2FURAgnTY0LWmqy0R7XRnuq7av0hKU4AaM%2FiYWnw3mvjlbJvpP1jkOAmwA3lTSNLDfT3NyTKzK2spAT6yHL97Wj6k73316E1IvzXDJ6rIKAYEvR4oj%2F5EJnR0TK1QduptAd6ZUno8zPH%2FjMaUWMsMEQoBA9zaVNFl%2BKcQNiBwRK7Q1dAUp9Mrg%2Bd%2F4%2BrDr0Tw3VJYyJAKmEXgmUhL5kOncLma0TazSHaXTA3rgDQBLTetTyLY5pnPLjBIBRwgQ6I2mkqa1joTYLGybWOXbyz8gyKL1OpOKySWTRCA9CJyLlERmpaeq4bXYJpZWrX0BsBE6ml%2BYka6PmejrCVlnfjx%2F1t5l6TdrckIsdglh1xBrSc5a1vCSuR0hoAhlbWNxI29Z0prsE2ub9igEPmFLWz56H%2Bl%2BZEuULCQRGA8BhZQPNi5uTLvDrX1iVWvV%2FCC8rW7ly2LpUGILOlnIGgIC4n%2BGS8IjLYKsibGc2wmx%2BDE5exH%2BuVaetbI%2Ffr9lwGWB9CIghPheuDj8lfTWatOCb9Daom%2FAWdxmYsNcawGKbFYki01kBATEr8Ml4ZvSjYGtGauspmyZklAOOVZWnhA6hlAKSIlAbaQksjFlLpcz2CJWxesVl%2BqqvtexLtIawzGEUkBKBFoiJZGVKXO5nMEWsVgHbZv2OgRsv9F6vh3ShtDlLpXiLkKgNVIScRYo3waktolVtrXsGkVR%2FmSjzuFF%2BACDY2PIJBHwAgGB45HiSNp9K2wTizEIbQ%2F9iYiucYyHjI3hGEIpYEwEMmLW5IhYZdvLNiukbHXcqXy2yLOW%2FTNGxypIATmLQG%2BkJJJ2N1tHxDJmrerQ8wS6znG3cNgPnrlkkgi4i4AeKYlwWKO0JjeIdRmB2IPYsSxj1pKXxmkdABOhssnHJwfrNtT1p7OtzsnAJ4TV2u8A3OhYcWmg6xhCKWAkAiJfTAvPC3elExt3iLVdWw9CrSuzlnSGTGf%2FT4i6SNDcpuKm0%2BlsrCvEYoW1ao2j4XAUXGeJfbXYIkMmiYBLCIgT4u%2FDleH7XRJnSoxrxCqvLl8tINgaw%2FnZngzyaarzZCaTCBwFkECtgLgzXBV%2B2WQpR9lcI9bgrPUYgI870ogL8xmOfFDBMYxSwCACxwAkjy4IL0LBnZFNkd1e4uMusXZoK5DAyxAocaz0dAAzHEuRAiQCwHEQYsNOrQkCjymk%2FO%2FGqsYDXkDkKrFYwbWvrJ0RDUZ%2FZNu7ONlK1oxnrbTfQHgBs5SZUQSOA4iNqkE%2FCA%2BKgPhm%2BLIwz2uuJdeJldQstC10Cwn6T0fzDgf4HHi3RCaJgH0ETgCIjlu8G4TvR%2FOj%2F%2FfQhkPv2K%2FoQknPiMVVaNs0tir%2BhSMreF4O8rJQJomAXQROAmC33NTpuUhV5H2ps6XO4SmxjOofhxoqCX2ViL5uO4SMvNtK3ZMyx9gInALQaxIggZsjmyJ8COcoeU%2BsQfXKtpZtUITyCASsO53xAT7fbUlzJ0edPWELWyEWcCw%2Fmq%2FtvcZZLMK0EYs7dc0ba6bEumPfFRB%2FZ7mT%2BeKYY7%2BnVWPLWsoCfkOADy14KaibV4xA9zdVNf29%2BRIjc2ZkmA6Gp37IcsBpGTbNSV9PvLI2SMUgCYhD4arwcieAZYRYrPCqHauKEpT4CQjWNovSKdJJf0%2BcsnwhzKeBFmaqIeDURaoiG5yAlTFiJZUObQt9lwR92XQjWGM%2BzOBANDJJBEZDID5IqoRteF6KVEWutV3aDzuWFa%2BvuCRPzTtoqRF8mMFRDOTlsSXYJkRm56RimB6PVEXshU8fBDnjMxbroVVrHLR%2BjaWOl4cZluCaEJl5hmIrC%2FszlQFT1h5eXNzJoW2hr5Oguyx3%2FlQAGXn9yLKmsoDXCLhEKlZTQNwTrgp%2FzYnKvpixQttCa0nQHlsNkS4mtmDLqUJMKj6o4GWgG0ngq5FNEX6mynbyBbEGl4OHLT27mmwyt4Dvt%2BRjdrYHQdYWZCL1AOh2kVS8FCT6bNPmph87wcVPxPoPAF%2By1Rg%2BxGDLDHmYYQu%2BrCrEsxOTiT%2BjW6w7bg4R3dS0uenXTgT5hljl1eVXCYhXbTeGj9%2F5GN43LbLdElnwYgT4Lopt%2FZhM5oxpHWGokPIXjZsbHUV59s8wfByqVqy9bdkaYyiEMjahowHlq8J0EZn47%2FSkqAJlYWNV4xkn1fmHWAPH7rsAOLrxNl6KTHvcUyddIMueR4CoF6K4AAAGLElEQVTJw35TPDPxDGXPasIpoE9FqiIfcSrEV8Qqry5vExDFThtlWGUwudhRUu67HMPpuQDeK%2FEBBJPJ4R2UC7p%2BJFIVecqpHP8QiyC07RqvoN073%2BPWJUnGRPNPa532W%2FaXZ1u%2B5CGEW8fkzlE5I2aIBeGKsONjEd8MtYrqitk6dO%2BCKnJLeQZLzmTOO0FKsIpA8kSPZ6e0Bnw2reiPIlWRz5nOPU5G3xBr1fZVWoISYTcalVIG2xoywfjjV2Ne3m8k9xhDf9F5aZtNDp%2BsO69DeHYaP%2B5Eym7zOgOBNjdVNVW7UY9viOXaQ3ZWUeGBmiSZe4vQC3sF%2FpVmkiT3DvzNhEkSJ%2FlvF%2BdJ1Q7%2BcWCC8Wfofyf%2FztTektvHROIPL6j8s8xLhejBSFWkNFUms%2F%2FuG2Jp27SbIfArs4p7ki8AYMrgkpGRYQIkP0kiJIly8WySHEBJ0niioAWhrP9opGPCJT9u9D63l0nEsxF%2F%2FLnESwmcIPGN8OYwx2VxJbkBrSuKaNXaFwF83xVhUog5BJLLyiTRmIhD%2F3u0YOFMJCZQckZyvM03p6rHuUiBstLN4J2%2BIVaoOnQ3ge70GEAp3goCPDqGko9nZSZS%2Bi5rrWjrJG91pCqy2YmAi8v6hlhatcZ2gmwvKJNEIB0IHBEQUQK1QuBHboQ8G6q0b4iFgXssfsDu%2FelAVdaREwjwwrR18GqZXRzPCRLnSKHjBOpVdKVVF3oUAkch0AnCaaVPORW%2BxvtH6PxDrGTc9%2FwoP2DnKEJOTgwZ2YixEOCD%2BxdI0DN6QH%2B2eUMzRw30XfIVsRidsh1laxRd2S4t%2Fnw3VjKnEOGUgHgWwNMdouOF9qp2s3FtM6az74jFSAw%2BqPDzjKEiK844AhzbD4SnCfRMpCqyFSJDJrk2kfAlsQxyVYfuI9DtNtsli2UnAnUAniHQ001VTfXZ2YQBrX1LrMraykBPrIcdH6uyGWCpuykE9kHBTZF3RVpM5c6CTL4llrHf2lq2UFEU%2FhXjKIIy5SYCz4iouCUdJ3XphM%2FXxGIgtG3alRB4yfYTQOlEU9ZlCQEBcXd4U%2Fhfsm3%2FZKaRvieWQa7t2h0gfM9Mg3IgD4cnYAcXjlKfq6lPkPhMeHP4F7nawKwg1uDM9ajjd40z04tsCNQ%2BGKP1jCBxnBTiv8%2FwhSUJahW6OIUETkeujDCpwPvLvv6%2BGwi0hYhu9LFzix1Ej0HHhyPvjuywUzhbymQNsfhtrf7u%2FhoAFb4El9AMgXuJ6BgUnCaF3kpQ4vSBdx3ocKKv4QAqdI4jvgWEdzmR5YOy1QEl8Il979rHPyw5nbKGWNwL5TXlK0VC7HT0YLj73XlcCPH1eX3zHnz1mlc99T4y2h8XWyDwSQCL3W%2BKJxLPENEjilAeDleF7UU79kQtb4VmFbEG91vvBeHzAuJSAl3iLTzjSu8k0HeCU4Lf3XfpPnY2T18iiLJtZVerQt1Cgj426EWWvvpT16QT6AUmU%2Bxs7JkD7zvgc9%2Fh1A2ymiPriDW0gZfUXjIjGAuuFRBrBQmO%2F752cKnILoteJXble6A%2F3v%2BNA1ce4Ec4M5oqaysn90R7PgqBLQDeM%2BhPnCmdDkLg4YAI%2FHQiLPfGAzmriTVaw0KNoSDOIQRgHQm6lL8B8PeMwcgLHD5%2FaHpz2F%2BE4wLivC2arui8RzKCNwoSugLlV246xLnJgDU71hT36%2F03gbBAQMwjQUUCYjqBFgHg5yOmu1nfoCw2in2CQA83VTW95oH8rBSZc8TKyl5Io9Ll28uXgjANAnMUKEy4aTp0JiA%2FLTEdhGISNEuQ4B%2BiJeNY51Tz7CT6xKO5drnrRndIYrmBYg7LCL0SmqoX6HOhYwEEpkNgPiVox%2F5379%2Bfw8123DRJLMcQSgESgZEISGLJUSER8AABSSwPQJUiJQKSWHIMSAQ8QEASywNQpUiJgCSWHAMSAQ8QkMTyAFQpUiIgiSXHgETAAwQksTwAVYqUCEhiyTEgEfAAAUksD0CVIiUCklhyDEgEPEBAEssDUKVIiYAklhwDEgEPEJDE8gBUKVIiIIklx4BEwAMEJLE8AFWKlAhIYskxIBHwAAFJLA9AlSIlApJYcgxIBDxA4P8DwBHwfEBEJz8AAAAASUVORK5CYII%3D%22%3E%0A%20%20%3Cscript%3E%0A%20%20%20%20document.addEventListener(%22DOMContentLoaded%22%2C%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20main%20%3D%20%22https%3A%2F%2Fraw.githubusercontent.com%2FBlobby-Boi%2FExtHang3r%2Frefs%2Fheads%2Fmain%2Findex.html%22%3B%0A%20%20%20%20%20%20const%20fallback%20%3D%20%22https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FBlobby-Boi%2FExtHang3r%2Findex.html%22%3B%0A%0A%20%20%20%20%20%20fetch(main)%0A%20%20%20%20%20%20%20%20.then(response%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20if%20(!response.ok)%20throw%20new%20Error(%22Primary%20URL%20failed%22)%3B%0A%20%20%20%20%20%20%20%20%20%20return%20response.text()%3B%0A%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%20%20%20%20.catch(()%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20return%20fetch(fallback).then(response%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(!response.ok)%20throw%20new%20Error(%22Fallback%20URL%20failed%22)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20response.text()%3B%0A%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%20%20%20%20.then(html%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20document.open()%3B%0A%20%20%20%20%20%20%20%20%20%20document.write(html)%3B%0A%20%20%20%20%20%20%20%20%20%20document.close()%3B%0A%20%20%20%20%20%20%20%20%7D)%0A%20%20%20%20%7D)%3B%0A%20%20%3C%2Fscript%3E%0A%3C%2Fhead%3E%0A%3C%2Fhtml%3E
        </code></pre>
            </div>
            <p>Copy this URL and paste it anywhere!</p>
            <button class="copy-button">Copy to Clipboard</button>
          </div>
        `;
        document.body.appendChild(extHangerContainer);

        // Add copy functionality
        const copyButton = extHangerContainer.querySelector('.copy-button');
        copyButton.addEventListener('click', () => {
          const code = extHangerContainer.querySelector('code').textContent;
          navigator.clipboard.writeText(code);
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy to Clipboard';
          }, 2000);
        });
      }
      extHangerContainer.style.display = 'flex';
    });
  }

  // Save settings
  document.getElementById('settings-save').addEventListener('click', () => {
    const tabCloak = tabCloakSelect.value;
    const bgColor = document.getElementById('bg-color').value;
    const buttonColor = document.getElementById('button-color').value;
    
    updateTabAppearance(tabCloak);
    applyTheme(bgColor, buttonColor);
    
    document.querySelector('.settings-container').style.display = 'none';
  });

  // Open in about:blank
  document.getElementById('blank-open').addEventListener('click', () => {
    const win = window.open('about:blank', '_blank');
    const doc = win.document;
    doc.write(`
      <html>
        <head>
          <title>${document.title}</title>
          ${document.head.innerHTML}
        </head>
        <body>
          ${document.body.innerHTML}
        </body>
      </html>
    `);
    doc.close();
  });

  // Cancel settings
  document.getElementById('settings-cancel').addEventListener('click', () => {
    document.querySelector('.settings-container').style.display = 'none';
  });
});