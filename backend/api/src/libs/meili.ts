import { MeiliSearch } from "meilisearch";
import config from "../config/config";


export const meiliClient = new MeiliSearch({
  host: config.meilisearch.host,
  apiKey: config.meilisearch.apiKey,
});
