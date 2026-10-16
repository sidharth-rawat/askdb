CREATE TYPE "public"."db_mode" AS ENUM('url', 'parameters');--> statement-breakpoint
CREATE TABLE "database_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"mode" "db_mode" NOT NULL,
	"db_name" text NOT NULL,
	"db_credentials" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_dbname_per_source" ON "database_connections" USING btree ("source","db_name");