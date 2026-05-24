require("dotenv").config();

const cosineSimilarity = require("compute-cosine-similarity");
const { MongoClient } = require("mongodb");
const { createEmbedding } = require("./embed");

const client = new MongoClient(process.env.MONGODB_URI);

async function searchDocuments(query) {

    // CONNECT DATABASE
    await client.connect();

    const db = client.db("shootgeeksAI");

    const collection = db.collection("documents");

    // CREATE EMBEDDING FOR USER QUESTION
    const queryEmbedding = await createEmbedding(query);

    // GET ALL DOCUMENTS
    const documents = await collection.find({}).toArray();

    // CALCULATE SIMILARITY
    const scoredDocs = documents.map(doc => {

        const similarity = cosineSimilarity(
            queryEmbedding,
            doc.embedding
        );

        return {
            text: doc.text,
            similarity
        };
    });

    // SORT BEST MATCHES
    scoredDocs.sort((a, b) => b.similarity - a.similarity);

    // RETURN TOP 3 CHUNKS
    return scoredDocs.slice(0, 3);
}

module.exports = {
    searchDocuments
};