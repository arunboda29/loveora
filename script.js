/* =========================================================
   LOVEORA — MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const exploreButton = document.getElementById("exploreButton");
const curiousButton = document.getElementById("curiousButton");
const loginButton = document.getElementById("loginButton");

const storyCards = document.querySelectorAll(".story-card");
const languagePills = document.querySelectorAll(".language-pill");
const featureLinks = document.querySelectorAll(".feature-link");

const pickupLines = [
    { category: "cute", en: "Are you made of stardust? Because you make an ordinary night feel magical.", te: "నువ్వు నక్షత్ర ధూళితో చేసినవా? నువ్వుంటే సాధారణ రాత్రి కూడా మాయలా మారుతుంది.", hi: "क्या तुम तारों की धूल से बनी हो? तुम्हारे साथ साधारण रात भी जादुई लगती है।" },
    { category: "cute", en: "You must be a little bit of sunshine; my day got brighter when you showed up.", te: "నువ్వు చిన్న సూర్యకిరణంలా ఉన్నావు; నిన్ను చూసినప్పటి నుంచి నా రోజు వెలిగిపోయింది.", hi: "तुम थोड़ी सी धूप जैसी हो; तुम्हें देखकर मेरा दिन खिल गया।" },
    { category: "cute", en: "If smiles were postcards, I’d send you one every time you cross my mind.", te: "నవ్వులు పోస్ట్‌కార్డులైతే, నువ్వు గుర్తొచ్చినప్పుడల్లా ఒకటి పంపేవాడిని.", hi: "अगर मुस्कानें पोस्टकार्ड होतीं, तो तुम्हारी याद आते ही एक भेजता।" },
    { category: "flirty", en: "I had a clever opener ready, but then you smiled and I forgot the whole script.", te: "ఒక మంచి మాట సిద్ధం చేసుకున్నాను, కానీ నువ్వు నవ్వగానే అంతా మర్చిపోయాను.", hi: "एक शानदार शुरुआत सोच रखी थी, पर तुम्हारी मुस्कान देखकर सब भूल गया।" },
    { category: "flirty", en: "Is it too soon to say you’ve made my favorite part of today?", te: "ఈ రోజు నాకు ఇష్టమైన క్షణం నువ్వేనని చెప్పడానికి తొందరేనా?", hi: "क्या यह कहना जल्दी होगा कि आज का मेरा पसंदीदा पल तुम हो?" },
    { category: "flirty", en: "I was going to play it cool, but honestly, you’re making that difficult.", te: "కూల్‌గా ఉండాలనుకున్నాను, కానీ నిజం చెప్పాలంటే నువ్వు అది కష్టంగా చేస్తున్నావు.", hi: "सोचा था थोड़ा कूल रहूँगा, लेकिन तुमने वह मुश्किल कर दिया।" },
    { category: "funny", en: "Are you a plot twist? Because my day got interesting the second you appeared.", te: "నువ్వు కథలో ట్విస్ట్‌వా? కనిపించిన క్షణం నుంచి నా రోజు ఆసక్తికరంగా మారింది.", hi: "क्या तुम कहानी का ट्विस्ट हो? तुम्हारे आते ही मेरा दिन दिलचस्प हो गया।" },
    { category: "funny", en: "Are you my phone at 1%? Because suddenly you’re all I can think about.", te: "నువ్వు ఒక శాతం బ్యాటరీ ఉన్న ఫోనా? ఇప్పుడు నా ఆలోచనలన్నీ నీపైనే.", hi: "क्या तुम 1% बैटरी वाला फोन हो? अब मेरा सारा ध्यान तुम पर है।" },
    { category: "funny", en: "I’m not a photographer, but I can already picture us laughing at this line.", te: "నేను ఫోటోగ్రాఫర్‌ను కాదు, కానీ ఈ మాటకు మనిద్దరం నవ్వుకోవడం ఊహించగలను.", hi: "मैं फोटोग्राफर नहीं हूँ, पर इस लाइन पर हम दोनों को हँसते देख सकता हूँ।" },
    { category: "romantic", en: "Somehow the world feels softer whenever I get to talk with you.", te: "నీతో మాట్లాడే ప్రతిసారీ ఈ ప్రపంచం మరింత మృదువుగా అనిపిస్తుంది.", hi: "तुमसे बात होती है तो दुनिया थोड़ी और खूबसूरत लगने लगती है।" },
    { category: "romantic", en: "If this moment had a soundtrack, I think your laugh would be my favorite part.", te: "ఈ క్షణానికి సంగీతం ఉంటే, నీ నవ్వే నాకు ఇష్టమైన భాగం అవుతుంది.", hi: "अगर इस पल का कोई संगीत होता, तो तुम्हारी हँसी मेरा पसंदीदा हिस्सा होती।" },
    { category: "romantic", en: "I don’t need a perfect line; I’d rather hear the story behind your smile.", te: "నాకు పరిపూర్ణమైన మాట అవసరం లేదు; నీ నవ్వు వెనుక కథ వినాలని ఉంది.", hi: "मुझे कोई परफेक्ट लाइन नहीं चाहिए; तुम्हारी मुस्कान की कहानी सुनना पसंद करूँगा।" }
];

let pickupLanguage = "en";
let pickupCategory = "all";
let currentPickupLine = null;
let previousPickupId = -1;

function updatePickupLine() {
    const eligibleLines = pickupLines
        .map((line, index) => ({ ...line, index }))
        .filter((line) => pickupCategory === "all" || line.category === pickupCategory);
    if (!eligibleLines.length) return;
    let choice = eligibleLines[Math.floor(Math.random() * eligibleLines.length)];
    if (eligibleLines.length > 1 && choice.index === previousPickupId) {
        choice = eligibleLines[(eligibleLines.findIndex((line) => line.index === choice.index) + 1) % eligibleLines.length];
    }
    previousPickupId = choice.index;
    currentPickupLine = choice;
    document.getElementById("pickup-line").textContent = choice[pickupLanguage];
    document.getElementById("pickup-mood").textContent = `A LITTLE ${choice.category.toUpperCase()}`;
    document.getElementById("pickup-language-name").textContent = { en: "ENGLISH", te: "తెలుగు", hi: "हिन्दी" }[pickupLanguage];
    updateFavoriteButton();
}

function getSavedPickupLines() {
    try { return JSON.parse(localStorage.getItem("loveoraPickupFavorites") || "[]"); }
    catch { return []; }
}

function isPickupSaved() {
    return Boolean(currentPickupLine) && getSavedPickupLines().some((saved) => saved.id === `${currentPickupLine.index}-${pickupLanguage}`);
}

function updateFavoriteButton() {
    const button = document.getElementById("pickupFavorite");
    if (!button) return;
    const saved = isPickupSaved();
    button.classList.toggle("is-saved", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.innerHTML = `<span aria-hidden="true">${saved ? "♥" : "♡"}</span> ${saved ? "Saved" : "Save favorite"}`;
}

function openPickupLine() {
    document.getElementById("pickup-lines")?.scrollIntoView({ behavior: "smooth" });
    document.getElementById("pickup-line")?.focus({ preventScroll: true });
}

document.querySelectorAll(".pickup-language").forEach((button) => {
    button.addEventListener("click", () => {
        pickupLanguage = button.dataset.language;
        document.querySelectorAll(".pickup-language").forEach((item) => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        updatePickupLine();
    });
});

document.querySelectorAll(".pickup-category").forEach((button) => {
    button.addEventListener("click", () => {
        pickupCategory = button.dataset.category;
        document.querySelectorAll(".pickup-category").forEach((item) => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        previousPickupId = -1;
        updatePickupLine();
    });
});

document.getElementById("pickupNext").addEventListener("click", updatePickupLine);
document.getElementById("pickupCopy").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    try {
        await navigator.clipboard.writeText(currentPickupLine[pickupLanguage]);
        button.innerHTML = "<span>✓</span> Copied";
    } catch {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById("pickup-line"));
        const selection = window.getSelection();
        selection.removeAllRanges(); selection.addRange(range);
        button.innerHTML = "<span>✓</span> Select and copy";
    }
    window.setTimeout(() => { button.innerHTML = "<span>▢</span> Copy line"; }, 1800);
});
document.getElementById("pickupFavorite").addEventListener("click", () => {
    const savedLines = getSavedPickupLines();
    const id = `${currentPickupLine.index}-${pickupLanguage}`;
    const existingIndex = savedLines.findIndex((saved) => saved.id === id);
    const note = document.getElementById("pickupFavoritesNote");
    if (existingIndex >= 0) {
        savedLines.splice(existingIndex, 1);
        note.textContent = "Removed from your favorites.";
    } else {
        savedLines.push({ id, text: currentPickupLine[pickupLanguage], category: currentPickupLine.category, language: pickupLanguage });
        note.textContent = "Saved on this device. Your favorite is easy to find again.";
    }
    try { localStorage.setItem("loveoraPickupFavorites", JSON.stringify(savedLines)); }
    catch { note.textContent = "Your browser could not save favorites on this device."; }
    updateFavoriteButton();
});

updatePickupLine();


/* =========================================================
   EXPLORE LOVE BUTTON
========================================================= */

exploreButton.addEventListener("click", () => {

    const exploreSection = document.getElementById("explore");

    if (exploreSection) {
        exploreSection.scrollIntoView({
            behavior: "smooth"
        });
    }

});


/* =========================================================
   I'M FEELING CURIOUS
========================================================= */

curiousButton.addEventListener("click", () => {

    const messages = [
        "Maybe your person is closer than you think. 💗",

        "Someone out there is hoping to meet someone exactly like you. ✨",

        "Your love story doesn't need to look like anyone else's. 🌷",

        "Sometimes the best love stories start with a simple 'hey'. 💌",

        "You deserve a love that feels like home. 🏡❤️",

        "Don't rush love. Let it find you at the right time. 🌙",

        "A little courage can change an entire love story. 💘"
    ];

    const randomIndex =
        Math.floor(Math.random() * messages.length);

    showLoveMessage(messages[randomIndex]);

});


/* =========================================================
   LOVE MESSAGE POPUP
========================================================= */

function showLoveMessage(message) {

    const existingPopup =
        document.querySelector(".love-popup");

    if (existingPopup) {
        existingPopup.remove();
    }


    const popup = document.createElement("div");

    popup.className = "love-popup";

    popup.innerHTML = `
        <div class="popup-heart">♡</div>

        <p>${message}</p>

        <button class="popup-close">
            That's cute 💗
        </button>
    `;


    document.body.appendChild(popup);


    requestAnimationFrame(() => {
        popup.classList.add("show");
    });


    const closeButton =
        popup.querySelector(".popup-close");


    closeButton.addEventListener("click", () => {

        popup.classList.remove("show");

        setTimeout(() => {
            popup.remove();
        }, 300);

    });


    setTimeout(() => {

        if (document.body.contains(popup)) {

            popup.classList.remove("show");

            setTimeout(() => {
                popup.remove();
            }, 300);

        }

    }, 5000);

}


/* =========================================================
   STORY CARD INTERACTION
========================================================= */

storyCards.forEach((card) => {

    card.addEventListener("click", () => {

        const titleElement =
            card.querySelector(".story-title");

        if (!titleElement) {
            return;
        }

        const selectedStory =
            titleElement.textContent.trim();


        const storyMessages = {

            "I'm Single":
                "Single era activated. 💘 Let's make it a good one.",

            "I'm Dating":
                "Dating mode activated. 💌 Let's make those conversations easier.",

            "I'm in Love":
                "Aww, you're in love. ❤️ Let's make the little moments count.",

            "I'm Healing":
                "Healing takes time. 🌱 Be gentle with yourself.",

            "Just Exploring":
                "No pressure, no labels. ✨ Explore at your own pace."

        };


        const message =
            storyMessages[selectedStory] ||
            "Welcome to your Loveora journey. ❤️";


        showLoveMessage(message);

    });

});


/* =========================================================
   LANGUAGE SWITCHING
========================================================= */

const languageMessages = {

    "English":
        "Love sounds beautiful in every language. 💗",

    "తెలుగు":
        "ప్రేమ ఏ భాషలో చెప్పినా అందంగానే ఉంటుంది. ❤️",

    "हिन्दी":
        "प्यार किसी भी भाषा में खूबसूरत लगता है। ❤️"

};


languagePills.forEach((pill) => {

    pill.addEventListener("click", () => {

        languagePills.forEach((item) => {
            item.classList.remove("active");
        });


        pill.classList.add("active");


        const language =
            pill.textContent.trim();


        const message =
            languageMessages[language] ||
            "Love has no language. ❤️";


        showLoveMessage(message);

    });

});


/* =========================================================
   FEATURE CARD BUTTONS
========================================================= */

featureLinks.forEach((button) => {

    button.addEventListener("click", () => {

        const card =
            button.closest(".feature-card");


        if (!card) {
            return;
        }


        const titleElement =
            card.querySelector("h3");


        if (!titleElement) {
            return;
        }


        const title =
            titleElement.textContent.trim();


        if (title === "Pickup Lines") {

            openPickupLine();

        } else if (title === "Say It Better") {

            openMessageIdea();

        } else if (title === "Date Ideas") {

            openDateIdea();

        }

    });

});


/* =========================================================
   PICKUP LINE GENERATOR
========================================================= */

/* =========================================================
   MESSAGE IDEA
========================================================= */

function openMessageIdea() {

    const messages = [

        "Hey, just wanted to say that talking to you always makes my day a little better. ❤️",

        "I don't know how you do it, but somehow you always make me smile. 💗",

        "Random thought: I'm really glad I met you. 🌷",

        "You crossed my mind, so I thought I'd say hi. 😊",

        "Some people make ordinary days feel special. You're one of them. ✨"

    ];


    const randomIndex =
        Math.floor(Math.random() * messages.length);


    showLoveTool(
        "Say It Better 💌",
        messages[randomIndex],
        "Another message"
    );

}


/* =========================================================
   DATE IDEA
========================================================= */

function openDateIdea() {

    const dateIdeas = [

        "Sunset walk + street food + a playlist you both love. 🌅",

        "Find a cozy café, order something neither of you has tried, and talk for hours. ☕",

        "Take a random metro/bus ride and explore a place you've never visited together. 🚆",

        "Cook dinner together and rate each other's cooking like a reality show. 🍝",

        "Go for a night drive, grab ice cream and talk about your future dreams. 🌙🍦",

        "Have a no-phone date: just snacks, conversation and a walk. 💗"

    ];


    const randomIndex =
        Math.floor(Math.random() * dateIdeas.length);


    showLoveTool(
        "Date Idea 🌙",
        dateIdeas[randomIndex],
        "Another idea"
    );

}


/* =========================================================
   LOVE TOOL POPUP
========================================================= */

function showLoveTool(title, content, buttonText) {

    const existingPopup =
        document.querySelector(".love-tool-popup");


    if (existingPopup) {
        existingPopup.remove();
    }


    const popup =
        document.createElement("div");


    popup.className = "love-tool-popup";


    popup.innerHTML = `

        <div class="tool-popup-content">

            <button class="tool-popup-close">
                ×
            </button>

            <div class="tool-popup-icon">
                ♡
            </div>

            <span class="tool-popup-label">
                LOVEORA
            </span>

            <h3>
                ${title}
            </h3>

            <p>
                ${content}
            </p>

            <div class="tool-popup-actions">

                <button class="tool-primary">
                    ${buttonText}
                </button>

                <button class="tool-copy">
                    Copy
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(popup);


    requestAnimationFrame(() => {
        popup.classList.add("show");
    });


    const closeButton =
        popup.querySelector(".tool-popup-close");


    closeButton.addEventListener("click", () => {
        closeLoveTool(popup);
    });


    const primaryButton =
        popup.querySelector(".tool-primary");


    primaryButton.addEventListener("click", () => {

        if (title.includes("Pickup")) {
            openPickupLine();

        } else if (title.includes("Message")) {
            openMessageIdea();

        } else if (title.includes("Date")) {
            openDateIdea();

        } else if (title.includes("Check-in")) {
            openRelationshipCheckin();

        } else if (title.includes("Game")) {
            openCoupleGame();

        }

    });


    const copyButton =
        popup.querySelector(".tool-copy");


    copyButton.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(content);

            copyButton.textContent = "Copied ✓";

            setTimeout(() => {
                copyButton.textContent = "Copy";
            }, 1800);

        } catch (error) {

            copyButton.textContent = "Copy manually";

        }

    });


    popup.addEventListener("click", (event) => {

        if (event.target === popup) {
            closeLoveTool(popup);
        }

    });

}


function closeLoveTool(popup) {

    popup.classList.remove("show");

    setTimeout(() => {

        if (document.body.contains(popup)) {
            popup.remove();
        }

    }, 300);

}


/* =========================================================
   LOGIN BUTTON
========================================================= */

loginButton.addEventListener("click", () => {
    if (loveoraUser) {
        signOutOfLoveora();
    } else {
        openAuthDialog("login");
    }
});


/* =========================================================
   NAVIGATION
========================================================= */

document.querySelectorAll(".nav-links a").forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId =
            link.getAttribute("href");


        if (!targetId || !targetId.startsWith("#")) {
            return;
        }


        const target =
            document.querySelector(targetId);


        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});


/* =========================================================
   ADD POPUP STYLES
========================================================= */

const popupStyles = document.createElement("style");


popupStyles.textContent = `

    /* ===============================
       SIMPLE LOVE POPUP
    =============================== */

    .love-popup {

        position: fixed;

        left: 50%;
        bottom: 35px;

        z-index: 3000;

        width: min(420px, calc(100vw - 32px));

        padding: 22px;

        border: 1px solid rgba(255,255,255,0.8);

        border-radius: 22px;

        background: rgba(255,250,252,0.94);

        box-shadow:
            0 25px 70px rgba(54,35,50,0.2);

        backdrop-filter: blur(20px);

        text-align: center;

        opacity: 0;

        transform:
            translate(-50%, 25px);

        transition:
            opacity 0.3s ease,
            transform 0.3s ease;

    }


    .love-popup.show {

        opacity: 1;

        transform:
            translate(-50%, 0);

    }


    .popup-heart {

        color: #e76586;

        font-family:
            "Playfair Display",
            serif;

        font-size: 40px;

        line-height: 1;

    }


    .love-popup p {

        margin: 12px 0 18px;

        color: #51434d;

        font-size: 14px;

        line-height: 1.6;

    }


    .popup-close {

        border: none;

        border-radius: 999px;

        padding: 10px 17px;

        background: #ed6b89;

        color: white;

        font-size: 12px;

        font-weight: 700;

    }


    /* ===============================
       LOVE TOOL POPUP
    =============================== */

    .love-tool-popup {

        position: fixed;

        inset: 0;

        z-index: 4000;

        display: flex;

        align-items: center;
        justify-content: center;

        padding: 20px;

        background:
            rgba(39, 27, 37, 0.35);

        backdrop-filter: blur(8px);

        opacity: 0;

        transition: opacity 0.3s ease;

    }


    .love-tool-popup.show {

        opacity: 1;

    }


    .tool-popup-content {

        position: relative;

        width: min(530px, 100%);

        padding: 42px 35px 35px;

        border: 1px solid rgba(255,255,255,0.8);

        border-radius: 30px;

        background:
            linear-gradient(
                145deg,
                #fffafd,
                #fff2f6
            );

        box-shadow:
            0 30px 90px rgba(40,25,37,0.25);

        text-align: center;

        transform:
            translateY(15px)
            scale(0.97);

        transition:
            transform 0.3s ease;

    }


    .love-tool-popup.show
    .tool-popup-content {

        transform:
            translateY(0)
            scale(1);

    }


    .tool-popup-close {

        position: absolute;

        top: 17px;
        right: 19px;

        width: 32px;
        height: 32px;

        border: none;

        border-radius: 50%;

        background: #f7e9ee;

        color: #806b75;

        font-size: 22px;

        line-height: 1;

    }


    .tool-popup-icon {

        color: #e86687;

        font-family:
            "Playfair Display",
            serif;

        font-size: 55px;

        line-height: 1;

    }


    .tool-popup-label {

        display: block;

        margin-top: 12px;

        color: #d36a84;

        font-size: 9px;

        font-weight: 800;

        letter-spacing: 2px;

    }


    .tool-popup-content h3 {

        margin: 8px 0 15px;

        color: #392d36;

        font-family:
            "Playfair Display",
            serif;

        font-size: 32px;

    }


    .tool-popup-content p {

        margin: 0 auto;

        max-width: 420px;

        color: #695b65;

        font-size: 15px;

        line-height: 1.75;

    }


    .tool-popup-actions {

        display: flex;

        justify-content: center;

        gap: 10px;

        margin-top: 25px;

    }


    .tool-primary,
    .tool-copy {

        border-radius: 999px;

        padding: 11px 18px;

        font-size: 12px;

        font-weight: 700;

    }


    .tool-primary {

        border: none;

        background: #e96887;

        color: white;

    }


    .tool-copy {

        border: 1px solid #ead7de;

        background: white;

        color: #675762;

    }


    .tool-primary:hover,
    .tool-copy:hover {

        transform: translateY(-1px);

    }


    @media (max-width: 500px) {

        .tool-popup-content {

            padding:
                38px
                22px
                28px;

        }

        .tool-popup-content h3 {

            font-size: 28px;

        }

        .tool-popup-actions {

            flex-direction: column;

        }

        .tool-primary,
        .tool-copy {

            width: 100%;

        }

    }

`;


document.head.appendChild(popupStyles);


/* =========================================================
   CONSOLE MESSAGE
========================================================= */

console.log(
    "%c♡ Welcome to Loveora ♡",
    "color:#e86687;font-size:18px;font-weight:bold;"
);

console.log(
    "Made for hearts that feel deeply."
);

/* =========================================================
   LOVEORA TOOLKIT
========================================================= */

const checkInPrompts = [
    "What is one small thing I did recently that made you feel cared for?",
    "What would make this week feel a little lighter for you?",
    "What is something you would love for us to make more time for?",
    "When do you feel most listened to by me?",
    "What is one thing we handled well together lately?"
];

const coupleGamePrompts = [
    "Take turns sharing a tiny moment together that you still think about.",
    "What would our perfect no-plans day look like? Build it together, one detail at a time.",
    "Name a song that reminds you of us, then tell the story behind it.",
    "Take turns guessing each other's favorite comfort snack, place, and way to unwind.",
    "If we could take a weekend trip tomorrow, where would we go and what would we do first?",
    "Tell each other one quality you admire and one thing you want to learn together."
];

function openRelationshipCheckin() {
    const prompt = checkInPrompts[Math.floor(Math.random() * checkInPrompts.length)];
    showLoveTool("A Gentle Check-in 🫶", prompt, "Another prompt");
}

function openCoupleGame() {
    const prompt = coupleGamePrompts[Math.floor(Math.random() * coupleGamePrompts.length)];
    showLoveTool("A Little Game 🎲", prompt, "Another question");
}

function readJournalEntries() {
    try { return JSON.parse(localStorage.getItem("loveoraJournal") || "[]"); }
    catch { return []; }
}

function openLoveJournal() {
    const overlay = createToolkitOverlay("Love Journal", "A private little space for your own notes. Entries are saved only in this browser.");
    const form = document.createElement("form");
    form.className = "toolkit-journal-form";
    form.innerHTML = `<label for="journalEntry">What would you like to remember?</label><textarea id="journalEntry" name="entry" rows="4" maxlength="1200" placeholder="A moment, a thought, something you appreciate…" required></textarea><button class="tool-primary" type="submit">Save this note</button>`;
    overlay.content.appendChild(form);
    const entries = document.createElement("div");
    entries.className = "toolkit-journal-entries";
    overlay.content.appendChild(entries);
    const renderEntries = () => {
        entries.replaceChildren();
        const saved = readJournalEntries();
        if (!saved.length) {
            const empty = document.createElement("p"); empty.className = "toolkit-empty-note"; empty.textContent = "Your saved notes will appear here."; entries.appendChild(empty); return;
        }
        saved.slice().reverse().forEach((entry) => {
            const card = document.createElement("article"); card.className = "journal-entry";
            const date = document.createElement("time"); date.textContent = entry.date;
            const text = document.createElement("p"); text.textContent = entry.text;
            card.append(date, text); entries.appendChild(card);
        });
    };
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const field = form.elements.entry;
        const text = field.value.trim();
        if (!text) return;
        const saved = readJournalEntries();
        saved.push({ text, date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date()) });
        try {
            localStorage.setItem("loveoraJournal", JSON.stringify(saved));
            field.value = ""; renderEntries();
            const status = overlay.content.querySelector(".toolkit-status"); status.textContent = "Saved on this device.";
        } catch {
            overlay.content.querySelector(".toolkit-status").textContent = "Could not save. Your browser storage may be full.";
        }
    });
    const status = document.createElement("p"); status.className = "toolkit-status"; status.setAttribute("aria-live", "polite");
    form.appendChild(status);
    renderEntries();
}

function createToolkitOverlay(title, description) {
    document.querySelector(".toolkit-overlay")?.remove();
    const overlay = document.createElement("div"); overlay.className = "toolkit-overlay"; overlay.setAttribute("role", "presentation");
    const content = document.createElement("section"); content.className = "toolkit-dialog"; content.setAttribute("role", "dialog"); content.setAttribute("aria-modal", "true"); content.setAttribute("aria-labelledby", "toolkitDialogTitle");
    const close = document.createElement("button"); close.className = "toolkit-close"; close.type = "button"; close.setAttribute("aria-label", "Close"); close.textContent = "×";
    const heading = document.createElement("h2"); heading.id = "toolkitDialogTitle"; heading.textContent = title;
    const intro = document.createElement("p"); intro.className = "toolkit-dialog-intro"; intro.textContent = description;
    content.append(close, heading, intro); overlay.appendChild(content); document.body.appendChild(overlay);
    const dismiss = () => { overlay.remove(); document.removeEventListener("keydown", escapeHandler); };
    const escapeHandler = (event) => { if (event.key === "Escape" && document.body.contains(overlay)) dismiss(); };
    close.addEventListener("click", dismiss);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) dismiss(); });
    document.addEventListener("keydown", escapeHandler);
    close.focus();
    return { overlay, content };
}

function openLoveLanguageQuiz() {
    const questions = [
        { prompt: "When you’ve had a long day, what feels most caring?", choices: ["A heartfelt note or kind words", "Unhurried time together", "A thoughtful little surprise", "A hand with something on my plate", "A comforting hug"] },
        { prompt: "What do you remember most from a good day together?", choices: ["What they said that made me feel seen", "Being fully present together", "A meaningful gift or keepsake", "Something they did to help me", "A warm, affectionate moment"] },
        { prompt: "What would you most appreciate this week?", choices: ["A sincere compliment", "A planned evening together", "A small just-because treat", "Help with a task I have been carrying", "A long hug"] }
    ];
    const results = ["Words of affirmation", "Quality time", "Receiving thoughtful gifts", "Acts of service", "Physical touch"];
    const scores = Array(5).fill(0);
    let current = 0;
    const showQuestion = () => {
        const item = questions[current];
        const { content } = createToolkitOverlay("Love Language Quiz 💗", `Question ${current + 1} of ${questions.length} · Choose the answer that feels closest to you.`);
        const question = document.createElement("h3"); question.className = "toolkit-question"; question.textContent = item.prompt; content.appendChild(question);
        const choices = document.createElement("div"); choices.className = "toolkit-quiz-choices";
        item.choices.forEach((label, index) => {
            const button = document.createElement("button"); button.type = "button"; button.className = "toolkit-choice"; button.textContent = label;
            button.addEventListener("click", () => { scores[index] += 1; current += 1; if (current < questions.length) showQuestion(); else showResult(); }); choices.appendChild(button);
        });
        content.appendChild(choices);
    };
    const showResult = () => {
        const highest = Math.max(...scores); const winners = results.filter((_, index) => scores[index] === highest);
        const { content } = createToolkitOverlay("Your caring style ✨", "This is a playful reflection, not a label. People often appreciate a mix of things.");
        const result = document.createElement("p"); result.className = "toolkit-result"; result.textContent = winners.join(" + "); content.appendChild(result);
        const restart = document.createElement("button"); restart.type = "button"; restart.className = "tool-primary"; restart.textContent = "Take it again"; restart.addEventListener("click", () => { current = 0; scores.fill(0); showQuestion(); }); content.appendChild(restart);
    };
    showQuestion();
}

document.querySelectorAll("#love-tools .feature-link").forEach((button) => {
    button.addEventListener("click", () => {
        const title = button.closest(".feature-card")?.querySelector("h3")?.textContent.trim();
        if (title === "Relationship Check-in") openRelationshipCheckin();
        if (title === "Love Journal") openLoveJournal();
        if (title === "Couple Games") openCoupleGame();
        if (title === "Love Language Quiz") openLoveLanguageQuiz();
    });
});

const toolkitStyles = document.createElement("style");
toolkitStyles.textContent = `
.toolkit-overlay{position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:18px;background:rgba(42,29,41,.42);backdrop-filter:blur(8px)}
.toolkit-dialog{position:relative;width:min(560px,100%);max-height:min(88vh,850px);overflow:auto;padding:38px;border:1px solid rgba(255,255,255,.85);border-radius:28px;background:linear-gradient(145deg,#fffafd,#fff4f7);box-shadow:0 30px 90px rgba(40,25,37,.28)}
.toolkit-close{position:absolute;top:15px;right:17px;width:36px;height:36px;border:0;border-radius:50%;background:#f7e9ee;color:#806b75;font-size:24px;cursor:pointer}
.toolkit-dialog h2{margin:8px 40px 8px 0;color:#392d36;font:600 32px/1.15 "Playfair Display",serif}
.toolkit-dialog-intro,.toolkit-status,.toolkit-empty-note{color:#776874;font-size:13px;line-height:1.65}
.toolkit-dialog-intro{margin:0 0 22px}
.toolkit-journal-form{display:grid;gap:11px}.toolkit-journal-form label{color:#554651;font-size:13px;font-weight:700}
.toolkit-journal-form textarea{width:100%;resize:vertical;border:1px solid #ead9e0;border-radius:16px;padding:14px;background:#fff;color:#453743;font:inherit;line-height:1.6}
.toolkit-journal-form .tool-primary,.toolkit-dialog>.tool-primary{justify-self:start;border:0;border-radius:999px;padding:12px 19px;background:#e96887;color:#fff;font-weight:700;cursor:pointer}
.toolkit-status{margin:0}.toolkit-journal-entries{display:grid;gap:10px;margin-top:18px}.journal-entry{padding:14px 16px;border:1px solid #f0e2e7;border-radius:15px;background:rgba(255,255,255,.7)}.journal-entry time{color:#ba8392;font-size:10px;font-weight:700;letter-spacing:.4px}.journal-entry p{margin:7px 0 0;color:#594d57;font-size:13px;line-height:1.6;white-space:pre-wrap}
.toolkit-question{margin:0 0 16px;color:#453743;font:500 22px/1.4 "Playfair Display",serif}.toolkit-quiz-choices{display:grid;gap:9px}.toolkit-choice{border:1px solid #ecdde3;border-radius:14px;padding:13px 15px;background:#fff;text-align:left;color:#574b56;font:600 13px/1.4 "DM Sans",sans-serif;cursor:pointer;transition:.2s}.toolkit-choice:hover{border-color:#e36b89;background:#fff6f8;transform:translateY(-1px)}.toolkit-result{margin:12px 0 22px;color:#d45f80;font:600 30px/1.3 "Playfair Display",serif}
@media(max-width:560px){.toolkit-dialog{padding:34px 21px 24px;border-radius:22px}.toolkit-dialog h2{font-size:28px}}
`;
document.head.appendChild(toolkitStyles);

/* =========================================================
   ACCOUNT + COMMUNITY EXPERIENCE
========================================================= */

let loveoraUser = null;
let authMode = "login";
const authDialog = document.getElementById("authDialog");
const authForm = document.getElementById("authForm");
const communityFeed = document.getElementById("communityFeed");

async function loveoraApi(path, options = {}) {
    const response = await fetch(path, {
        credentials: "same-origin",
        ...options,
        headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        throw new Error(`Loveora's account service returned an unexpected response (HTTP ${response.status}). Refresh the page and try again.`);
    }
    const result = await response.json().catch(() => null);
    if (!result) throw new Error("Loveora received an unreadable response. Refresh the page and try again.");
    if (!response.ok) throw new Error(result.error || `The account server returned an error (HTTP ${response.status}).`);
    return result;
}

function openAuthDialog(mode = "login") {
    authMode = mode;
    const registering = mode === "register";
    document.getElementById("authTitle").textContent = registering ? "Make yourself at home." : "Welcome back.";
    document.getElementById("authDescription").textContent = registering ? "Create an account to post, react, and join the Loveora Kindness Wall." : "Sign in to share a little kindness and join the community.";
    document.getElementById("authSubmit").textContent = registering ? "Create my account" : "Sign in";
    document.getElementById("authModeToggle").textContent = registering ? "Already have an account? Sign in" : "New here? Create an account";
    document.getElementById("authPassword").autocomplete = registering ? "new-password" : "current-password";
    document.getElementById("authName").hidden = !registering;
    document.getElementById("authName").required = registering;
    document.getElementById("authNameLabel").hidden = !registering;
    document.getElementById("authStatus").textContent = "";
    if (!authDialog.open) authDialog.showModal();
    window.setTimeout(() => (registering ? document.getElementById("authName") : document.getElementById("authEmail")).focus(), 50);
}

document.getElementById("authClose").addEventListener("click", () => authDialog.close());
document.getElementById("authModeToggle").addEventListener("click", () => openAuthDialog(authMode === "login" ? "register" : "login"));
document.getElementById("communityJoinButton").addEventListener("click", () => openAuthDialog("register"));
authDialog.addEventListener("click", (event) => { if (event.target === authDialog) authDialog.close(); });

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = document.getElementById("authSubmit");
    const status = document.getElementById("authStatus");
    submit.disabled = true; status.textContent = "One little moment… ✨";
    const body = {
        displayName: document.getElementById("authName").value.trim(),
        email: document.getElementById("authEmail").value.trim(),
        password: document.getElementById("authPassword").value
    };
    try {
        const route = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
        const result = await loveoraApi(route, { method: "POST", body: JSON.stringify(body) });
        loveoraUser = result.user;
        authForm.reset(); authDialog.close(); updateAccountUI(); await loadCommunity();
        showLoveMessage(`Welcome to Loveora, ${loveoraUser.displayName}! ✨`);
    } catch (error) {
        status.textContent = error.message.includes("Failed to fetch")
            ? "Can't reach Loveora right now. Check your connection and try again in a moment."
            : error.message;
    } finally {
        submit.disabled = false;
    }
});

async function signOutOfLoveora() {
    try { await loveoraApi("/api/auth/logout", { method: "POST", body: "{}" }); }
    catch { showLoveMessage("Loveora could not sign you out right now. Please try again. 💗"); return; }
    loveoraUser = null; updateAccountUI(); await loadCommunity();
}

function updateAccountUI() {
    loginButton.innerHTML = loveoraUser ? `Sign out <span aria-hidden="true">↗</span>` : `Join Loveora <span aria-hidden="true">♡</span>`;
    document.getElementById("communityJoinButton").hidden = Boolean(loveoraUser);
    document.getElementById("communityComposer").hidden = !loveoraUser;
    document.getElementById("communityWelcome").textContent = loveoraUser ? `Hi, ${loveoraUser.displayName}! 🌷` : "Join the Loveora community";
    document.getElementById("communityGateText").textContent = loveoraUser ? "Leave a kind little note for the community." : "Create an account to share a kind note and cheer people on.";
}

function renderCommunityPosts(posts) {
    communityFeed.replaceChildren();
    if (!posts.length) {
        const empty = document.createElement("div"); empty.className = "community-empty";
        empty.innerHTML = "<span aria-hidden='true'>🌱</span><strong>Be the first to leave a little kindness.</strong><p>This wall is ready for its first note.</p>";
        communityFeed.appendChild(empty); return;
    }
    posts.forEach((post, index) => {
        const card = document.createElement("article"); card.className = "community-post"; card.style.setProperty("--post-index", index);
        const header = document.createElement("div"); header.className = "community-post-header";
        const avatar = document.createElement("span"); avatar.className = "community-avatar"; avatar.setAttribute("aria-hidden", "true"); avatar.textContent = ["💗", "🌼", "🦋", "🌈", "✨"][index % 5];
        const identity = document.createElement("div"); identity.className = "community-post-identity";
        const author = document.createElement("strong"); author.textContent = post.displayName;
        const date = document.createElement("time"); date.dateTime = post.createdAt; date.textContent = formatCommunityDate(post.createdAt);
        identity.append(author, date); header.append(avatar, identity);
        const message = document.createElement("p"); message.className = "community-post-message"; message.textContent = post.message;
        const actions = document.createElement("div"); actions.className = "community-post-actions";
        const heart = document.createElement("button"); heart.type = "button"; heart.className = `community-heart ${post.hasHearted ? "hearted" : ""}`; heart.dataset.postId = post.id; heart.setAttribute("aria-pressed", String(post.hasHearted)); heart.innerHTML = `<span aria-hidden="true">${post.hasHearted ? "💖" : "♡"}</span> <span>${post.hearts || "Send a heart"}</span>`;
        actions.appendChild(heart);
        if (loveoraUser && !post.isMine) {
            const report = document.createElement("button"); report.type = "button"; report.className = "community-report"; report.dataset.postId = post.id; report.textContent = "Report"; actions.appendChild(report);
        }
        card.append(header, message, actions); communityFeed.appendChild(card);
    });
}

function formatCommunityDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "A little while ago";
    const elapsed = Date.now() - date.getTime();
    if (elapsed < 60_000) return "Just now";
    if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
    if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

async function loadCommunity() {
    try {
        const result = await loveoraApi("/api/community/posts"); renderCommunityPosts(result.posts);
    } catch (error) {
        communityFeed.replaceChildren();
        const note = document.createElement("div"); note.className = "community-empty";
        note.innerHTML = "<span aria-hidden='true'>💌</span><strong>Your community is almost ready.</strong><p>Loveora couldn't reach the community service. Please refresh in a moment.</p>";
        communityFeed.appendChild(note);
    }
}

document.getElementById("communityMessage").addEventListener("input", (event) => {
    document.getElementById("communityCharacterCount").textContent = `${event.currentTarget.value.length} / 500`;
});
document.getElementById("communityPostButton").addEventListener("click", async () => {
    const message = document.getElementById("communityMessage").value.trim();
    const status = document.getElementById("communityStatus");
    if (message.length < 3) { status.textContent = "Write just a little more before sharing. 💗"; return; }
    const button = document.getElementById("communityPostButton"); button.disabled = true; status.textContent = "Sending a little kindness…";
    try {
        await loveoraApi("/api/community/posts", { method: "POST", body: JSON.stringify({ message }) });
        document.getElementById("communityMessage").value = ""; document.getElementById("communityCharacterCount").textContent = "0 / 500";
        status.textContent = "Your note is on the wall. Thanks for making it kinder! ✨"; await loadCommunity();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
});

document.getElementById("communityFeed").addEventListener("click", async (event) => {
    const heart = event.target.closest(".community-heart");
    const report = event.target.closest(".community-report");
    const action = heart || report;
    if (!action) return;
    if (!loveoraUser) { openAuthDialog("login"); return; }
    try {
        const route = heart ? "heart" : "report";
        const result = await loveoraApi(`/api/community/posts/${action.dataset.postId}/${route}`, { method: "POST", body: "{}" });
        if (heart) await loadCommunity();
        else { action.closest(".community-post").remove(); showLoveMessage(result.message || "Thanks for helping keep this corner kind. 💗"); }
    } catch (error) { showLoveMessage(error.message); }
});
document.getElementById("communityRefresh").addEventListener("click", loadCommunity);

async function initializeLoveoraAccount() {
    updateAccountUI(); loadCommunity();
    try { const result = await loveoraApi("/api/auth/me"); loveoraUser = result.user; updateAccountUI(); await loadCommunity(); }
    catch { /* The static preview remains usable when the local server is not running. */ }
}

initializeLoveoraAccount();
