CREATE TYPE "public"."attendance_status" AS ENUM('PRESENT', 'ABSENT');--> statement-breakpoint
CREATE TYPE "public"."event_assignment_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED');--> statement-breakpoint
CREATE TYPE "public"."event_assignment_type" AS ENUM('COORDINATOR', 'VOLUNTEER');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('PUBLIC', 'INTERNAL');--> statement-breakpoint
CREATE TABLE "event_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"club_membership_id" uuid NOT NULL,
	"type" "event_assignment_type" DEFAULT 'VOLUNTEER' NOT NULL,
	"status" "event_assignment_status" DEFAULT 'PENDING' NOT NULL,
	"working_team_id" uuid,
	"responsibility" text,
	"assigned_by_membership_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"club_membership_id" uuid NOT NULL,
	"status" "attendance_status" NOT NULL,
	"marked_by_membership_id" uuid NOT NULL,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"venue" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"visibility" "event_visibility" DEFAULT 'INTERNAL' NOT NULL,
	"status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"created_by_membership_id" uuid NOT NULL,
	"approved_by_membership_id" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_id_club_unique" UNIQUE("id","club_id"),
	CONSTRAINT "events_valid_dates" CHECK ("events"."end_at" > "events"."start_at")
);
--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_event_club_fk" FOREIGN KEY ("event_id","club_id") REFERENCES "public"."events"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_member_club_fk" FOREIGN KEY ("club_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_assigner_club_fk" FOREIGN KEY ("assigned_by_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_team_club_fk" FOREIGN KEY ("working_team_id","club_id") REFERENCES "public"."teams"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_event_club_fk" FOREIGN KEY ("event_id","club_id") REFERENCES "public"."events"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_member_club_fk" FOREIGN KEY ("club_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_marker_club_fk" FOREIGN KEY ("marked_by_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_creator_club_fk" FOREIGN KEY ("created_by_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_approver_club_fk" FOREIGN KEY ("approved_by_membership_id","club_id") REFERENCES "public"."club_memberships"("id","club_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_assignments_member_event_unique" ON "event_assignments" USING btree ("event_id","club_membership_id");--> statement-breakpoint
CREATE INDEX "event_assignments_event_idx" ON "event_assignments" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_assignments_member_idx" ON "event_assignments" USING btree ("club_membership_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_attendance_member_event_unique" ON "event_attendance" USING btree ("event_id","club_membership_id");--> statement-breakpoint
CREATE INDEX "event_attendance_event_idx" ON "event_attendance" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_club_idx" ON "events" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");--> statement-breakpoint
