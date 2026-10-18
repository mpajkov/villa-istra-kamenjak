/* =========================================================
   PHOTO SLIDER (apartment pages)
   - dots and the "3 / 13" counter are created automatically
   - arrows, dots, keyboard (focus the slider, then use the
     left / right arrow keys) and swipe on phones
   - photos load lazily, so the page opens fast
   - only the visible photo is exposed to screen readers
   This file does not need to be edited.
   ========================================================= */
(function () {
    "use strict";

    var slider = document.querySelector(".slider");
    var track = document.getElementById("slides");
    if (!slider || !track) return;

    var I = window.VillaI18n;
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;
    var dotsBox = slider.querySelector(".dots");
    var counter = slider.querySelector(".slider-count");
    var index = 0;
    var dots = [];

    if (total > 7) slider.classList.add("many");      // CSS hides the dots on phones for long galleries

    slides.forEach(function (slide, i) {
        slide.setAttribute("aria-label", (i + 1) + " / " + total);

        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "dot";
        dot.addEventListener("click", function () { go(i); });
        dotsBox.appendChild(dot);
        dots.push(dot);
    });

    function labelDots() {
        dots.forEach(function (dot, i) {
            dot.setAttribute("aria-label", I ? I.t("slider.goTo", { n: i + 1 }) : "Photo " + (i + 1));
        });
    }

    function go(n) {
        index = (n + total) % total;
        track.style.transform = "translateX(-" + index * 100 + "%)";
        slides.forEach(function (slide, i) {
            if (i === index) slide.removeAttribute("aria-hidden"); else slide.setAttribute("aria-hidden", "true");
        });
        dots.forEach(function (dot, i) {
            if (i === index) dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current");
        });
        if (counter) counter.textContent = (index + 1) + " / " + total;
    }

    slider.querySelector(".prev-arrow").addEventListener("click", function () { go(index - 1); });
    slider.querySelector(".next-arrow").addEventListener("click", function () { go(index + 1); });

    // keyboard: only while the slider has focus (so typing in the booking form is never affected)
    slider.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    // swipe with a finger
    var startX = null, startY = null;
    track.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
        startX = null;
    });

    labelDots();
    if (I) I.onChange(labelDots);
    go(0);
})();
