# Vistyle

Vistyle is a MERN storefront with customer accounts, a product catalog, seller
product listings, administrator catalog management, and Stripe Checkout in
test mode. It does not process real payments.

## Requirements

- Node.js and npm
- MongoDB
- Redis
- Cloudinary credentials for product image uploads
- Stripe test-mode secret and webhook keys to use checkout

## Local setup

1. Install root/backend dependencies and frontend dependencies:

   ```sh
   npm install
   npm install --prefix front-end
   ```

2. Copy `.env.example` to `.env` and configure the values below. Replace both
   JWE placeholders with distinct random secrets at least 32 bytes long.
3. Copy `front-end/.env.example` to `front-end/.env`. The default API URL is
   suitable for the local backend.
4. Start MongoDB and Redis locally, then start the backend:

   ```sh
   npm run dev
   ```

5. In another terminal, start the frontend:

   ```sh
   npm run dev --prefix front-end
   ```

The backend listens on `PORT` (default `5000`); Vite normally serves the
frontend at `http://localhost:5173`.

## Environment variables

The backend reads `.env` from the repository root:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | Backend HTTP port |
| `CLIENT_URL` | Allowed frontend origin and checkout return URL |
| `MONGO_URI` | MongoDB connection URL |
| `UPSTASH_REDIS_URL` | Redis connection URL (a local `redis://` URL works for development) |
| `JWE_SECRET` | Access-token encryption secret, at least 32 bytes |
| `JWE_REFRESH_SECRET` | Distinct refresh-token encryption secret, at least 32 bytes |
| `JWE_ACCESS_EXPIRATION` | Access-token lifetime, e.g. `15m` |
| `JWE_REFRESH_EXPIRATION` | Refresh-token lifetime, e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe test-mode secret key; must start with `sk_test_` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret; must start with `whsec_` |

The frontend reads `front-end/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional Stripe test-mode publishable key; if set, must start with `pk_test_` |

Never use Stripe live keys. The application rejects live Stripe keys and keeps
the Stripe secret key on the backend.

## Available commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the backend with nodemon |
| `npm start` | Start the backend without nodemon |
| `npm run seed` | Add or refresh curated sample products for an existing seller |
| `npm run lint` | Run frontend ESLint and check backend server syntax |
| `npm run check:server` | Check backend server syntax |
| `npm run build` | Build the frontend for production |
| `npm run dev --prefix front-end` | Start the Vite frontend |
| `npm run lint --prefix front-end` | Run frontend ESLint |

## Sample catalog data

`npm run seed` requires an existing seller account. It adds missing curated
sample products for that seller, matched by product name and seller ID. For
matching products that still use the known legacy image for that sample, it
refreshes the sample name, description, category, and image fields. It leaves
price and stock unchanged. Products with a different image are treated as
seller-edited and left unchanged. Seeding does not create demo user accounts,
modify other sellers' products, or delete products. Older sample products that
are no longer in the curated seed list are also left in place so existing
orders and catalog data are not removed automatically. The sample products in
`back-end/seedProducts.js` are catalog demo data, not a source of real inventory
or product claims.

Seeding is disabled when `NODE_ENV=production`.

## Stripe test checkout and local webhook

Checkout uses Stripe test mode only. **Demo payment — no real money will be
charged.** Checkout amounts are calculated by the backend; order creation and
inventory changes occur only after the backend verifies the Stripe webhook.
The browser's success redirect alone does not confirm payment.

For local webhook development, run the Stripe CLI in test mode and forward
events to the implemented webhook endpoint:

```sh
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Use the signing secret printed by the CLI as `STRIPE_WEBHOOK_SECRET` in your
local backend `.env`, restart the backend, and perform a test-mode checkout.
Keep the signing secret private. Never use live-mode credentials or a live
webhook.

## Quality checks and limitations

Run `npm run lint` and `npm run build` from the repository root. There is no
configured test script or existing automated test suite in this repository.
There is also no GitHub Actions workflow configured.
