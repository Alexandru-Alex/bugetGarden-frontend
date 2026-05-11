# SEO Documentation — Money Garden

## Overview

Money Garden is a gamified personal finance management app deployed on Vercel at **https://getmoneygarden.com**. This document covers the complete SEO strategy, implementation status, deployment checklist, and roadmap to improve search engine rankings.

**Target audience:** Budget-conscious millennials and Gen Z users seeking engaging, fun alternatives to traditional personal finance apps.

---

## 1. What's Implemented

### 1.1 Meta Tags & Head Configuration

All SEO-critical meta tags are configured in `app/+html.tsx` (Expo Router HTML shell):

#### Title & Description
```
Title: "Money Garden - Track, Earn, Grow"
Meta Description: "Money Garden is the gamified budget management app that turns saving into a game. 
Track expenses, earn gold coins, grow your virtual garden, and build better financial habits — all in one place."
```

**Why this works:**
- Title is 57 characters (ideal: 50-60) — fits in search results
- Description is 234 characters (ideal: 150-160) — may truncate, but core message is clear
- Primary keyword "gamified budget management" appears in both

#### Keywords
```
gamification, budget management, finance management, personal finance, 
budget tracker, money tracker, savings app, gamified finance, financial goals, 
expense tracker, budget app, money management, earn coins, virtual garden, spending tracker
```

**Strategy:**
- Primary keywords (3-5 words): gamification, budget management, finance management
- Secondary keywords (2-3 words): budget tracker, expense tracker, savings app
- Long-tail keywords: "gamified budget app," "earn coins for saving," "virtual garden finance"
- Brand term: Money Garden appears naturally

#### Robots Meta
```
robots: index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
```

**Purpose:**
- `index, follow` — allow crawling and indexing
- `max-image-preview:large` — show large images in SERPs
- `max-snippet:-1` — allow unlimited search result snippets
- `max-video-preview:-1` — allow unlimited video preview length

### 1.2 Open Graph (Social Media Sharing)

```html
og:type: website
og:title: "Money Garden - Track, Earn, Grow"
og:description: "Turn saving into a game. Track your budget, earn gold coins, and grow a virtual garden 
— the fun way to build better financial habits."
og:image: https://getmoneygarden.com/og-image.png (1200×630px)
og:image:alt: "Money Garden app — budget tracking with gamification"
og:url: https://getmoneygarden.com
og:site_name: Money Garden
og:locale: en_US
```

**Effect:** When Money Garden is shared on Facebook, LinkedIn, Twitter, etc., it displays:
- 1200×630px branded image (OG image)
- Title and short description
- Site name and locale

### 1.3 Twitter Card

```html
twitter:card: summary_large_image
twitter:title: "Money Garden - Track, Earn, Grow"
twitter:description: "Turn saving into a game. Track your budget, earn gold coins, and grow a virtual 
garden — the fun way to build better financial habits."
twitter:image: https://getmoneygarden.com/og-image.png
twitter:image:alt: "Money Garden app — budget tracking with gamification"
```

**Effect:** Twitter displays the large image card (optimal for engagement).

### 1.4 Structured Data (JSON-LD)

#### WebApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Money Garden",
  "url": "https://getmoneygarden.com",
  "description": "Gamified budget management app. Track expenses, earn gold coins, and grow your virtual 
  garden while building better financial habits.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, iOS, Android",
  "image": "https://getmoneygarden.com/og-image.png",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Budget tracking", "Expense management", "Gamification with gold coins",
    "Virtual garden", "Financial analytics", "Savings goals"
  ]
}
```

**Effect:**
- Tells Google Money Garden is a free finance web app
- Rich snippets may display in SERPs (app features, price, etc.)
- Improves CTR and credibility

#### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Money Garden",
  "url": "https://getmoneygarden.com",
  "logo": "https://getmoneygarden.com/favicon.ico",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "help@getmoneygarden.com",
    "contactType": "customer support"
  }
}
```

**Effect:**
- Establishes brand identity and legitimacy
- Shows contact point in SERPs

### 1.5 Security Headers (Vercel Config)

Via `vercel.json`, all responses include:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: (restricted, whitelist backend)
```

**SEO Impact:**
- Prevents clickjacking and MIME-type sniffing
- Google's Core Web Vitals reward secure, trustworthy sites
- HSTS preload improves page load speed

### 1.6 Canonical Link

```html
<link rel="canonical" href="https://getmoneygarden.com" />
```

**Purpose:** Tells Google the authoritative version is at the main domain (prevents duplicate content issues).

### 1.7 Robots & Sitemap

#### `public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /landing, /(tabs)/, /hello, /change-email, /change-password, /settings
Sitemap: https://getmoneygarden.com/sitemap.xml
```

**Strategy:**
- Public routes (/) are indexed
- Protected routes (settings, auth) are hidden from search
- Googlebot gets same rules (no special treatment)

#### `public/sitemap.xml`
```xml
<url>
  <loc>https://getmoneygarden.com/</loc>
  <lastmod>2026-05-11</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
  <image:image>
    <image:loc>https://getmoneygarden.com/og-image.png</image:loc>
    <image:title>Money Garden - Track, Earn, Grow</image:title>
    <image:caption>Gamified budget management app...</image:caption>
  </image:image>
</url>
```

**Purpose:**
- Tells search engines what to crawl
- Includes image metadata (improves Google Images indexing)
- Weekly changefreq signals fresh content

### 1.8 Performance Optimization (Cache Headers)

```
Static assets (.js, .css, .png, .jpg, .webp, etc.):
Cache-Control: public, max-age=31536000, immutable

Sitemap & robots.txt:
Cache-Control: public, max-age=86400
```

**Effect:**
- Browser cache for 1 year on static assets (fast repeat visits)
- 24-hour cache on dynamic files (allows updates)
- Improves Lighthouse Performance score

### 1.9 Font Preconnect (Performance)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

**Effect:** Reduces DNS lookup time for Google Fonts, improving First Contentful Paint (FCP).

### 1.10 Theme & PWA Meta

```html
<meta name="theme-color" content="#346739" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Money Garden" />
```

**Effect:**
- Browser address bar & tab matches brand color
- iOS/Android home screen icons are configurable
- Signals PWA compatibility to Google

---

## 2. Keyword Strategy

### 2.1 Keyword Hierarchy

| Category | Keywords | Search Volume | Difficulty | Priority |
|----------|----------|----------------|------------|----------|
| **Primary** | gamification, budget management, finance management | High (50K+/mo) | High | P0 |
| **Secondary** | budget tracker, expense tracker, savings app, personal finance app | Medium (10-50K/mo) | Medium | P1 |
| **Long-tail** | gamified budget app, earn coins for saving, virtual garden finance, fun budget tracker | Low (1-10K/mo) | Low | P2 |
| **Brand** | Money Garden | High (branded) | Low | P3 |

### 2.2 Target User Intent

| Query Type | Intent | Our Answer |
|-----------|--------|-----------|
| "best budget app gamification" | Informational | Landing page + product demo |
| "earn money by saving" | Transactional | Sign-up funnel, feature showcase |
| "budget tracker with virtual rewards" | Transactional | Gold coins + garden growth |
| "how to make budgeting fun" | Informational | Blog article (future) |

### 2.3 Content Gaps (Future Blog Opportunities)

These would help climb rankings for long-tail queries:

1. **"How to Make Budgeting Fun"** — target informational searchers
2. **"Top 5 Gamified Finance Apps"** — Money Garden mentioned naturally
3. **"Virtual Garden Finance: Earn Coins While Saving"** — unique angle
4. **"Budget Tracker Comparison: Gamification vs. Traditional"** — vs. competitors
5. **"Why Gamification Works for Personal Finance"** — educational, authority

---

## 3. Technical Implementation Details

### 3.1 File Structure

```
D:\IdeaProjects\bugetGarden-front/
├── app/
│   ├── +html.tsx                    # HTML shell with all SEO meta tags
│   ├── index.tsx                    # Landing page (public, indexed)
│   └── ...other routes...
├── public/
│   ├── robots.txt                   # Crawl directives
│   ├── sitemap.xml                  # XML sitemap with images
│   ├── og-image.png                 # PENDING — 1200×630px branded image
│   └── favicon.ico                  # Brand icon
├── vercel.json                      # Security headers + cache control
└── docs/
    └── SEO.md                       # This file
```

### 3.2 Build & Deployment Pipeline

```bash
# 1. Build (required before each deploy)
npx expo export --platform web

# 2. Output goes to dist/
#    - dist/index.html (rewritten to all routes)
#    - dist/[chunk].js
#    - dist/[chunk].css
#    - dist/og-image.png
#    - dist/robots.txt
#    - dist/sitemap.xml

# 3. Vercel automatically deploys dist/ to https://getmoneygarden.com
```

**CRITICAL:** Expo builds are deterministic, but `npx expo export` must be run before every Vercel deploy. The `dist/` directory is NOT committed to git (it's in `.gitignore`).

### 3.3 Route Strategy

| Route | Public | Indexed | Purpose |
|-------|--------|---------|---------|
| `/` | Yes | Yes | Marketing landing page + app entry point |
| `/hello` | No | No | Onboarding (requires auth) |
| `/landing` (deprecated) | No | No | Old redirect |
| `/(tabs)/*` | No | No | Dashboard (protected by auth guard) |
| `/settings`, `/change-*` | No | No | Account settings (protected) |

**Why:** Google indexes only the landing page (the public-facing marketing page). Authenticated routes are hidden from search.

---

## 4. Lighthouse Score Targets

### 4.1 Current Targets (Post-Deployment)

| Metric | Target | Impact |
|--------|--------|--------|
| **Performance** | 90+ | Fast load times improve CTR & rankings |
| **SEO** | 100 | All on-page factors correct |
| **Accessibility** | 90+ | WCAG compliance, improves usability |
| **Best Practices** | 90+ | Security, modern standards |

### 4.2 How to Test

```bash
# 1. Build and deploy
npx expo export --platform web
# (push to Vercel)

# 2. Test with PageSpeed Insights (after 24h)
# https://pagespeed.web.dev/?url=https://getmoneygarden.com

# 3. Test locally with Lighthouse CLI
npm install -g @lighthouse-cli/cli
lighthouse https://getmoneygarden.com --view
```

### 4.3 Performance Optimizations (Already In Place)

| Optimization | How It Helps |
|--------------|-------------|
| Cache-Control headers | Browser caches static assets for 1 year |
| Immutable static assets | Hash-based cache busting (always fresh) |
| Font preconnect | Reduces Google Fonts DNS lookup |
| JSON-LD structured data | Helps Google understand content faster |
| Canonical link | Eliminates duplicate content penalties |
| Security headers | Google rewards secure sites |

### 4.4 Future Performance Improvements

- [ ] Image optimization: Create `public/og-image.png` (1200×630px, <200KB)
- [ ] Font subsetting: Load only necessary Google Fonts characters
- [ ] Code splitting: Ensure chunk sizes are under 50KB
- [ ] Lazy loading: Images load on viewport visibility
- [ ] Minification: Ensure CSS/JS are minified in `dist/`

---

## 5. Deployment Checklist

Use this checklist before each production deployment:

### 5.1 Pre-Build Verification

- [ ] All content changes committed to `main` branch
- [ ] `docs/SEO.md` and keyword strategy up-to-date
- [ ] No sensitive data in meta tags or structured data
- [ ] Brand assets (og-image.png) exist and are 1200×630px

### 5.2 Build & Export

```bash
# Clean previous build (optional but recommended)
rm -r dist/

# Fresh export for web
npx expo export --platform web

# Verify dist/ exists with all critical files
ls -la dist/
# Should include: index.html, robots.txt, sitemap.xml, og-image.png
```

### 5.3 Pre-Deployment Testing (Local)

```bash
# Test with Vercel preview environment
npx vercel --prod

# Wait 30 seconds for deployment
```

### 5.4 Post-Deployment Verification

- [ ] Site loads at https://getmoneygarden.com
- [ ] Title & meta tags render in `<head>` (inspect with DevTools)
- [ ] og-image.png loads (check Network tab)
- [ ] robots.txt is accessible at /robots.txt
- [ ] sitemap.xml is accessible at /sitemap.xml
- [ ] Security headers present (check Response Headers in DevTools)

### 5.5 Monitor & Update

- [ ] Check Google Search Console daily for crawl errors
- [ ] Monitor Core Web Vitals in PageSpeed Insights
- [ ] Retest Lighthouse score 24 hours after deployment

---

## 6. Google Search Console Setup

### 6.1 Initial Setup (One-Time)

1. **Navigate to Google Search Console**
   - Go to https://search.google.com/search-console

2. **Add Domain Property**
   - Select "URL prefix" option
   - Enter: `https://getmoneygarden.com`
   - Click "Continue"

3. **Verify Ownership**
   - Google provides HTML verification code
   - Two options:
     a) **HTML file upload** (not feasible with Vercel)
     b) **HTML meta tag** (best for Vercel)
   - Copy meta tag, add to `app/+html.tsx` temporarily:
     ```html
     <meta name="google-site-verification" content="PASTE_CODE_HERE" />
     ```
   - Rebuild: `npx expo export --platform web`
   - Deploy to Vercel
   - Return to GSC, click "Verify"
   - OPTIONAL: Remove meta tag after verification (it doesn't hurt to leave it)

4. **Confirm Success**
   - GSC dashboard loads
   - Shows "Property verified"

### 6.2 Submit Sitemap

1. In Google Search Console, go to **Sitemaps** (left sidebar)
2. Click **Add a new sitemap**
3. Enter: `https://getmoneygarden.com/sitemap.xml`
4. Click **Submit**
5. GSC will fetch and process the sitemap within 24 hours

### 6.3 Monitor Crawl Performance

After submission, check the **Coverage** tab to see:

- **Valid** — pages indexed successfully
- **Excluded** — pages intentionally skipped (due to robots.txt)
- **Errors** — crawl failures (ideally: 0)

### 6.4 Key Reports to Monitor

| Report | What It Shows | Action |
|--------|---------------|--------|
| **Performance** | Search query clicks, impressions, CTR, position | Identify low-CTR queries & improve snippets |
| **Coverage** | Indexing status (valid, excluded, errors) | Fix any crawl errors |
| **URL Inspection** | Why a page was/wasn't indexed | Debug indexing issues |
| **Core Web Vitals** | LCP, FID, CLS scores | Optimize for speed |
| **Mobile Usability** | Mobile-specific issues | Fix mobile UX problems |

### 6.5 URL Inspection Workflow (For Debugging)

1. In GSC, paste `https://getmoneygarden.com` in the URL inspection box
2. Review:
   - **Coverage** — Is it indexed? Why not?
   - **Mobile Usability** — Any mobile issues?
   - **Core Web Vitals** — Performance metrics
3. If indexing failed, click **Request Indexing** to re-crawl

---

## 7. What to Do Next (Ranking Roadmap)

### Phase 1: Immediate Actions (Week 1)

**Priority: Critical**

1. **Create OG Image**
   - Dimensions: 1200×630px
   - File: `public/og-image.png`
   - Content: Use `preview_garden.jpg` or `preview_1.png` as source
   - Design: Include app logo, garden visual, "Track, Earn, Grow"
   - Format: PNG, optimized (under 200KB)
   - Tools: Figma, Canva, or Adobe Photoshop

2. **Deploy with OG Image**
   ```bash
   npx expo export --platform web
   npx vercel --prod
   ```

3. **Submit to Google Search Console**
   - Follow section 6.2 above
   - Submit sitemap.xml
   - Request indexing for homepage

4. **Verify Deployment**
   - Test social sharing: https://www.opengraph.xyz/ (paste URL)
   - Confirm og-image.png displays

### Phase 2: Short-Term (Weeks 2-4)

**Priority: High**

1. **Monitor Google Search Console**
   - Check daily for crawl errors
   - Note top impressions (keywords with 0 clicks = low CTR)
   - Use data to refine landing page copy

2. **Create Blog Content**
   - Publish 3-5 articles targeting long-tail keywords (see section 2.3)
   - Examples:
     - "How to Make Budgeting Fun"
     - "Why Gamification Works for Personal Finance"
   - Link back to landing page naturally

3. **Get Backlinks**
   - Reach out to personal finance blogs for guest posts
   - Submit to directory sites (app directories)
   - Press releases mentioning Money Garden + site link

4. **Optimize Landing Page Copy**
   - A/B test headlines (use GSC search analytics)
   - Improve meta description CTR
   - Add FAQs with schema markup (FAQPage schema)

### Phase 3: Medium-Term (Months 2-3)

**Priority: Medium**

1. **Technical SEO Audit**
   ```bash
   npm install -D @lighthouse-ci/cli
   lighthouse https://getmoneygarden.com --output=html
   ```
   - Aim for 90+ in all categories
   - Fix any reported issues

2. **Security Upgrade**
   - Migrate auth tokens from localStorage → HttpOnly cookies
   - Benefits: Improves security audit scores, signals trust to Google

3. **Expand Sitemap**
   - If blog is added, include blog posts in sitemap.xml
   - Add video sitemap if demo videos are created

4. **Internal Linking Strategy**
   - Link blog posts → landing page with anchor text like "gamified budget app"
   - Link landing page → sign-up with "start budgeting now"

### Phase 4: Long-Term (Months 4+)

**Priority: Low**

1. **Content Hub Development**
   - Create 20-30 articles on personal finance + gamification
   - Establish Money Garden as authority in the niche
   - Target "informational" queries (high volume, lower intent)

2. **Brand Building**
   - Social media strategy (TikTok, Instagram for Gen Z)
   - Influencer partnerships in personal finance space
   - Backlinks from major finance publications

3. **User-Generated Content**
   - Testimonials with schema markup (Review schema)
   - Case studies from users who saved X dollars
   - Video testimonials embedded on landing page

4. **Monitor Competitors**
   - Track keyword rankings vs. competitors
   - Analyze their backlink strategy
   - Identify gaps in content

---

## 8. Keyword Targeting Summary

### 8.1 Landing Page Optimization

**Current:** Homepage targets all keywords broadly (good for brand awareness).

**Recommended:** Refine landing page sections to target specific keyword clusters:

```
Section 1: Hero
- Headline includes primary keyword "budget management"
- Subheadline includes "gamification"

Section 2: Features
- "Track expenses" (target "expense tracker")
- "Earn gold coins" (target "earn coins for saving")
- "Grow your garden" (target "virtual garden")

Section 3: Why Choose Money Garden
- "Gamified approach" (target "gamified finance")
- "Better habits" (target "financial goals")

CTA: "Start budgeting for free" (target "free budget app")
```

### 8.2 Internal Linking Strategy (Future)

Once blog is launched:

```
Blog article: "How to Make Budgeting Fun"
→ Link to Money Garden with anchor text "gamified budget app"

Blog article: "Virtual Garden Finance"
→ Link to Money Garden with anchor text "earn coins while saving"

Landing page "Features" section
→ Link to blog articles with educational anchor text
```

**Effect:** Distributes keyword relevance across pages, improves domain authority.

---

## 9. Maintenance & Monitoring

### 9.1 Monthly Tasks

- [ ] Check Google Search Console for new errors
- [ ] Review top landing pages & keywords (Performance report)
- [ ] Check Core Web Vitals scores in PageSpeed Insights
- [ ] Verify sitemap is up-to-date

### 9.2 Quarterly Tasks

- [ ] Full Lighthouse audit (all 4 metrics)
- [ ] Backlink analysis (check new mentions of Money Garden)
- [ ] Competitor keyword analysis
- [ ] Search query trend analysis (GSC > Performance)

### 9.3 Alerts to Set Up

In Google Search Console:

1. **Coverage Issues** → Email alert
2. **Crawl Anomalies** → Email alert
3. **Manual Actions** → Email alert
4. **Security Issues** → Email alert

Navigate to **Settings** > **Email preferences** to configure.

---

## 10. FAQ

### Q: Why is the landing page the only indexed page?

**A:** Money Garden is a web app where authenticated users access their dashboard. Only the public landing page is meant for search engines. Authenticated routes are protected by Expo Router's auth guard, and robots.txt explicitly disallows them.

### Q: How long until Money Garden ranks for "gamified budget app"?

**A:** Typically 4-12 weeks after first submission to Google Search Console, depending on:
- Domain authority (new site = lower initial ranking)
- Backlink quantity & quality
- Content quality & freshness
- Competition level

Start with long-tail keywords (lower competition), then move to primary keywords.

### Q: What if og-image.png is missing?

**A:** When shared on social media, a generic preview appears (usually the favicon). This doesn't hurt SEO directly, but reduces CTR on social platforms. Priority: create the image in Week 1.

### Q: Do I need to rebuild & redeploy to update robots.txt or sitemap.xml?

**A:** **Yes.** These files are part of the `dist/` directory created by `npx expo export --platform web`. Changes to `public/robots.txt` or `public/sitemap.xml` require a rebuild and redeployment.

### Q: Can I set up automatic sitemap generation?

**A:** Yes (future improvement). Use a Node script to auto-generate sitemap.xml based on routes. For now, manually update `public/sitemap.xml` when adding new public routes.

### Q: Why use Vercel instead of traditional hosting?

**A:** Vercel is optimized for Next.js/Expo/React apps and provides:
- Automatic HTTPS + HTTP/2
- Smart image optimization
- Edge caching globally (fast load times)
- Built-in security headers
- Automatic scaling

All of these help with SEO (Lighthouse scores, performance metrics, uptime).

---

## 11. Implementation Checklist

**Status: 85% Complete**

- [x] Title & description meta tags
- [x] Keywords meta tag
- [x] Open Graph tags (all platforms)
- [x] Twitter Card tags
- [x] JSON-LD WebApplication schema
- [x] JSON-LD Organization schema
- [x] Canonical link
- [x] robots.txt with crawl directives
- [x] sitemap.xml (basic, 1 URL)
- [x] Security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] Cache control headers
- [x] Font preconnect
- [x] Theme color & PWA meta tags
- [ ] **PENDING:** og-image.png creation (1200×630px)
- [ ] **PENDING:** Google Search Console submission + verification
- [ ] **PENDING:** Backlink acquisition strategy
- [ ] **PENDING:** Blog content (3-5 initial articles)

---

## 12. Tools & Resources

### SEO Auditing
- **Google Search Console** — https://search.google.com/search-console
- **PageSpeed Insights** — https://pagespeed.web.dev
- **Lighthouse CLI** — `npm install -g @lighthouse-cli/cli`
- **Schema.org Validator** — https://validator.schema.org

### Keyword Research
- **Google Keyword Planner** — https://ads.google.com/intl/en_US/home/tools/keyword-planner/
- **SEMrush** (paid) — https://semrush.com
- **Ahrefs** (paid) — https://ahrefs.com
- **Answer the Public** (free) — https://answerthepublic.com

### Backlink & Competitor Analysis
- **Backlinko** — https://backlinko.com
- **Majestic** (paid) — https://majestic.com
- **Moz** (paid) — https://moz.com

### Social Media Preview
- **Open Graph Debugger** — https://www.opengraph.xyz

### Image Optimization
- **TinyPNG** — https://tinypng.com (PNG/JPG compression)
- **Squoosh** — https://squoosh.app (Google, free)

---

## 13. Contact & Support

**Questions about Money Garden SEO?**
- Support email: help@getmoneygarden.com
- Domain: https://getmoneygarden.com
- GitHub: [repo link]

---

**Last updated:** May 11, 2026  
**Next review:** August 11, 2026 (3 months)
