import { MeiliSearch } from "meilisearch";
import config from "../config/config";


const meiliClient = new MeiliSearch({
  host: config.meilisearch.host,
  apiKey: config.meilisearch.apiKey,
});


// check MeiliSearch connection
export const checkMeiliConnection = async () => {
  try {
    const health = await meiliClient.health();
    console.log("MeiliSearch is healthy:", health);
  } catch (error) {
    console.error("Error connecting to MeiliSearch:", error);
  }
};

export default meiliClient;
