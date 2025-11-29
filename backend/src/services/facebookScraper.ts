import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export interface FacebookScrapeResult {
  title: string;
  description: string;
  price: number | null;
  images: string[];
  location: string | null;
  externalId?: string;
}

export const scrapeFacebookMarketplace = async (url: string): Promise<FacebookScrapeResult> => {
  const browser = await puppeteer.launch({
    headless: true,

    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").text().trim() ||
      "Unknown";

    const description =
      $("meta[property='og:description']").attr("content")?.trim() || "";

    // Price: try meta, then text fallback
    const priceMeta = $("meta[property='product:price:amount']").attr("content");
    let price: number | null = priceMeta ? Number(priceMeta) : null;

    if (!price) {
      const priceText = html.match(/\$[\s]*([0-9,]+)/);
      price = priceText ? Number(priceText[1].replace(/,/g, "")) : null;
    }

    const images: string[] = [];
    $("meta[property='og:image']").each((_, el) => {
      const img = $(el).attr("content");
      if (img) images.push(img);
    });

    const externalIdMatch = url.match(/item\/(\d+)/);
    const externalId = externalIdMatch?.[1];

    // Location is inconsistent in FB HTML
    const location =
      $("meta[property='place:location:latitude']").length > 0
        ? "Facebook Listing"
        : null;

    return {
      title,
      description,
      price,
      images: [...new Set(images)],
      location,
      externalId,
    };
  } finally {
    await browser.close();
  }
};
