const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.use(cors());

app.get('/proxy-rusprofile', async (req, res) => {
  const inn = req.query.inn;
  const url = `https://www.rusprofile.ru/search?query=${inn}`;
  try {
    const response = await getRusprofileData(url);
    res.json(response);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.get('/proxy-zakupki', async (req, res) => {
  const num = req.query.num;
  const url = `https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=${num}`;
  try {
    const response = await getZakupkiData(url);
    res.json(response);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

async function getZakupkiData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const html = await page.content();

  const object = getObject(html);
  const nmc = getNmc(html);

  const data = {
    object,
    nmc
  }

  console.log(`запрос на ${url}:`);
  console.log(data)

  await browser.close();
  return data;
}

// поиск объекта закупки в разметке
function getObject(text) {
  const objectSearch = '<div class="registry-entry__body-value">'

  const index = text.indexOf(objectSearch, 0);
  const lastIndex = text.indexOf('</div>', index);
  return text.slice(index + objectSearch.length, lastIndex);
}

function getNmc(text) {
  const objectSearch = '<div class="price-block__value"'

  const index = text.indexOf(objectSearch, 0);
  const startIndex = text.indexOf('>', index)
  const lastIndex = text.indexOf('</div>', index);
  return text.slice(startIndex + 1, lastIndex).match(/[\d,]+/g).join('');
}

async function getRusprofileData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const html = await page.content();

  const foundationDate = getDate(html);
  const companyName = getName(html);

  const data = {
    foundationDate,
    companyName
  }
  console.log(`запрос на ${url}:`);
  console.log(data);

  await browser.close();
  return data;
}

// поиск имени организации в разметке
function getName(text) {  
  const nameSearchTerm = `<meta property="og:title"`;
  const index = text.indexOf(nameSearchTerm, 0);
  const lastIndex = text.indexOf('">', index);
  return text.slice(index + 35, lastIndex).replaceAll('&quot;', '"'); // 35 symbols after <meta...
}

// поиск даты основания в разметке
function getDate(text) {
  const dateSearchTerm = '<dd class="company-info__text" itemprop="foundingDate">'
  const index = text.indexOf(dateSearchTerm, 0);
  const dateSearchStart = index + dateSearchTerm.length;
  const dateSearchEnd = index + dateSearchTerm.length + 10; // 10 - date length
  return text.slice(dateSearchStart, dateSearchEnd);
}
