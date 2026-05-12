-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'end_user',
    "organization_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "owner_id" TEXT NOT NULL,
    "external_id" TEXT,
    "external_source" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "deployment_count" INTEGER NOT NULL DEFAULT 0,
    "last_policy_check_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "models_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "models_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT NOT NULL,
    "scope_value" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "enforcement_enabled" BOOLEAN NOT NULL DEFAULT true,
    "enforcement_auto_resolve" BOOLEAN NOT NULL DEFAULT false,
    "required_approvers" TEXT NOT NULL DEFAULT '[]',
    "rules" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "policies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "policy_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "applied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "policy_applications_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "policy_applications_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "violations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "description" TEXT,
    "remediation" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "resolved_at" DATETIME,
    CONSTRAINT "violations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rag_resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "content_url" TEXT,
    "accessLevel" TEXT NOT NULL DEFAULT 'read-only',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "rag_resources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rag_distributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "rag_resource_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "access_level" TEXT NOT NULL DEFAULT 'read-only',
    "expires_at" DATETIME,
    "distributed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rag_distributions_rag_resource_id_fkey" FOREIGN KEY ("rag_resource_id") REFERENCES "rag_resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rag_distributions_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "user_id" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '{}',
    "model_id" TEXT,
    "policy_id" TEXT,
    "rag_resource_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_rag_resource_id_fkey" FOREIGN KEY ("rag_resource_id") REFERENCES "rag_resources" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "spend_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "record_date" DATETIME NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthly_limit" REAL NOT NULL,
    "alert_threshold" REAL NOT NULL DEFAULT 0.8,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" TEXT NOT NULL DEFAULT '{}',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_organization_id_key" ON "users"("email", "organization_id");

-- CreateIndex
CREATE INDEX "models_organization_id_idx" ON "models"("organization_id");

-- CreateIndex
CREATE INDEX "models_owner_id_idx" ON "models"("owner_id");

-- CreateIndex
CREATE INDEX "models_status_idx" ON "models"("status");

-- CreateIndex
CREATE INDEX "models_created_at_idx" ON "models"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "models_organization_id_name_key" ON "models"("organization_id", "name");

-- CreateIndex
CREATE INDEX "policies_organization_id_idx" ON "policies"("organization_id");

-- CreateIndex
CREATE INDEX "policies_created_by_idx" ON "policies"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "policies_organization_id_name_key" ON "policies"("organization_id", "name");

-- CreateIndex
CREATE INDEX "policy_applications_organization_id_idx" ON "policy_applications"("organization_id");

-- CreateIndex
CREATE INDEX "policy_applications_policy_id_idx" ON "policy_applications"("policy_id");

-- CreateIndex
CREATE INDEX "policy_applications_model_id_idx" ON "policy_applications"("model_id");

-- CreateIndex
CREATE UNIQUE INDEX "policy_applications_policy_id_model_id_key" ON "policy_applications"("policy_id", "model_id");

-- CreateIndex
CREATE INDEX "violations_organization_id_idx" ON "violations"("organization_id");

-- CreateIndex
CREATE INDEX "violations_model_id_idx" ON "violations"("model_id");

-- CreateIndex
CREATE INDEX "violations_policy_id_idx" ON "violations"("policy_id");

-- CreateIndex
CREATE INDEX "violations_status_idx" ON "violations"("status");

-- CreateIndex
CREATE INDEX "violations_severity_idx" ON "violations"("severity");

-- CreateIndex
CREATE INDEX "violations_created_at_idx" ON "violations"("created_at");

-- CreateIndex
CREATE INDEX "rag_resources_organization_id_idx" ON "rag_resources"("organization_id");

-- CreateIndex
CREATE INDEX "rag_resources_type_idx" ON "rag_resources"("type");

-- CreateIndex
CREATE UNIQUE INDEX "rag_resources_organization_id_name_key" ON "rag_resources"("organization_id", "name");

-- CreateIndex
CREATE INDEX "rag_distributions_organization_id_idx" ON "rag_distributions"("organization_id");

-- CreateIndex
CREATE INDEX "rag_distributions_rag_resource_id_idx" ON "rag_distributions"("rag_resource_id");

-- CreateIndex
CREATE INDEX "rag_distributions_model_id_idx" ON "rag_distributions"("model_id");

-- CreateIndex
CREATE UNIQUE INDEX "rag_distributions_rag_resource_id_model_id_key" ON "rag_distributions"("rag_resource_id", "model_id");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "spend_records_organization_id_idx" ON "spend_records"("organization_id");

-- CreateIndex
CREATE INDEX "spend_records_provider_idx" ON "spend_records"("provider");

-- CreateIndex
CREATE INDEX "spend_records_record_date_idx" ON "spend_records"("record_date");

-- CreateIndex
CREATE INDEX "budgets_organization_id_idx" ON "budgets"("organization_id");

-- CreateIndex
CREATE INDEX "agents_organization_id_idx" ON "agents"("organization_id");

-- CreateIndex
CREATE INDEX "agents_is_published_idx" ON "agents"("is_published");

-- CreateIndex
CREATE INDEX "agent_runs_agent_id_idx" ON "agent_runs"("agent_id");

-- CreateIndex
CREATE INDEX "agent_runs_status_idx" ON "agent_runs"("status");
