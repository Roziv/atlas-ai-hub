import { Pool } from 'pg';
import logger from './logger';

const SQL_STATEMENTS = [
  // Check if tables exist (handled separately)

  // Organizations
  `CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "logo_url" TEXT,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE INDEX "organizations_slug_idx" ON "organizations"("slug")`,

  // Users
  `CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'end_user',
    "organization_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_email_organization_id_key" UNIQUE("email", "organization_id")
  )`,
  `CREATE INDEX "users_organization_id_idx" ON "users"("organization_id")`,
  `CREATE INDEX "users_role_idx" ON "users"("role")`,

  // Models
  `CREATE TABLE "models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" TEXT NOT NULL,
    "external_id" TEXT,
    "external_source" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "deployment_count" INTEGER NOT NULL DEFAULT 0,
    "last_policy_check_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "models_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "models_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "models_organization_id_name_key" UNIQUE("organization_id", "name")
  )`,
  `CREATE INDEX "models_organization_id_idx" ON "models"("organization_id")`,
  `CREATE INDEX "models_owner_id_idx" ON "models"("owner_id")`,
  `CREATE INDEX "models_status_idx" ON "models"("status")`,
  `CREATE INDEX "models_created_at_idx" ON "models"("created_at")`,

  // Policies
  `CREATE TABLE "policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT NOT NULL,
    "scope_value" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "enforcement_enabled" BOOLEAN NOT NULL DEFAULT true,
    "enforcement_auto_resolve" BOOLEAN NOT NULL DEFAULT false,
    "required_approvers" TEXT NOT NULL DEFAULT '[]',
    "rules" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "policies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "policies_organization_id_name_key" UNIQUE("organization_id", "name")
  )`,
  `CREATE INDEX "policies_organization_id_idx" ON "policies"("organization_id")`,
  `CREATE INDEX "policies_created_by_idx" ON "policies"("created_by")`,

  // Policy Applications
  `CREATE TABLE "policy_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "policy_applications_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "policy_applications_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "policy_applications_policy_id_model_id_key" UNIQUE("policy_id", "model_id")
  )`,
  `CREATE INDEX "policy_applications_organization_id_idx" ON "policy_applications"("organization_id")`,
  `CREATE INDEX "policy_applications_policy_id_idx" ON "policy_applications"("policy_id")`,
  `CREATE INDEX "policy_applications_model_id_idx" ON "policy_applications"("model_id")`,

  // Violations
  `CREATE TABLE "violations" (
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    CONSTRAINT "violations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "violations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE INDEX "violations_organization_id_idx" ON "violations"("organization_id")`,
  `CREATE INDEX "violations_model_id_idx" ON "violations"("model_id")`,
  `CREATE INDEX "violations_policy_id_idx" ON "violations"("policy_id")`,
  `CREATE INDEX "violations_status_idx" ON "violations"("status")`,
  `CREATE INDEX "violations_severity_idx" ON "violations"("severity")`,
  `CREATE INDEX "violations_created_at_idx" ON "violations"("created_at")`,

  // RAG Resources
  `CREATE TABLE "rag_resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "content_url" TEXT,
    "access_level" TEXT NOT NULL DEFAULT 'read-only',
    "created_by_id" TEXT,
    "is_general" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rag_resources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rag_resources_organization_id_name_key" UNIQUE("organization_id", "name")
  )`,
  `CREATE INDEX "rag_resources_organization_id_idx" ON "rag_resources"("organization_id")`,
  `CREATE INDEX "rag_resources_type_idx" ON "rag_resources"("type")`,

  // RAG Distributions
  `CREATE TABLE "rag_distributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "rag_resource_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "access_level" TEXT NOT NULL DEFAULT 'read-only',
    "expires_at" TIMESTAMP(3),
    "distributed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rag_distributions_rag_resource_id_fkey" FOREIGN KEY ("rag_resource_id") REFERENCES "rag_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rag_distributions_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rag_distributions_rag_resource_id_model_id_key" UNIQUE("rag_resource_id", "model_id")
  )`,
  `CREATE INDEX "rag_distributions_organization_id_idx" ON "rag_distributions"("organization_id")`,
  `CREATE INDEX "rag_distributions_rag_resource_id_idx" ON "rag_distributions"("rag_resource_id")`,
  `CREATE INDEX "rag_distributions_model_id_idx" ON "rag_distributions"("model_id")`,

  // Audit Logs
  `CREATE TABLE "audit_logs" (
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_rag_resource_id_fkey" FOREIGN KEY ("rag_resource_id") REFERENCES "rag_resources"("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id")`,
  `CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id")`,
  `CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action")`,
  `CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at")`,

  // Spend Records
  `CREATE TABLE "spend_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "department" TEXT,
    "agent_id" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tokens_input" INTEGER NOT NULL DEFAULT 0,
    "tokens_output" INTEGER NOT NULL DEFAULT 0,
    "record_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX "spend_records_organization_id_idx" ON "spend_records"("organization_id")`,
  `CREATE INDEX "spend_records_provider_idx" ON "spend_records"("provider")`,
  `CREATE INDEX "spend_records_record_date_idx" ON "spend_records"("record_date")`,
  `CREATE INDEX "spend_records_department_idx" ON "spend_records"("department")`,

  // Budgets
  `CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "monthly_limit" DOUBLE PRECISION NOT NULL,
    "alert_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE INDEX "budgets_organization_id_idx" ON "budgets"("organization_id")`,

  // Agents
  `CREATE TABLE "agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "creator_id" TEXT,
    "creator_name" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "icon" TEXT NOT NULL DEFAULT 'bot',
    "definition" TEXT NOT NULL DEFAULT '{}',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE INDEX "agents_organization_id_idx" ON "agents"("organization_id")`,
  `CREATE INDEX "agents_is_published_idx" ON "agents"("is_published")`,

  // Tools
  `CREATE TABLE "tools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE INDEX "tools_organization_id_idx" ON "tools"("organization_id")`,

  // Agent Runs
  `CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3)
  )`,
  `CREATE INDEX "agent_runs_agent_id_idx" ON "agent_runs"("agent_id")`,
  `CREATE INDEX "agent_runs_status_idx" ON "agent_runs"("status")`,

  // Workflows
  `CREATE TABLE "workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "trigger" TEXT NOT NULL,
    "definition" TEXT NOT NULL DEFAULT '[]',
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workflows_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE INDEX "workflows_organization_id_idx" ON "workflows"("organization_id")`,
  `CREATE INDEX "workflows_status_idx" ON "workflows"("status")`,

  // Workflow Runs
  `CREATE TABLE "workflow_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflow_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX "workflow_runs_workflow_id_idx" ON "workflow_runs"("workflow_id")`,
  `CREATE INDEX "workflow_runs_status_idx" ON "workflow_runs"("status")`,
];

/**
 * Initializes the PostgreSQL database schema by connecting directly
 * Executes each SQL statement individually to avoid transaction issues
 */
export async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    logger.info('Initializing PostgreSQL database schema...');

    const client = await pool.connect();

    try {
      // Check if tables already exist
      const result = await client.query(
        `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations')`
      );

      if (result.rows[0]?.exists) {
        logger.info('✓ Database schema already exists');
        return true;
      }

      logger.info('Creating database tables...');

      // Execute each SQL statement individually
      for (const sql of SQL_STATEMENTS) {
        try {
          await client.query(sql);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            logger.error(`Failed to execute SQL: ${sql.substring(0, 50)}...`, {
              error: error.message,
            });
            throw error;
          }
        }
      }

      logger.info('✓ Database schema created successfully');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Failed to initialize database:', { error: String(error).substring(0, 300) });
    throw error;
  } finally {
    await pool.end();
  }
}
