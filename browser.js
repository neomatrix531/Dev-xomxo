// We've setup Playwright on the window
// Connect to an existing browser instance using the Chrome DevTools Protocol (CDP)

(async () => {
  try {
    // Connect to the browser over CDP
    const browser = await window.playwright.chromium.connectOverCDP(window.connectionString);

    console.log('✅ Connected to browser');

    // Get the default context (usually already open in Chrome)
    const contexts = browser.contexts();
    const context = contexts.length > 0 ? contexts[0] : await browser.newContext();
// We've setup Playwright on the window
const browser = await window.playwright.chromium.connectOverCDP(window.connectionString);
    // Create or attach to a page
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    // Navigate somewhere
    await page.goto('https://example.com');

    // Do something on the page
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Take a screenshot
    await page.screenshot({ path: 'example.png' });
    console.log('📸 Screenshot saved as example.png');

    // Optionally close the connection (not the actual Chrome instance)
    await browser.close();
    console.log('🔌 Disconnected from browser');
  } catch (error) {
    console.error('❌ Error connecting to browser:', error);
  }
})();
