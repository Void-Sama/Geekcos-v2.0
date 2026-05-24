const { pipeline } = require("@xenova/transformers");

let extractor;

// LOAD MODEL
async function loadModel() {

    extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded");
}

// CREATE EMBEDDING
async function createEmbedding(text) {

    if (!extractor) {
        await loadModel();
    }

    const output = await extractor(text, {
        pooling: "mean",
        normalize: true
    });

    return Array.from(output.data);
}

module.exports = {
    createEmbedding
};