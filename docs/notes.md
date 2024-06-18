# NOTES

The purpose of these notes is to track the different steps taken to accomplish this webauthn POC. Following along with [Ian Mitchell's Blog Post on webauthn](https://ianmitchell.dev/blog/nextjs-and-webauthn).

## Setup Nextjs application

See [Nextjs get started docs](https://nextjs.org/docs/getting-started/installation)

```bash
pnpm create-next-app@latest
```

## Setup Prisma with SQLite DB

See [Prisma Quickstart for Prisma + SQLite](https://www.prisma.io/docs/getting-started/quickstart)

Prisma is an easy to use and popular ORM. This is coupled with SQLite, which reduces the need for setting up any docker compose files for other dbs.

```bash
# Format prisma schema file with the following
pnpx prisma format
```
