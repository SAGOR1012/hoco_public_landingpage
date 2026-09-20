# Gadget Lab BD: Hoco EQ34 Plus landing page (Next.js, Bangla)

## Run
```
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```
Deploy on Vercel: import the project, add the same env variables, deploy.

## What gets tracked

| Event | When | Browser Pixel | Server (CAPI) |
|---|---|---|---|
| PageView, ViewContent | page opens | yes | yes |
| ScrollDepth (50, 90), TimeOnPage30s | engagement | yes | yes |
| CTAClick, Contact | order button / call link tapped | yes | yes |
| ANCDemo | ANC switch on the demo | yes | yes |
| InitiateCheckout | first touch of the order form | yes | yes |
| IncompleteOrder | valid phone typed, no order (2s after typing stops, or when they leave) | yes | yes |
| Purchase | order accepted by the server | yes | yes |

Browser and server copies share one `event_id`, so Meta counts each event once.

## Incomplete orders
`/api/incomplete` saves name, phone, address, quantity to the sheet (one row per visitor, status INCOMPLETE, updated as they type) and pings Telegram once. If the same visitor orders later, the row turns CONVERTED.

## Setup steps
1. Meta: Events Manager > your Pixel > Settings > Conversions API > generate access token. Put Pixel ID and token in env.
2. Test: put the Test Event Code in `META_TEST_EVENT_CODE`, open the page, check Events Manager > Test events (you should see Browser and Server for each event). Remove the code before going live.
3. Google Sheet: follow the steps at the top of `docs/google-apps-script.gs`.
4. Telegram (optional): create a bot with @BotFather, put token and your chat id in env.
5. Edit price, delivery charge and phone in `lib/config.js`.

Without ORDER_WEBHOOK_URL / Telegram set, orders are only printed in the server log, so set at least one before running ads.
