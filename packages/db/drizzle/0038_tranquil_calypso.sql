CREATE TYPE "public"."division" AS ENUM('NCAA Division I', 'NCAA Division II', 'NCAA Division III', 'NAIA', 'NJCAA Division I', 'NJCAA Division II', 'NJCAA Division III', 'Junior College', 'Community College', 'High School', 'Club Sports');--> statement-breakpoint
CREATE TABLE "conferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"division" "division" NOT NULL,
	"region" text,
	"abbreviation" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conferences_name_unique" UNIQUE("name"),
	CONSTRAINT "conferences_name_division_unique" UNIQUE("name","division")
);
--> statement-breakpoint
CREATE INDEX "idx_conferences_division" ON "conferences" USING btree ("division");--> statement-breakpoint
CREATE INDEX "idx_conferences_is_active" ON "conferences" USING btree ("is_active");