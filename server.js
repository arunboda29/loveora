import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = process.env.LOVEO_DATA_DIR || root;
fs.mkdirSync(dataDirectory, { recursive: true });
const databasePath = path.join(dataDirectory, "loveora-data.json");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const sessions = new Map();
const loginAttempts = new Map();
const postLimits = new Map();
const staticFiles = new Map([
    ["/", ["index.html", "text/html; charset=utf-8"]],
    ["/index.html", ["index.html", "text/html; charset=utf-8"]],
    ["/style.css", ["style.css", "text/css; charset=utf-8"]],
    ["/script.js", ["script.js", "text/javascript; charset=utf-8"]]
]);

function readDatabase() {
    try {
        const parsed = JSON.parse(fs.readFileSync(databasePath, "utf8"));
        if (Array.isArray(parsed.users) && Array.isArray(parsed.posts)) return parsed;
    } catch {}
    return { users: [], posts: [] };
}

let database = readDatabase();
function saveDatabase() {
    const tempPath = `${databasePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(database, null, 2), { mode: 0o600 });
    fs.renameSync(tempPath, databasePath);
}

function json(response, status, payload, headers = {}) {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers
    });
    response.end(JSON.stringify(payload));
}

function getCookie(request, name) {
    const cookies = request.headers.cookie || "";
    for (const part of cookies.split(";")) {
        const separator = part.indexOf("=");
        if (separator < 0) continue;
        if (part.slice(0, separator).trim() === name) return decodeURIComponent(part.slice(separator + 1).trim());
    }
    return "";
}

function findSession(request) {
    const session = sessions.get(getCookie(request, "loveora_session"));
    if (!session || session.expiresAt < Date.now()) return null;
    return database.users.find((user) => user.id === session.userId) || null;
}

function safeUser(user) {
    return { id: user.id, displayName: user.displayName, createdAt: user.createdAt };
}

function requireSameOrigin(request, response) {
    const origin = request.headers.origin;
    if (!origin) return true;
    const hostHeader = request.headers.host;
    if (origin === `http://${hostHeader}` || origin === `https://${hostHeader}`) return true;
    json(response, 403, { error: "This request could not be verified." });
    return false;
}

async function readBody(request) {
    let raw = "";
    for await (const chunk of request) {
        raw += chunk;
        if (raw.length > 12_000) throw new Error("This message is too large.");
    }
    try { return JSON.parse(raw || "{}"); }
    catch { throw new Error("Please send valid form details."); }
}

function passwordHash(password, salt) {
    return crypto.scryptSync(password, salt, 64).toString("hex");
}

function addSession(response, user) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.setHeader("Set-Cookie", `loveora_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`);
}

function limited(map, key, maximum, periodMs) {
    const now = Date.now();
    const recent = (map.get(key) || []).filter((time) => now - time < periodMs);
    if (recent.length >= maximum) { map.set(key, recent); return true; }
    recent.push(now); map.set(key, recent); return false;
}

function publicPost(post, currentUserId) {
    return {
        id: post.id,
        displayName: post.displayName,
        message: post.message,
        createdAt: post.createdAt,
        hearts: post.hearts.length,
        hasHearted: post.hearts.includes(currentUserId),
        isMine: post.userId === currentUserId
    };
}

const server = http.createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");

    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    const route = url.pathname;

    try {
        if (route === "/healthz" && request.method === "GET") {
            response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
            response.end("ok");
            return;
        }

        if (route.startsWith("/api/")) {
            if (request.method !== "GET" && !requireSameOrigin(request, response)) return;

            if (route === "/api/auth/me" && request.method === "GET") {
                const user = findSession(request);
                return json(response, 200, { user: user ? safeUser(user) : null });
            }

            if (route === "/api/auth/register" && request.method === "POST") {
                const body = await readBody(request);
                const displayName = String(body.displayName || "").trim().replace(/\s+/g, " ");
                const email = String(body.email || "").trim().toLowerCase();
                const password = String(body.password || "");
                if (displayName.length < 2 || displayName.length > 32) return json(response, 400, { error: "Choose a name between 2 and 32 characters." });
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json(response, 400, { error: "Enter a valid email address." });
                if (password.length < 8 || password.length > 128) return json(response, 400, { error: "Your password must be at least 8 characters." });
                if (database.users.some((user) => user.email === email)) return json(response, 409, { error: "An account with that email already exists. Try signing in." });
                const salt = crypto.randomBytes(16).toString("hex");
                const user = { id: crypto.randomUUID(), displayName, email, salt, passwordHash: passwordHash(password, salt), createdAt: new Date().toISOString() };
                database.users.push(user); saveDatabase(); addSession(response, user);
                return json(response, 201, { user: safeUser(user) });
            }

            if (route === "/api/auth/login" && request.method === "POST") {
                const ip = request.socket.remoteAddress || "local";
                if (limited(loginAttempts, ip, 10, 15 * 60 * 1000)) return json(response, 429, { error: "Too many sign-in attempts. Please wait a little and try again." });
                const body = await readBody(request);
                const email = String(body.email || "").trim().toLowerCase();
                const password = String(body.password || "");
                const user = database.users.find((candidate) => candidate.email === email);
                const candidate = user ? passwordHash(password, user.salt) : "";
                const valid = Boolean(user && candidate.length === user.passwordHash.length && crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(user.passwordHash, "hex")));
                if (!valid) return json(response, 401, { error: "That email and password combination was not found." });
                addSession(response, user);
                return json(response, 200, { user: safeUser(user) });
            }

            if (route === "/api/auth/logout" && request.method === "POST") {
                sessions.delete(getCookie(request, "loveora_session"));
                return json(response, 200, { ok: true }, { "Set-Cookie": "loveora_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0" });
            }

            if (route === "/api/community/posts" && request.method === "GET") {
                const user = findSession(request);
                const posts = database.posts.filter((post) => post.reports.length < 3).slice(-60).reverse().map((post) => publicPost(post, user?.id));
                return json(response, 200, { posts });
            }

            if (route === "/api/community/posts" && request.method === "POST") {
                const user = findSession(request);
                if (!user) return json(response, 401, { error: "Sign in to share a note with the community." });
                if (limited(postLimits, user.id, 5, 60 * 1000)) return json(response, 429, { error: "Take a little pause before sharing another note." });
                const body = await readBody(request);
                const message = String(body.message || "").trim();
                if (message.length < 3 || message.length > 500) return json(response, 400, { error: "Write a note between 3 and 500 characters." });
                const post = { id: crypto.randomUUID(), userId: user.id, displayName: user.displayName, message, createdAt: new Date().toISOString(), hearts: [], reports: [] };
                database.posts.push(post); saveDatabase();
                return json(response, 201, { post: publicPost(post, user.id) });
            }

            const postAction = route.match(/^\/api\/community\/posts\/([a-f0-9-]+)\/(heart|report)$/i);
            if (postAction && request.method === "POST") {
                const user = findSession(request);
                if (!user) return json(response, 401, { error: "Sign in to join the community." });
                const post = database.posts.find((item) => item.id === postAction[1]);
                if (!post) return json(response, 404, { error: "That note is no longer here." });
                if (postAction[2] === "heart") {
                    post.hearts = post.hearts || [];
                    post.hearts = post.hearts.includes(user.id) ? post.hearts.filter((id) => id !== user.id) : [...post.hearts, user.id];
                    saveDatabase();
                    return json(response, 200, { post: publicPost(post, user.id) });
                }
                if (post.userId === user.id) return json(response, 400, { error: "You cannot report your own note." });
                post.reports = post.reports || [];
                if (!post.reports.includes(user.id)) post.reports.push(user.id);
                saveDatabase();
                return json(response, 200, { ok: true, message: "Thanks for helping keep this corner kind." });
            }

            return json(response, 404, { error: "This Loveora feature is not available." });
        }

        const file = staticFiles.get(route);
        if (!file || request.method !== "GET" && request.method !== "HEAD") {
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found"); return;
        }
        const filePath = path.join(root, file[0]);
        response.writeHead(200, { "Content-Type": file[1], "Cache-Control": "no-cache" });
        if (request.method === "HEAD") return response.end();
        fs.createReadStream(filePath).pipe(response);
    } catch (error) {
        const status = error.message === "This message is too large." ? 413 : 400;
        if (!response.headersSent) json(response, status, { error: error.message || "Loveora hit a small snag. Please try again." });
        else response.destroy();
    }
});

let portOffset = 0;
server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && !process.env.PORT && portOffset < 10) {
        portOffset += 1;
        const nextPort = port + portOffset;
        console.warn(`Port ${nextPort - 1} is already in use. Trying ${nextPort}…`);
        server.listen(nextPort, host);
        return;
    }
    console.error(`Loveora could not start: ${error.message}`);
    process.exitCode = 1;
});

server.on("listening", () => {
    const address = server.address();
    console.log(`Loveora is ready at http://${host}:${address.port}`);
    console.log("Use this exact address in your browser. Local accounts and posts are saved in loveora-data.json.");
});

server.listen(port, host);
