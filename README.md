# Villa Istra Kamenjak

**A fast, bilingual (English / Croatian) website for a holiday-apartment property in Premantura, Istria**, with photo galleries, an availability calendar, automatic price calculation and a booking-inquiry form.

[**Preview**](https://mpajkov.github.io/villa-istra-kamenjak/) · [Hrvatski opis](README.hr.md) · Built by [mpajkov](https://github.com/mpajkov)

![Villa Istra Kamenjak on desktop and phone](docs/screenshots/overview.jpg)

> No framework, no build step, no tracking, no cookies. Plain HTML, CSS and JavaScript that the owner can edit in any text editor and host anywhere for free.

---

## What the guest gets

- **Five pages** (home plus four apartments), each with a swipeable photo gallery that works with touch, mouse and keyboard.
- **Availability calendar** per apartment: choose arrival and departure, see the price per night, the season and the **total price**, then send an inquiry. Booked nights are crossed out, and the minimum stay is enforced per season.
- **English or Croatian in one click.** The choice is remembered, Croatian browsers open the Croatian version automatically, and `?lang=hr` links work for sharing.
- A site that is **comfortable on every screen**: phone, tablet, laptop and wide monitors.

## What the owner gets

- **One settings file** (`assets/js/config.js`) for prices, seasons, minimum stays and booked dates. No code knowledge needed.
- Inquiries arrive **by email**, always in English for the owner, with the guest's language noted and "Reply" going straight to the guest. Free for roughly 250 messages a month via [Web3Forms](https://web3forms.com). Until a key is entered, the guest's own email app opens with the message ready, so no inquiry is ever lost.
- **Spam protection without CAPTCHAs** (hidden trap field, timing check and a short cool-down), so guests are never asked to click traffic lights.
- **Zero running costs**: static files on GitHub Pages, Netlify, Cloudflare Pages or any ordinary web host.
- Friendly to search engines: page titles and descriptions in both languages, Open Graph preview image, `sitemap.xml`, `robots.txt` and structured data for the property.

---

## Quality checks

Every claim below was measured on this code with an automated Playwright/Chromium test harness, except the Lighthouse and Speed rows, which were measured on the preview site.

| Area | Result |
|---|---|
| **Lighthouse** (Lighthouse 12.8.2, default mobile simulation, preview site, median of 3 runs, 23 Oct 2026) | Performance 87, Accessibility 100, Best practices 100, SEO 66. SEO is lower only because this demo copy deliberately carries `noindex` |
| **Speed** (Lighthouse 12.8.2 default mobile simulation: 4x CPU slowdown, 1.6 Mbit/s, 150 ms latency; median of 3, 23 Oct 2026) | First paint about 3.0 s, largest paint about 3.3 s, layout shift about 0.04, blocking time 0 ms |
| **Weight** | Home page about 233 KB, apartment pages 160 to 450 KB on first view (photos load as the guest browses) |
| **Responsive** | No sideways scrolling and nothing outside the screen at 320, 375, 768, 1024 and 1440 px, in both languages; layouts reviewed on phone, tablet and desktop |
| **Accessibility** | Skip link, visible focus, full keyboard use of gallery and calendar (arrow keys, PageUp/PageDown), screen-reader labels and live regions, text contrast 4.5:1 or better (also measured on text over photos), tap targets at least 24 px, reduced-motion support |
| **Security** | Strict Content-Security-Policy (no inline scripts or styles, no `eval`, forms may only post to Web3Forms), no third-party scripts, input trimming and control-character stripping, `textContent` instead of `innerHTML` for anything a visitor can influence, extra response headers in `_headers` |
| **Privacy** | No analytics, no cookies. The only thing stored in the browser is the language choice |
| **Behaviour** | 96 automated checks pass: language switching, form validation and spam guards, sending and failure paths, calendar rules (minimum stay, booked nights, season boundaries), keyboard navigation, swipe, 404 page |
| **Errors** | No console errors and no CSP violations on any page, viewport or language |

Photos are delivered as responsive WebP (640, 1024 and 1600 px; the hero also 800, 1280 and 1920 px) with correct `srcset`/`sizes`, explicit width and height, the hero as a prioritised image and everything else lazy-loaded. Location data (EXIF/GPS) was removed from every photo.

---

## Project structure

```
index.html                 home page
apartments/                pavel.html, mali.html, barok.html, garden.html
404.html                   friendly "page not found" (also translated)
assets/
  css/style.css            the single stylesheet (table of contents at the top)
  js/config.js             PRICES, SEASONS, BOOKED DATES, email  <- the file to edit
  js/i18n.js               English / Croatian switch and the texts written by JavaScript
  js/calendar.js           availability calendar and booking inquiry
  js/slider.js             photo gallery
  js/contact.js            sending messages and spam protection
  img/                     optimised photos (WebP)
  favicon.svg, apple-touch-icon.png, og-image.jpg
tools/                     helper scripts used to prepare images and icons (not needed to run the site)
docs/screenshots/          pictures used in this README
_headers                   security and caching headers for Netlify / Cloudflare Pages
sitemap.xml, robots.txt    search engine files
```

Open `index.html` by double-clicking it: everything works offline too, apart from sending the form and the Google Fonts.

## Everyday edits

**Prices, seasons, minimum stays, booked dates.** Edit `assets/js/config.js`. Every setting has a short comment in English and Croatian. Booked stays are written as `["2027-07-10", "2027-07-17"]` (arrival, departure). The departure day itself stays free for the next guest.

**Receiving inquiries by email.** Create a free access key at [web3forms.com](https://web3forms.com) (enter the owner's email, the key arrives by mail) and paste it into `web3formsKey` in `config.js`. The key is meant to be public.

**Texts.** English is written normally in the HTML. The Croatian version sits in a `data-hr` attribute on the same element:

```html
<h2 data-hr="Naši apartmani">Our Apartments</h2>
```

Other attributes work the same way: `data-hr-alt`, `data-hr-placeholder`, `data-hr-aria-label`, `data-hr-content` (meta tags). Texts written by JavaScript (calendar, form messages) are in the dictionary at the top of `assets/js/i18n.js`. A missing translation simply falls back to English.

**Photos.** The list of photos and the sizes to create sits at the top of `tools/optimize-images.mjs`. Edit it for new photos, then run `npm install` once and `npm run images -- <folder with the originals>` (needs [Node.js](https://nodejs.org) 18 or newer). It creates every size, strips location data and writes the files to `assets/img/`.

**Contact details.** The email address and the phone number in the contact section are placeholders. Replace them in `index.html` and in `config.js`.

## Publishing

The simplest route is GitHub Pages: *Settings, Pages, Deploy from a branch, `main` / root*. Any other host works too: upload everything and keep the folder structure. When the site moves to its own domain, replace `https://mpajkov.github.io/villa-istra-kamenjak/` in `index.html`, the four apartment pages, `404.html`, `sitemap.xml` and `robots.txt` (a search for that text finds every place).

**This public copy is a showcase.** Every page carries `<meta name="robots" content="noindex">` (marked with a comment in the HTML), so search engines do not list it next to the real site. For a real launch, delete that line from `index.html` and the four apartment pages, and replace the placeholder contact details.

**Headers.** GitHub Pages cannot set HTTP headers, so each page carries its Content-Security-Policy as a `<meta>` tag. On Netlify or Cloudflare Pages the included `_headers` file additionally adds clickjacking protection, HSTS and cache rules.

**Fonts and GDPR.** Headings (Playfair Display) and text (Jost) are loaded from Google Fonts, which means the visitor's IP address reaches Google. For a strictly local setup, download both families from [fonts.google.com](https://fonts.google.com) as WOFF2, put them in `assets/fonts/`, add `@font-face` rules to the top of `style.css`, delete the three Google `<link>` lines in each page and remove the two Google hosts from the `Content-Security-Policy` (`style-src` and `font-src`).

---

## Credits and rights

- Icons: [Font Awesome Free](https://fontawesome.com) (CC BY 4.0), inlined as an SVG sprite so no icon font is downloaded.
- Fonts: Playfair Display and Jost, SIL Open Font License, served by Google Fonts.
- Photographs, the property name and the contact details belong to the property owner and are included here to demonstrate the work.
- Source code: &copy; 2026 mpajkov, all rights reserved. It is published so that prospective clients can review the quality of the work; please ask before reusing it.

Would you like a site like this for your property or business? Get in touch via [github.com/mpajkov](https://github.com/mpajkov).
