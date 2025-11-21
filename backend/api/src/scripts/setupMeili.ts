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

async function deleteAllDocuments(indexUid: string) {
  const index = meiliClient.index(indexUid);
  await index.deleteAllDocuments();
  console.log(`All documents in index ${indexUid} have been deleted.`);
}



deleteAllDocuments("tracks").catch((error) => {
  console.log("Error deleting documents:", error);
})

setupMeili().catch((error) => {
  console.error("Error setting up MeiliSearch:", error);
});
