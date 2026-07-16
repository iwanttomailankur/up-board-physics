/**
 * UPBoardExam.com — secure download redirector
 * ------------------------------------------------
 * Deploy this as a free Cloudflare Worker. It receives an opaque
 * token (e.g. "phy-u1-hi") from success-notes.html, looks up the
 * real Google Drive link server-side, and 302-redirects the buyer
 * straight to it.
 *
 * Because the lookup happens on Cloudflare's server, the real Drive
 * file ID never appears in your website's HTML, JavaScript, or the
 * buyer's browser address bar — only the token does. If a buyer
 * shares the success-notes.html link, the token alone is much less
 * useful to a stranger than a raw, permanent Drive link, and you can
 * revoke or rotate any single token instantly by editing FILES below
 * and re-deploying — no need to touch your website.
 *
 * HOW TO DEPLOY (free, ~10 minutes):
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create → Worker.
 * 2. Delete the sample code it gives you, paste in this whole file.
 * 3. Edit the FILES object below with your real Drive file IDs.
 * 4. Click Deploy. You'll get a URL like:
 *      https://upboardexam-download.<your-subdomain>.workers.dev
 * 5. Put that URL into WORKER_URL in success-notes.html.
 * 6. On each Razorpay Payment Page's "redirect after payment" setting,
 *    point to:
 *      https://upboardexam.com/success-notes.html?unit=1&title=Electrostatics&token=phy-u1-hi
 *    (use a token you defined in FILES below — never the raw Drive link).
 *
 * WANT STRONGER PROTECTION LATER?
 * - Add Cloudflare KV storage so each token can be single-use or expire
 *   after N hours/downloads (ask your developer, or come back and ask
 *   for this — it's a small addition to this same Worker).
 * - Or skip DIY entirely and move delivery to a platform built for this
 *   (Gumroad, Payhip, SendOwl) — they handle expiring/secure links,
 *   receipts, and GST-ready invoicing out of the box.
 */

// Map opaque tokens -> real Google Drive file IDs.
// Keep this list private; only this Worker ever sees it.
const FILES = {
  "phy-u1-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u2-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u3-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u4-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u5-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u6-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u7-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u8-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  "phy-u9-hi": "REPLACE_WITH_DRIVE_FILE_ID",
  // add chemistry / biology / maths tokens here as you create those notes
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/download") {
      return new Response("Not found", { status: 404 });
    }

    const token = url.searchParams.get("token");
    const fileId = token && FILES[token];

    if (!fileId || fileId.startsWith("REPLACE_WITH")) {
      return new Response(
        "यह लिंक अमान्य है या अभी सक्रिय नहीं की गई है। कृपया Contact पेज से संपर्क करें.",
        { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return Response.redirect(driveUrl, 302);
  },
};
