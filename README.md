
  # BloomFigmaApp

  This is a code bundle for BloomFigmaApp. The original project is available at https://www.figma.com/design/nGYB8tzv74ecEZP7oG0bHI/BloomFigmaApp.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Sync API and Databases

  The app now includes a Next.js sync endpoint at `/api/sync`.

  Required environment variables:

  - `DATABASE_URL` (or `POSTGRES_URL`): PostgreSQL connection string
  - `PGSSL=true` (optional): enable TLS for hosted Postgres

  Offline mode:

  - The mobile/web client stores pending sync operations in local SQLite (using `sql.js`) inside browser storage.
  - When connectivity returns, pending operations are sent to `/api/sync` and deleted from local SQLite if successful.

  Remote mode:

  - `/api/sync` maps operations to PostgreSQL tables:
    - `bloom_habits`
    - `bloom_habit_history`
  - Tables/indexes are created automatically on first call.
  