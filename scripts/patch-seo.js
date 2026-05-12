const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

const title = "Money Garden - Track, Earn, Grow";
const description =
  "Gamified budget management app. Track expenses, earn gold coins, and grow your virtual garden while building better financial habits.";

const meta = [
  `<title>${title}</title>`,
  `<meta name="description" content="${description}" />`,
  `<meta property="og:type" content="website" />`,
  `<meta property="og:url" content="https://getmoneygarden.com/" />`,
  `<meta property="og:title" content="${title}" />`,
  `<meta property="og:description" content="${description}" />`,
  `<meta name="twitter:card" content="summary" />`,
  `<meta name="twitter:title" content="${title}" />`,
  `<meta name="twitter:description" content="${description}" />`,
  `<link rel="canonical" href="https://getmoneygarden.com/" />`,
].join("\n    ");

// Replace the empty react-helmet title placeholder
html = html.replace(/<title data-rh="true"><\/title>/, meta);

// Fallback: if pattern didn't match, inject after <head>
if (!html.includes(title)) {
  html = html.replace("<head>", `<head>\n    ${meta}`);
}

fs.writeFileSync(file, html, "utf8");
console.log("SEO patch applied to dist/index.html");
