import axios from "axios";
import { API_BASE_URL } from "./cars";

export interface FacebookPreview {
  title: string;
  description: string;
  price: number | null;
  images: string[];
  location: string | null;
  externalId?: string;
}

export const previewFacebook = async (url: string) => {
  const res = await axios.post(`${API_BASE_URL}/api/scrape/facebook/preview`, { url });
  return res.data as FacebookPreview;
};

export const importFacebook = async (url: string, token: string) => {
  const res = await axios.post(
    `${API_BASE_URL}/api/scrape/facebook/import`,
    { url },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
