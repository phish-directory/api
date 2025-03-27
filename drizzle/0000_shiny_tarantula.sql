CREATE TYPE "public"."apis" AS ENUM('SafeBrowsing', 'GoogleWebRisk', 'IpQualityScore', 'PhishObserver', 'PhishReport', 'SecurityTrails', 'SinkingYachts', 'UrlScan', 'VirusTotal', 'Walshy', 'IpQuery', 'AbuseCh');--> statement-breakpoint
CREATE TYPE "public"."abuse_contact_report_method" AS ENUM('email', 'form', 'discord', 'other');--> statement-breakpoint
CREATE TYPE "public"."abuse_contact_type" AS ENUM('hostingProvider', 'domainRegistrar', 'linkShortener', 'registrar', 'other');--> statement-breakpoint
CREATE TYPE "public"."classifications" AS ENUM('postal', 'banking', 'crypto');--> statement-breakpoint
CREATE TYPE "public"."permission_level" AS ENUM('user', 'trusted', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."use_extended_data" AS ENUM('off', 'on', 'forced');--> statement-breakpoint
CREATE TABLE "abuse_contacts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"type" "abuse_contact_type" NOT NULL,
	"method" "abuse_contact_report_method" NOT NULL,
	"reportContactEmail" varchar,
	"reportContactForm" varchar,
	"reportContactDiscord" varchar,
	"reportContactOther" varchar,
	"notes" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "abuse_contacts_id_unique" UNIQUE("id"),
	CONSTRAINT "abuse_contacts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "abuse_contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_auth-tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"userId" bigint NOT NULL,
	"token" varchar,
	"used" boolean DEFAULT false,
	"expiresAt" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "user_auth-tokens_id_unique" UNIQUE("id"),
	CONSTRAINT "user_auth-tokens_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "user_auth-tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "domains" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"domain" varchar NOT NULL,
	"malicious" boolean DEFAULT false NOT NULL,
	"last_checked" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "domains_id_unique" UNIQUE("id"),
	CONSTRAINT "domains_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "domains" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "emails" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"email" varchar NOT NULL,
	"malicious" boolean DEFAULT false NOT NULL,
	"last_checked" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "emails_id_unique" UNIQUE("id"),
	CONSTRAINT "emails_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "emails" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_login-attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"userId" bigint NOT NULL,
	"ipAddress" varchar NOT NULL,
	"userAgent" varchar NOT NULL,
	"success" boolean DEFAULT false NOT NULL,
	"ipInfo" json,
	"country" varchar,
	"city" varchar,
	"region" varchar,
	"isp" varchar,
	"organization" varchar,
	"deviceType" varchar,
	"browser" varchar,
	"os" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "user_login-attempts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "user_login-attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "raw_api_data" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"sourceAPI" "apis" NOT NULL,
	"data" json NOT NULL,
	"domain" bigint,
	"email" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "raw_api_data_id_unique" UNIQUE("id"),
	CONSTRAINT "raw_api_data_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "raw_api_data" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"method" varchar(10) NOT NULL,
	"url" varchar NOT NULL,
	"headers" json,
	"body" json,
	"query" json,
	"ip" varchar NOT NULL,
	"userAgent" varchar NOT NULL,
	"xIdentity" varchar,
	"referer" varchar,
	"userId" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "requests_id_unique" UNIQUE("id"),
	CONSTRAINT "requests_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid(),
	"firstName" varchar NOT NULL,
	"lastName" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"permissionLevel" "permission_level" DEFAULT 'user' NOT NULL,
	"useExtendedData" "use_extended_data" DEFAULT 'off' NOT NULL,
	"invitedToSlack" boolean DEFAULT false NOT NULL,
	"slackInviteAt" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_auth-tokens" ADD CONSTRAINT "user_auth-tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_login-attempts" ADD CONSTRAINT "user_login-attempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_api_data" ADD CONSTRAINT "raw_api_data_domain_domains_id_fk" FOREIGN KEY ("domain") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_api_data" ADD CONSTRAINT "raw_api_data_email_emails_id_fk" FOREIGN KEY ("email") REFERENCES "public"."emails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_abuseContacts_name" ON "abuse_contacts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_abuseContacts_type" ON "abuse_contacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_userId" ON "user_auth-tokens" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_expiresAt" ON "user_auth-tokens" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "idx_domains_domain" ON "domains" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_emails_email" ON "emails" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_loginAttempts_userId" ON "user_login-attempts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_loginAttempts_ipAddress" ON "user_login-attempts" USING btree ("ipAddress");--> statement-breakpoint
CREATE INDEX "idx_loginAttempts_success" ON "user_login-attempts" USING btree ("success");--> statement-breakpoint
CREATE INDEX "idx_rawAPIData_sourceAPI" ON "raw_api_data" USING btree ("sourceAPI");--> statement-breakpoint
CREATE INDEX "idx_raw_api_data_created_at" ON "raw_api_data" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_requests_userId" ON "requests" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_requests_url" ON "requests" USING btree ("url");--> statement-breakpoint
CREATE INDEX "idx_requests_method" ON "requests" USING btree ("method");--> statement-breakpoint
CREATE INDEX "idx_requests_ip" ON "requests" USING btree ("ip");--> statement-breakpoint
CREATE INDEX "idx_firstName" ON "users" USING btree ("firstName");--> statement-breakpoint
CREATE INDEX "idx_lastName" ON "users" USING btree ("lastName");--> statement-breakpoint
CREATE INDEX "idx_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE VIEW "public"."active_users_view" AS (select "id", "uuid", "firstName", "lastName", "email", "password", "permissionLevel", "useExtendedData", "invitedToSlack", "slackInviteAt", "created_at", "deleted_at", "updated_at" from "users" where "users"."deleted_at" is null);--> statement-breakpoint
CREATE VIEW "public"."admin_users_view" AS (select "id", "uuid", "firstName", "lastName", "email", "permissionLevel", "created_at", "updated_at" from "users" where ("users"."deleted_at" is null and ("users"."permissionLevel" = 'admin' or "users"."permissionLevel" = 'owner')));--> statement-breakpoint
CREATE VIEW "public"."recent_api_requests_view" AS (select "requests"."id", "requests"."method", "requests"."url", "requests"."ip", "requests"."userAgent", "requests"."created_at", "requests"."userId", "users"."email", "users"."permissionLevel" from "requests" left join "users" on "requests"."userId" = "users"."id" where "requests"."created_at" > NOW() - INTERVAL '7 days' order by "requests"."created_at" desc);--> statement-breakpoint
CREATE VIEW "public"."trusted_users_view" AS (select "id", "uuid", "firstName", "lastName", "email", "created_at", "updated_at" from "users" where ("users"."deleted_at" is null and "users"."permissionLevel" = 'trusted'));--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."failed_login_attempts_view" AS (select "user_login-attempts"."id", "user_login-attempts"."uuid", "user_login-attempts"."userId", "users"."email", "users"."firstName", "users"."lastName", "user_login-attempts"."ipAddress", "user_login-attempts"."userAgent", "user_login-attempts"."country", "user_login-attempts"."city", "user_login-attempts"."ipInfo", "user_login-attempts"."created_at" from "user_login-attempts" inner join "users" on "user_login-attempts"."userId" = "users"."id" where "user_login-attempts"."success" = false order by "user_login-attempts"."created_at");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."malicious_domains_report_view" AS (select "domains"."id", "domains"."domain", "domains"."malicious", "domains"."last_checked", "domains"."created_at", "raw_api_data"."sourceAPI", "raw_api_data"."data" from "domains" left join (select data->>'domain' as "domain_name", max("created_at") as "max_created_at" from "raw_api_data" group by data->>'domain') "latest_api_data" on "domains"."domain" = "domain_name" left join "raw_api_data" on ("raw_api_data"."data"->>'domain' = "domains"."domain" and "raw_api_data"."created_at" = "max_created_at") where "domains"."malicious" = true order by "domains"."last_checked" desc);