# Coffee Sagaa: website

The website for **Coffee Sagaa**, a filter coffee cafe on Mugalivakkam Main Rd, Ramapuram, Chennai.
It's plain HTML, CSS and JS with no build step. GSAP, ScrollTrigger and Lenis are bundled in `js/vendor/`.

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000

## What's on the page
1. **Loader**: a cup fills with coffee (shorter on repeat visits in the same session)
2. **Hero**: the headline and floating products with mouse parallax and steam. A product tag cycles through favourites
3. **Favourites**: six signature items (a swipeable carousel on phones)
4. **About**: the story, which lights up word by word, signed by the team
5. **Video**: hidden until you add the video file (see below)
6. **Menu**: tabbed categories from `js/menu-data.js` (sticky, swipeable tabs on phones)
7. **Visit**: a **live clock in Chennai time (IST)** with an Open / Closed status, plus a "Find us" card with the map, address, landmark, plus code and directions
8. **Order ahead**: Instagram DM ordering, falling beans and a receipt that prints on scroll
9. **Instagram**: a follow card (a single compact row on phones)
10. **Footer**: a compact version on phones

On phones the top bar shows only the logo. A bottom action bar (Menu · Directions · Instagram) appears after the first screen.

## Fonts
**Baloo Thambi 2** (Ek Type) is used for headings and body text: rounded and close to the shop sign.
**Kalam** (Indian Type Foundry) is used for the handwritten accents. Both load from Google Fonts.

## Opening hours / status
The clock and every "Open now" label use India Standard Time, whatever the visitor's own time zone is.
The hours are set at the top of `js/main.js` (`OPEN_H = 7`, `CLOSE_H = 24`).

## Add the demo video
- `assets/video/sagaa-demo.mp4` (H.264 MP4, ideally under 15 MB)
- optional poster: `assets/img/video-poster.jpg`

The video section stays hidden until this file exists. Once it does, the section appears and the video plays muted and looped while it's on screen.

## Edit menu / prices
Everything is in `js/menu-data.js`. Each item is `[name, price, optional description]`.

## Google Maps listing
From the public Google listing: rated 4.7, category Cafe, open 7 AM – 12 AM, plus code `258H+H4 Chennai`,
coordinates 13.0164804, 80.1778195. The listing has no phone number or website yet and shows
"Claim this business". Claim it at https://business.google.com and add your phone number and website.
