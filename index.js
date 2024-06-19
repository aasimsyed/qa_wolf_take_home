const { chromium } = require('playwright');

async function getArticleTimes(page) {
  return await page.$$eval('.age', times =>
    times.map(time => new Date(time.title).getTime())
  );
}

async function saveHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News "newest" page
  await page.goto('https://news.ycombinator.com/newest');

  let articleTimes = [];
  while (articleTimes.length < 100) {
    // Get the list of article times on the current page
    const timesOnPage = await getArticleTimes(page);
    articleTimes = articleTimes.concat(timesOnPage);

    // Click on the "More" link to load more articles
    const moreLink = await page.$('.morelink');
    if (!moreLink) {
      break;
    }
    await moreLink.click();
    await page.waitForTimeout(2000);
  }

  // Validate the articles are sorted from newest to oldest
  for (let i = 1; i < articleTimes.length; i++) {
    if (articleTimes[i] > articleTimes[i - 1]) {
      console.error('Articles are not sorted correctly.');
      await browser.close();
      process.exit(1);
    }
  }

  console.log('Articles are sorted correctly.');
  await browser.close();
}

(async () => {
  await saveHackerNewsArticles();
})();
