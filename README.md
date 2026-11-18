# Coffee Sagaa — animated website

Single-page animated site for **Coffee Sagaa**, Ramapuram, Chennai. It's plain HTML, CSS and JS with no build step. GSAP, ScrollTrigger and Lenis are bundled in `js/vendor/`.

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000

## Sections
1. **Preloader**: a "NOW BREWING" counter while the cup fills with decoction
2. **Hero**: floating cup, coffee pouch and steel tumbler with mouse parallax and steam; a rotating product tag; the script word cycles (saga / morning / midnight / mood)
3. **Marquee**: speeds up with scroll velocity
4. **Favourites**: six signature items, with a script swash that draws on scroll
5. **Our Saga**: story text that lights up word by word, plus counters
6. **Brand film**: a video slot that grows on scroll (see below)
7. **Full menu**: tabbed categories rendered from `js/menu-data.js`
8. **Visit**: a pinned clock that scrolls from 07:00 to 00:00, with address and directions
9. **Chennai never stops**: falling coffee beans and a receipt that prints on scroll
10. **Footer**

## Add the demo video
Drop the files here:
- `assets/video/sagaa-demo.mp4` (H.264 MP4; around 1080p and under 15 MB works well)
- optional poster: `assets/img/video-poster.jpg`

When the video is present, the site detects it and plays it muted and looped while it's on screen. If it's missing, a placeholder shows.

## Edit menu / prices
Everything is in `js/menu-data.js`. Each item is `[name, price, optional description]`.
