# Running the jukebox with Docker (self-hosted backend)

Everything runs in Docker Compose: the built frontend behind nginx, plus a full
self-hosted Supabase stack (Postgres, auth, REST, realtime, storage, edge
functions, Studio) behind a Kong gateway.

## 1. Configure

```sh
cp .env.docker.example .env.docker
openssl rand -hex 32   # -> JWT_SECRET
openssl rand -hex 32   # -> REALTIME_SECRET_KEY_BASE
```

Generate the `anon` and `service_role` JWTs signed with your `JWT_SECRET`
(see the link in `.env.docker.example`) and paste them in, along with your
Spotify client ID/secret.

## 2. Start

```sh
docker compose --env-file .env.docker up -d --build
```

| Service        | URL                     |
| -------------- | ----------------------- |
| Jukebox app    | http://localhost:3000   |
| Supabase API   | http://localhost:8000   |
| Supabase Studio| http://localhost:54323  |
| Postgres       | localhost:5432          |

The `migrate` one-shot container applies everything in `supabase/migrations`
in filename order and records applied versions in
`supabase_migrations.schema_migrations`, so restarts are idempotent.

Edge functions are served from `supabase/functions` at
`http://localhost:8000/functions/v1/<name>` (e.g. `.../functions/v1/spotify`).

## 3. Useful commands

```sh
docker compose --env-file .env.docker logs -f functions   # function logs
docker compose --env-file .env.docker run --rm migrate    # re-run migrations
docker compose --env-file .env.docker down                # stop
docker compose --env-file .env.docker down -v             # stop + wipe data
```

## Notes

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are baked in at image
  build time, so change `PUBLIC_SUPABASE_URL` or `SUPABASE_ANON_KEY` and
  rebuild with `--build`.
- Set the Spotify redirect URI in your Spotify dashboard to
  `http://localhost:3000/host` (or your deployed origin + `/host`).
- `SUPABASE_SERVICE_ROLE_KEY` is server-only; never expose it to the frontend.
- Behind a reverse proxy, terminate TLS in front of ports 3000 and 8000 and set
  `PUBLIC_SUPABASE_URL`/`SITE_URL` to the https URLs.
