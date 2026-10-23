/* =========================================================
   LANGUAGE SWITCH: English (default) + Croatian
   ---------------------------------------------------------
   HOW IT WORKS
   - English is written normally in the HTML.
   - The Croatian text sits in a data attribute on the SAME element:
         <h2 data-hr="Naši apartmani">Our Apartments</h2>
     Other attributes: data-hr-alt, data-hr-placeholder,
     data-hr-aria-label, data-hr-title, data-hr-content (meta tags).
   - Texts written by JavaScript (calendar, form messages) are in
     the TEXT dictionary below.
   - The visitor's choice is remembered (localStorage). Without a
     choice, Croatian is used when the browser language is Croatian.
   - https://.../index.html?lang=hr opens the page in Croatian.
   - If a translation is missing, the English text simply stays.
   ========================================================= */
(function () {
    "use strict";

    var SUPPORTED = ["en", "hr"];
    var STORAGE_KEY = "villa-lang";
    var LOCALE = { en: "en-GB", hr: "hr-HR" };
    var html = document.documentElement;
    var lang = "en";
    var listeners = [];

    html.classList.remove("no-js");
    html.classList.add("js");

    /* ---------- texts written by JavaScript ---------- */
    var TEXT = {
        en: {
            "unit.night": { one: "night", other: "nights" },
            "unit.guest": { one: "guest", other: "guests" },
            "season.low": "Low season",
            "season.mid": "Mid season",
            "season.high": "High season",

            "cal.prev": "Previous month",
            "cal.next": "Next month",
            "cal.available": "Available",
            "cal.booked": "Booked",
            "cal.yourStay": "Your stay",
            "cal.perNight": "/ night · min {n} {nights}",
            "cal.dayFree": "{date}, {price} per night",
            "cal.dayBooked": "{date}, booked",
            "cal.dayDeparture": "{date}, booked (departure possible)",
            "cal.dayPast": "{date}, not available",

            "bk.title": "Your Stay",
            "bk.checkIn": "Check-in",
            "bk.checkOut": "Check-out",
            "bk.selectDate": "Select date",
            "bk.hintStart": "Choose your arrival and departure dates in the calendar.",
            "bk.hintEnd": "Now choose your departure date.",
            "bk.total": "Total · {n} {nights}",
            "bk.minStay": "Minimum stay for these dates is {n} {nights}.",
            "bk.name": "Your Name",
            "bk.email": "Email Address",
            "bk.guests": "Guests",
            "bk.message": "Message",
            "bk.optional": "(optional)",
            "bk.namePh": "John Doe",
            "bk.emailPh": "john@example.com",
            "bk.msgPh": "Arrival time, questions...",
            "bk.send": "Send Booking Enquiry",
            "bk.note": "This is an enquiry, not a confirmed booking. We'll reply within 24 hours.",
            "bk.privacy": "We only use your details to reply to your enquiry.",
            "bk.noscript": "Please enable JavaScript to see availability, or email us at {email}.",

            "msg.invalid": "Please enter your name and a valid email address.",
            "msg.sending": "Sending...",
            "msg.sent": "Thank you! Your message has been sent. We'll reply within 24 hours.",
            "msg.sentInquiry": "Thank you! Your enquiry has been sent. We'll reply within 24 hours.",
            "msg.emailApp": "Your email app should open with the message ready to send. Just press Send!",
            "msg.failed": "The message could not be sent. Please try again, or email us at {email}.",
            "msg.wait": "Please wait a moment before sending another message.",

            "slider.goTo": "Go to photo {n}"
        },
        hr: {
            "unit.night": { one: "noć", few: "noći", other: "noći" },
            "unit.guest": { one: "gost", few: "gosta", other: "gostiju" },
            "season.low": "Niska sezona",
            "season.mid": "Srednja sezona",
            "season.high": "Visoka sezona",

            "cal.prev": "Prethodni mjesec",
            "cal.next": "Sljedeći mjesec",
            "cal.available": "Slobodno",
            "cal.booked": "Zauzeto",
            "cal.yourStay": "Vaš boravak",
            "cal.perNight": "/ noć · min. {n} {nights}",
            "cal.dayFree": "{date}, {price} po noći",
            "cal.dayBooked": "{date}, zauzeto",
            "cal.dayDeparture": "{date}, zauzeto (odlazak je moguć)",
            "cal.dayPast": "{date}, nije dostupno",

            "bk.title": "Vaš boravak",
            "bk.checkIn": "Dolazak",
            "bk.checkOut": "Odlazak",
            "bk.selectDate": "Odaberite datum",
            "bk.hintStart": "Odaberite datum dolaska i odlaska u kalendaru.",
            "bk.hintEnd": "Sada odaberite datum odlaska.",
            "bk.total": "Ukupno · {n} {nights}",
            "bk.minStay": "Minimalni boravak za ove datume je {n} {nights}.",
            "bk.name": "Vaše ime",
            "bk.email": "Adresa e-pošte",
            "bk.guests": "Gosti",
            "bk.message": "Poruka",
            "bk.optional": "(neobavezno)",
            "bk.namePh": "Ivan Horvat",
            "bk.emailPh": "ivan@example.com",
            "bk.msgPh": "Vrijeme dolaska, pitanja...",
            "bk.send": "Pošalji upit za rezervaciju",
            "bk.note": "Ovo je upit, a ne potvrđena rezervacija. Odgovaramo u roku od 24 sata.",
            "bk.privacy": "Vaše podatke koristimo samo za odgovor na vaš upit.",
            "bk.noscript": "Uključite JavaScript za prikaz dostupnosti ili nam pišite na {email}.",

            "msg.invalid": "Unesite svoje ime i ispravnu adresu e-pošte.",
            "msg.sending": "Šaljem...",
            "msg.sent": "Hvala! Vaša poruka je poslana. Odgovorit ćemo u roku od 24 sata.",
            "msg.sentInquiry": "Hvala! Vaš upit je poslan. Odgovorit ćemo u roku od 24 sata.",
            "msg.emailApp": "Vaš program za e-poštu trebao bi se otvoriti s pripremljenom porukom. Samo stisnite Pošalji!",
            "msg.failed": "Poruku nije moguće poslati. Pokušajte ponovno ili nam pišite na {email}.",
            "msg.wait": "Pričekajte trenutak prije slanja nove poruke.",

            "slider.goTo": "Idi na fotografiju {n}"
        }
    };

    /* ---------- helpers other scripts can use ---------- */
    function locale() { return LOCALE[lang]; }

    function t(key, vars) {
        var entry = TEXT[lang][key];
        if (entry === undefined) entry = TEXT.en[key];
        if (entry === undefined) return key;
        vars = vars || {};
        if (typeof entry === "object") {
            var category = new Intl.PluralRules(locale()).select(Number(vars.n));
            entry = entry[category] || entry.other;
        }
        return entry.replace(/\{(\w+)\}/g, function (match, name) {
            return vars[name] !== undefined ? vars[name] : match;
        });
    }

    function money(amount, currency) {
        return new Intl.NumberFormat(locale(), {
            style: "currency",
            currency: currency || "EUR",
            maximumFractionDigits: 0
        }).format(amount);
    }

    function date(d, options) {
        return new Intl.DateTimeFormat(locale(), options || { day: "numeric", month: "short", year: "numeric" }).format(d);
    }

    /** Month name on its own ("July" / "srpanj"), month = 0..11 */
    function monthName(month) { return date(new Date(2024, month, 1), { month: "long" }); }

    /** Short weekday names, Monday first */
    function weekdays() {
        var names = [];
        for (var i = 0; i < 7; i++) names.push(date(new Date(2024, 0, 1 + i), { weekday: "short" }));
        return names;
    }

    /* ---------- translating the static HTML ---------- */
    var ATTRS = ["alt", "placeholder", "aria-label", "title", "content"];
    var originals = new WeakMap();

    function remember(el) {
        var saved = { attrs: {} };
        if (el.hasAttribute("data-hr")) saved.text = el.textContent;
        ATTRS.forEach(function (name) {
            if (el.hasAttribute("data-hr-" + name)) saved.attrs[name] = el.getAttribute(name);
        });
        originals.set(el, saved);
        return saved;
    }

    function applyToPage() {
        var selector = "[data-hr]," + ATTRS.map(function (a) { return "[data-hr-" + a + "]"; }).join(",");
        document.querySelectorAll(selector).forEach(function (el) {
            var saved = originals.get(el) || remember(el);
            var croatian = lang === "hr";
            if (saved.text !== undefined) el.textContent = croatian ? el.getAttribute("data-hr") : saved.text;
            Object.keys(saved.attrs).forEach(function (name) {
                el.setAttribute(name, croatian ? el.getAttribute("data-hr-" + name) : saved.attrs[name]);
            });
        });

        document.querySelectorAll(".lang-btn").forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
        });
    }

    function setLang(next, persist) {
        if (SUPPORTED.indexOf(next) === -1) return;
        lang = next;
        html.setAttribute("lang", next);
        applyToPage();
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode: ignore */ }
        }
        listeners.forEach(function (fn) { fn(next); });
    }

    function detect() {
        var fromUrl = new URLSearchParams(window.location.search).get("lang");
        if (fromUrl && SUPPORTED.indexOf(fromUrl.toLowerCase()) !== -1) {
            return { lang: fromUrl.toLowerCase(), persist: true };
        }
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (SUPPORTED.indexOf(saved) !== -1) return { lang: saved, persist: false };
        } catch (e) { /* storage blocked: ignore */ }
        var browser = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
        return { lang: browser.toLowerCase().indexOf("hr") === 0 ? "hr" : "en", persist: false };
    }

    window.VillaI18n = {
        get lang() { return lang; },
        locale: locale,
        t: t,
        money: money,
        date: date,
        monthName: monthName,
        weekdays: weekdays,
        setLang: setLang,
        onChange: function (fn) { listeners.push(fn); }
    };

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
        btn.addEventListener("click", function () { setLang(btn.getAttribute("data-set-lang"), true); });
    });

    var start = detect();
    if (start.lang !== "en") setLang(start.lang, start.persist);
    else {
        applyToPage();
        if (start.persist) setLang("en", true);
    }
})();
