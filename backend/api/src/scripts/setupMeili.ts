import meiliClient from "../libs/meili";

async function setupMeili() {
    const index = meiliClient.index("tracks");

    await index.updateSettings({
        searchableAttributes: ["title", "artist", "album", "tags"],
        filterableAttributes: ["genre", "releaseDate"],
        sortableAttributes: ["popularity", "releaseDate"],
        rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "exactness",
        "sort",
        ],
        distinctAttribute: "id",
    });
    console.log("MeiliSearch index 'tracks' configured successfully.");
    return null;
}


setupMeili().catch((error) => {
  console.error("Error setting up MeiliSearch:", error);
});
