# Kapoor Jewellers POC — Web tracking spec (v1.3)

Owner: website (EDS storefront). Consumers: Experience Platform / Real-Time CDP, Journey Optimizer, Adobe Analytics.
Naming prefix for every object: **POC-Kapoor**. Currency: **USD**. Site: `https://main--demo-site--akkapoor93.aem.live/`.

**Environment (decided):** organisation **CXO Enablement Training LAB**, shared development sandbox **`general-dev-sandbox`** — add-only, every object prefixed `POC-Kapoor`, inventory of created objects kept by Coworker. To be copied to the dedicated sandbox **`akkapoor-poc`** once access is granted (only the sandbox name and dataset/datastream IDs change on the website side).

**IDs:** org `0B6930256441790E0A495FFE@AdobeOrg`, tenant `acsultimatesupport` → custom fields at `_acsultimatesupport.kapoor`.
**Commerce:** for now the site runs its own **POC shop** (catalogue `data/products.json` — 50 products incl. 11 earrings and 7 rings; cart, test accounts and test orders kept in the browser; test payment only). Adobe Commerce replaces it later; pages and events stay the same.

**Implementation status (website):** all events in section 4, `setConsent` and the profile post (section 5) are implemented — `scripts/tracking.js`, `scripts/shop.js`, `scripts/web-sdk.js`, settings in `scripts/tracking-config.js`. The Web SDK loads only after the visitor accepts the consent banner. Until `datastreamId` (and the streaming inlet) are filled in, events are built and logged in the browser (sessionStorage `kapoor-tracking-log`) but not sent.

**Shop pages:** `/jewelry/earrings`, `/jewelry/rings`, `/product` (product chosen by the `sku` query parameter), `/cart`, `/checkout` (order confirmation shown in place), `/account`. `productUrl` in events is the public product page address with its `sku` parameter.

**Messaging safety (shared sandbox):** journeys and emails target **test profiles only** (POC-Kapoor test customers / seed list) until the dedicated sandbox is in use.

## 1. Delivery

- Collection: **Adobe Experience Platform Web SDK** (alloy), loaded after page render.
- One **datastream**: `POC-Kapoor Web` with two services:
  - **Adobe Experience Platform** → event dataset `POC-Kapoor Web Events`, profile dataset `POC-Kapoor Profile` (for consent updates).
  - **Adobe Analytics** → POC report suite (ID to be supplied).
- Every event is sent with `sendEvent({ xdm })`; page views and link clicks are also mapped to Analytics automatically by the datastream.
- Commerce data (SKUs, prices, orders) comes from the POC shop catalogue now, and from Adobe Commerce later.

## 2. Schemas

### 2a. Event schema `POC-Kapoor Web Events` (class: XDM ExperienceEvent)

Standard field groups:
- **AEP Web SDK ExperienceEvent** (web page details, web interaction, environment, device)
- **Commerce Details** (commerce.*, productListItems[])
- **User Account Details** (userAccount.*)

Custom field group **POC-Kapoor Site Context** (at `_acsultimatesupport.kapoor`):

| Field | Type | Example |
|---|---|---|
| `pageType` | string (enum: home, category, product, cart, checkout, confirmation, account, coming-soon, other) | `category` |
| `category` | string | `Earrings` |
| `productImageUrl` | string (URL) — set on product view / cart adds for use in emails | `https://…/media_….jpg` |
| `productUrl` | string (URL) | `https://…/products/…` |

### 2b. Profile schema `POC-Kapoor Profile` (class: XDM Individual Profile)

Standard field groups: **Demographic Details** (person.name), **Personal Contact Details** (personalEmail.address), **Consents and Preferences** (consents.marketing.email.val).
Primary identity: **Email** (`personalEmail.address`). Also `_acsultimatesupport.kapoor.customerId` (string) marked as identity, namespace `kapoorCustomerId`. Enable for **Profile**.

## 3. Identities

| Namespace | When sent | Primary on web events | authenticatedState |
|---|---|---|---|
| **ECID** | always (automatic) | yes | ambiguous |
| **Email** (standard namespace) | after login, signup or checkout with an email | no | authenticated |
| **POC-Kapoor Customer ID** — custom namespace, code `kapoorCustomerId` (type: Cross-device) | after login/signup (Commerce customer ID) | no | authenticated |

Identity graph: ECID ↔ Email ↔ kapoorCustomerId stitched when the customer logs in or checks out. Email is the identifier used for messaging.

## 4. Events

`productListItems[]` item shape used by all commerce events:
`{ SKU, name, quantity, priceTotal, currencyCode: "USD", productAddMethod? }` plus `_<tenantId>.kapoor.productImageUrl` / `productUrl` on the event.

| # | Event | `eventType` | When | Key fields |
|---|---|---|---|---|
| 1 | Page view | `web.webpagedetails.pageViews` | every page load | `web.webPageDetails.{name, URL, pageViews.value=1}`, `web.webReferrer.URL`, `kapoor.pageType`, `kapoor.category` |
| 2 | Link / menu click | `web.webinteraction.linkClicks` | header, megamenu, footer and CTA clicks | `web.webInteraction.{name, URL, type: "other" \| "exit", linkClicks.value=1}` |
| 3 | Product view | `commerce.productViews` | product page shown | `commerce.productViews.value=1`, `productListItems[1]` |
| 4 | Add to cart | `commerce.productListAdds` | item added (product page or mini-cart) | `commerce.productListAdds.value=1`, `commerce.cart.cartID`, `productListItems[1]` (quantity, priceTotal) |
| 5 | Remove from cart | `commerce.productListRemovals` | item removed / qty to 0 | `commerce.productListRemovals.value=1`, `commerce.cart.cartID`, `productListItems[1]` |
| 6 | Cart view | `commerce.productListViews` | cart page or mini-cart opened | `commerce.productListViews.value=1`, `commerce.cart.cartID`, `productListItems[]` (full cart) |
| 7 | Checkout start | `commerce.checkouts` | checkout page shown | `commerce.checkouts.value=1`, `commerce.cart.cartID`, `productListItems[]` |
| 8 | Purchase | `commerce.purchases` | order placed (confirmation page) | `commerce.purchases.value=1`, `commerce.order.{purchaseID, priceTotal, currencyCode, payments[{paymentType, paymentAmount, currencyCode}]}`, `productListItems[]`; identities Email (+ customer ID if logged in) |
| 9 | Account created | `userAccount.createProfile` | signup succeeds | `userAccount.createProfile.value=1`; identities Email + kapoorCustomerId |
| 10 | Login | `userAccount.login` | sign-in succeeds | `userAccount.login.value=1`; identities Email + kapoorCustomerId |
| 11 | Logout | `userAccount.logout` | sign-out | `userAccount.logout.value=1` |

Consent: at signup/checkout the customer ticks “Email me offers”. The site calls `setConsent` (Adobe 2.0 standard) → `consents.marketing.email.val = "y" | "n"` on the profile (needs the profile dataset in the datastream).

## 5. Profile attributes (name, email address)

Web events carry identities, not profile attributes. For the POC:
1. **Seed test profiles** — loaded by Coworker into `POC-Kapoor Profile`: the owner's email plus 2–3 made-up shoppers using **`@example.com`** addresses (reserved, undeliverable), marketing consent `y`.
2. **Signup from the website** — at account creation (and at checkout when the shopper ticks "Email me offers"), the site posts one profile record to an **HTTP API streaming source** (POC only, unauthenticated inlet) into `POC-Kapoor Profile`:
   `personalEmail.address`, `person.name.firstName` / `lastName`, `_acsultimatesupport.kapoor.customerId`, `consents.marketing.email.val`.
   Coworker creates the source + dataflow and sends the inlet URL; the site wraps records in the standard streaming envelope (`header.schemaRef`, `imsOrgId`, `datasetId`, `body.xdmEntity`).

## 6. Journeys and audiences this spec supports

- **Abandoned cart**: trigger on event 4 (Add to cart); exit if event 8 (Purchase) arrives for the same profile within the wait (POC: 30 minutes); email uses the triggering event's `productListItems[]`, `productImageUrl`, `productUrl`; requires `consents.marketing.email.val = "y"`.
- **Audiences**: signed-up customers (event 9 ever), purchasers (event 8 ever), high-value shoppers (sum of `commerce.order.priceTotal` ≥ 2000 in 90 days), cart abandoners (event 4 in last 7 days, no event 8 since).

## 7. Open questions

1. ~~Sandbox~~ — decided: `general-dev-sandbox` now, `akkapoor-poc` later. ~~Org ID~~ — received. Still needed: whether the datastream can be created in Data Collection in that organisation.
2. ~~Commerce~~ — decided: POC shop on the site for now; Adobe Commerce later.
3. Analytics report suite ID.
4. ~~Tenant ID~~ — `acsultimatesupport`.
5. From Coworker after creation: schema/dataset IDs, identity namespace code, HTTP API streaming inlet URL + dataset ID for profile records, datastream settings.
