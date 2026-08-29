CREATE TYPE "public"."application_status" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."recruitment_drive_status" AS ENUM('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "application_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"club_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	CONSTRAINT "application_preferences_positive_rank" CHECK ("application_preferences"."rank" > 0)
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"recruitment_drive_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"motivation" text,
	"experience" text,
	"status" "application_status" DEFAULT 'SUBMITTED' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitment_drives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "recruitment_drive_status" DEFAULT 'DRAFT' NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"created_by_membership_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recruitment_drives_id_club_unique" UNIQUE("id","club_id"),
	CONSTRAINT "recruitment_drives_valid_dates" CHECK ("recruitment_drives"."closes_at" > "recruitment_drives"."opens_at")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "applications_id_club_unique" ON "applications" USING btree ("id","club_id");--> statement-breakpoint

ALTER TABLE "application_preferences" ADD CONSTRAINT "application_preferences_application_club_fk" FOREIGN KEY ("application_id","club_id") REFERENCES "public"."applications"("id","club_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_preferences" ADD CONSTRAINT "application_preferences_team_club_fk" FOREIGN KEY ("team_id","club_id") REFERENCES "public"."teams"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_drive_club_fk" FOREIGN KEY ("recruitment_drive_id","club_id") REFERENCES "public"."recruitment_drives"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_drives" ADD CONSTRAINT "recruitment_drives_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_drives" ADD CONSTRAINT "recruitment_drives_creator_club_fk" FOREIGN KEY ("created_by_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_preferences_team_unique" ON "application_preferences" USING btree ("application_id","team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "application_preferences_rank_unique" ON "application_preferences" USING btree ("application_id","rank");--> statement-breakpoint
CREATE INDEX "application_preferences_application_idx" ON "application_preferences" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_user_drive_unique" ON "applications" USING btree ("user_id","recruitment_drive_id");--> statement-breakpoint
CREATE INDEX "applications_drive_idx" ON "applications" USING btree ("recruitment_drive_id");--> statement-breakpoint
CREATE INDEX "applications_user_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recruitment_drives_club_idx" ON "recruitment_drives" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "recruitment_drives_status_idx" ON "recruitment_drives" USING btree ("status");