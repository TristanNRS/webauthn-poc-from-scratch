# NOTES

The purpose of these notes is to track the different steps taken to accomplish this webauthn POC. Following along with [Ian Mitchell's Blog Post on webauthn](https://ianmitchell.dev/blog/nextjs-and-webauthn).

Overal goals:

- Registration flow
- Login flow
- Logout flow
- Maintain session
- Decent UX of authentication flows
- Basic implementation that can work in prod (no bug where users are created everytime register button is created. See [blog post](https://ianmitchell.dev/blog/nextjs-and-webauthn#:~:text=%E2%84%B9%EF%B8%8F-,This%20code%20has%20a%20bug,-!))

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

## Setup Register flow

19/06/2024

- Add simple register form UI that calls a server action on submit
- This server action generates a challenge and goes through the webauthn steps to generate credentials and verify. This needs to be updated as it all happens on the server vs going back and forth between client and server. Need to verify the behaviour here wrt how server/client is defined in spec and how this part should work
- Once registered, a user is created and session is saved using iron session
- User should redirect to admin page once registered

21/06/2024

- Updated registration flow to create challenge and credentials on client before sending to server to verify
  - Created register API route on server for verifying credentials
- Updated prisma schema to allow cascading deletes for Credentials/Users for easier management of User data via prisma studio. This allows for easier reset when testing
- Tested flow
  - Add username/email
  - Click register
  - Authenticate using chosen authenticator (I used the laptop chrome biometrics)
  - Verify cookie is set and data in db is set
- To reset flow

  - Delete cookie
  - Clear data using prisma studio (env-cmd --file ./env.local pnpx prisma studio)

- Added useSession hook which allows client components to access the session. This utilizes an API endpoint that returns the session. See [Iron Session example code for protected client component](https://github.com/vvo/iron-session/blob/main/examples/next/src/app/app-router-client-component-route-handler-swr/protected-client/page.tsx#L28)
- Ensure that if already logged in, navigation to the register page takes you to /admin
- Added session usage to admin page

22/06/2024

- Added login page
- See [Manage chrome passkeys](https://support.google.com/chrome/answer/13168025?hl=en&co=GENIE.Platform%3DDesktop#zippy=%2Cmanage-passkeys-in-macos) for managing existing passkeys

- TODO: Look into bug with retrieving session. After registering a new passkey, user is not redirected to admin page as expected but redirected to / as if session is not set yet for newly registered user/passkey
  - Resolved this by taking a closer look at [Iron Session eg. for accessing session in client component](https://github.com/vvo/iron-session/blob/main/examples/next/src/app/app-router-client-component-route-handler-swr/use-session.ts#L40). Had some inconsistencies between what I implemented and what was done in the example that seemed to cause all the weird behaviours. Spent 3+ hours trying to determine the fix here by trying all kinds of things eg. changing server components to client components, using debugger etc.
- Good things to note:
  - Got passkeys working with login/register/logout flows for both chrome profile and device (iphone) authenticators
  - Issues faced with sessions does not reflect webauthn related issues and can be solved by another session management library all the same
- Problems to fix:
  - `page.tsx:36 publicKey.pubKeyCredParams is missing at least one of the default algorithm identifiers: ES256 and RS256. This can result in registration failures on incompatible authenticators. See https://chromium.googlesource.com/chromium/src/+/main/content/browser/webauth/pub_key_cred_params.md for details`
    - This shows up due to some configuration issue for authn
  - fix bug noted in tutorial being followed
