import { describe, expect, it } from "vitest";

import { localizeEnvDescription } from "./env-metadata";

const CJK = /[㐀-鿿]/;

/** The tool, browser, media and memory credentials the Keys page lists. */
const LISTED_KEYS: [string, string][] = [
  ["FIRECRAWL_API_KEY", "Firecrawl API key for web search and scraping"],
  ["EXA_API_KEY", "Exa API key for AI-native web search and contents"],
  ["PARALLEL_API_KEY", "Parallel API key for AI-native web search and extract"],
  ["FIRECRAWL_API_URL", "Firecrawl API URL for self-hosted instances (optional)"],
  ["TAVILY_API_KEY", "Tavily API key for AI-native web search and extract"],
  ["PERPLEXITY_API_KEY", "Perplexity API key for the Search API web backend"],
  ["SEARXNG_URL", "URL of your SearXNG instance for free self-hosted web search"],
  ["BRAVE_SEARCH_API_KEY", "Brave Search API subscription token"],
  ["BROWSERBASE_API_KEY", "Browserbase API key for cloud browser"],
  ["BROWSER_USE_API_KEY", "Browser Use API key for cloud browser"],
  ["FAL_KEY", "FAL API key for image and video generation"],
  ["KREA_API_KEY", "Krea API key for Krea 2 image generation"],
  ["ELEVENLABS_API_KEY", "ElevenLabs API key for premium text-to-speech voices"],
  ["GITHUB_TOKEN", "GitHub token for Skills Hub"],
  ["HONCHO_API_KEY", "Honcho API key for AI-native persistent memory"],
  ["HINDSIGHT_API_KEY", "Hindsight API key for graph-aware persistent memory"],
  ["SUPERMEMORY_API_KEY", "Supermemory API key for conversation-scoped persistent memory"],
  ["MEM0_API_KEY", "Mem0 Platform API key for semantic persistent memory"],
  ["RETAINDB_API_KEY", "RetainDB API key for persistent memory"],
  ["BRV_API_KEY", "ByteRover API key"],
  ["OPENVIKING_ENDPOINT", "OpenViking server URL"],
];

describe("dashboard environment descriptions", () => {
  it("localizes every credential the Keys page lists", () => {
    for (const [key, english] of LISTED_KEYS) {
      const localized = localizeEnvDescription(key, english, "zh");
      expect(localized, key).not.toBe(english);
      expect(CJK.test(localized), key).toBe(true);
    }
  });

  it("keeps unknown keys and non-Chinese locales verbatim", () => {
    expect(localizeEnvDescription("MY_CUSTOM_VAR", "Some custom text", "zh")).toBe("Some custom text");
    expect(localizeEnvDescription("FIRECRAWL_API_KEY", "Firecrawl API key", "en")).toBe("Firecrawl API key");
  });
});
