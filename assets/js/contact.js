/* =========================================================
   SENDING MESSAGES: contact form (home page) + booking inquiry
   ---------------------------------------------------------
   Messages are sent with Web3Forms (free, about 250 a month).
   The key goes into config.js (web3formsKey). Until a key is
   entered, the guest's email app opens with the message ready,
   so no inquiry is ever lost.

   Spam protection (no CAPTCHA to annoy guests):
   - hidden "website" field that only bots fill in
   - forms submitted within 2.5 seconds of page load are ignored
   - a short pause between two messages
   This file does not need to be edited.
   ========================================================= */
(function () {
    "use strict";

    var C = window.VILLA_CONFIG || {};
    var I = window.VillaI18n;
    var OPENED_AT = Date.now();
    var COOLDOWN_MS = 20000;
    var lastSentAt = 0;

    var hasKey = function () {
        return Boolean(C.web3formsKey) && !/^(YOUR_|UPISI)/i.test(C.web3formsKey);
    };

    /** Trim, remove control characters and cap the length. */
    function clean(value, max) {
        return String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
    }

    /**
     * Sends one message. Resolves with "sent" (delivered by Web3Forms)
     * or "email-app" (the guest's email program was opened).
     * Used by the contact form below and by calendar.js.
     */
    function send(message) {
        var subject = clean(message.subject, 150);
        var body = clean(message.body, 4000);
        var name = clean(message.name, 80);
        var email = clean(message.email, 120);

        if (!hasKey()) {
            window.location.href = "mailto:" + C.email +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);
            return Promise.resolve("email-app");
        }

        return fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                access_key: C.web3formsKey,
                subject: subject,
                from_name: "Villa Istra website",
                name: name,
                email: email,                     // "Reply" in your inbox goes to the guest
                message: body
            })
        }).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (result) {
                if (!response.ok || result.success === false) {
                    throw new Error(result.message || "Web3Forms " + response.status);
                }
                return "sent";
            });
        });
    }

    /** Spam checks shared by both forms. Returns true if the submit should be ignored silently. */
    function looksLikeBot(form) {
        var trap = form.querySelector(".hp-field input");
        return Boolean((trap && trap.value) || Date.now() - OPENED_AT < 2500);
    }

    function tooSoon() { return Date.now() - lastSentAt < COOLDOWN_MS; }
    function markSent() { lastSentAt = Date.now(); }

    function show(el, text, kind) {
        el.className = "form-msg" + (kind ? " is-" + kind : "");
        el.textContent = text;
    }

    window.VillaMail = { send: send, clean: clean, looksLikeBot: looksLikeBot, tooSoon: tooSoon, markSent: markSent, show: show };

    /* ---------- contact form on the home page ---------- */
    var form = document.getElementById("contact-form");
    if (!form) return;

    var msg = form.querySelector(".form-msg");
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = clean(form.elements.name.value, 80);
        var emailField = form.elements.email;
        var email = clean(emailField.value, 120);

        form.elements.name.removeAttribute("aria-invalid");
        emailField.removeAttribute("aria-invalid");

        if (!name || !email || !emailField.checkValidity()) {
            var bad = !name ? form.elements.name : emailField;
            bad.setAttribute("aria-invalid", "true");
            show(msg, I.t("msg.invalid"), "error");
            bad.focus();
            return;
        }

        // Bots get a friendly "thank you" and nothing is sent
        if (looksLikeBot(form)) {
            show(msg, I.t("msg.sent"), "ok");
            form.reset();
            return;
        }

        if (tooSoon()) { show(msg, I.t("msg.wait"), "error"); return; }

        var dates = clean(form.elements.dates.value, 80);
        var apartment = clean(form.elements.apartment.value, 60);
        var text = [
            "Name: " + name,
            "Email: " + email,
            "Preferred dates: " + (dates || "-"),
            "Interested in: " + apartment,
            "Guest language: " + (I.lang === "hr" ? "Croatian" : "English"),
            "",
            clean(form.elements.message.value, 2000)
        ].join("\n");

        button.disabled = true;
        show(msg, I.t("msg.sending"));

        send({
            subject: "Website message: " + apartment + (dates ? ", " + dates : ""),
            body: text,
            name: name,
            email: email
        }).then(function (how) {
            if (how === "sent") {
                markSent();
                show(msg, I.t("msg.sent"), "ok");
                form.reset();
            } else {
                show(msg, I.t("msg.emailApp"), "ok");
            }
        }).catch(function (error) {
            console.error(error);
            show(msg, I.t("msg.failed", { email: C.email }), "error");
        }).then(function () {
            button.disabled = false;
        });
    });
})();
