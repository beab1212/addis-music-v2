import prisma from "../libs/db";


const trackAndArtistSelect = `
  t."id",
  t."title",
  t."durationSec",
  t."audioUrl",
  t."artistId",
  t."albumId",
  t."genreId",
  t."coverUrl",
  t."trackNumber",
  t."releaseDate",
  t."description",
  t."credit",
  t."tags",
  t."popularity",
  t."createdAt",
  a."id" AS "artistId",
  a."name" AS "artistName",
  a."bio" AS "artistBio",
  a."isVerified" AS "artistIsVerified",
  a."imageUrl" AS "artistImageUrl",
  a."genres" AS "artistGenres",
  a."country" AS "artistCountry",
  a."createdAt" AS "artistCreatedAt",`;

const organizeTracksWithArtist = (tracks: any[]) => {
  return tracks.map((track) => ({
    id: track.id,
    title: track.title,
    durationSec: track.durationSec,
    audioUrl: track.audioUrl,
    artist: {
      id: track.artistId,
      name: track.artistName,
      bio: track.artistBio,
      isVerified: track.artistIsVerified,
      imageUrl: track.artistImageUrl,
      genres: track.artistGenres,
      country: track.artistCountry,
      createdAt: track.artistCreatedAt,
    },
    albumId: track.albumId,
    genreId: track.genreId,
    coverUrl: track.coverUrl,
    trackNumber: track.trackNumber,
    releaseDate: track.releaseDate,
    description: track.description,
    credit: track.credit,
    tags: track.tags,
    popularity: track.popularity,
    createdAt: track.createdAt,
    score: track.score, // Include the cosine similarity score
  }));
}


// The function to fetch similar tracks
export const getSimilarTracks = async (
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0,) => {

  // if user has no vectors(history)
  if (userMetaVector.length === 0 || userAudioVector.length === 0) {
    const latestTracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return latestTracks;
  }

  const options = [];

  // If userMetaVector is non-empty, push it to options
  if (userMetaVector && userMetaVector.length > 0) {
    options.push(userMetaVector);
  }

  // If userAudioVector is non-empty, push it to options
  if (userAudioVector && userAudioVector.length > 0) {
    options.push(userAudioVector);
  }

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
     ${trackAndArtistSelect}
    
      ${userMetaVector.length > 0 && userAudioVector.length > 0 ? `
      -- cosine similarity metadata
        (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.6 +
        -- cosine similarity audio
        (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.4 AS "score"
    ` : userMetaVector.length > 0 ? `
      1 - (t."embeddingVector" <-> CAST($1 AS vector)) AS "score"
    ` : `
      1 - (t."sonicEmbeddingVector" <-> CAST($1 AS vector)) AS "score"
    `}

    FROM "Track" t
    JOIN "Artist" a ON t."artistId" = a."id"  -- Join the Artist table
    ORDER BY "score" DESC
    LIMIT $3
    OFFSET $4;
  `, ...options, limit, offset);

  return organizeTracksWithArtist(results);
};


export const getTrendingNow = async (
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0) => {

  // if user has no vectors(history)
  if (userMetaVector.length === 0 || userAudioVector.length === 0) {
    const latestTracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return latestTracks;
  }

  // const tradingTracks: any = await prisma.$queryRawUnsafe(`
  //   SELECT 
  //     ${trackAndArtistSelect}
    
  //     -- cosine similarity metadata
  //       (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.6 +
  //       -- cosine similarity audio
  //       (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.4 AS "score"

  //   FROM "Track" t
  //   ORDER BY "score" DESC
  //   LIMIT $3
  //   OFFSET $4;
  // `, userMetaVector, userAudioVector, limit, offset);

  // return tradingTracks;
}

