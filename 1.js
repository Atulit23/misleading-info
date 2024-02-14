const puppeteer = require('puppeteer');

const flipkartBase = 'https://www.flipkart.com/search?q=';
const amazonUrl = 'https://www.amazon.in/Samsung-inches-Crystal-iSmart-UA43CUE60AKLXL/dp/B0C1GX5RVW/ref=sr_1_1';
let includes = false;

if (amazonUrl.includes("amazon")) {
  includes = true;
}

// B_NuCI -->  title class for flipkart
// https://www.amazon.in/s?k= --> amazon url for searching products

(async () => {
  if (includes) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(amazonUrl);

    // Amazon title
    const amazonTitleSelector = 'span#productTitle';

    await page.waitForSelector(amazonTitleSelector, { timeout: 5000 }); // Set a timeout of 5 seconds
    
    const amazonTitle = await page.$eval(amazonTitleSelector, element => element.textContent.trim());
    
    console.log(`Amazon Title: ${amazonTitle}`);

    // Amazon description
    const amazonDescSelector = 'div#feature-bullets';
    const amazonDesc = await page.$eval(amazonDescSelector, element => element.textContent.trim());
    console.log(`Amazon Description: ${amazonDesc}`);

    // Searching Flipkart for the product
    await page.goto(`${flipkartBase}${amazonTitle.split(" ").slice(0, 6).join(" ")}`);
    console.log(`${flipkartBase}${amazonTitle.split(" ").slice(0, 6).join(" ")}`)

    const elements = await page.$$('._2rpwqI');
    var flipkart_url = ''
    for (const element of elements) {
        const textContent = await page.evaluate(el => el.getAttribute('href'), element);
        if(textContent.includes(amazonTitle.split(" ")[0].toLowerCase())) {
            flipkart_url = textContent
            console.log(textContent)
            break
        }
    }

    if(flipkart_url === '') {
        // _1fQZEK\
        const elements = await page.$$('._1fQZEK');
        var flipkart_url = ''
        for (const element of elements) {
            const textContent = await page.evaluate(el => el.getAttribute('href'), element);
            if(textContent.includes(amazonTitle.split(" ")[0].toLowerCase())) {
                flipkart_url = textContent
                console.log(textContent)
                break
            }
        }
    }

    flipkart_url = 'https://www.flipkart.com' + flipkart_url

    // finally getting product description from flipkart
    await page.goto(flipkart_url)
    const final_elements = await page.$$('._2418kt')
    var flipkart_desc = ''
    for (const element of final_elements) {
        const textContent = await page.evaluate(el => el.textContent, element);
        flipkart_desc = textContent
    }

    console.log("Flipkart Desc: ", flipkart_desc)

    

    await browser.close();
  }
})();
