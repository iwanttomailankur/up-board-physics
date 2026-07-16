# Fixing the exposed Google Drive links (success-notes.html)

## What was wrong
The old `success-notes.html` built its download buttons like this:

```
https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlmNoPqRsTuVwXyZ
```

...with the real Drive file ID passed straight in the page URL (`?en=...&hi=...`).
That meant:
- The real, permanent download link was visible in the browser address bar,
  page source, browser history, and any screenshot or forwarded link.
- Anyone who got that link (shared by a buyer, or from browser autofill/history)
  had permanent access to the file — you couldn't revoke it without changing
  the Drive file's sharing settings entirely (which breaks it for everyone).
- Search engines or link-preview bots visiting the URL could also expose it.

## What this fix does
`success-notes.html` now only accepts an opaque **token** (e.g. `phy-u1-hi`),
not a real file ID. That token is sent to a small **Cloudflare Worker**
(`worker.js`) that keeps the real Drive file IDs on the server side, in a
lookup table nobody but you can see. The Worker resolves the token and
redirects the buyer's browser to the real file.

Net effect: the real Drive link never appears anywhere in your website's
HTML/JS or in the buyer's address bar — only the token does.

## Deploying it (free, ~10 minutes)
1. Go to https://dash.cloudflare.com → **Workers & Pages → Create → Worker**.
2. Paste in the contents of `worker.js`.
3. Replace each `REPLACE_WITH_DRIVE_FILE_ID` with the real Drive file ID for
   that unit's Hindi-medium PDF (the long string after `id=` in your current
   Drive share link).
4. Click **Deploy**. Copy the URL Cloudflare gives you
   (something like `https://upboardexam-download.<you>.workers.dev`).
5. Open `success-notes.html`, find `WORKER_URL`, and paste your Worker URL in.
6. In each Razorpay Payment Page, set the **post-payment redirect** to:
   ```
   https://upboardexam.com/success-notes.html?unit=1&title=Electrostatics&token=phy-u1-hi
   ```
   using the token you assigned to that file in `worker.js` — never the raw
   Drive link.

## Being honest about the limits
This is a real improvement, not a cosmetic one — but two things are worth
knowing:
- **A token can still be forwarded.** Once a buyer has a working
  `success-notes.html?...&token=phy-u1-hi` link, they could still send *that*
  link to someone else, and the Worker would still honour it (same as any
  simple "possession of the link = access" system, which is what most small
  sellers use). What this fix removes is the *permanent, guessable, raw* Drive
  link being exposed — not sharing altogether.
- **For real single-use / expiring links**, the Worker needs a small amount of
  state (Cloudflare KV, free tier is generous) to mark a token as "used" or
  check a timestamp. That's a natural next step and only a short addition to
  `worker.js` — ask if you'd like it built.

## The other honest option
If you'd rather not maintain a Worker at all, moving digital delivery to a
platform built for exactly this (**Gumroad**, **Payhip**, **SendOwl**) gets
you expiring/secure links, download-count limits, receipts, and (for Gumroad/
Payhip) GST-ready invoicing, without you hosting any of the logic yourself.
Razorpay Payment Pages are great for the checkout itself, but they were never
designed to be a secure file host — pairing them with one of the above (or
this Worker) closes that gap.
