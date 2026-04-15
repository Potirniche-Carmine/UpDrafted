CREATE TYPE "public"."school_classification" AS ENUM('high_school', 'college', 'university', 'professional', 'other');--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"classification" "school_classification" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_schools_name" ON "schools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_schools_classification" ON "schools" USING btree ("classification");--> statement-breakpoint
CREATE INDEX "idx_schools_name_lower" ON "schools" USING btree ("name");