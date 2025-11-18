import { MeiliSearch } from "meilisearch";
import config from "../config/config";
import prisma from "./db";


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


export const addTrackToMeiliIndex = async (trackId: string) => {
  try {
    const index = meiliClient.index('tracks');
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        artist: true,
        album: true,
        genre: true,
      },
    });

    if (!track) {
      return null;
    }

    const trackData = {
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      album: track.album ? track.album.title : null,
      genre: track.genre ? track.genre.name : null,
      releaseDate: track.releaseDate,
      tags: track.tags,
      description: track.description,
    };

    const response = await index.addDocuments([trackData]);
    console.log("Track added to MeiliSearch index:", response);
  } catch (error) {
    console.error("Error adding track to MeiliSearch index:", error);
  }
}


export default meiliClient;
