# Vistyle

Vistyle is a fashion-focused MERN storefront for browsing products, managing a
shopping cart, and placing demo orders through Stripe Checkout in **test mode
only**. It includes customer accounts, an application-based seller onboarding
flow, seller product listings, and administrator catalog and category tools.

> **Demo project:** Stripe live payments are not supported. Sample products and
> images are illustrative and should not be presented as real inventory.

## Application overview

### Customer storefront

- **Home (`/`)** — editorial landing page, featured products, and image-led
  category cards.
- **All products (`/products`)** — browse the product catalog.
- **Category (`/category/:category`)** — view products belonging to a category.
- **Product detail (`/product/:id`)** — view product information and add
  available stock to the cart.
- **Search** — search the catalog by product name from the site navigation.
- **Cart (`/cart`)** — authenticated customers can review items, change
  quantities, remove items, clear the cart, and begin checkout.
- **Orders (`/orders`, `/orders/:orderId`)** — review the signed-in customer's
  orders and order details.
- **About (`/about`)** — information about the storefront.
- **Contact (`/contact`)** — currently a static placeholder; no support message
  is submitted or sent.

### Account and seller tools

- **Register (`/register`) and login (`/login`)** — create and access customer
  accounts. Public signup cannot assign seller or administrator privileges.
- **Sell with us (`/sell`)** — signed-in customers can submit store details for
  administrator review. Approval grants seller access; rejected applications
  can be updated and resubmitted.
- **Seller studio (`/seller-panel`)** — approved sellers can create, view,
  update, and delete their own product listings.
- Product images uploaded through seller/admin product forms are stored in
  Cloudinary.

### Administrator tools

The administrator workspace (`/secret-panel`) provides:

- Full product catalog management and product creation.
- Featured-product controls.
- A queue for reviewing seller applications.
- Category management: create or reactivate categories, adopt categories
  discovered from existing products, and deactivate categories that are no
  longer in use.

An administrator account must be provisioned through a trusted, out-of-band
administrative process. There is no public admin signup, default admin account,
or admin bootstrap command in this repository. Do not expose database
credentials or promote accounts through an unauthenticated endpoint.

### Checkout

Checkout uses Stripe-hosted Checkout in **test mode** and displays a demo
payment notice. The server calculates amounts from current product prices and
checks available stock before creating a session. A verified Stripe webhook,
not the browser's return page, confirms payment and performs order fulfillment:
it records the order, decrements inventory, and removes purchased quantities
from the customer's cart. Webhook fulfillment uses MongoDB transactions, so the
MongoDB deployment must support transactions (for example, a replica set or
MongoDB Atlas).

Orders use INR. This application is not configured to accept real payments;
never supply Stripe live keys.

## Technology

- **Frontend:** React 19, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS
  4, and Stripe.js.
- **Backend:** Node.js ES modules, Express 5, and Mongoose.
- **Data and services:** MongoDB, Redis/Upstash Redis, Cloudinary, and Stripe
  Checkout (test mode).
- **Security and operations:** HTTP-only session cookies, encrypted access and
  refresh tokens, Helmet security headers, credentialed CORS, request IDs,
  structured logging, request rate limits, and health/readiness endpoints.

## Requirements

- A supported Node.js release and npm.
- MongoDB configured as a standalone development database or a
  transaction-capable replica set for checkout fulfillment.
- Redis (local Redis or a compatible Upstash Redis URL).
- Cloudinary credentials for product image uploads.
- Stripe **test-mode** secret and webhook keys to exercise checkout.

## Local development

Run commands from the repository root.

1. Install dependencies:

   ```sh
   npm install
   npm install --prefix front-end
   ```

2. Create environment files from the examples:

   ```cmd
   copy .env.example .env
   copy front-end\.env.example front-end\.env
   ```

3. Edit `.env` and `front-end/.env` with the local settings described in
   [Environment configuration](#environment-configuration). Replace both JWE
   secret placeholders with distinct, randomly generated secrets of at least
   32 bytes. Do not commit either `.env` file.

4. Start MongoDB and Redis.

5. Start the backend in one terminal:

   ```sh
   npm run dev
   ```

6. Start Vite in a second terminal:

   ```sh
   npm run dev --prefix front-end
   ```

By default, the API listens at `http://localhost:5000` and Vite serves the UI
at `http://localhost:5173`. The frontend's development API URL defaults to
`http://localhost:5000/api`.

## Environment configuration

The backend loads `.env` from the repository root. The frontend loads
`front-end/.env`; `VITE_*` values are embedded into the frontend build and must
not contain secrets.

### Backend

| Variable                 | Required | Description                                                                  |
| ------------------------ | -------- | ---------------------------------------------------------------------------- |
| `NODE_ENV`               | No       | `development`, `test`, or `production`; defaults to `development`.           |
| `PORT`                   | No       | HTTP listen port; defaults to `5000`.                                        |
| `CLIENT_URL`             | Yes      | Frontend origin used for CORS and Stripe return URLs.                        |
| `MONGO_URI`              | Yes      | MongoDB connection string.                                                   |
| `UPSTASH_REDIS_URL`      | Yes      | Redis connection string; use `rediss://` for TLS deployments where required. |
| `JWE_SECRET`             | Yes      | Access-token encryption secret, at least 32 bytes.                           |
| `JWE_REFRESH_SECRET`     | Yes      | Distinct refresh-token encryption secret, at least 32 bytes.                 |
| `JWE_ACCESS_EXPIRATION`  | No       | Access-token lifetime such as `15m`; defaults to `15m`.                      |
| `JWE_REFRESH_EXPIRATION` | No       | Refresh-token lifetime such as `7d`; defaults to `7d`.                       |
| `CLOUDINARY_CLOUD_NAME`  | Yes      | Cloudinary account cloud name.                                               |
| `CLOUDINARY_API_KEY`     | Yes      | Cloudinary API key.                                                          |
| `CLOUDINARY_API_SECRET`  | Yes      | Cloudinary API secret.                                                       |
| `STRIPE_SECRET_KEY`      | Yes      | Stripe test secret key beginning with `sk_test_`.                            |
| `STRIPE_WEBHOOK_SECRET`  | Yes      | Webhook signing secret beginning with `whsec_`.                              |

The backend validates required values during startup. The two JWE secrets must
be different, token durations must be positive and no longer than one year, and
Stripe live secret keys are rejected.

### Frontend

| Variable                      | Required | Description                                                                                                                  |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`                | No       | API base URL, normally `http://localhost:5000/api` for local development and `/api` for a same-origin production deployment. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No       | Optional Stripe test publishable key beginning with `pk_test_`.                                                              |

The frontend defaults to `/api` outside development if `VITE_API_URL` is not
set. If the frontend is hosted separately from the backend, set `VITE_API_URL`
to the backend API URL at build time and set backend `CLIENT_URL` to the
frontend's exact origin. Because session cookies use `SameSite=Strict`, separate
hosts should remain same-site (for example, subdomains of the same
registrable domain); a cross-site frontend/API deployment would require a
reviewed cookie policy change.

## Sample products and categories

Run `npm run seed` to add or refresh development sample data. It requires at
least one existing user whose role is `seller`; it does not create demo
accounts.

The seed command:

- Creates managed categories used by the curated sample products when missing.
- Adds locally bundled category artwork and refreshes a category image only if
  it is blank or matches the older seed artwork. Custom category images remain
  unchanged.
- Adds missing sample products for the existing seller.
- Refreshes selected product details and image only when a matched product
  still has its known legacy seed image. It preserves price, stock, and products
  with a different image.
- Does not modify other sellers' products, delete older catalog entries, or
  remove seller-edited products.

Seeding is disabled when `NODE_ENV=production`. The bundled product and
category images are demo assets; replace them with images you have the right to
use before using the storefront commercially.

## API reference

All endpoints use the `/api` prefix. Protected endpoints require the
authenticated session cookies.

### Health

| Method | Path          | Access | Purpose                                                                                   |
| ------ | ------------- | ------ | ----------------------------------------------------------------------------------------- |
| `GET`  | `/api/health` | Public | Process health check.                                                                     |
| `GET`  | `/api/ready`  | Public | Readiness check for MongoDB and Redis; returns `503` if either dependency is unavailable. |

### Authentication

| Method | Path                      | Access         | Purpose                                                        |
| ------ | ------------------------- | -------------- | -------------------------------------------------------------- |
| `POST` | `/api/auth/signup`        | Public         | Register a customer account.                                   |
| `POST` | `/api/auth/login`         | Public         | Sign in.                                                       |
| `POST` | `/api/auth/logout`        | Public/session | Clear session cookies and invalidate the stored refresh token. |
| `POST` | `/api/auth/refresh-token` | Session        | Refresh access credentials.                                    |
| `GET`  | `/api/auth/profile`       | Signed in      | Return the current user profile.                               |

Signup and login have dedicated rate limits; the API also applies a general
rate limit to API routes.

### Products and categories

| Method   | Path                             | Access                 | Purpose                                                                        |
| -------- | -------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `GET`    | `/api/products`                  | Public                 | Browse all products.                                                           |
| `GET`    | `/api/products/search?name=...`  | Public                 | Search product names.                                                          |
| `GET`    | `/api/products/featured`         | Public                 | Browse featured products.                                                      |
| `GET`    | `/api/products/:id`              | Public                 | Read product details.                                                          |
| `GET`    | `/api/products/mine`             | Seller                 | List the signed-in seller's products.                                          |
| `POST`   | `/api/products`                  | Seller or admin        | Create a product.                                                              |
| `PATCH`  | `/api/products/:id`              | Product owner or admin | Update a product.                                                              |
| `PATCH`  | `/api/products/:id/feature`      | Admin                  | Toggle the featured state.                                                     |
| `DELETE` | `/api/products/:id`              | Product owner or admin | Delete a product.                                                              |
| `GET`    | `/api/categories`                | Public                 | List active managed categories and legacy categories in use.                   |
| `GET`    | `/api/categories/products/:slug` | Public                 | Browse products in a category.                                                 |
| `GET`    | `/api/categories/admin`          | Admin                  | List managed and legacy categories for administration.                         |
| `POST`   | `/api/categories`                | Admin                  | Create or reactivate a managed category.                                       |
| `DELETE` | `/api/categories/:id`            | Admin                  | Deactivate an unused category; categories with products cannot be deactivated. |

### Cart and orders

| Method   | Path                   | Access    | Purpose                          |
| -------- | ---------------------- | --------- | -------------------------------- |
| `GET`    | `/api/cart`            | Signed in | Read the signed-in user's cart.  |
| `POST`   | `/api/cart`            | Signed in | Add a product to the cart.       |
| `PUT`    | `/api/cart/:id`        | Signed in | Update a cart item's quantity.   |
| `DELETE` | `/api/cart/:id`        | Signed in | Remove a cart item.              |
| `DELETE` | `/api/cart/clear`      | Signed in | Clear the cart.                  |
| `GET`    | `/api/orders`          | Signed in | List the user's orders.          |
| `GET`    | `/api/orders/:orderId` | Signed in | Read an order owned by the user. |

### Seller applications and payment

| Method  | Path                                      | Access             | Purpose                                                       |
| ------- | ----------------------------------------- | ------------------ | ------------------------------------------------------------- |
| `GET`   | `/api/seller-applications/mine`           | Signed in          | Read the current user's application status.                   |
| `POST`  | `/api/seller-applications`                | Signed-in customer | Submit or resubmit an application when allowed.               |
| `GET`   | `/api/seller-applications`                | Admin              | List pending applications.                                    |
| `PATCH` | `/api/seller-applications/:userId/review` | Admin              | Approve or reject an application.                             |
| `POST`  | `/api/payment/checkout`                   | Signed in          | Create a Stripe test-mode Checkout session.                   |
| `GET`   | `/api/payment/success`                    | Signed in          | Check whether a returned checkout session has been fulfilled. |
| `POST`  | `/api/payment/webhook`                    | Stripe signature   | Process signed Stripe checkout events.                        |

Errors are returned as JSON with an `error` code/message and request ID. Health
responses also include a request ID for support and log correlation.

## Stripe test checkout

1. Configure test-mode Stripe credentials in the backend environment and, if
   desired, a test publishable key in the frontend environment.
2. For local development, install and authenticate the Stripe CLI.
3. Forward Stripe test events to the backend:

   ```sh
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```

4. Copy the signing secret displayed by the CLI into
   `STRIPE_WEBHOOK_SECRET`, then restart the backend.
5. Complete a test checkout and verify the resulting order in the application.

For a future hosted demo, configure a Stripe **test-mode** webhook and point it
to `https://YOUR-DEPLOYED-DOMAIN/api/payment/webhook`. Set the corresponding
webhook signing secret in the backend environment. Do not use production
payment credentials. Do not treat the browser's success redirect as proof of
payment; the application relies on the verified webhook.

## Production deployment checklist

The backend serves `front-end/dist` when `NODE_ENV=production`; build the
frontend before starting the backend:

```sh
npm run build
npm start
```

Before deployment:

- Set `NODE_ENV=production`, the platform-provided `PORT`, and the public
  `CLIENT_URL`.
- Build the frontend with the correct `VITE_API_URL`; use `/api` for the
  same-origin setup.
- Provide production-grade MongoDB and Redis URLs through the host's secret
  manager. MongoDB must support transactions for checkout fulfillment.
- Generate and store distinct JWE secrets securely; never reuse example
  values.
- Configure Cloudinary and Stripe **test-mode** credentials, and register the
  production webhook URL with Stripe.
- Use HTTPS for the storefront and API. Production session cookies are marked
  secure.
- Provision the first administrator using a trusted operational procedure
  before relying on admin-only category and seller-application tools.
- Replace demo products and images with accurate catalog information and
  imagery you are licensed to use.

The Express API allows the origin configured in `CLIENT_URL` and serves the
frontend build from the same service in production. A separate, same-site
frontend host requires the API URL and allowed origin to be configured
consistently. A cross-site deployment also needs a deliberate change to the
strict session-cookie policy and a security review. This repository does not
include a platform-specific deployment manifest or a public admin bootstrap
command.

## Development commands and checks

Run from the repository root unless stated otherwise:

| Command                              | Purpose                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`                        | Start the backend with nodemon.                                           |
| `npm start`                          | Start the backend with Node.js.                                           |
| `npm run dev --prefix front-end`     | Start the Vite frontend.                                                  |
| `npm run seed`                       | Add or refresh development sample products and categories.                |
| `npm run lint`                       | Run frontend ESLint and `node --check` on the backend server entry point. |
| `npm run check:server`               | Syntax-check the backend server entry point.                              |
| `npm run lint --prefix front-end`    | Run frontend ESLint.                                                      |
| `npm run build`                      | Create the production frontend build.                                     |
| `npm run preview --prefix front-end` | Preview the built frontend with Vite.                                     |

There is currently no automated test script or configured GitHub Actions
workflow. The production build may print a Vite advisory when the main
JavaScript chunk exceeds 500 kB; the build can still complete successfully.

## Repository layout

```text
back-end/
  config/       Environment and Cloudinary configuration
  controllers/  HTTP request handlers
  lib/          MongoDB, Redis, Stripe, and logging integrations
  middleware/   Authentication, authorization, request IDs, and errors
  models/       Mongoose data models
  route/        Express API route definitions
  services/     Cart, checkout, fulfillment, and image workflows
  utils/        Category, session, and token helpers
  seedProducts.js
  server.js
front-end/
  public/       Static files and bundled category artwork
  src/
    components/
    config/
    lib/
    pages/
    store/
```

## Important operational notes

- Never commit `.env` files, API secrets, database credentials, Stripe
  credentials, or session tokens.
- Never configure Stripe live keys; live payment processing is not implemented.
- Seed data is for local/demo use only and is deliberately disabled in
  production.
- The contact page is informational only until a support channel is configured.
- Review access controls, payment configuration, data retention, privacy
  disclosures, and legal requirements before offering the application as a
  public production store.
