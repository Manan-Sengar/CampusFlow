CREATE TYPE "public"."team_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "team_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"club_membership_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	CONSTRAINT "team_memberships_valid_dates" CHECK ("team_memberships"."ended_at" IS NULL OR "team_memberships"."ended_at" >= "team_memberships"."started_at")
);
--> statement-breakpoint
CREATE TABLE "team_lead_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"club_membership_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	CONSTRAINT "team_lead_assignments_valid_dates" CHECK ("team_lead_assignments"."ended_at" IS NULL OR "team_lead_assignments"."ended_at" >= "team_lead_assignments"."started_at")
);

CREATE UNIQUE INDEX "club_memberships_id_club_unique"
ON "club_memberships" USING btree ("id", "club_id");
--> statement-breakpoint

CREATE UNIQUE INDEX "teams_id_club_unique"
ON "teams" USING btree ("id", "club_id");
--> statement-breakpoint

ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_membership_club_fk" FOREIGN KEY ("club_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_club_fk" FOREIGN KEY ("team_id","club_id") REFERENCES "public"."teams"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_lead_assignments" ADD CONSTRAINT "team_lead_assignments_membership_club_fk" FOREIGN KEY ("club_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_lead_assignments" ADD CONSTRAINT "team_lead_assignments_team_club_fk" FOREIGN KEY ("team_id","club_id") REFERENCES "public"."teams"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "teams_club_name_lower_unique" ON "teams" USING btree ("club_id",lower("name"));--> statement-breakpoint
CREATE INDEX "teams_club_idx" ON "teams" USING btree ("club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_memberships_one_active_team_unique" ON "team_memberships" USING btree ("club_membership_id") WHERE "team_memberships"."ended_at" IS NULL;--> statement-breakpoint
CREATE INDEX "team_memberships_team_idx" ON "team_memberships" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_lead_assignments_active_unique" ON "team_lead_assignments" USING btree ("team_id","club_membership_id") WHERE "team_lead_assignments"."ended_at" IS NULL;--> statement-breakpoint
CREATE INDEX "team_lead_assignments_team_idx" ON "team_lead_assignments" USING btree ("team_id");