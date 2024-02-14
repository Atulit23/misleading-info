import puppeteer from 'puppeteer';
import { client } from "@gradio/client";
import express from "express"
const app = express();
const port = 3000;

app.use(express.json());

app.post('/compareDescriptions', async (req, res) => {
  try {
    const amazonUrl = req.body.amazonUrl;

    let includes = false;

    if (amazonUrl.includes('amazon')) {
      includes = true;
    }

    if (includes) {
      console.log(amazonUrl)
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(amazonUrl);

      // Amazon title
      const amazonTitleSelector = 'span#productTitle';

      await page.waitForSelector(amazonTitleSelector, { timeout: 5000 }); // Set a timeout of 5 seconds
      
      const amazonTitle = await page.$eval(amazonTitleSelector, element => element.textContent.trim());
      
      console.log(`Amazon Title: ${amazonTitle}`);

      // Amazon description
      const amazonDescSelector = '#feature-bullets';
      await page.waitForSelector(amazonDescSelector, { timeout: 2000 }); // Set a timeout of 5 seconds
      const amazonDesc = await page.$eval(amazonDescSelector, element => element.textContent.trim());
      console.log(`Amazon Description: ${amazonDesc}`);

      // Searching Flipkart for the product
      await page.goto(
        `https://www.flipkart.com/search?q=${amazonTitle
          .split(' ')
          .slice(0, 6)
          .join(' ')}`
      );

      const elements = await page.$$('._2rpwqI');
      let flipkart_url = '';

      for (const element of elements) {
        const textContent = await page.evaluate(
          (el) => el.getAttribute('href'),
          element
        );
        if (textContent.includes(amazonTitle.split(' ')[0].toLowerCase())) {
          flipkart_url = textContent;
          break;
        }
      }

      if (flipkart_url === '') {
        const elements = await page.$$('._1fQZEK');
        for (const element of elements) {
          const textContent = await page.evaluate(
            (el) => el.getAttribute('href'),
            element
          );
          if (textContent.includes(amazonTitle.split(' ')[0].toLowerCase())) {
            flipkart_url = textContent;
            break;
          }
        }
      }

      flipkart_url = 'https://www.flipkart.com' + flipkart_url;

      console.log(flipkart_url)

      // Finally getting product description from Flipkart
      await page.goto(flipkart_url);
      const final_elements = await page.$$('._2418kt');
      let flipkart_desc = '';

      for (const element of final_elements) {
        const textContent = await page.evaluate((el) => el.textContent, element);
        flipkart_desc = textContent;
      }

      const description_to_compare =
        'First description: ' +
        amazonDesc +
        ' Second Description: ' +
        flipkart_desc +
        ' As you can see I have provided you with two descriptions. Compare these two descriptions to see if for the same field some different information has been provided. Answer in yes or no.';

      const result = await app.predict('/predict', [description_to_compare]);
      let final_obj = {
        Amazon: amazonDesc,
        Flipkart: flipkart_desc,
      };

      if (result.data[0].includes('yes')) {
        final_obj['result'] =
          'Mismatch Detected between the descriptions at Amazon & Flipkart.';
      } else {
        final_obj['result'] =
          'No Mismatch Detected between the descriptions at Amazon & Flipkart.';
      }

      await browser.close();
      res.json(final_obj);
    } else {
      res.status(400).json({ error: 'Invalid URL' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});