import axios from "axios";
import { API_BASE_URL } from "./cars";

export const scrapeFacebook = async (url: string) => {
  const res = await axios.post(`${API_BASE_URL}/api/cars/scrape-facebook`, { url });
  return res.data.data;
};
