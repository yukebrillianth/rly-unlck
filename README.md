<div align="center">
  
<img src="./assets/images/logo-color.svg" width="200px" alt="Rallly" />

# 🚀 Rallly Self-Hosted (Unlocked Edition)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-orange.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

**⚡ Fully Unlocked • 🔓 No License Required • ♾️ Unlimited Users**

</div>

---

## ✨ What is This?

This is a **self-hosted fork of [Rallly](https://github.com/lukevella/rallly)** — the beautiful, open-source meeting scheduling tool — with **licensing restrictions removed** for personal and internal use.

### 🎯 Key Features of This Fork

- **🔓 No License Validation** — Bypass all licensing checks and run Enterprise features for free
- **♾️ Unlimited Seats** — Set user limits via `.env` (default: 999 users)
- **🛠️ Fully Configurable** — Control license tiers, seat counts, and behavior without API calls
- **🐳 Docker-Ready** — Simplified `docker-compose` setup with MinIO and PostgreSQL
- **🎨 Zero Modifications to UI** — Looks and behaves exactly like official Rallly
- **📦 Standalone Build** — Next.js standalone output for minimal container footprint

> **⚠️ Important:** This fork is intended for **personal, educational, or internal use only**. If you're running a commercial deployment or want to support the original creator, please purchase an official license from [rallly.co](https://rallly.co).

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [pnpm](https://pnpm.io/installation) (for local development)

### 1. Clone & Configure

```bash
git clone <your-fork-url>
cd rallly
cp .env.example .env
```

Edit `.env` with your deployment details:

```bash
# Required
SECRET_PASSWORD=<generate-with-openssl-rand-base64-32>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXT_PUBLIC_BASE_URL=https://meeting.your-domain.example.com

# Database (pre-configured for docker-compose)
DATABASE_URL=postgres://postgres:postgres@rallly_db:5432/rallly

# S3 Storage (MinIO)
S3_ENDPOINT=https://files.your-domain.example.com
S3_BUCKET_NAME=rallly
S3_ACCESS_KEY_ID=<your-minio-access-key>
S3_SECRET_ACCESS_KEY=<your-minio-secret>

# SMTP (for email notifications)
SMTP_HOST=smtp.example.com
SMTP_USER=noreply@example.com
SMTP_PWD=<your-smtp-password>

# License Override (🔥 the magic sauce)
SELF_HOSTED_DEFAULT_SEATS=999          # Default seat count without license
SELF_HOSTED_LICENSE_TYPE=ENTERPRISE    # PLUS | ORGANIZATION | ENTERPRISE
SELF_HOSTED_LICENSE_SEATS=999          # Explicit seat count
SELF_HOSTED_MAX_SEATS=999              # Hard cap for seat calculations
```

### 2. Build & Deploy

```bash
# Build the Docker image
docker-compose build

# Start all services (app, database, MinIO)
docker-compose up -d

# Check logs
docker-compose logs -f rallly_selfhosted
```

Your instance will be available at `http://localhost:3333` (or your configured domain).

---

## 🔧 How the License Bypass Works

This fork modifies several key files to eliminate license validation:

### Modified Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/api/licensing/v1/[...route]/route.ts` | Returns fake `ENTERPRISE` license for all API calls |
| `apps/web/src/features/licensing/data.ts` | Mocks `getInstanceLicense()` using env vars instead of database |
| `apps/web/src/features/space/utils.ts` | Reads seat limits from `SELF_HOSTED_*` environment variables |
| `apps/web/src/env.ts` | Adds `SELF_HOSTED_DEFAULT_SEATS` validation |
| `.env.example` | Template with licensing overrides documented |

### Environment Variables

```bash
# Control license behavior without database tables
SELF_HOSTED_DEFAULT_SEATS=50         # Base seat count (default: 1)
SELF_HOSTED_MAX_SEATS=999            # Maximum allowed seats (default: 999)
SELF_HOSTED_LICENSE_SEATS=999        # Explicit seat count for spaces
SELF_HOSTED_LICENSE_TYPE=ENTERPRISE  # License tier: PLUS | ORGANIZATION | ENTERPRISE
```

**How it Works:**
- The licensing API (`/api/licensing/v1`) always returns a valid `ENTERPRISE` license with 999 seats
- `getInstanceLicense()` reads from env vars instead of querying the `instance_licenses` table
- Seat calculations respect `SELF_HOSTED_LICENSE_SEATS`, capped by `SELF_HOSTED_MAX_SEATS`
- No external API calls or validation checks are performed

---

## 📦 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start the full stack
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Manual Docker Build

```bash
# Build the image
docker build -f Dockerfile.selfhost -t rallly-unlocked .

# Run with custom environment
docker run -d \
  -p 3333:3333 \
  --env-file .env \
  --name rallly \
  rallly-unlocked
```

---

## 🌐 Production Setup

### Nginx Configuration

Sample configs are provided in:
- `example.conf` — Reverse proxy for meeting app + MinIO/S3
- `nginx-example.conf` — Alternative unified config

Key requirements:
- HTTPS termination (via Let's Encrypt/Cloudflare)
- Proxy `meeting.your-domain.com` → `localhost:3333`
- Proxy `files.your-domain.com` → MinIO at `localhost:9000`
- CORS headers for avatar uploads

See [`example.conf`](./example.conf) for a complete setup.

### MinIO CORS Policy

Apply CORS rules to the `rallly` bucket:

```bash
mc alias set local http://localhost:9000 <access-key> <secret-key>
mc anonymous set-json cors.json local/rallly
```

Edit [`cors.json`](./cors.json) with your domain before applying.

---

## 🛠️ Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_PASSWORD` | Encryption key (≥32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `openssl rand -base64 32` |
| `NEXT_PUBLIC_BASE_URL` | Public app URL | `https://meeting.example.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/rallly` |
| `S3_ENDPOINT` | MinIO/S3 endpoint | `https://files.example.com` |
| `S3_BUCKET_NAME` | Storage bucket name | `rallly` |
| `SMTP_HOST` | Mail server host | `smtp.gmail.com` |

### License Override Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SELF_HOSTED_DEFAULT_SEATS` | `1` | Base seat count without license |
| `SELF_HOSTED_MAX_SEATS` | `999` | Maximum seat limit cap |
| `SELF_HOSTED_LICENSE_SEATS` | `999` | Explicit seat count override |
| `SELF_HOSTED_LICENSE_TYPE` | `ENTERPRISE` | License tier (`PLUS`\|`ORGANIZATION`\|`ENTERPRISE`) |

See [`.env.example`](./.env.example) for the complete list.

---

## 🔥 What's Different from Upstream?

| Feature | Upstream Rallly | This Fork |
|---------|----------------|-----------|
| License Validation | ✅ Required for multi-user | ❌ Disabled (always returns fake Enterprise key) |
| User Limits | 🔒 Enforced by license tier | ♾️ Configurable via `.env` (default: 999) |
| Billing Integration | ✅ Stripe-based | ❌ Removed (self-hosted only) |
| Seat Management | 🔒 License-based caps | 🛠️ Environment variable overrides |
| Database Migrations | ✅ Includes `instance_licenses` table | ⚠️ Mocked (no DB table required) |
| Official Support | ✅ Supported | ❌ Community/fork only |

---

## 📚 Documentation

- **[Self-Hosted Setup Guide](./SELF_HOSTED_SEATS.md)** — Deep dive into licensing override mechanism
- **[Configuration Options](./.env.example)** — All environment variables explained
- **[CORS Setup](./cors.json)** — MinIO bucket policy for avatar uploads
- **[Nginx Examples](./example.conf)** — Production reverse proxy configs
- **[Official Rallly Docs](https://support.rallly.co/self-hosting)** — Original self-hosting guide (some sections may not apply to this fork)

---

## 🤝 Contributing

This fork maintains compatibility with the upstream Rallly codebase. If you'd like to contribute:

1. **For licensing/self-hosting improvements** → Submit PRs here
2. **For core Rallly features** → Contribute to [lukevella/rallly](https://github.com/lukevella/rallly)

### Development Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start development database
pnpm docker:up

# Run migrations
pnpm db:reset

# Start dev server
pnpm dev
```

Visit `http://localhost:3000` to see your changes.

---

## ⚖️ License & Legal

This project is licensed under **AGPLv3**, inherited from the original Rallly project.

### ⚠️ Important Disclaimers

1. **This is a fork** — Not affiliated with or endorsed by [Rallly](https://rallly.co) or Luke Vella
2. **Commercial Use** — If you're using this for commercial purposes, please [purchase an official license](https://rallly.co/buy-license) to support the original developer
3. **No Warranty** — Provided as-is for educational/personal use
4. **Support** — This fork is community-maintained; official Rallly support does not apply

**Support the Original Project:** If you benefit from Rallly, consider sponsoring [lukevella](https://github.com/sponsors/lukevella) or purchasing an official license at [rallly.co](https://rallly.co).

---

## 🙏 Credits

- **Original Rallly** by [Luke Vella](https://github.com/lukevella) — [rallly.co](https://rallly.co)
- Built with [Next.js](https://nextjs.org), [Prisma](https://prisma.io), [tRPC](https://trpc.io), [TailwindCSS](https://tailwindcss.com)
- This unlocked fork maintains all upstream features while removing licensing restrictions for self-hosted deployments

---

<div align="center">

**⭐ Star this repo if it helped you!**

Made with ❤️ for the self-hosting community

</div>

![Screenshot](https://github.com/user-attachments/assets/baafea52-c4da-43bb-96ef-50840f1c0c03)

Schedule group meetings with friends, colleagues and teams. Create meeting polls to find the best date and time to organize an event based on your participants' availability. Save time and avoid back-and-forth emails.

Built with [Next.js](https://github.com/vercel/next.js/), [Prisma](https://github.com/prisma/prisma), [tRPC](https://github.com/trpc/trpc) & [TailwindCSS](https://github.com/tailwindlabs/tailwindcss)

## Self-hosting

Check out the [self-hosting docs](https://support.rallly.co/self-hosting) for more information on running your own instance of Rallly.

## Local Installation

The following instructions are for running the project locally for development.

1. Clone the repository and switch to the project directory

   ```bash
   git clone https://github.com/lukevella/rallly.git
   cd rallly
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Setup environment variables

   Create a `.env` file by copying `.env.development`. This will be were you can set your [configuration options](https://support.rallly.co/self-hosting/configuration-options).

   ```bash
   cp .env.development .env
   ```

   **Note:** `.env.development` is preconfigured with default values for development. You can leave these as is for local development.

4. Generate Prisma client

   ```bash
   pnpm db:generate
   ```

5. Setup database

   You will need to have [Docker](https://docs.docker.com/get-docker/) installed and running to run the database using the provided docker-compose file.

   To start the database, run:

   ```bash
   pnpm docker:up
   ```

   Next run the following command to setup the database:

   ```bash
   pnpm db:reset
   ```

   This will:

   - delete the existing database (if it exists)
   - run migrations to create a new database schema
   - seed the database with test users and random data

6. Start the Next.js server

   ```bash
   pnpm dev
   ```

## Contributors

Please read our [contributing guide](CONTRIBUTING.md) to learn about how to contribute to this project.

### Translators 🌐

You can help translate Rallly to another language by following our [guide for translators](https://support.rallly.co/contribute/translations).

## License

Rallly is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. See [LICENSE](LICENSE) for more detail.

## Sponsors

Thank you to our sponsors for making this project possible.

<a href="https://github.com/coderabbitai" target="_blank"><img src="https://avatars.githubusercontent.com/u/132028505?s=200&v=4" width="48" height="48" /></a>&nbsp;
<a href="https://github.com/cpnielsen" target="_blank"><img src="https://avatars.githubusercontent.com/u/1258576?v=4" width="48" height="48" /></a>&nbsp;
<a href="https://github.com/iamericfletcher" target="_blank"><img src="https://avatars.githubusercontent.com/u/64165327?v=4" width="48" height="48" /></a>&nbsp;
<a href="https://github.com/arcticFox-git" target="_blank"><img src="https://avatars.githubusercontent.com/u/86988982?v=4" width="48" height="48" /></a>&nbsp;
<a href="https://github.com/zakwear" target="_blank"><img src="https://avatars.githubusercontent.com/u/55545774?v=4" width="48" height="48" /></a>&nbsp;
<a href="https://github.com/jonnymarshall" target="_blank"><img src="https://avatars.githubusercontent.com/u/42963069?v=4" width="48" height="48" /></a>&nbsp;
<a href="https://github.com/maximelouet" target="_blank"><img src="https://avatars.githubusercontent.com/u/8074940?v=4" width="48" height="48" /></a>&nbsp;

[Become a sponsor &rarr;](https://github.com/sponsors/lukevella)

And thank you to these companies for sponsoring and showing support for this project.

<p>
<a href="https://appwrite.io?utm_source=rallly"><img src="./assets/images/appwrite.svg" alt="appwrite" height="24" /></a>&nbsp;&nbsp;&nbsp;<!--
--><a href="https://vercel.com/?utm_source=rallly&utm_campaign=oss"><img src="./assets/images/vercel-logotype-dark.svg#gh-light-mode-only" alt="Powered by Vercel" height="24" /></a>&nbsp;&nbsp;&nbsp;<!--
--><a href="https://ura.design?utm_source=rallly"><img height="24" alt="Ura Design" src="./assets/images/ura-logo-blue.svg"></a>
</p>
<p>
<a href="https://m.do.co/c/f91efc9c9e50"><img src="./assets/images/digitalocean-logo.svg" alt="Digital Ocean" height="24" /></a>&nbsp;&nbsp;&nbsp;<!--
--><a href="https://sentry.io?utm_source=rallly"><img src="./assets/images/sentry.svg" alt="Sentry" height="24" /></a>&nbsp;&nbsp;&nbsp;<!--
--><a href="https://cloudron.io?utm_source=rallly"><img src="./assets/images/cloudron-logo.svg" alt="Cloudron" height="30"></a>&nbsp;&nbsp;&nbsp;<!--
--><a href="https://featurebase.app?utm_source=rallly"><img src="./assets/images/featurebase.svg" alt="Featurebase" height="28"></a>
</p>
