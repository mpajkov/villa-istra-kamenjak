/* =========================================================
   SETTINGS / POSTAVKE
   The only file you need to edit for prices, seasons,
   minimum stays and booked dates.
   Jedina datoteka koju treba mijenjati za cijene, sezone,
   minimalan broj noćenja i zauzete termine.
   ========================================================= */

window.VILLA_CONFIG = {

    // Guest enquiries arrive at this address.
    // Upiti gostiju stižu na ovu adresu.
    email: "info@villapremantura.com",

    // Free key from https://web3forms.com (about 250 messages a month).
    // How: "Create Access Key" -> enter the email above -> the key arrives by email.
    // Paste it below instead of YOUR_ACCESS_KEY. This key is meant to be public.
    // While it is missing, the forms open the guest's own email app with the message ready.
    // Besplatan ključ s web3forms.com; dok ga nema, forme otvaraju gostov email program.
    web3formsKey: "YOUR_ACCESS_KEY",

    // Currency as ISO code, shown next to prices (EUR, USD...) / Valuta (ISO oznaka)
    currency: "EUR",

    // Bookable season (month-day): 1 May to 31 October.
    // Sezona u kojoj se može rezervirati: od 1.5. do 31.10.
    season: { from: "05-01", to: "10-31" },

    // Price periods (month-day), valid every year.
    // The names low / mid / high are translated by the website.
    // Razdoblja cijena, vrijede svake godine.
    periods: [
        { id: "low",  from: "05-01", to: "05-31" },
        { id: "mid",  from: "06-01", to: "06-30" },
        { id: "high", from: "07-01", to: "08-31" },
        { id: "mid",  from: "09-01", to: "09-30" },
        { id: "low",  from: "10-01", to: "10-31" }
    ],

    // Price per night and minimum number of nights for every room.
    // Cijena po noći i minimalan broj noćenja za svaku sobu.
    rooms: {
        pavel: {
            name: { en: "Pavlov's Room", hr: "Pavlova soba" },
            maxGuests: 2,
            price:     { low: 45, mid: 55, high: 70 },
            minNights: { low: 2,  mid: 3,  high: 5 },
            // Booked stays (arrival, departure), e.g. ["2027-07-10", "2027-07-17"]
            // Zauzeti termini (dolazak, odlazak)
            booked: [],
            // Later: iCal link from Booking.com / Kasnije: iCal link s Booking.com-a
            ical: ""
        },
        mali: {
            name: { en: "Small Apartment", hr: "Mali apartman" },
            maxGuests: 4,
            price:     { low: 60, mid: 75, high: 95 },
            minNights: { low: 2,  mid: 3,  high: 5 },
            booked: [],
            ical: ""
        },
        barok: {
            name: { en: "Barok", hr: "Barok" },
            maxGuests: 4,
            price:     { low: 75, mid: 95, high: 125 },
            minNights: { low: 2,  mid: 3,  high: 5 },
            booked: [],
            ical: ""
        }
    },

    // Later: address of a small server script that reads the Booking.com calendar
    // (for example "../ical.php"). While empty, only "booked" above is used.
    // Kasnije: adresa skripte koja čita Booking.com kalendar.
    icalProxy: ""
};
