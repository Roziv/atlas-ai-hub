-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "trigger" TEXT NOT NULL,
    "definition" TEXT NOT NULL DEFAULT '[]',
    "last_run_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "workflows_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflow_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflow_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "workflows_organization_id_idx" ON "workflows"("organization_id");

-- CreateIndex
CREATE INDEX "workflows_status_idx" ON "workflows"("status");

-- CreateIndex
CREATE INDEX "workflow_runs_workflow_id_idx" ON "workflow_runs"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_runs_status_idx" ON "workflow_runs"("status");
