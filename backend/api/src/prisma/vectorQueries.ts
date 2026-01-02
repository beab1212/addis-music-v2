import prisma from "../libs/db";
import { queryEmbedding, isAmharic } from '../utils/helpers';


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



// The function to fetch similar tracks (Foundation Function)
// export const getSimilarTracks = async (
//   userMetaVector: number[] = [],
//   userAudioVector: number[] = [],
//   limit: number = 10,
//   offset: number = 0,) => {

//   // if user has no vectors(history)
//   if (userMetaVector.length === 0 || userAudioVector.length === 0) {
//     const latestTracks = await prisma.track.findMany({
//       orderBy: { createdAt: 'desc' },
//       take: limit,
//       skip: offset,
//     });

//     return latestTracks;
//   }

//   const options = [];

//   // If userMetaVector is non-empty, push it to options
//   if (userMetaVector && userMetaVector.length > 0) {
//     options.push(userMetaVector);
//   }

//   // If userAudioVector is non-empty, push it to options
//   if (userAudioVector && userAudioVector.length > 0) {
//     options.push(userAudioVector);
//   }

//   const results: any = await prisma.$queryRawUnsafe(`
//     SELECT 
//       ${trackAndArtistSelect},

//       ${userMetaVector.length > 0 && userAudioVector.length > 0
//       ? `
//           (
//             (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.8 +
//             (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.2
//           ) AS "score"
//         `
//       : userMetaVector.length > 0
//         ? `
//           (1 - (t."embeddingVector" <-> CAST($1 AS vector))) AS "score"
//         `
//         : `
//           (1 - (t."sonicEmbeddingVector" <-> CAST($1 AS vector))) AS "score"
//         `
//     }

//     FROM "Track" t
//     JOIN "Artist" a 
//       ON t."artistId" = a."id"

//     LEFT JOIN "PlayHistory" ph
//       ON ph."trackId" = t."id"

//     GROUP BY
//       t."id",
//       a."id"

//     ORDER BY "score" DESC
//     LIMIT $3
//     OFFSET $4;
//   `, ...options, limit, offset);

//   return organizeTracksWithArtist(results);
// };


export const getSimilarTracks = async (
  userId: string,
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

    ${userMetaVector.length > 0 && userAudioVector.length > 0
      ? `
          (
            (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.8 +
            (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.2
          ) AS score
        `
      : userMetaVector.length > 0
        ? `
          (1 - (t."embeddingVector" <-> CAST($1 AS vector))) AS score
        `
        : `
          (1 - (t."sonicEmbeddingVector" <-> CAST($1 AS vector))) AS score
        `
    }

    FROM "Track" t
    JOIN "Artist" a
      ON t."artistId" = a."id"

    LEFT JOIN "PlayHistory" ph
      ON ph."trackId" = t."id"

    WHERE t."id" NOT IN (
      SELECT ph2."trackId"
      FROM "PlayHistory" ph2
      WHERE ph2."userId" = $3
      ORDER BY ph2."playedAt" DESC
      LIMIT 3
    )

    GROUP BY
      t."id",
      a."id"

    ORDER BY score DESC
    LIMIT $4
    OFFSET $5;
  `, ...options, userId, limit, offset);


  return organizeTracksWithArtist(results);
};




// The function to fetch similar-sounding tracks(Foundation Function)
// export const getSimilarSoundingTracks = async (
//   userAudioVector?: number[],
//   limit: number = 10,
//   offset: number = 0,
// ) => {
//   // Fallback: no vector provided
//   if (!Array.isArray(userAudioVector) || userAudioVector.length === 0) {
//     const latestTracks = await prisma.track.findMany({
//       include: { artist: true },
//       orderBy: { createdAt: 'desc' },
//       take: limit,
//       skip: offset,
//     });
//     return latestTracks.map(track => ({
//       ...track,
//       artist: track.artist,
//       score: null,
//     }));
//   }

//   const results: any = await prisma.$queryRawUnsafe(`
//     SELECT 
//       ${trackAndArtistSelect},
//       (t."sonicEmbeddingVector" <#> $1::vector) * -1 AS similarity
//     FROM "Track" t
//     JOIN "Artist" a ON t."artistId" = a."id"
//     LEFT JOIN "PlayHistory" ph ON ph."trackId" = t."id"
//     WHERE t."sonicEmbeddingVector" IS NOT NULL
//     GROUP BY t."id", a."id"
//     ORDER BY t."sonicEmbeddingVector" <#> $1::vector ASC
//     LIMIT $2
//     OFFSET $3;
//   `,
//     userAudioVector,  // $1
//     limit,            // $2
//     offset            // $3
//   );

//   return organizeTracksWithArtist(results);
// };


export const getSimilarSoundingTracks = async (
  userAudioVector?: number[],
  limit: number = 10,
  offset: number = 0,
) => {
  // Fallback: no vector provided
  if (!Array.isArray(userAudioVector) || userAudioVector.length === 0) {
    const latestTracks = await prisma.track.findMany({
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return latestTracks.map(track => ({
      ...track,
      artist: track.artist,
      score: null,
    }));
  }

  const results: any = await prisma.$queryRawUnsafe(`
    SELECT 
      ${trackAndArtistSelect},
      1 - (t."sonicEmbeddingVector" <=> $1::vector) AS similarity
    FROM "Track" t
    JOIN "Artist" a ON t."artistId" = a."id"
    LEFT JOIN "PlayHistory" ph ON ph."trackId" = t."id"
    WHERE t."sonicEmbeddingVector" IS NOT NULL
      AND (t."sonicEmbeddingVector" <=> $1::vector) < 0.2  -- cosine distance < 0.2 → similarity ≥ 0.80
    GROUP BY t."id", a."id"
    ORDER BY t."sonicEmbeddingVector" <=> $1::vector ASC  -- most similar first
    LIMIT 20
  `,
    userAudioVector  // $1
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

      ${hasVectors
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
  const hasVectors = userMetaVector.length > 0;

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

      ${hasVectors
        ? `(1 - (a."embeddingVector" <-> CAST($3 AS vector))) AS "score"`
        : `1.0 AS "score"`
      }
    FROM "Album" a
    JOIN "Artist" ar ON a."artistId" = ar."id"
    GROUP BY a."id", ar."id"
    ORDER BY "score" DESC
    LIMIT $1 OFFSET $2
  `,
    limit,   // always $1
    offset,  // always $2
    ...(hasVectors ? [userMetaVector] : [])  // $3 only if vector provided
  );

  return organizeAlbumsWithArtist(results);
};

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
      p."userId",
      p."createdAt",

      -- Likes Score: total number of likes on tracks in the playlist
      COALESCE(SUM(CASE WHEN tl."id" IS NOT NULL THEN 1 ELSE 0 END), 0) * 0.5 AS "likesScore",

      -- Play History Score: total number of plays on tracks in the playlist
      COALESCE(SUM(CASE WHEN ph."id" IS NOT NULL THEN 1 ELSE 0 END), 0) * 0.3 AS "playScore",

      -- Vector similarity score (only used when vectors are provided)
      ${hasVectors
        ? `(1 - (p."embeddingVector" <-> CAST($3 AS vector))) * 0.2 AS "vectorScore"`
        : `0.2 AS "vectorScore"`
      },

      -- Final combined score
      (
        COALESCE(SUM(CASE WHEN tl."id" IS NOT NULL THEN 1 ELSE 0 END), 0) * 0.5 +
        COALESCE(SUM(CASE WHEN ph."id" IS NOT NULL THEN 1 ELSE 0 END), 0) * 0.3 +
        ${hasVectors
          ? `(1 - (p."embeddingVector" <-> CAST($3 AS vector))) * 0.2`
          : `0.2`
        }
      ) AS "combinedScore"

    FROM "Playlist" p
    LEFT JOIN "PlaylistItem" pi ON p."id" = pi."playlistId"
    LEFT JOIN "Track" t ON pi."trackId" = t."id"
    LEFT JOIN "TrackLike" tl ON t."id" = tl."trackId"
    LEFT JOIN "PlayHistory" ph ON t."id" = ph."trackId"

    GROUP BY p."id"

    ORDER BY "combinedScore" DESC

    LIMIT $1
    OFFSET $2;
  `,
    limit,   // $1
    offset,  // $2
    ...(hasVectors ? [userMetaVector] : [])  // $3 only when hasVectors = true
  );

  return results;
};


// Featured Artists
export const featuredArtists = async (
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
  offset: number = 0
) => {

  const hasVectors = userMetaVector.length > 0;

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

      ${hasVectors
        ? `(1 - (a."embeddingVector" <-> CAST($3 AS vector))) AS "score"`
        : `1.0 AS "score"`
      }

    FROM "Artist" a
    LEFT JOIN "ArtistFollow" af
      ON af."artistId" = a."id"

    GROUP BY 
      a."id"

    ORDER BY "score" DESC  -- Order by the score

    LIMIT $1
    OFFSET $2;
  `,
    limit,  // Add limit as parameter
    offset,  // Add offset as parameter
    ...(hasVectors ? [userMetaVector] : [])  // Pass the vector if available

  );

  // console.log("Featured artists: ", results);
  return results;

}



// (NEW EXPERIMENTAL SEARCH FUNCTIONS USING VECTORS BELOW)

// Tuning constants — adjust these as needed to reduce noise and improve relevance
// Cosine Similarity threshold to consider a result relevant (0 to 1) 1 ≈ identical, 0.5 ≈ somewhat similar 0 ≈ no similarity
const SEARCH_MIN_SIMILARITY = 0.2;

// Loose cosine *distance* filter to keep the query fast and index-friendly
// pgvector <=> returns cosine_distance = 1 − cosine_similarity
// cosine_similarity range: 1 (identical) → 0 (unrelated) → -1 (opposite)
// cosine_distance range:   0 (best) → 1 (unrelated) → 2 (opposite)
// Example: distance ≤ 0.80 ≈ similarity ≥ 0.20
const SEARCH_MAX_VECTOR_DISTANCE = 0.80;

export const searchTracks = async (query: string, limit: number = 20, offset: number = 0) => {
  const embeddingArray = (await queryEmbedding(query)).result?.data || [];
  if (embeddingArray.length === 0) return [];

  const embedding = `[${embeddingArray.join(",")}]`;

  const results: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      ${trackAndArtistSelect},
      (1 - (t."embeddingVector" <=> CAST($1 AS vector))) AS similarity
    FROM "Track" t
    JOIN "Artist" a ON t."artistId" = a."id"
    LEFT JOIN "PlayHistory" ph ON ph."trackId" = t."id"
    WHERE t."embeddingVector" <=> CAST($1 AS vector) <= ${SEARCH_MAX_VECTOR_DISTANCE}
    GROUP BY t."id", a."id"
    ORDER BY similarity DESC
    LIMIT $2 OFFSET $3;
  `, embedding, limit, offset);

  // Optional debug
  console.log(`Raw playlist results: ${results.length}`);
  console.log("Results: ", results)
  // Remove low-quality matches
  const filteredResults = results.filter(
    (track: any) => track.similarity >= SEARCH_MIN_SIMILARITY
  );

  return organizeTracksWithArtist(filteredResults);
};

export const searchPlaylists = async (
  query: string,
  limit: number = 20,
  offset: number = 0,
  userId?: string
) => {
  const embeddingArray = (await queryEmbedding(query)).result?.data || [];
  if (embeddingArray.length === 0) return [];

  const embedding = `[${embeddingArray.join(",")}]`;

  const results: any[] = await prisma.$queryRawUnsafe(`
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
      p."embeddingVector" <=> CAST($1 AS vector) <= ${SEARCH_MAX_VECTOR_DISTANCE}
      AND (
        p."isPublic" = true
        OR p."userId" = $4
      )
    ORDER BY similarity DESC
    LIMIT $2 OFFSET $3;
  `, embedding, limit, offset, userId ?? null);

  // Optional debug
  console.log(`Raw playlist results: ${results.length}`);

  const filteredResults = results.filter(r => r.similarity >= SEARCH_MIN_SIMILARITY);

  return filteredResults;
};

export const searchAlbums = async (query: string, limit: number = 20, offset: number = 0) => {
  const embeddingArray = (await queryEmbedding(query)).result?.data || [];
  if (embeddingArray.length === 0) return [];

  const embedding = `[${embeddingArray.join(",")}]`;

  const results: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      ${albumAndArtistSelect},
      (1 - (a."embeddingVector" <=> CAST($1 AS vector))) AS similarity
    FROM "Album" a
    JOIN "Artist" ar ON a."artistId" = ar."id"
    WHERE a."embeddingVector" <=> CAST($1 AS vector) <= ${SEARCH_MAX_VECTOR_DISTANCE}
    GROUP BY a."id", ar."id"
    ORDER BY similarity DESC
    LIMIT $2 OFFSET $3;
  `, embedding, limit, offset);

  // Optional debug
  console.log(`Raw album results: ${results.length}`);


  const filteredResults = results.filter(r => r.similarity >= SEARCH_MIN_SIMILARITY);

  return organizeAlbumsWithArtist(filteredResults);
};

export const searchArtists = async (query: string, limit: number = 20, offset: number = 0) => {
  const embeddingArray = (await queryEmbedding(query)).result?.data || [];
  if (embeddingArray.length === 0) return [];

  const embedding = `[${embeddingArray.join(",")}]`;

  const results: any[] = await prisma.$queryRawUnsafe(`
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
    LEFT JOIN "ArtistFollow" af ON af."artistId" = a."id"
    WHERE a."embeddingVector" <=> CAST($1 AS vector) <= ${SEARCH_MAX_VECTOR_DISTANCE}
    GROUP BY a."id"
    ORDER BY similarity DESC
    LIMIT $2 OFFSET $3;
  `, embedding, limit, offset);

  // Optional debug
  console.log(`Raw artist results: ${results.length}`);

  const filteredResults = results.filter(r => r.similarity >= SEARCH_MIN_SIMILARITY);

  return filteredResults;
};




export const trackFromArtistYouFollow = async (
  userId: string,
  userMetaVector: number[] = [],
  userAudioVector: number[] = [],
  limit: number = 10,
) => {
  const options: any[] = [];

  if (userMetaVector.length > 0) options.push(userMetaVector);
  if (userAudioVector.length > 0) options.push(userAudioVector);

  const vectorCount = options.length;
  const userIdParam = vectorCount + 1;
  const oneMonthAgoParam = vectorCount + 2;
  const limitParam = vectorCount + 3;

  const scoreClause = (() => {
    if (userMetaVector.length > 0 && userAudioVector.length > 0) {
      return `
        (
          (1 - (t."embeddingVector" <-> CAST($1 AS vector))) * 0.6 +
          (1 - (t."sonicEmbeddingVector" <-> CAST($2 AS vector))) * 0.4
        ) AS score
      `;
    }
    if (userMetaVector.length > 0) {
      return `(1 - (t."embeddingVector" <-> CAST($1 AS vector))) AS score`;
    }
    if (userAudioVector.length > 0) {
      return `(1 - (t."sonicEmbeddingVector" <-> CAST($1 AS vector))) AS score`;
    }
    return `1 AS score`;
  })();

  const sql = `
    SELECT 
      ${trackAndArtistSelect},
      ${scoreClause}
    FROM "Track" t
    JOIN "ArtistFollow" af ON af."artistId" = t."artistId"
    JOIN "Artist" a
      ON t."artistId" = a."id"
    LEFT JOIN "PlayHistory" ph 
      ON ph."trackId" = t.id 
      AND ph."userId" = $${userIdParam}
    WHERE af."userId" = $${userIdParam}
      AND (
        ph.id IS NULL
        OR ph."playedAt" >= $${oneMonthAgoParam}
      )
    GROUP BY
      t."id",
      a."id"
    ORDER BY score DESC, t."createdAt" DESC
    LIMIT $${limitParam}
  `;

  // Calculate one month ago as a Date object (NOT string!)
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const results = await prisma.$queryRawUnsafe(
    sql,
    ...options,
    userId,
    oneMonthAgo,
    limit
  );

  return results;
};
