/* =========================================================
   AVAILABILITY CALENDAR + BOOKING INQUIRY
   ---------------------------------------------------------
   Prices, seasons and booked dates live in config.js.
   This file does not need to be edited.

   - Guests pick arrival and departure dates, see the price
     per night and the total, and send an inquiry (not a
     confirmed booking).
   - Booked days are crossed out. A booked day can still be
     the DEPARTURE day of a stay.
   - Works with the keyboard: Tab to the calendar, arrow keys
     move between days, Enter selects, PageUp/PageDown change month.
   - English and Croatian (see i18n.js).
   ========================================================= */
(function () {
    "use strict";

    var box = document.getElementById("booking-calendar");
    var C = window.VILLA_CONFIG;
    var I = window.VillaI18n;
    var M = window.VillaMail;
    if (!box || !C || !I) return;

    var key = box.getAttribute("data-room");
    var room = C.rooms[key];
    if (!room) return;

    /* ---------- date helpers ---------- */
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var ymd = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
    var md = function (d) { return pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
    var parse = function (s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
    var addDays = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
    var esc = function (s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    };

    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    var inSeason = function (d) { return md(d) >= C.season.from && md(d) <= C.season.to; };
    var periodOf = function (d) {
        var p = C.periods.find(function (r) { return md(d) >= r.from && md(d) <= r.to; });
        return p ? p.id : null;
    };
    var priceOf = function (d) { return room.price[periodOf(d)]; };
    var money = function (n) { return I.money(n, C.currency); };
    var shortDate = function (d) { return I.date(d); };
    var roomName = function () { return room.name[I.lang] || room.name.en; };

    /* ---------- booked nights ---------- */
    var booked = new Set();
    function addRange(from, to) {                 // [arrival, departure): the departure night is free
        for (var d = from; d < to; d = addDays(d, 1)) booked.add(ymd(d));
    }
    (room.booked || []).forEach(function (pair) { addRange(parse(pair[0]), parse(pair[1])); });

    var nightFree = function (d) { return d >= today && inSeason(d) && !booked.has(ymd(d)); };

    /* ---------- months shown: every month of the season, this year and next ---------- */
    var months = [];
    for (var y = today.getFullYear(); y <= today.getFullYear() + 1; y++) {
        for (var m = 0; m < 12; m++) {
            var first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
            if ((inSeason(first) || inSeason(last)) && last >= today) months.push([y, m]);
        }
    }

    var start = 0;
    var checkIn = null, checkOut = null, hover = null;
    var perView = function () { return window.matchMedia("(max-width: 760px)").matches ? 1 : 2; };

    /* ---------- markup (static texts are filled in by applyStatic) ---------- */
    box.innerHTML =
        '<div class="price-chips"></div>' +
        '<div class="booking-layout">' +
          '<div class="cal-card">' +
            '<div class="cal-nav">' +
              '<button type="button" class="cal-arrow" data-dir="-1" data-k-label="cal.prev"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-chevron-left"></use></svg></button>' +
              '<span class="cal-range" aria-live="polite"></span>' +
              '<button type="button" class="cal-arrow" data-dir="1" data-k-label="cal.next"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-chevron-right"></use></svg></button>' +
            '</div>' +
            '<div class="cal-months"></div>' +
            '<div class="cal-legend">' +
              '<span><i class="lg lg-free"></i><span data-k="cal.available"></span></span>' +
              '<span><i class="lg lg-booked"></i><span data-k="cal.booked"></span></span>' +
              '<span><i class="lg lg-selected"></i><span data-k="cal.yourStay"></span></span>' +
            '</div>' +
          '</div>' +
          '<form class="inquiry-card" novalidate>' +
            '<h3 data-k="bk.title"></h3>' +
            '<div class="stay-dates">' +
              '<div><small data-k="bk.checkIn"></small><strong class="ci"></strong></div>' +
              '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-arrow-right"></use></svg>' +
              '<div><small data-k="bk.checkOut"></small><strong class="co"></strong></div>' +
            '</div>' +
            '<div class="stay-summary" aria-live="polite"></div>' +
            '<div class="form-group"><label for="bk-name" data-k="bk.name"></label><input id="bk-name" name="name" type="text" required maxlength="80" autocomplete="name" data-k-ph="bk.namePh"></div>' +
            '<div class="form-group"><label for="bk-email" data-k="bk.email"></label><input id="bk-email" name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" data-k-ph="bk.emailPh"></div>' +
            '<div class="form-group"><label for="bk-guests" data-k="bk.guests"></label><select id="bk-guests" name="guests"></select></div>' +
            '<div class="form-group"><label for="bk-msg"><span data-k="bk.message"></span> <span class="optional" data-k="bk.optional"></span></label><textarea id="bk-msg" name="message" rows="3" maxlength="2000" data-k-ph="bk.msgPh"></textarea></div>' +
            '<div class="hp-field" aria-hidden="true"><label for="bk-website">Leave this empty</label><input type="text" id="bk-website" name="website" tabindex="-1" autocomplete="off"></div>' +
            '<button type="submit" class="btn btn-primary btn-block" disabled data-k="bk.send"></button>' +
            '<p class="form-note" data-k="bk.note"></p>' +
            '<p class="form-note" data-k="bk.privacy"></p>' +
            '<p class="form-msg" role="status"></p>' +
          '</form>' +
        '</div>';

    var chipsEl = box.querySelector(".price-chips");
    var monthsEl = box.querySelector(".cal-months");
    var rangeEl = box.querySelector(".cal-range");
    var summaryEl = box.querySelector(".stay-summary");
    var form = box.querySelector("form");
    var submit = form.querySelector('button[type="submit"]');
    var guestsEl = form.querySelector("#bk-guests");
    var msgEl = form.querySelector(".form-msg");

    /* ---------- texts that depend on the language ---------- */
    function applyStatic() {
        box.querySelectorAll("[data-k]").forEach(function (el) { el.textContent = I.t(el.getAttribute("data-k")); });
        box.querySelectorAll("[data-k-ph]").forEach(function (el) { el.setAttribute("placeholder", I.t(el.getAttribute("data-k-ph"))); });
        box.querySelectorAll("[data-k-label]").forEach(function (el) { el.setAttribute("aria-label", I.t(el.getAttribute("data-k-label"))); });

        // price chips
        var seen = [];
        C.periods.forEach(function (p) { if (seen.indexOf(p.id) === -1) seen.push(p.id); });
        var monthShort = function (mm) { return I.date(new Date(2024, +mm - 1, 1), { month: "short" }); };
        chipsEl.innerHTML = seen.map(function (id) {
            var when = C.periods.filter(function (p) { return p.id === id; }).map(function (p) {
                var a = p.from.slice(0, 2), b = p.to.slice(0, 2);
                return monthShort(a) + (a === b ? "" : "–" + monthShort(b));
            }).join(" & ");
            var nights = room.minNights[id];
            return '<div class="price-chip"><span>' + esc(when) + '</span><strong>' + esc(money(room.price[id])) + '</strong>' +
                   '<small>' + esc(I.t("cal.perNight", { n: nights, nights: I.t("unit.night", { n: nights }) })) + '</small></div>';
        }).join("");

        // guest list keeps the chosen value when the language changes
        var chosen = guestsEl.value || "1";
        guestsEl.innerHTML = "";
        for (var i = 1; i <= room.maxGuests; i++) {
            var opt = document.createElement("option");
            opt.value = String(i);
            opt.textContent = i + " " + I.t("unit.guest", { n: i });
            guestsEl.appendChild(opt);
        }
        guestsEl.value = chosen;
    }

    /* ---------- calendar grid ---------- */
    function buildMonths() {
        var n = perView();
        start = Math.max(0, Math.min(start, months.length - n));
        var shown = months.slice(start, start + n);
        var dow = I.weekdays();

        monthsEl.innerHTML = shown.map(function (pair) {
            var yy = pair[0], mm = pair[1];
            var offset = (new Date(yy, mm, 1).getDay() + 6) % 7;            // Monday first
            var daysIn = new Date(yy, mm + 1, 0).getDate();
            var cells = new Array(offset + 1).join('<span class="cal-empty"></span>');
            for (var day = 1; day <= daysIn; day++) {
                cells += '<button type="button" class="cal-day" data-date="' + ymd(new Date(yy, mm, day)) + '">' +
                         '<span>' + day + '</span><small class="p"></small></button>';
            }
            return '<div class="cal-month"><h3>' + esc(I.monthName(mm) + " " + yy) + '</h3>' +
                   '<div class="cal-grid" role="group" aria-label="' + esc(I.monthName(mm) + " " + yy) + '">' +
                   dow.map(function (x) { return '<span class="cal-dow" aria-hidden="true">' + esc(x) + '</span>'; }).join("") +
                   cells + '</div></div>';
        }).join("");

        var a = shown[0], b = shown[shown.length - 1];
        rangeEl.textContent = a === b ? I.monthName(a[1]) + " " + a[0]
            : a[0] === b[0] ? I.monthName(a[1]) + " – " + I.monthName(b[1]) + " " + b[0]
            : I.monthName(a[1]) + " " + a[0] + " – " + I.monthName(b[1]) + " " + b[0];
        box.querySelector('[data-dir="-1"]').disabled = start === 0;
        box.querySelector('[data-dir="1"]').disabled = start + n >= months.length;
        paint();
    }

    /** Is d a valid departure day for the chosen arrival? */
    function validCheckout(d) {
        if (!checkIn || d <= checkIn) return false;
        for (var x = checkIn; x < d; x = addDays(x, 1)) if (!nightFree(x)) return false;
        return true;
    }

    /** Updates classes, labels and prices of the day buttons without rebuilding them. */
    function paint() {
        var end = checkOut || (hover && checkIn && hover > checkIn && validCheckout(hover) ? hover : null);
        var active = document.activeElement;
        var focusId = active && active.classList && active.classList.contains("cal-day") ? active.getAttribute("data-date") : null;
        var firstEnabled = null, tabStop = null;

        monthsEl.querySelectorAll(".cal-day").forEach(function (btn) {
            var id = btn.getAttribute("data-date"), d = parse(id);
            var past = d < today || !inSeason(d);
            var isBooked = booked.has(id);
            var departureOnly = isBooked && validCheckout(d);
            var disabled = past || (isBooked && !departureOnly);

            var cls = ["cal-day"];
            if (past) cls.push("is-past");
            else if (isBooked) cls.push("is-booked");
            if (id === ymd(today)) cls.push("is-today");
            if (checkIn && id === ymd(checkIn)) cls.push("is-start");
            if (end && id === ymd(end)) cls.push("is-end");
            if (checkIn && end && d > checkIn && d < end) cls.push("in-range");
            btn.className = cls.join(" ");
            btn.disabled = disabled;

            var priceEl = btn.querySelector(".p");
            var showPrice = !past && !isBooked;
            priceEl.textContent = showPrice ? money(priceOf(d)) : " ";

            var when = I.date(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            btn.setAttribute("aria-label",
                past ? I.t("cal.dayPast", { date: when })
                : departureOnly ? I.t("cal.dayDeparture", { date: when })
                : isBooked ? I.t("cal.dayBooked", { date: when })
                : I.t("cal.dayFree", { date: when, price: money(priceOf(d)) }));
            var selected = (checkIn && id === ymd(checkIn)) || (checkOut && id === ymd(checkOut));
            if (selected) btn.setAttribute("aria-pressed", "true"); else btn.removeAttribute("aria-pressed");

            if (!disabled && !firstEnabled) firstEnabled = btn;
            if (!disabled && (id === focusId || (!tabStop && checkIn && id === ymd(checkIn)))) tabStop = btn;
            btn.tabIndex = -1;
        });
        (tabStop || firstEnabled || { }).tabIndex = 0;
    }

    /* ---------- stay summary and price ---------- */
    function summary() {
        box.querySelector(".ci").textContent = checkIn ? shortDate(checkIn) : I.t("bk.selectDate");
        box.querySelector(".co").textContent = checkOut ? shortDate(checkOut) : I.t("bk.selectDate");
        summaryEl.textContent = "";

        var line = function (cls, text) {
            var p = document.createElement("p");
            p.className = cls; p.textContent = text; summaryEl.appendChild(p);
        };

        if (!checkIn) { line("hint", I.t("bk.hintStart")); submit.disabled = true; return null; }
        if (!checkOut) { line("hint", I.t("bk.hintEnd")); submit.disabled = true; return null; }

        var groups = {}, order = [], total = 0, nights = 0;
        for (var d = checkIn; d < checkOut; d = addDays(d, 1)) {
            var pr = priceOf(d), id = periodOf(d), k = id + "|" + pr;
            if (!groups[k]) { groups[k] = 0; order.push(k); }
            groups[k]++; total += pr; nights++;
        }
        var min = room.minNights[periodOf(checkIn)];

        var row = function (cls, left, leftNote, right) {
            var div = document.createElement("div");
            div.className = "sum-row" + (cls ? " " + cls : "");
            var l = document.createElement("span"); l.textContent = left;
            if (leftNote) { var em = document.createElement("em"); em.textContent = " " + leftNote; l.appendChild(em); }
            var r = document.createElement("span"); r.textContent = right;
            div.appendChild(l); div.appendChild(r); summaryEl.appendChild(div);
        };

        order.forEach(function (k) {
            var parts = k.split("|"), count = groups[k];
            row("", count + " " + I.t("unit.night", { n: count }) + " × " + money(+parts[1]), I.t("season." + parts[0]), money(count * +parts[1]));
        });
        row("sum-total", I.t("bk.total", { n: nights, nights: I.t("unit.night", { n: nights }) }), "", money(total));

        var tooShort = nights < min;
        if (tooShort) line("warn", I.t("bk.minStay", { n: min, nights: I.t("unit.night", { n: min }) }));
        submit.disabled = tooShort;
        return { nights: nights, total: total };
    }

    function refresh() { paint(); return summary(); }

    /* ---------- interaction ---------- */
    monthsEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".cal-day");
        if (!btn || btn.disabled) return;
        var d = parse(btn.getAttribute("data-date"));
        if (checkIn && !checkOut && validCheckout(d)) checkOut = d;
        else if (nightFree(d)) { checkIn = d; checkOut = null; }
        hover = null;
        refresh();
    });

    monthsEl.addEventListener("mouseover", function (e) {
        var btn = e.target.closest(".cal-day");
        if (!btn || !checkIn || checkOut) return;
        var d = parse(btn.getAttribute("data-date"));
        if (!hover || ymd(hover) !== ymd(d)) { hover = d; paint(); }
    });
    monthsEl.addEventListener("mouseleave", function () { if (hover) { hover = null; paint(); } });

    // keyboard: arrows move between days, PageUp/PageDown change month
    monthsEl.addEventListener("keydown", function (e) {
        var btn = e.target.closest(".cal-day");
        if (!btn) return;
        var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (step) {
            e.preventDefault();
            var all = Array.prototype.slice.call(monthsEl.querySelectorAll(".cal-day"));
            var i = all.indexOf(btn) + step;
            while (i >= 0 && i < all.length && all[i].disabled) i += step > 0 ? 1 : -1;
            if (all[i]) { all[i].tabIndex = 0; btn.tabIndex = -1; all[i].focus(); }
        } else if (e.key === "PageDown" || e.key === "PageUp") {
            e.preventDefault();
            var next = start + (e.key === "PageDown" ? 1 : -1);
            if (next >= 0 && next + perView() <= months.length) { start = next; buildMonths(); }
        }
    });

    box.querySelectorAll(".cal-arrow").forEach(function (b) {
        b.addEventListener("click", function () { start += +b.getAttribute("data-dir"); buildMonths(); });
    });

    var lastView = perView();
    window.addEventListener("resize", function () {
        if (perView() !== lastView) { lastView = perView(); buildMonths(); }
    });

    /* ---------- sending the inquiry ---------- */
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var nameEl = form.elements.name, mailEl = form.elements.email;
        var name = M.clean(nameEl.value, 80), mail = M.clean(mailEl.value, 120);
        nameEl.removeAttribute("aria-invalid"); mailEl.removeAttribute("aria-invalid");

        if (!checkIn || !checkOut) return;
        if (!name || !mail || !mailEl.checkValidity()) {
            var bad = !name ? nameEl : mailEl;
            bad.setAttribute("aria-invalid", "true");
            M.show(msgEl, I.t("msg.invalid"), "error");
            bad.focus();
            return;
        }
        if (M.looksLikeBot(form)) { M.show(msgEl, I.t("msg.sentInquiry"), "ok"); return; }
        if (M.tooSoon()) { M.show(msgEl, I.t("msg.wait"), "error"); return; }

        // the message for the owner is always in English
        var en = function (d) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d); };
        var info = summary();
        var subject = "Booking inquiry: " + room.name.en + ", " + en(checkIn) + " - " + en(checkOut);
        var body = [
            "Apartment: " + room.name.en,
            "Check-in: " + en(checkIn),
            "Check-out: " + en(checkOut),
            "Nights: " + info.nights,
            "Guests: " + form.elements.guests.value,
            "Estimated price: " + new Intl.NumberFormat("en-GB", { style: "currency", currency: C.currency, maximumFractionDigits: 0 }).format(info.total),
            "Guest language: " + (I.lang === "hr" ? "Croatian" : "English"),
            "",
            "Name: " + name,
            "Email: " + mail,
            "",
            M.clean(form.elements.message.value, 2000)
        ].join("\n");

        submit.disabled = true;
        M.show(msgEl, I.t("msg.sending"));
        M.send({ subject: subject, body: body, name: name, email: mail }).then(function (how) {
            if (how === "sent") { M.markSent(); M.show(msgEl, I.t("msg.sentInquiry"), "ok"); }
            else M.show(msgEl, I.t("msg.emailApp"), "ok");
        }).catch(function (error) {
            console.error(error);
            M.show(msgEl, I.t("msg.failed", { email: C.email }), "error");
        }).then(function () { summary(); });
    });

    /* ---------- later: booked dates from Booking.com (optional) ---------- */
    function parseIcal(text) {
        text.split("BEGIN:VEVENT").slice(1).forEach(function (ev) {
            var s = ev.match(/DTSTART[^:]*:(\d{8})/), e = ev.match(/DTEND[^:]*:(\d{8})/);
            if (!s || !e) return;
            var p = function (v) { return new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8)); };
            addRange(p(s[1]), p(e[1]));
        });
    }
    if (C.icalProxy && room.ical) {
        fetch(C.icalProxy + "?room=" + encodeURIComponent(key))
            .then(function (r) { return r.ok ? r.text() : ""; })
            .then(function (text) { if (text) { parseIcal(text); refresh(); } })
            .catch(function () { /* calendar still works with the manual dates */ });
    }

    /* ---------- start, and re-draw when the language changes ---------- */
    applyStatic();
    buildMonths();
    summary();

    I.onChange(function () {
        applyStatic();
        buildMonths();
        summary();
    });
})();
