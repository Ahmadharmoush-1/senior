import { Request, Response } from "express";
import puppeteer from "puppeteer";

export const scrapeFacebook = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      const title = document.querySelector("h1")?.textContent || "";
      const price = document.querySelector("span[dir='auto']")?.textContent || "";
      const desc = document.querySelector("[data-ad-preview='message']")?.textContent || "";
      const images = [...document.querySelectorAll("img")].map((img) => img.src);

      return { title, price, desc, images };
    });

    await browser.close();
    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ message: "Scraping failed" });
  }
};
