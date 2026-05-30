import axios from 'axios';

const DEFAULT_INDEXNOW_KEY = 'a20961d6fbfe693634229b74144ab62e';
const DEFAULT_SITE_BASE = 'https://open-claw.id';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

type IndexNowResult = {
  submitted: number;
  status: number;
};

export function siteUrl(path: string) {
  const base = getSiteBase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function submitIndexNowUrlsInBackground(urls: string[]) {
  if (process.env.INDEXNOW_DISABLED === 'true') return;

  void submitIndexNowUrls(urls).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`IndexNow submission failed: ${message}`);
  });
}

export async function submitIndexNowUrls(urls: string[]): Promise<IndexNowResult | null> {
  if (process.env.INDEXNOW_DISABLED === 'true') return null;

  const { host, key, keyLocation } = getIndexNowConfig();
  const urlList = unique(urls.filter(Boolean));
  if (urlList.length === 0) return null;

  const response = await axios.post(
    INDEXNOW_ENDPOINT,
    {
      host,
      key,
      keyLocation,
      urlList,
    },
    {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      timeout: 5000,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 202,
    },
  );

  return {
    submitted: urlList.length,
    status: response.status,
  };
}

function getIndexNowConfig() {
  const key = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
  const siteBase = getSiteBase();
  const host = process.env.INDEXNOW_HOST || new URL(siteBase).host;
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${siteBase}/${key}.txt`;

  return { host, key, keyLocation };
}

function getSiteBase() {
  return cleanBaseUrl(
    process.env.INDEXNOW_SITE_BASE ||
      process.env.FRONTEND_BASE_URL ||
      DEFAULT_SITE_BASE,
  );
}

function cleanBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
