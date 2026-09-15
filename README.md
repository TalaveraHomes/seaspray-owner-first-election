# Seaspray Owners First Election Website (v4)

This package replaces the previous GitHub Pages version and addresses the latest requested changes.

## Changes in this version
- Added hero video support with fallback image
- Improved candidate photo cropping for desktop and smaller desktop sizes
- Replaced remaining generic imagery with real Seaspray photos
- Added updated candidate lineup with Zachary Moody
- Added cache-busting by switching the site to `styles-v4.css` and `script-v4.js`

## Important note about the hero video
This version is already coded to play a looping drone video in the hero section **if** a file named `hero-loop.mp4` is added to the `assets` folder.

Because no video file was available in the working files, the site will currently show the fallback hero photo. If you later upload `assets/hero-loop.mp4`, the video will automatically play.

## Files to upload to GitHub
Upload/replace these:
- `index.html`
- `styles-v4.css`
- `script-v4.js`
- `README.md`
- entire `assets` folder

## Still to customize
- Replace `YOUR_TALLY_SURVEY_LINK_HERE`
- Replace `YOUR_TOWNHALL_REGISTRATION_LINK_HERE`
- Add `assets/hero-loop.mp4` if you want the hero background video live
