const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 8080;

app.post("/getBooks", async (req, res) => {
  try {
    let ISBN = req.body.ISBN;
    if (ISBN.length == 13) {
      console.log(ISBN);
      let data = await getBookData(ISBN);

      if (data) {
        res.json({
          bookName: data.bookName,
          author: data.author,
          publish: data.publish,
          ISBN: ISBN,
        });
      } else {
        res.json({
          message: "Error",
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

app.get("/hello", (req, res) => {
  console.log(res);
  res.json({
    message: "Hello",
  });
});

app.listen(port, () => {
  console.log(`Express Server started on port ${port}`);
});

const getBookData = async (ISBN) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  await page.goto("http://isbn.ncl.edu.tw/NEW_ISBNNet/");
  await page.select("[name='FO_SearchField0']", "ISBN");
  await page.type("#searchbook", ISBN);
  await (await page.$("#searchbook")).press("Enter");
  await page.waitForNavigation();
  const bookData = await page.evaluate(async () => {
    const bookName = document
      .querySelector("td[aria-label='書名'] a")
      .textContent.replaceAll(",", ";");
    const author = document.querySelector("td[aria-label='作者']").textContent;
    const publish = document.querySelector(
      "td[aria-label='出版者'] font"
    ).textContent;

    return {
      bookName,
      author,
      publish,
    };
  });

  browser.close();
  return bookData;
};
