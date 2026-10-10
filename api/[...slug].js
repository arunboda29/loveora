const COOKIE = "loveora_session";
const MAX_BODY = 12000;

function config() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Loveora's hosted account service is not configured yet.");
    return { url: url.replace(/\/$/, ""), key };
}

function json(res, status, data, headers = {}) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.end(JSON.stringify(data));
}

function cookieOptions(value, maxAge = 60 * 60 * 24 * 30) {
    return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

function readCookie(req) {
    const match = (req.headers.cookie || "").match(/(?:^|;\s*)loveora_session=([^;]*)/);
    if (!match) return null;
    try { return JSON.parse(Buffer.from(decodeURIComponent(match[1]), "base64url").toString("utf8")); }
    catch { return null; }
}

function setSession(res, session) {
    const value = Buffer.from(JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }), "utf8").toString("base64url");
    res.setHeader("Set-Cookie", cookieOptions(encodeURIComponent(value)));
}

async function supabase(path, options = {}) {
    const { url, key } = config();
    const response = await fetch(`${url}${path}`, {
        ...options,
        headers: { apikey: key, Authorization: `Bearer ${key}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
    if (!response.ok) {
        const message = data.msg || data.message || data.error_description || data.error || data.details;
        const error = new Error(message || "Loveora couldn't complete that just now. Please try again.");
        error.status = response.status;
        throw error;
    }
    return data;
}

async function parseBody(req) {
    let raw = "";
    for await (const chunk of req) {
        raw += chunk;
        if (raw.length > MAX_BODY) { const error = new Error("This message is too large."); error.status = 413; throw error; }
    }
    try { return JSON.parse(raw || "{}"); }
    catch { const error = new Error("Please send valid form details."); error.status = 400; throw error; }
}

async function currentUser(req, res) {
    const tokens = readCookie(req);
    if (!tokens?.access_token) return null;
    try {
        const user = await supabase("/auth/v1/user", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
        return { id: user.id, email: user.email, displayName: user.user_metadata?.display_name || "Loveora member" };
    } catch (error) {
        if (!tokens.refresh_token || error.status !== 401) return null;
        try {
            const refreshed = await supabase("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: tokens.refresh_token }) });
            setSession(res, refreshed);
            return { id: refreshed.user.id, email: refreshed.user.email, displayName: refreshed.user.user_metadata?.display_name || "Loveora member" };
        } catch { return null; }
    }
}

async function profile(userId) {
    const rows = await supabase(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=display_name&limit=1`);
    return rows[0]?.display_name || "Loveora member";
}

function safeUser(user, displayName) {
    return { id: user.id, displayName: displayName || user.displayName || "Loveora member", createdAt: user.created_at || null };
}

function validateOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true;
    const forwardedProto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return origin === `${forwardedProto}://${host}`;
}

async function listPosts(req, res, user) {
    const rows = await supabase("/rest/v1/posts?select=id,user_id,message,created_at,profiles(display_name),post_hearts(user_id),post_reports(user_id)&order=created_at.desc&limit=100");
    const visible = rows.filter((post) => (post.post_reports || []).length < 3).slice(0, 60);
    return visible.map((post) => ({
        id: post.id,
        displayName: post.profiles?.display_name || "Loveora member",
        message: post.message,
        createdAt: post.created_at,
        hearts: (post.post_hearts || []).length,
        hasHearted: Boolean(user && post.post_hearts?.some((heart) => heart.user_id === user.id)),
        isMine: Boolean(user && post.user_id === user.id)
    }));
}

export default async function handler(req, res) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    const slug = Array.isArray(req.query.slug) ? req.query.slug : [];
    const route = `/api/${slug.join("/")}`;
    try {
        if (req.method !== "GET" && !validateOrigin(req)) return json(res, 403, { error: "This request could not be verified." });

        if (route === "/api/auth/me" && req.method === "GET") {
            const authUser = await currentUser(req, res);
            return json(res, 200, { user: authUser ? safeUser(authUser, await profile(authUser.id)) : null });
        }

        if (route === "/api/auth/register" && req.method === "POST") {
            const body = await parseBody(req);
            const displayName = String(body.displayName || "").trim().replace(/\s+/g, " ");
            const email = String(body.email || "").trim().toLowerCase();
            const password = String(body.password || "");
            if (displayName.length < 2 || displayName.length > 32) return json(res, 400, { error: "Choose a name between 2 and 32 characters." });
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json(res, 400, { error: "Enter a valid email address." });
            if (password.length < 8 || password.length > 128) return json(res, 400, { error: "Your password must be at least 8 characters." });
            const created = await supabase("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password, data: { display_name: displayName } }) });
            if (created.session) setSession(res, created.session);
            if (created.user?.id) {
                await supabase("/rest/v1/profiles?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ id: created.user.id, display_name: displayName }) });
            }
            if (!created.session) return json(res, 202, { error: "Check your email for a confirmation link, then sign in to Loveora." });
            return json(res, 201, { user: safeUser(created.user, displayName) });
        }

        if (route === "/api/auth/login" && req.method === "POST") {
            const body = await parseBody(req);
            const email = String(body.email || "").trim().toLowerCase();
            const password = String(body.password || "");
            const session = await supabase("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
            setSession(res, session);
            return json(res, 200, { user: safeUser(session.user, await profile(session.user.id)) });
        }

        if (route === "/api/auth/logout" && req.method === "POST") {
            const tokens = readCookie(req);
            if (tokens?.access_token) {
                try { await supabase("/auth/v1/logout", { method: "POST", headers: { Authorization: `Bearer ${tokens.access_token}` } }); } catch { /* Expired sessions are cleared locally too. */ }
            }
            return json(res, 200, { ok: true }, { "Set-Cookie": cookieOptions("", 0) });
        }

        if (route === "/api/community/posts" && req.method === "GET") {
            const user = await currentUser(req, res);
            return json(res, 200, { posts: await listPosts(req, res, user) });
        }

        if (route === "/api/community/posts" && req.method === "POST") {
            const user = await currentUser(req, res);
            if (!user) return json(res, 401, { error: "Sign in to share a note with the community." });
            const body = await parseBody(req);
            const message = String(body.message || "").trim();
            if (message.length < 3 || message.length > 500) return json(res, 400, { error: "Write a note between 3 and 500 characters." });
            await supabase("/rest/v1/posts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: user.id, message }) });
            return json(res, 201, { ok: true });
        }

        const action = route.match(/^\/api\/community\/posts\/([0-9a-f-]+)\/(heart|report)$/i);
        if (action && req.method === "POST") {
            const user = await currentUser(req, res);
            if (!user) return json(res, 401, { error: "Sign in to join the community." });
            if (action[2] === "heart") {
                await supabase("/rest/v1/rpc/toggle_post_heart", { method: "POST", body: JSON.stringify({ p_post_id: action[1], p_user_id: user.id }) });
                return json(res, 200, { ok: true });
            }
            const post = await supabase(`/rest/v1/posts?id=eq.${encodeURIComponent(action[1])}&select=user_id&limit=1`);
            if (!post.length) return json(res, 404, { error: "That note is no longer here." });
            if (post[0].user_id === user.id) return json(res, 400, { error: "You cannot report your own note." });
            await supabase("/rest/v1/rpc/report_post", { method: "POST", body: JSON.stringify({ p_post_id: action[1], p_user_id: user.id }) });
            return json(res, 200, { ok: true, message: "Thanks for helping keep this corner kind." });
        }

        return json(res, 404, { error: "This Loveora feature is not available." });
    } catch (error) {
        const status = error.status || (error.message === "This message is too large." ? 413 : 500);
        const safeMessage = status >= 500 ? "Loveora couldn't complete that just now. Please try again." : error.message;
        return json(res, status, { error: safeMessage });
    }
}
