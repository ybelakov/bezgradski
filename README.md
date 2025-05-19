# Bez Gradski

A modern web application built with the T3 Stack, featuring Next.js, tRPC, Prisma, NextAuth.js, and Tailwind CSS.

## Demo

Watch our demo video to see the application in action:
https://www.loom.com/share/f99bbe6a5a2240ee8a6dc14a03af1a33

[![Bez Gradski Demo](https://cdn.loom.com/sessions/thumbnails/f99bbe6a5a2240ee8a6dc14a03af1a33-with-play.gif)](https://www.loom.com/share/f99bbe6a5a2240ee8a6dc14a03af1a33)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) (Run `npm install -g pnpm` to install)
- [Docker](https://www.docker.com/) (for local database)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bez-gradski.git
cd bez-gradski
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database URL for PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/bez-gradski"

# Next Auth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Add any other required environment variables here
```

### 4. Start the database

We provide a script to easily start a PostgreSQL database in Docker:

```bash
chmod +x start-database.sh  # Make the script executable
./start-database.sh
```

This script will:

- Check for Docker/Podman installation
- Verify port availability
- Start a PostgreSQL container
- Generate a secure password if you're using the default
- Update your .env file with the new database credentials

### 5. Database migrations

Run the database migrations to set up your database schema:

```bash
pnpm prisma db push  # For development
# or
pnpm prisma migrate deploy  # For production
```

### 6. Start the development server

```bash
pnpm dev
```

Your application should now be running at [http://localhost:3000](http://localhost:3000)

## Development

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Prisma](https://prisma.io) - Database ORM
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [PostgreSQL](https://www.postgresql.org/) - Database

## Deployment

This application can be deployed on various platforms:

- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Netlify](https://create.t3.gg/en/deployment/netlify)
- [Docker](https://create.t3.gg/en/deployment/docker)

For detailed deployment instructions, follow the links above.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
