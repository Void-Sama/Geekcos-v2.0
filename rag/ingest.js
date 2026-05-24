require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { MongoClient } = require("mongodb");
const { createEmbedding } = require("./embed");

// CONNECT TO MONGODB
const client = new MongoClient(process.env.MONGODB_URI);

// MAIN FUNCTION
async function ingestPDFs() {

    try {

        // CONNECT DATABASE
        await client.connect();

        console.log("Connected to MongoDB");

        // DATABASE NAME
        const db = client.db("shootgeeksAI");

        // COLLECTION NAME
        const collection = db.collection("documents");

        // REMOVE OLD DATA
        await collection.deleteMany({});

        console.log("Old documents removed");

        // PDF FILES
        const files = [
            "assets/Shootgeeks Privacy Policy.pdf",
            "assets/Shootgeeks Term and Condition.pdf"
        ];

        // LOOP THROUGH PDF FILES
        for (const file of files) {

            console.log(`Reading: ${file}`);

            // GET FULL FILE PATH
            const filePath = path.join(__dirname, "..", file);

            // READ PDF
            const buffer = fs.readFileSync(filePath);

            // EXTRACT TEXT
            const pdf = await pdfParse(buffer);

            const text = pdf.text;

            console.log("PDF text extracted");

            // CHUNKING
            const chunks = text.match(/(.|[\r\n]){1,500}/g);

            console.log(`Chunks created: ${chunks.length}`);

            // SAVE EACH CHUNK
            for (const chunk of chunks) {

                const embedding = await createEmbedding(chunk);

                await collection.insertOne({

                    text: chunk,

                    embedding: embedding

                });

                console.log("Chunk saved");
            }
        }

        console.log("INGEST COMPLETE");

        await client.close();

    } catch (error) {

        console.log(error);
    }
}

// RUN FUNCTION
ingestPDFs();