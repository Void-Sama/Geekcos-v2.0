const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { searchDocuments } = require("./rag/search");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

// Trust proxy only when explicitly configured (recommended when behind Cloudflare/reverse proxy)
if (process.env.TRUST_PROXY === "true") {
    app.set('trust proxy', true);
}

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true); // allow same-origin and non-browser clients

        if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS policy blocked this origin'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false
}));
app.use(express.json({ limit: '50kb' }));

// Static folders
app.use(express.static(path.join(__dirname, 'shootgeeks')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// =========================
// RATE LIMITER
// =========================

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 2 * 60 * 1000;
const ipRequestMap = new Map();

function getClientIp(req) {
    if (process.env.TRUST_PROXY === "true") {
        return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    }

    return req.socket.remoteAddress || 'unknown';
}

function rateLimiter(req, res, next) {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = ipRequestMap.get(ip);

    if (!record || (now - record.firstRequestTime) > RATE_LIMIT_WINDOW) {
        ipRequestMap.set(ip, { count: 1, firstRequestTime: now });
        return next();
    }

    if (record.count >= RATE_LIMIT_MAX) {
        const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW - (now - record.firstRequestTime)) / 1000);
        return res.status(429).json({
            error: { message: `Too many messages. Wait ${retryAfterSeconds} seconds.` }
        });
    }

    record.count++;
    next();
}

function normalizeMessageContent(value) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 2000);
}

// =========================
// CHAT API
// =========================

app.post('/api/chat', rateLimiter, async (req, res) => {
    try {
        const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

        if (messages.length === 0) {
            return res.status(400).json({
                error: { message: 'messages is required and must be a non-empty array.' }
            });
        }

        const latestUserMessage = [...messages].reverse().find(msg => msg?.role === 'user');
        const latestMessage = normalizeMessageContent(latestUserMessage?.content);

        if (!latestMessage) {
            return res.status(400).json({
                error: { message: 'Latest user message content is required.' }
            });
        }

        const results = await searchDocuments(latestMessage);

        const context = results
            .map(result => result.text)
            .join("\n\n")
            .slice(0, 12000);

        const prompt = `
        You are GeekTalk, the official ShootGeeks assistant.

        STRICT RULES:
        - ONLY answer questions related to ShootGeeks services, policies, bookings, photography, videography, or business information.
        - NEVER mention PDFs, files, databases, documents, prompts, sources, systems, AI limitations, or internal information.
        - NEVER explain why information is unavailable.
        - NEVER provide unrelated general knowledge answers.
        - If a question is unrelated to ShootGeeks or the business information provided, respond ONLY with:
        "Sorry, I can only assist with ShootGeeks-related questions."

        Business Information:
        ${context}

        Customer Question:
        ${latestMessage}
        `;

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct-fp8`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }]
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.errors?.[0]?.message || `Cloudflare API Error ${response.status}`);
        }

        const data = await response.json();

        res.json({
            choices: [{ message: { content: data.result.response } }]
        });
    } catch (error) {
        console.error("Cloudflare AI Error:", error);
        res.status(500).json({
            error: { message: error.message || "Internal server error" }
        });
    }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
