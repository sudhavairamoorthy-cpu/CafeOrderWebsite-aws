# Cafe Bliss — Cafe Order Website

This is a simple static HTML/CSS/JavaScript frontend for your Cafe Order Website. It is configured to call your existing AWS API Gateway route:

`POST https://2uifu0p2kc.execute-api.ap-south-1.amazonaws.com/order`

The current flow is: Browser → API Gateway → Lambda (`PlaceOrder`) → DynamoDB (`CafeOrders`) + SNS (`CafeOrdersTopic`) → subscribed SQS queues.

## Files

- `index.html` — page structure
- `css/style.css` — responsive pink/purple gradient design
- `js/script.js` — menu, search, categories, cart, checkout, and AWS API call

## Step-by-step: test on your computer

1. Download and extract `CafeOrderWebsite.zip`.
2. Open the extracted `CafeOrderWebsite` folder.
3. Open `index.html` in Chrome for a quick UI test. For the best local development experience, open the folder in VS Code and use the Live Server extension.
4. Add menu items to your cart, fill in your name, and click **Place my order**.
5. For AWS submission, verify that API Gateway CORS allows the origin `https://sudhavairamoorthy-cpu.github.io`, methods `POST` and `OPTIONS`, and header `content-type`.
6. Ensure the API Gateway `$default` stage exists and automatic deployment is enabled.
7. If you are testing from your GitHub Pages URL, upload the three files/folders to your existing GitHub repository while preserving this structure:
   - `index.html`
   - `css/style.css`
   - `js/script.js`
8. Commit the changes to the `main` branch. Wait for GitHub Pages to publish, then open:
   `https://sudhavairamoorthy-cpu.github.io/CafeOrderWebsite/`

## If your GitHub repository has no files left

1. Open `https://github.com/sudhavairamoorthy-cpu/CafeOrderWebsite`
2. Click **Add file → Upload files**.
3. Upload `index.html`, and upload the `css` and `js` folders with their files. If GitHub's web upload doesn't preserve empty folders, these folders are not empty in this package.
4. Commit the changes to `main`.
5. Open **Settings → Pages** and confirm it deploys from branch `main`, folder `/(root)`.

## AWS troubleshooting

- **CORS error in browser:** In API Gateway → `CafeOrderAPI` → CORS, allow exactly `https://sudhavairamoorthy-cpu.github.io`, methods `POST` and `OPTIONS`, and header `content-type`. `$default` stage has automatic deployment enabled.
- **HTTP 500:** Open Lambda → `PlaceOrder` → Monitor → View CloudWatch logs. Check the Lambda execution role has permission to write to `CafeOrders` and publish to `CafeOrdersTopic`.
- **Route not found / 404:** API Gateway → Routes should show `POST /order`, integrated with `PlaceOrder`.
- **Local file testing:** Browsers can send an origin of `null` when opened as `file://`, which won't match your GitHub Pages CORS origin. Use GitHub Pages or a local server for an accurate API test.

## Important notes

- This demo does not take real payments. The `payment` field is set to `"Not collected"`; do not treat browser-submitted payment information as verified payment.
- The frontend calculates prices for demonstration. A production system should calculate/verify prices on the server and use a trusted payment provider.
- The website uses text/emoji illustrations instead of external product images, so the menu remains visually complete without image dependencies.
