// ---- mobile menu ----
function toggleMobileNav(){
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('menuToggle');
  const isOpen = nav.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if(isOpen) trackEvent('mobile_nav_open', {});
}
function closeMobileNav(){
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('menuToggle').classList.remove('open');
  document.getElementById('menuToggle').setAttribute('aria-expanded', 'false');
}

// ---- header "ETFs" dropdown ----
/*function toggleEtfsDropdown(){
  const menu = document.getElementById('etfsDropdownMenu');
  const trigger = document.querySelector('#etfsDropdown .dropdown-trigger');
  const isOpen = menu.classList.toggle('open');
  trigger.classList.toggle('open', isOpen);
  trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if(isOpen) trackEvent('etfs_dropdown_open', {});
}
document.addEventListener('click', (e) => {
  if(!e.target.closest('#etfsDropdown')){
    document.getElementById('etfsDropdownMenu').classList.remove('open');
    document.querySelector('#etfsDropdown .dropdown-trigger').classList.remove('open');
  }
});*/

// ---- mode toggle (signature interaction) ----
const heroTicker = document.getElementById('heroTicker');

// ============================================================
// TWO SEPARATE SWITCHES — effective and listed are genuinely
// different events (a fund can be SEC-effective before it's actually
// trading), so they're deliberately not tied together. Everything
// else on the page reads from FUND_EFFECTIVE; only the product-page
// links read from FUND_LISTED instead.
//
// FUND_EFFECTIVE — flip to true once the SEC registration is
// effective (regardless of whether trading has actually started).
//   Hidden pre-effective, shown once true:
//     - the fund snapshot boxes (Ticker, CUSIP, Net Assets, etc.)
//   Shown pre-effective, hidden once true (the inverse — these are
//   legally required specifically because the funds aren't
//   effective yet, so they need to disappear once they are):
//     - the amber Registration Statement Notice near the top
//     - the matching registration paragraph in the footer legal block
//     - the "not yet effective" line in the scrolling ticker tape
//
// FUND_LISTED — flip to true once ANTU/ANTY are actually trading and
// have real product pages to send people to. Independent of
// FUND_EFFECTIVE: a fund could be effective for a while before it
// actually lists, and you don't want "View Fund Details" links
// pointing at pages that don't exist yet just because effectiveness
// happened.
//   Hidden until listed, shown once true:
//     - "View Fund Details" links on the toggle buttons
//
// Independent of both flags entirely (its own two controls, see below):
//   - the status badge ("Pending Anthropic IPO Listing")
// ============================================================
const FUND_EFFECTIVE = false;
const FUND_LISTED = false;

// ---- Status badge: two independent controls, not tied to a fixed pair
// of preset states —
//   STATUS_BADGE_VISIBLE: set to false to remove the badge completely.
//   STATUS_BADGE_TEXT: edit this string to say anything you want, at
//     any stage (e.g. "Available Soon", "Listing This Fall", etc.) —
//     it's a normal string, not limited to two presets. The line below
//     just picks a sensible default depending on FUND_LISTED (not
//     FUND_EFFECTIVE — a fund can be effective without trading yet,
//     so "Now Trading" shouldn't show until it's actually listed),
//     but you can override it directly any time. ----
const STATUS_BADGE_VISIBLE = true;
const STATUS_BADGE_TEXT = FUND_LISTED ? 'Now Trading' : 'Pending Anthropic IPO Listing';

// ---- Signup: Once FUND_LISTED is true:
//   - the thin banner's button is replaced with a small inline
//     email field + Subscribe button, right in the banner — no
//     popup ask at all
//   - the auto-popup timer never fires
//   - a brief confirmation still appears after they submit (that's
//     a direct response to their own action, not an interruption)
// Edit any of these strings freely — plain text, not limited to
// these two presets. ----
const SIGNUP_HEADING_PRE_LISTING = 'Be first to trade <strong>ANTU</strong> and <strong>ANTY</strong>';
const SIGNUP_HEADING_LISTED = 'Stay updated on market insights and ProShares products.';
const SIGNUP_POPUP_SUBTITLE_PRE_LISTING = 'Get an email alert as soon as the funds list.';
//const CONFIRM_MESSAGE_PRE_LISTING = 'ProShares will notify you when ANTU and ANTY are available to trade.';
//const CONFIRM_MESSAGE_LISTED = "You'll get market insights and ProShares updates in your inbox.";

document.getElementById('signupThinHeading').innerHTML = FUND_LISTED ? SIGNUP_HEADING_LISTED : SIGNUP_HEADING_PRE_LISTING;

if(FUND_LISTED){
  document.getElementById('signupThinAction').innerHTML = `
    <form class="signup-thin-inline-form" id="signupInlineForm" onsubmit="return doSignup(event)">
      <input type="email" name="email" placeholder="you@email.com" required>
      <button type="submit" class="signup-thin-btn">Subscribe</button>
    </form>`;
} else {
  //document.getElementById('signupPopupSubtitle').textContent = SIGNUP_POPUP_SUBTITLE_PRE_LISTING;
}

const statusBadgeEl = document.getElementById('statusBadge');
if(statusBadgeEl) statusBadgeEl.style.display = STATUS_BADGE_VISIBLE ? '' : 'none';
document.getElementById('statusText').textContent = STATUS_BADGE_TEXT;
document.getElementById('statusDot').classList.toggle(!FUND_LISTED);
document.getElementById('statusDot').style.backgroundColor = FUND_LISTED ? '#1A3302' : '#E6B800';
document.getElementById('statusBadge').style.cssText = FUND_LISTED ? `
  display:flex;
  align-items:center;
  gap:8px;
  justify-content:center;
  width:fit-content;
  font-family:var(--font-body);
  font-size:11.5px;
  font-weight:700;
  letter-spacing:.6px;
  color: #1A3302;
  text-transform:uppercase;
  background: #c6d9b4;
  border:1.5px solid #1A3302;
  padding:7px 16px;
  border-radius:20px;
` : ``;

// ---- Toggle button subtitle ("Long · 2x daily" / "Short · -2x daily"):
// this states the fund's daily multiple/objective, which can't be said
// publicly before the fund is effective — so this now defaults to
// hidden pre-effective and appears automatically once FUND_EFFECTIVE
// is true. Same override pattern as the status badge above —
//   SEG_TAG_VISIBLE: hardcode to true or false here if you want to
//     force it independent of FUND_EFFECTIVE for any reason.
//   SEG_TAG_TEXT_LONG / SEG_TAG_TEXT_SHORT: edit these strings to say
//     anything you want, or leave blank ('') to show an empty line. ----
const SEG_TAG_VISIBLE = true;
const SEG_TAG_TEXT_LONG = 'Long \u00b7 2x daily';
const SEG_TAG_TEXT_SHORT = 'Short \u00b7 \u22122x daily';

const segTagLong = document.getElementById('segTagLong');
const segTagShort = document.getElementById('segTagShort');
if(segTagLong){ segTagLong.style.display = SEG_TAG_VISIBLE ? '' : 'none'; segTagLong.textContent = SEG_TAG_TEXT_LONG; }
if(segTagShort){ segTagShort.style.display = SEG_TAG_VISIBLE ? '' : 'none'; segTagShort.textContent = SEG_TAG_TEXT_SHORT; }

// ---- "View Fund Details" links on the toggle buttons — tied to
// FUND_LISTED, not FUND_EFFECTIVE (see the note above) ----
const PRODUCT_PAGES_LIVE = FUND_LISTED;
document.getElementById('tickerToggle').classList.toggle('product-pages-live', PRODUCT_PAGES_LIVE);

// ---- Fund snapshot boxes (Ticker, CUSIP, Net Assets, etc.): hidden
// pre-effective rather than showing a table full of "TBD" placeholders,
// shown once there's real data to display. ----
const fdSnapshotAntu = document.getElementById('fdSnapshotAntu');
if(fdSnapshotAntu) fdSnapshotAntu.style.display = FUND_EFFECTIVE ? '' : 'none';
const fdSnapshotAnty = document.getElementById('fdSnapshotAnty');
if(fdSnapshotAnty) fdSnapshotAnty.style.display = FUND_EFFECTIVE ? '' : 'none';

// ---- Registration-statement-specific notices: these are the opposite
// direction from everything else on this page — they're legally
// required BECAUSE the funds aren't effective yet, so they show
// pre-effective and disappear once effective (not the other way
// around). See the note in the chat about why this one stays inverted. ----
const regCaption = document.getElementById('regCaption');
if(regCaption) regCaption.style.display = FUND_EFFECTIVE ? 'none' : '';
const footerRegNotice = document.getElementById('footerRegNotice');
if(footerRegNotice) footerRegNotice.style.display = FUND_EFFECTIVE ? 'none' : '';

// ---- Every major section can be switched off independently. Flipping
// any of these to false also removes that section's own nav link
// (desktop header + mobile menu) automatically, so you never end up
// with a dead link pointing at a hidden section. Turning FAQ off also
// disables its hidden search-engine schema up in <head>, so there's no
// mismatch between what's on the page and what search engines/AI
// assistants are told is on the page. ----
const FUND_DETAILS_LIVE   = FUND_EFFECTIVE;  // "Benefits of ANTU/ANTY" + snapshot section
const INSIGHTS_LIVE       = true;  // the article/video cards above "Anthropic at a Glance"
const WHY_ANTHROPIC_LIVE  = true;  // the whole investment-case section (includes Insights)
const FAQ_LIVE            = true;  // the FAQ accordion + its search-engine schema

// ---- Anthropic at a Glance: Valuation / Run-Rate Revenue toggle ----
function setChartView(view, btn){
  document.getElementById('chartValuation').style.display = view === 'valuation' ? '' : 'none';
  document.getElementById('chartRevenue').style.display = view === 'revenue' ? '' : 'none';
  document.querySelectorAll('.chart-toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ---- "Anthropic at a Glance" stat grid: always lays out as 2 even
// rows, whatever the card count is. Add or remove .stat-cell blocks
// in the HTML freely — this recalculates the column count on its own,
// so there's never a fixed 4-wide grid leaving an awkward gap when
// the count doesn't divide evenly by 4 (6 cards -> 2 rows of 3,
// 8 cards -> 2 rows of 4, 5 cards -> 2 rows of 3 with one gap on the
// second row, etc.). Tablet/mobile breakpoints below still override
// this down to 2 or 1 column regardless of the count. ----
const statGrid = document.querySelector('.stat-grid');
if(statGrid){
  const cardCount = statGrid.querySelectorAll('.stat-cell').length;
  const cols = Math.max(1, Math.ceil(cardCount / 2));
  statGrid.style.setProperty('--stat-cols', cols);
}

function toggleSection(id, isLive, navHref){
  const el = document.getElementById(id);
  if(el) el.style.display = isLive ? '' : 'none';
  if(navHref){
    document.querySelectorAll(`a[href="${navHref}"]`).forEach(a => {
      a.style.display = isLive ? '' : 'none';
    });
  }
}

toggleSection('fundDetails', FUND_DETAILS_LIVE);

if(!FAQ_LIVE){
  const faqSchema = document.getElementById('faqJsonLd');
  if(faqSchema) faqSchema.remove();
}

function setMode(mode){
  document.body.dataset.mode = mode;
  document.querySelectorAll('.ticker-seg-wrap').forEach(w => w.classList.toggle('active', w.classList.contains(mode)));
  trackEvent('mode_toggle', {mode: mode});

  if(mode === 'long'){
    heroTicker.textContent = 'MAGNIFIED';
    heroTicker.classList.remove('mode-short');
    heroTicker.classList.add('mode-long');
  } else {
    heroTicker.textContent = 'INVERSE';
    heroTicker.classList.remove('mode-long');
    heroTicker.classList.add('mode-short');
  }
}

// ---- ticker tape content ----
// Kept deliberately distinct from the "Anthropic at a Glance" stat grid below —
// no repeated valuation/revenue numbers here. Mix of fun facts, brand
// credibility, and functional wayfinding instead. Any number of items
// works; add, remove, or edit freely.
// ---- Ticker tape content — completely independent of FUND_EFFECTIVE/
// FUND_LISTED above. Edit, add, or remove any line below, any time,
// for any reason — none of it is tied to fund status automatically.
// Plain HTML is fine inside each string, including real links —
// e.g. the "How They Work" line below links to the actual page. ----
const tickerItems = [
  "Claude is reportedly named after <b>Claude Shannon</b>, the father of information theory",
  'Anthropic was co-founded in 2021 by siblings <b>Dario and Daniela Amodei</b>',
  'Anthropic employs more than <b>2,500 people</b> company-wide',
  "Anthropic's valuation more than <b>doubled</b> in just 3 months, Feb–May 2026"
];
const track = document.getElementById('tickerTrack');
const loopContent = tickerItems.concat(tickerItems).map(t => `<span>${t}</span>`).join('');
track.innerHTML = loopContent;

// ---- accordion ----
const faqExpandButton = document.getElementById('collapseAll');
const faqAccordions = document.querySelectorAll('.accordion-collapse');

function updateFaqToggleLabel(){
  if(!faqExpandButton || !faqAccordions.length) return;
  const allExpanded = [...faqAccordions].every(accordion => accordion.classList.contains('show'));
  faqExpandButton.textContent = allExpanded ? 'Close all' : 'Expand all';
}

if(faqExpandButton){
  faqExpandButton.addEventListener('click', () => {
    const allExpanded = [...faqAccordions].every(accordion => accordion.classList.contains('show'));
    faqAccordions.forEach(accordion => {
      const collapse = bootstrap.Collapse.getOrCreateInstance(accordion, { toggle: false });
      allExpanded ? collapse.hide() : collapse.show();
    });
    updateFaqToggleLabel();
  });
}

faqAccordions.forEach(accordion => {
  accordion.addEventListener('shown.bs.collapse', updateFaqToggleLabel);
  accordion.addEventListener('hidden.bs.collapse', updateFaqToggleLabel);
});
updateFaqToggleLabel();

// ============================================================
// ENGAGEMENT TRACKING — one helper, used everywhere on the page.
// Fires a GA4 event (if gtag exists), a Meta Pixel event (if fbq
// exists), and a LinkedIn conversion event (if lintrk exists) —
// each check is safe on its own, so adding one pixel at a time in
// <head> (see the ANALYTICS block up there) just works with zero
// changes needed here. Add more platforms the same way as needed.
// ============================================================
function trackEvent(eventName, params){
  params = params || {};
  if(typeof gtag === 'function') gtag('event', eventName, params);
  if(typeof fbq === 'function') fbq('trackCustom', eventName, params);
  if(typeof lintrk === 'function') lintrk('track', { conversion_id: eventName });
}

// ---- signup: styled form here, data goes to HubSpot behind the scenes ----
// Fill these in once you've created the form in HubSpot (see the
// ANALYTICS block in <head> for the full setup steps).
const HUBSPOT_PORTAL_ID = '47065601';
const HUBSPOT_FORM_GUID = '12d648a0-6a72-427a-991c-e3afaa092224';

function getHubspotCookie(name){
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

function doSignup(e){
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const investorTypeEl = form.querySelector('input[name="investor_type"]:checked');
  const investorType = investorTypeEl ? investorTypeEl.value : 'not_asked';

  trackEvent('signup_submitted', {investor_type: investorType, mode: document.body.dataset.mode});

  closeSignupPopup();
  openConfirmPopup();
  return false;
}

// ---- signup popup ----
// The thin banner up top is always visible regardless of this setting
// — its "Notify Me" button calls openSignupPopupNow() below and opens
// this same popup instantly. SIGNUP_STYLE only controls whether the
// popup ALSO appears automatically on its own after a delay:
//   'popup'  — auto-opens once, SIGNUP_POPUP_DELAY_MS after page load
//   'banner' — never auto-opens; only opens when someone clicks the
//              thin banner's button
const SIGNUP_STYLE = 'popup'; // 'banner' or 'popup'
const SIGNUP_POPUP_DELAY_MS = 5000;

function closeSignupPopup(){
  document.getElementById('signupPopupOverlay').classList.remove('open');
}
function openSignupPopupNow(){
  document.getElementById('signupPopupOverlay').classList.add('open');
  trackEvent('signup_popup_shown', {trigger: 'banner_click'});
}

document.getElementById('signupPopupOverlay').addEventListener('click', (e) => {
  if(e.target.id === 'signupPopupOverlay') closeSignupPopup();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeSignupPopup();
});

if(SIGNUP_STYLE === 'popup' && !FUND_LISTED){
  setTimeout(() => {
    document.getElementById('signupPopupOverlay').classList.add('open');
    trackEvent('signup_popup_shown', {trigger: 'timer'});
  }, SIGNUP_POPUP_DELAY_MS);
}

// ---- signup confirmation popup ----
/*function openConfirmPopup(){
  document.getElementById('confirmOverlay').classList.add('open');
  // tags (Google Ads, Meta, LinkedIn, etc.) to this event name if a
  // platform needs its own specific trigger rather than reusing
  // 'signup_submitted' above.
  trackEvent('signup_conversion', {});
}
function closeConfirmPopup(){
  document.getElementById('confirmOverlay').classList.remove('open');
}
document.getElementById('confirmOverlay').addEventListener('click', (e) => {
  if(e.target.id === 'confirmOverlay') closeConfirmPopup();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeConfirmPopup();
});*/

// ---- scroll reveal ----
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// transition when clicking on external links
//function externalLinkWarning(){
  //document.getElementById('externalLinkOverlay').classList.add('open');}

// Bootstrap Tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))