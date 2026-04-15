CREATE TYPE "public"."student_classification" AS ENUM('high_school', 'university_transfers', 'juco_students', 'graduate_transfers', 'international_students');--> statement-breakpoint
ALTER TABLE "recruiting_needs" ADD COLUMN "student_classifications" "student_classification"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" ADD COLUMN "student_classifications" "student_classification"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "recruiting_needs" DROP COLUMN "graduation_years";--> statement-breakpoint
ALTER TABLE "recruiting_profile_needs" DROP COLUMN "graduation_years";