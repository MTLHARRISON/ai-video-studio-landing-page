#!/bin/sh
# Applies supabase/migrations/*.sql in filename order, tracking what already ran.
set -e

PSQL="psql -v ON_ERROR_STOP=1 -h db -U postgres -d ${POSTGRES_DB:-postgres}"

echo "waiting for database..."
until pg_isready -h db -U postgres >/dev/null 2>&1; do sleep 1; done

$PSQL -c "CREATE SCHEMA IF NOT EXISTS supabase_migrations;
          CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());"

for file in $(ls /migrations/*.sql | sort); do
  version=$(basename "$file" .sql)
  applied=$($PSQL -tAc "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '$version'")
  if [ "$applied" = "1" ]; then
    echo "skip    $version"
    continue
  fi
  echo "apply   $version"
  $PSQL -f "$file"
  $PSQL -c "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('$version')"
done

echo "migrations complete"
