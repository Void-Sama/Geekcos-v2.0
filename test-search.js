const { searchDocuments } = require("./rag/search");

async function test() {

    const results = await searchDocuments(
        "How do you protect customer data?"
    );

    console.log(results);
}

test();