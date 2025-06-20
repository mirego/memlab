const playerDestroy = {
  url: () => 'https://jasper.local/',

  action: async (page) => {
    const iterations = 1

    console.log(`15 seconds given to setup demo configuration...`);
    await delay(1000);

    console.log(`Starting ${iterations} iterations of Add and Remove actions...`);

    const clickButtonByText = async (page, textToMatch) => {
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate((btn) => btn.textContent.trim(), button);
        if (text === textToMatch) {
          console.log(`Found button: "${textToMatch}", clicking it...`);
          await button.click();
          return true;
        }
      }
      console.log(`Button with text "${textToMatch}" not found.`);
      return false;
    };

    for (let i = 0; i < iterations; i++) {
      console.log(`Iteration ${i + 1} of ${iterations}`);

      const added = await clickButtonByText(page, 'Add Player');
      if (added) await delay(5500);

      const removed = await clickButtonByText(page, 'Remove');
    }

    console.log('All iterations complete!');
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = playerDestroy;
