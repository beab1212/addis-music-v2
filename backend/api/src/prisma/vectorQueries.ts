import prisma from "../libs/db";
import { queryEmbedding } from '../utils/helpers';


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
  a."createdAt" AS "artistCreatedAt",

  COUNT(ph."id")::INT AS "playCount"
`;

const albumAndArtistSelect = `
  a."id",
  a."title",
  a."coverUrl",
  a."releaseDate",
  a."credit",
  a."description",
  a."createdAt",

  ar."id" AS "artistId",
  ar."name" AS "artistName",
  ar."bio" AS "artistBio",
  ar."isVerified" AS "artistIsVerified",
  ar."imageUrl" AS "artistImageUrl",
  ar."genres" AS "artistGenres",
  ar."country" AS "artistCountry",
  ar."createdAt" AS "artistCreatedAt"
`;


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
    playCount: track.playCount, // ✅ NEW
    score: track.score,

    createdAt: track.createdAt,
  }));
};

const organizeAlbumsWithArtist = (albums: any[]) => {
  return albums.map((album) => ({
    id: album.id,
    title: album.title,
    coverUrl: album.coverUrl,
    releaseDate: album.releaseDate,
    credit: album.credit,
    description: album.description,

    artist: {
      id: album.artistId,
      name: album.artistName,
      bio: album.artistBio,
      isVerified: album.artistIsVerified,
      imageUrl: album.artistImageUrl,
      genres: album.artistGenres,
      country: album.artistCountry,
      createdAt: album.artistCreatedAt,
    },

    createdAt: album.createdAt,
  }));
};



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
      ${trackAndArtistSelect},

      ${
        userMetaVector.length > 0 && userAudioVector.length > 0
          ? `
          (
            (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.7 +
            (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.3
          ) AS "score"
        `
          : userMetaVector.length > 0
          ? `
          (1 - (t."embeddingVector" <-> CAST($1 AS vector))) AS "score"
        `
          : `
          (1 - (t."sonicEmbeddingVector" <-> CAST($1 AS vector))) AS "score"
        `
      }

    FROM "Track" t
    JOIN "Artist" a 
      ON t."artistId" = a."id"

    LEFT JOIN "PlayHistory" ph
      ON ph."trackId" = t."id"

    GROUP BY
      t."id",
      a."id"

    ORDER BY "score" DESC
    LIMIT $3
    OFFSET $4;
  `, ...options, limit, offset);

  return organizeTracksWithArtist(results);
};

// The function to fetch similar-sounding tracks
export const getSimilarSoundingTracks = async (
  userAudioVector?: number[],
  limit: number = 10,
  offset: number = 0,
) => {
  const SONIC_VECTOR_DIM = 512; // UPDATE THIS to your actual embedding dimension!
  const MAX_COSINE_DISTANCE = 0.1; // Tuned for good perceptual similarity
  // Tune between 0.25–0.40 depending on how strict you want similarity


  // Fallback: no vector provided
  if (!Array.isArray(userAudioVector) || userAudioVector.length === 0) {
    const latestTracks = await prisma.track.findMany({
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return latestTracks;
  }

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      ${trackAndArtistSelect},
      (1 - (t."sonicEmbeddingVector" <=> $1::vector(${SONIC_VECTOR_DIM}))) AS similarity
    FROM "Track" t
    JOIN "Artist" a 
      ON t."artistId" = a."id"

    LEFT JOIN "PlayHistory" ph
      ON ph."trackId" = t."id"
    
    WHERE t."sonicEmbeddingVector" IS NOT NULL
      AND t."sonicEmbeddingVector" <=> $1::vector(${SONIC_VECTOR_DIM}) <= $4
    GROUP BY t."id", a."id"
    ORDER BY t."sonicEmbeddingVector" <=> $1::vector(${SONIC_VECTOR_DIM}) ASC
    LIMIT $2
    OFFSET $3
  `, 
    userAudioVector,      // $1
    limit,                // $2
    offset,               // $3
    MAX_COSINE_DISTANCE
  );

  return organizeTracksWithArtist(results);
};

// The function to fetch trending tracks
export const getTrendingNow = async (
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0
) => {

  const hasVectors = userMetaVector.length > 0 && userAudioVector.length > 0;

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      ${trackAndArtistSelect},

      COUNT(ph."id")::INT AS "playCount",

      ${
        hasVectors
          ? `
          (
            -- similarity (secondary)
            (
              (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.4 +
              (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.4
            )
            +
            -- popularity boost (primary)
            LEAST(LOG(COUNT(ph."id") + 1), 5) * 0.2
          ) AS "score"
        `
          : `
          LEAST(LOG(COUNT(ph."id") + 1), 5) AS "score"
        `
      }

    FROM "Track" t
    JOIN "Artist" a
      ON t."artistId" = a."id"

    LEFT JOIN "PlayHistory" ph
      ON ph."trackId" = t."id"
      AND ph."playedAt" >= NOW() - INTERVAL '15 days'

    GROUP BY
      t."id",
      a."id"

    ORDER BY
      "playCount" DESC,
      "score" DESC

    LIMIT $${hasVectors ? 3 : 1}
    OFFSET $${hasVectors ? 4 : 2};
  `,
    ...(hasVectors ? [userMetaVector, userAudioVector] : []),
    limit,
    offset
  );

  return organizeTracksWithArtist(results);
};


// Recommended new albums
export const getNewAlbums = async (
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0
) => {

  const hasVectors = userMetaVector.length > 0 && userAudioVector.length > 0;

 const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      a."id",
      a."title",
      a."coverUrl",
      a."releaseDate",
      a."credit",
      a."description",

      ar."id" AS "artistId",
      ar."name" AS "artistName",
      ar."bio" AS "artistBio",
      ar."isVerified" AS "artistIsVerified",
      ar."imageUrl" AS "artistImageUrl",
      ar."genres" AS "artistGenres",
      ar."country" AS "artistCountry",
      ar."createdAt" AS "artistCreatedAt",

      ${
        hasVectors
          ? `
          -- Calculate score based only on embeddingVector
          (1 - (a."embeddingVector" <-> CAST($1 AS vector))) AS "score"
        `
          : `
          1.0 AS "score"  -- Default score when vectors are not available
        `
      }

    FROM "Album" a
    JOIN "Artist" ar
      ON a."artistId" = ar."id"

    -- No PlayHistory join anymore
    GROUP BY
      a."id", ar."id"

    -- Apply ordering based on score (if vectors are used) and limit/offset for pagination
    ORDER BY "score" DESC

    LIMIT $2
    OFFSET $3;
  `,
    ...(hasVectors ? [userMetaVector] : []),  // Pass the vector if available
    limit,  // Add limit as parameter
    offset  // Add offset as parameter
  );

  return organizeAlbumsWithArtist(results);
}

export const popularPlaylists = async (
    userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0
) => {

  const hasVectors = userMetaVector.length > 0 && userAudioVector.length > 0;

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      p."id",
      p."title",
      p."description",
      p."coverUrl",
      p."userId",  -- User who created the playlist (not creatorId)
      p."createdAt",

      ${
        hasVectors
          ? `
          -- Calculate score based on embeddingVector
          (1 - (p."embeddingVector" <-> CAST($1 AS vector))) AS "vectorScore"
          `
          : `
          1.0 AS "vectorScore"  -- Default score when vectors are not available
        `      
      },
      
      -- Calculate the combined score
      (
        -- Likes Score: Count the total likes on tracks in the playlist
        COALESCE(SUM(CASE WHEN tl."id" IS NOT NULL THEN 1 ELSE 0 END), 0) * 0.5 +
        
        -- Play History Score: Count the total plays on tracks in the playlist
        COALESCE(SUM(CASE WHEN ph."id" IS NOT NULL THEN 1 ELSE 0 END), 0) * 0.3 +

        -- Vector Score: As calculated from the embedding vector (if available)
        COALESCE((1 - (p."embeddingVector" <-> CAST($1 AS vector))), 1) * 0.2
      ) AS "combinedScore"

    FROM "Playlist" p
    LEFT JOIN "PlaylistItem" pi ON p."id" = pi."playlistId"
    LEFT JOIN "Track" t ON pi."trackId" = t."id"
    LEFT JOIN "TrackLike" tl ON t."id" = tl."trackId"
    LEFT JOIN "PlayHistory" ph ON t."id" = ph."trackId"

    GROUP BY 
      p."id"

    ORDER BY "combinedScore" DESC  -- Order by the combined score

    LIMIT $2
    OFFSET $3;
  `,
    ...(hasVectors ? [userMetaVector] : []),  // Pass the vector if available
    limit,  // Add limit as parameter
    offset  // Add offset as parameter
  );

  // console.log("Popular playlist: ", results);
  

  return results;

}


// Featured Artists
export const featuredArtists = async (
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0
) => {

  const hasVectors = userMetaVector.length > 0 && userAudioVector.length > 0;

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      a."id",
      a."name",
      a."bio",
      a."isVerified",
      a."imageUrl",
      a."genres",
      a."country",
      a."createdAt",
      COUNT(af."id")::int AS followers,

      ${
        hasVectors
          ? `
          -- Calculate score based on embeddingVector
          (1 - (a."embeddingVector" <-> CAST($1 AS vector))) AS "score"
        `
          : `
          1.0 AS "score"  -- Default score when vectors are not available
        `      
      }

    FROM "Artist" a
    LEFT JOIN "ArtistFollow" af
      ON af."artistId" = a."id"

    GROUP BY 
      a."id"

    ORDER BY "score" DESC  -- Order by the score

    LIMIT $2
    OFFSET $3;
  `,
    ...(hasVectors ? [userMetaVector] : []),  // Pass the vector if available
    limit,  // Add limit as parameter
    offset  // Add offset as parameter
  );

  // console.log("Featured artists: ", results);
  

  return results;

}





const MAX_COSINE_DISTANCE = 0.8; // tune this


// for search queries
export const searchTracks = async (query: string, limit: number = 20, offset: number = 0) => {
  const searchEmbeddingResult: any = (await queryEmbedding(query)).result?.data || [];
  const embedding = `[${searchEmbeddingResult.join(",")}]`;

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      ${trackAndArtistSelect},
      (1 - (t."embeddingVector" <=> CAST($1 AS vector))) AS similarity

    FROM "Track" t
    JOIN "Artist" a 
      ON t."artistId" = a."id"

    LEFT JOIN "PlayHistory" ph
      ON ph."trackId" = t."id"

    WHERE
      t."embeddingVector" <=> CAST($1 AS vector) <= $4

    GROUP BY
      t."id",
      a."id"

    ORDER BY similarity DESC
    LIMIT $2
    OFFSET $3;
  `, embedding, limit, offset, MAX_COSINE_DISTANCE);


  const organizedResults = organizeTracksWithArtist(results);
  return organizedResults;
};

export const searchAlbums = async (query: string, limit: number = 20, offset: number = 0) => {
  const searchEmbeddingResult: any = (await queryEmbedding(query)).result?.data || [];
  const embedding = `[${searchEmbeddingResult.join(",")}]`;

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      ${albumAndArtistSelect},
      (1 - (a."embeddingVector" <=> CAST($1 AS vector))) AS similarity

    FROM "Album" a
    JOIN "Artist" ar
      ON a."artistId" = ar."id"
    
    WHERE
      a."embeddingVector" <=> CAST($1 AS vector) <= $4

    GROUP BY
      a."id",
      ar."id"

    ORDER BY similarity DESC
    LIMIT $2
    OFFSET $3;
  `, embedding, limit, offset, MAX_COSINE_DISTANCE);
  
  return organizeAlbumsWithArtist(results);
};

export const searchPlaylists = async (query: string, limit: number = 20, offset: number = 0, userId: string) => {
  const searchEmbeddingResult: any = (await queryEmbedding(query)).result?.data || [];
  const embedding = `[${searchEmbeddingResult.join(",")}]`;
  const MAX_COSINE_DISTANCE = 0.8; // tune this

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      p."id",
      p."title",
      p."description",
      p."coverUrl",
      p."userId",
      p."createdAt",
      (1 - (p."embeddingVector" <=> CAST($1 AS vector))) AS similarity

    FROM "Playlist" p

    WHERE
      p."embeddingVector" <=> CAST($1 AS vector) <= $4
      AND (
        p."isPublic" = false
        OR ($5 IS NOT NULL AND p."userId" = $5)
      )

    ORDER BY similarity DESC
    LIMIT $2
    OFFSET $3;
  `, embedding, limit, offset, MAX_COSINE_DISTANCE, userId ?? null);

  return results;
};


export const searchArtists = async (query: string, limit: number = 20, offset: number = 0) => {
  const searchEmbeddingResult: any = (await queryEmbedding(query)).result?.data || [];
  const embedding = `[${searchEmbeddingResult.join(",")}]`;

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      a."id",
      a."name",
      a."bio",
      a."isVerified",
      a."imageUrl",
      a."genres",
      a."country",
      a."createdAt",
      COUNT(af."id")::int AS followers,
      (1 - (a."embeddingVector" <=> CAST($1 AS vector))) AS similarity

    FROM "Artist" a
    LEFT JOIN "ArtistFollow" af
      ON af."artistId" = a."id"

    WHERE
      a."embeddingVector" <=> CAST($1 AS vector) <= $4

    GROUP BY
      a."id"

    ORDER BY similarity DESC
    LIMIT $2
    OFFSET $3;
  `, embedding, limit, offset, MAX_COSINE_DISTANCE);

  return results;
};

