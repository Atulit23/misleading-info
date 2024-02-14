import puppeteer from 'puppeteer';
import { client } from "@gradio/client";

const app = await client("https://atulit23-google-flan-t5.hf.space/");
const flipkartBase = 'https://www.flipkart.com/search?q=';
const amazonUrl = 'https://www.amazon.in/Samsung-inches-Crystal-iSmart-UA43CUE60AKLXL/dp/B0C1GX5RVW/ref=sr_1_1';
let includes = false;

if (amazonUrl.includes("amazon")) {
  includes = true;
}

// B_NuCI -->  title class for flipkart
// https://www.amazon.in/s?k= --> amazon url for searching products

(async () => {
console.log(includes)
  if (includes) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(amazonUrl);

    // Amazon title
    // const amazonTitleSelector = '#productTitle';
    // const amazonTitle = await page.$eval(amazonTitleSelector, element => element.textContent.trim());
    // console.log(`Amazon Title: ${amazonTitle}`);

    const amazonTitleSelector = 'span#productTitle';

    await page.waitForSelector(amazonTitleSelector, { timeout: 5000 });
    
    const amazonTitle = await page.$eval(amazonTitleSelector, element => element.textContent.trim());
    
    console.log(`Amazon Title: ${amazonTitle}`);

    // Amazon description
    const amazonDescSelector = '#feature-bullets';
    await page.waitForSelector(amazonDescSelector, { timeout: 2000 }); 
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

    const description_to_compare = "First description: " + amazonDesc + " " + "Second Description: " + flipkart_desc + " As you can see I have provided you with two descriptions. Compare these two descriptions to see if for the same field some different information has been provided. Answer in yes or no."

    console.log(description_to_compare)

    const result = await app.predict("/predict", [		
        description_to_compare, 
    ]);
    let final_obj = {"Amazon": amazonDesc, "Flipkart": flipkart_desc}

    if(result.data[0].includes("yes")) {
        final_obj["result"] = "Mismatch Detected between the descriptions at Amazon & Flipkart."
    } else {
        final_obj["result"] = "No Mismatch Detected between the descriptions at Amazon & Flipkart."
    }
    console.log(final_obj);
    await browser.close();
  }
})();