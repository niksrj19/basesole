

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`




Shoes application architecture and Techstack 



The main shape is clear: a React SPA served by an Express/ Vite hybrid, with hash-based view routing and Prisma’s PostgreSQL schema behind `/api`. I’m checking the API, auth, persistence, and client context layers now so the summary distinguishes implemented architecture from dependency leftovers or static demo data.


The client has a deliberate guest-to-account cart transition: guests use `localStorage`, authenticated users use the API-backed Prisma cart, and auth refreshes JWTs transparently.


The final picture is a monolithic full-stack TypeScript app: one Node process owns both the API and SPA delivery, Prisma is the persistence adapter, and the UI is componentized by commerce workflow rather than a router library. I’m checking compiler settings and whether the declared Gemini capability is wired into code before I close out the stack inventory.

## Architecture

SoleVault is a monolithic full-stack TypeScript ecommerce application.

- **Frontend:** React SPA mounted from `main.tsx`, with workflow components for catalog, product details, cart, checkout, orders, profiles, and admin management.

- **Client routing:** Custom URL-hash routing in `App.tsx`, not React Router. Views include `home`, `catalog`, `pdp`, `checkout`, `orders`, `profile`, `login`, and admin views.
- **State management:** React Context providers:
  - Authentication: `AuthContext.tsx`
  - Cart: `CartContext.tsx`
  - Language: `LanguageContext.tsx`
- **Backend:** Express REST API defined in `routes.ts`.
- **Runtime/server entry:** `server.ts` runs Express and embeds Vite middleware during development. In production it serves the compiled `dist` frontend.
- **Persistence:** Prisma ORM with PostgreSQL, configured in `schema.prisma` and accessed through `db.ts`.
- **Seed data:** `seed.ts` loads users, products, categories, brands, orders, payments, and settings from `store.json`.

## Main Data Flow

```text
React UI
  -> Context providers
  -> /api REST endpoints
  -> Express routes
  -> Store data-access layer
  -> Prisma Client
  -> PostgreSQL
```

Guests keep their cart in `localStorage`. After authentication, the cart is migrated into the database-backed cart.

## Authentication

- Google OAuth 2.0 support.
- Direct Gmail-based login helper.
- Admin email/password login from environment variables.
- JWT access and refresh tokens.
- Refresh tokens are persisted in PostgreSQL.
- Authorization middleware supports customer and admin roles.

Authentication logic is in `auth.ts` and `AuthContext.tsx`.

## API Areas

The API currently covers:

- Authentication and token refresh
- Products, categories, brands, and filtering
- User carts
- User profiles and addresses
- Orders and payment confirmation
- QR/UPI payment settings
- Admin metrics, users, products, orders, and payment settings

## Tech Stack

- TypeScript
- React 19
- React DOM
- Vite 6
- Express 4
- Prisma 5
- PostgreSQL
- Tailwind CSS 4 with `@tailwindcss/vite`
- JWT via `jsonwebtoken`
- Google OAuth 2.0
- `qrcode` for QR payment support
- Lucide React icons
- `tsx` for TypeScript execution
- esbuild for production server bundling
- Motion is declared as a dependency, but no active usage was found
- Gemini is declared in `package.json` and mentioned in `README.md`, but no application code currently imports or uses it

Compiler and module settings are defined in `tsconfig.json`.