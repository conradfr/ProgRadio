<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251202100528 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql(<<<'SQL'
            -- v01
            
            CREATE SCHEMA IF NOT EXISTS public;
        SQL);

        $this->addSql(<<<'SQL'
            DO
            $$
                BEGIN
                    IF NOT EXISTS(SELECT 1
                                  FROM pg_type
                                  WHERE typname = 'oban_job_state'
                                    AND typnamespace = 'public'::regnamespace::oid) THEN
                        CREATE TYPE public.oban_job_state AS ENUM (
                            'available',
                            'scheduled',
                            'executing',
                            'retryable',
                            'completed',
                            'discarded'
                            );
                    END IF;
                END
            $$;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE IF NOT EXISTS public.oban_jobs
            (
                id           BIGSERIAL PRIMARY KEY,
                state        public.oban_job_state     NOT NULL DEFAULT 'available',
                queue        TEXT                        NOT NULL DEFAULT 'default',
                worker       TEXT                        NOT NULL,
                args         JSONB                       NOT NULL,
                errors       JSONB[]                     NOT NULL DEFAULT ARRAY []::JSONB[],
                attempt      INTEGER                     NOT NULL DEFAULT 0,
                max_attempts INTEGER                     NOT NULL DEFAULT 20,
                inserted_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC', NOW()),
                scheduled_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC', NOW()),
                attempted_at TIMESTAMP WITHOUT TIME ZONE,
                completed_at TIMESTAMP WITHOUT TIME ZONE
            );
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_queue_index ON public.oban_jobs (queue);
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_state_index ON public.oban_jobs (state);
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_scheduled_at_index ON public.oban_jobs (scheduled_at);
        SQL);

        $this->addSql(<<<'SQL'
            CREATE OR REPLACE FUNCTION public.oban_jobs_notify() RETURNS trigger AS
            $$
            DECLARE
                channel text;
                notice  json;
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                    channel = 'public.oban_insert';
                    notice = JSON_BUILD_OBJECT('queue', NEW.queue, 'state', NEW.state);
                    -- No point triggering for a job that isn't scheduled to run now
                    IF NEW.scheduled_at IS NOT NULL AND NEW.scheduled_at > NOW() AT TIME ZONE 'utc' THEN
                        RETURN NULL;
                    END IF;
                ELSE
                    channel = 'public.oban_update';
                    notice = JSON_BUILD_OBJECT('queue', NEW.queue, 'new_state', NEW.state, 'old_state',
                                               OLD.state);
                END IF;
                PERFORM pg_notify(channel, notice::text);
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        SQL);

        $this->addSql(<<<'SQL'
            DROP TRIGGER IF EXISTS oban_notify ON public.oban_jobs;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TRIGGER oban_notify
                AFTER INSERT OR UPDATE OF state
                ON public.oban_jobs
                FOR EACH ROW
            EXECUTE PROCEDURE public.oban_jobs_notify();
        SQL);

        $this->addSql(<<<'SQL'
            -- v02
            DROP INDEX IF EXISTS public.oban_jobs_scheduled_at_index;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_scheduled_at_index ON public.oban_jobs (scheduled_at)
                WHERE state IN ('available'::public.oban_job_state, 'scheduled'::public.oban_job_state);
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE public.oban_jobs
                ADD CONSTRAINT queue_length CHECK (((CHAR_LENGTH(queue) > 0) AND (CHAR_LENGTH(queue) < 128))),
                ADD CONSTRAINT worker_length CHECK (((CHAR_LENGTH(worker) > 0) AND (CHAR_LENGTH(worker) < 128)));
        SQL);

        $this->addSql(<<<'SQL'
            CREATE OR REPLACE FUNCTION public.oban_wrap_id(value bigint) RETURNS int AS
            $$
            BEGIN
                RETURN (CASE WHEN value > 2147483647 THEN MOD(value, 2147483647) ELSE value END)::int;
            END;
            $$ LANGUAGE plpgsql IMMUTABLE;
        SQL);

        $this->addSql(<<<'SQL'
            -- v03
            ALTER TABLE public.oban_jobs
                ADD COLUMN IF NOT EXISTS attempted_by text[];
        SQL);

        $this->addSql(<<<'SQL'
            -- v04
            DROP FUNCTION IF EXISTS public.oban_wrap_id(VALUE bigint);
        SQL);

        $this->addSql('DROP INDEX IF EXISTS public.oban_jobs_queue_index;');

        $this->addSql(<<<'SQL'
            DROP INDEX IF EXISTS public.oban_jobs_state_index;
        SQL);

        $this->addSql(<<<'SQL'
            DROP INDEX IF EXISTS public.oban_jobs_scheduled_at_index;
        SQL);

        $this->addSql(<<<'SQL'
            -- v06
            -- This used to modify oban_beats, which aren't included anymore
            CREATE INDEX IF NOT EXISTS oban_jobs_queue_state_scheduled_at_id_index
                ON public.oban_jobs (queue, state, scheduled_at, id);
        SQL);

        $this->addSql(<<<'SQL'
            -- v07
            CREATE INDEX IF NOT EXISTS oban_jobs_attempted_at_id_index
                ON public.oban_jobs (attempted_at DESC, id)
                WHERE state IN ('completed', 'discarded');
        SQL);

        $this->addSql(<<<'SQL'
            -- v08
            ALTER TABLE public.oban_jobs
                ADD COLUMN IF NOT EXISTS discarded_at timestamp WITHOUT TIME ZONE,
                ADD COLUMN IF NOT EXISTS priority     integer DEFAULT 0,
                ADD COLUMN IF NOT EXISTS tags         character varying(255)[] DEFAULT ARRAY[]::character varying[];
        SQL);

        $this->addSql(<<<'SQL'
            DROP INDEX IF EXISTS public.oban_jobs_queue_state_scheduled_at_id_index;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_state_queue_priority_scheduled_at_id_index
                ON public.oban_jobs (state, queue, priority, scheduled_at, id);
        SQL);

        $this->addSql(<<<'SQL'
            CREATE OR REPLACE FUNCTION public.oban_jobs_notify() RETURNS trigger AS
            $$
            DECLARE
                channel text;
                notice  json;
            BEGIN
                IF NEW.state = 'available' THEN
                    channel = 'public.oban_insert';
                    notice = JSON_BUILD_OBJECT('queue', NEW.queue);
                    PERFORM pg_notify(channel, notice::text);
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        SQL);

        $this->addSql(<<<'SQL'
            DROP TRIGGER IF EXISTS oban_notify ON public.oban_jobs;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TRIGGER oban_notify
                AFTER INSERT
                ON public.oban_jobs
                FOR EACH ROW
            EXECUTE PROCEDURE public.oban_jobs_notify();
        SQL);

        $this->addSql(<<<'SQL'
            -- v09
            ALTER TABLE public.oban_jobs
                ADD COLUMN IF NOT EXISTS meta         jsonb DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS cancelled_at timestamp WITHOUT TIME ZONE;
        SQL);

        $this->addSql(<<<'SQL'
            DO
            $$
                DECLARE
                    version int;
                    already bool;
                BEGIN
                    SELECT CURRENT_SETTING('server_version_num')::int INTO version;
                    SELECT '{cancelled}' <@ ENUM_RANGE(NULL::public.oban_job_state)::text[] INTO already;
                    IF already THEN
                        RETURN;
                    ELSIF version >= 120000 THEN
                        ALTER TYPE public.oban_job_state ADD VALUE IF NOT EXISTS 'cancelled';
                    ELSE
                        ALTER TYPE public.oban_job_state RENAME TO old_oban_job_state;
                        CREATE TYPE public.oban_job_state AS ENUM (
                            'available',
                            'scheduled',
                            'executing',
                            'retryable',
                            'completed',
                            'discarded',
                            'cancelled'
                            );
                        ALTER TABLE public.oban_jobs
                            RENAME COLUMN state TO _state;
                        ALTER TABLE public.oban_jobs
                            ADD state public.oban_job_state NOT NULL DEFAULT 'available';
                        UPDATE public.oban_jobs SET state = _state::text::public.oban_job_state;
                        ALTER TABLE public.oban_jobs
                            DROP COLUMN _state;
                        DROP TYPE public.old_oban_job_state;
                    END IF;
                END
            $$;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_state_queue_priority_scheduled_at_id_index
                ON public.oban_jobs (state, queue, priority, scheduled_at, id);
        SQL);

        $this->addSql(<<<'SQL'
            -- v10
            ALTER TABLE public.oban_jobs
                -- These didn't have defaults out of consideration for older PG versions
                ALTER COLUMN args SET DEFAULT '{}'::jsonb,
                ALTER COLUMN priority SET NOT NULL,
            
                -- These could happen from an insert_all call with invalid data
                ADD CONSTRAINT attempt_range CHECK (((attempt >= 0) AND (attempt <= max_attempts))),
                ADD CONSTRAINT positive_max_attempts CHECK ((max_attempts > 0)),
                ADD CONSTRAINT priority_range CHECK (((priority >= 0) AND (priority <= 3)));
        SQL);

        $this->addSql(<<<'SQL'
            DROP INDEX IF EXISTS public.oban_jobs_args_vector;
        SQL);

        $this->addSql(<<<'SQL'
            DROP INDEX IF EXISTS public.oban_jobs_worker_gist;
        SQL);

        $this->addSql(<<<'SQL'
            DROP INDEX IF EXISTS public.oban_jobs_attempted_at_id_index;
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_args_index ON public.oban_jobs USING gin (args);
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS oban_jobs_meta_index ON public.oban_jobs USING gin (meta);
        SQL);

        $this->addSql(<<<'SQL'
            -- v11
            CREATE UNLOGGED TABLE IF NOT EXISTS public.oban_peers
            (
                name       text                        NOT NULL PRIMARY KEY,
                node       text                        NOT NULL,
                started_at timestamp WITHOUT TIME ZONE NOT NULL,
                expires_at timestamp WITHOUT TIME ZONE NOT NULL
            );
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE "public".oban_peers SET UNLOGGED;
        SQL);

        $this->addSql(<<<'SQL'
            -- Save latest Oban database version for later introspection.
            COMMENT ON TABLE public.oban_jobs IS '11';
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE "public"."oban_jobs" DROP CONSTRAINT "priority_range";
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE "public"."oban_jobs" ADD CONSTRAINT "non_negative_priority" CHECK (priority >= 0) NOT VALID;
        SQL);

        $this->addSql(<<<'SQL'
            DROP TRIGGER IF EXISTS oban_notify ON "public".oban_jobs;
        SQL);

        $this->addSql(<<<'SQL'
            DROP FUNCTION IF EXISTS "public".oban_jobs_notify();
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS "oban_jobs_state_cancelled_at_index" ON "public"."oban_jobs" ("state", "cancelled_at");
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IF NOT EXISTS "oban_jobs_state_discarded_at_index" ON "public"."oban_jobs" ("state", "discarded_at");
        SQL);

        $this->addSql(<<<'SQL'
            COMMENT ON TABLE "public".oban_jobs IS '13'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
