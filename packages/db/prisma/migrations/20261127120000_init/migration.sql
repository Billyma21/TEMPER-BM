-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SiteKind" AS ENUM ('FACTORY', 'WAREHOUSE', 'STORE', 'HEADQUARTERS', 'LAB', 'OTHER');

-- CreateEnum
CREATE TYPE "BuildingKind" AS ENUM ('PRODUCTION', 'WAREHOUSE', 'OFFICE', 'LAB', 'WORKSHOP', 'GATEHOUSE', 'STORE', 'LOADING_DOCK', 'UTILITY');

-- CreateEnum
CREATE TYPE "WorkerCategory" AS ENUM ('BLUE_COLLAR', 'WHITE_COLLAR', 'MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'ACTIVE', 'LOCKED', 'DISABLED');

-- CreateEnum
CREATE TYPE "AssignmentSource" AS ENUM ('DIRECT', 'DELEGATION', 'BREAK_GLASS');

-- CreateEnum
CREATE TYPE "DeviceKind" AS ENUM ('CLOCK_KIOSK', 'BADGE_READER', 'TOOL_KIOSK', 'LINE_TABLET', 'ENV_SENSOR', 'POS_REGISTER', 'LABEL_PRINTER', 'SCALE', 'HANDHELD_SCANNER');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('PENDING', 'ACTIVE', 'OFFLINE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'DEVICE', 'SYSTEM', 'API_KEY');

-- CreateEnum
CREATE TYPE "IntegrationKind" AS ENUM ('PAYROLL', 'ACCOUNTING', 'PEPPOL', 'EDI', 'ECOMMERCE', 'SSO', 'IOT_BROKER', 'EMAIL', 'SMS', 'DIMONA');

-- CreateEnum
CREATE TYPE "DataRequestKind" AS ENUM ('ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'OBJECTION', 'RESTRICTION');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'SUSPENDED', 'LEFT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'FIXED_TERM', 'TEMPORARY_AGENCY', 'STUDENT', 'INTERN', 'FLEXI_JOB', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "FitnessStatus" AS ENUM ('FIT', 'FIT_WITH_RESTRICTIONS', 'TEMPORARILY_UNFIT', 'UNFIT');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('FOOD_HYGIENE', 'ALLERGENS', 'SAFETY', 'FORKLIFT', 'FIRST_AID', 'FIRE_WARDEN', 'MACHINE', 'LOTO', 'ONBOARDING', 'OTHER');

-- CreateEnum
CREATE TYPE "BadgeTech" AS ENUM ('MIFARE_DESFIRE', 'HID_ICLASS', 'QR', 'MOBILE_NFC');

-- CreateEnum
CREATE TYPE "BadgeKind" AS ENUM ('PERMANENT', 'TEMPORARY', 'VISITOR', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "BadgeStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'LOST', 'STOLEN', 'RETURNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ZoneLevel" AS ENUM ('PUBLIC', 'STANDARD', 'RESTRICTED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "HygieneLevel" AS ENUM ('NONE', 'HYGIENE', 'HIGH_HYGIENE');

-- CreateEnum
CREATE TYPE "AccessDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "AccessResult" AS ENUM ('GRANTED', 'DENIED');

-- CreateEnum
CREATE TYPE "DenyReason" AS ENUM ('UNKNOWN_BADGE', 'BADGE_INACTIVE', 'OUT_OF_SCHEDULE', 'NO_RIGHT', 'TRAINING_EXPIRED', 'MEDICAL_RESTRICTION', 'ANTI_PASSBACK', 'ZONE_FULL', 'DEVICE_OFFLINE');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('EXPECTED', 'ON_SITE', 'LEFT', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CHANGED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClockKind" AS ENUM ('IN', 'OUT', 'BREAK_START', 'BREAK_END', 'MISSION_START', 'MISSION_END');

-- CreateEnum
CREATE TYPE "ClockSource" AS ENUM ('BADGE', 'KIOSK_PIN', 'MOBILE', 'WEB', 'IMPORT');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('OK', 'ANOMALY', 'CORRECTED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('OPEN', 'SUBMITTED', 'MANAGER_APPROVED', 'PAYROLL_APPROVED', 'EXPORTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('SICKNESS', 'WORK_ACCIDENT', 'COMMUTE_ACCIDENT', 'PRIVATE_ACCIDENT', 'UNJUSTIFIED', 'FORCE_MAJEURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('DRAFT', 'GENERATED', 'SENT', 'ACKNOWLEDGED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProductRange" AS ENUM ('TABLET', 'PRALINE', 'BAR', 'SPREAD', 'POWDER', 'SEASONAL_MOULDING', 'COUVERTURE', 'GIFT_BOX');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('PERMANENT', 'EASTER', 'SAINT_NICHOLAS', 'CHRISTMAS', 'VALENTINE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DEVELOPMENT', 'ACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "AllergenPresence" AS ENUM ('CONTAINS', 'MAY_CONTAIN');

-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "Operation" AS ENUM ('CLEANING_SORTING', 'ROASTING', 'WINNOWING', 'GRINDING', 'PRESSING', 'MIXING', 'REFINING', 'CONCHING', 'TEMPERING', 'MOULDING', 'ENROBING', 'COOLING', 'DEMOULDING', 'PACKAGING', 'METAL_DETECTION', 'QUALITY_CHECK');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('RUNNING', 'IDLE', 'BREAKDOWN', 'MAINTENANCE', 'CLEANING', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "ProductionOrderStatus" AS ENUM ('PLANNED', 'RELEASED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductionOrderKind" AS ENUM ('STANDARD', 'TRIAL', 'REWORK');

-- CreateEnum
CREATE TYPE "BatchKind" AS ENUM ('RAW_MATERIAL', 'INTERMEDIATE', 'FINISHED_GOOD');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('IN_PRODUCTION', 'QUARANTINE', 'RELEASED', 'BLOCKED', 'RECALLED', 'CONSUMED', 'DESTROYED');

-- CreateEnum
CREATE TYPE "DowntimeCategory" AS ENUM ('BREAKDOWN', 'CHANGEOVER', 'CLEANING', 'MATERIAL_SHORTAGE', 'STAFF_SHORTAGE', 'QUALITY_HOLD', 'MICRO_STOP', 'PLANNED');

-- CreateEnum
CREATE TYPE "CheckKind" AS ENUM ('CCP', 'PRP', 'RECEPTION', 'IN_LINE', 'FINISHED_PRODUCT', 'ENVIRONMENT', 'CLEANING', 'PEST_CONTROL', 'ALLERGEN_CHANGEOVER');

-- CreateEnum
CREATE TYPE "CheckResult" AS ENUM ('PASS', 'FAIL', 'WATCH');

-- CreateEnum
CREATE TYPE "NcSeverity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReleaseDecision" AS ENUM ('RELEASED', 'BLOCKED', 'RELEASED_WITH_DEVIATION');

-- CreateEnum
CREATE TYPE "Uom" AS ENUM ('KG', 'G', 'L', 'ML', 'PIECE', 'BOX', 'CARTON', 'PALLET', 'BAG', 'ROLL');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('RAW_MATERIAL', 'PACKAGING', 'INTERMEDIATE', 'FINISHED_GOOD', 'SPARE_PART', 'CONSUMABLE', 'PPE');

-- CreateEnum
CREATE TYPE "WarehouseKind" AS ENUM ('RAW_MATERIALS', 'FINISHED_GOODS', 'COLD_ROOM', 'STORE_BACKROOM', 'QUARANTINE', 'SPARE_PARTS');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('AVAILABLE', 'QUARANTINE', 'BLOCKED', 'RESERVED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('RECEIPT', 'PRODUCTION_CONSUMPTION', 'PRODUCTION_OUTPUT', 'TRANSFER', 'INVENTORY_ADJUSTMENT', 'SHIPMENT', 'CUSTOMER_RETURN', 'SUPPLIER_RETURN', 'SCRAP', 'STORE_SALE', 'MAINTENANCE_ISSUE', 'PPE_ISSUE', 'QUALITY_SAMPLE');

-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('AVAILABLE', 'ON_LOAN', 'IN_CALIBRATION', 'IN_REPAIR', 'LOST', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "WorkOrderKind" AS ENUM ('REQUEST', 'PREVENTIVE', 'CORRECTIVE', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'PLANNED', 'IN_PROGRESS', 'WAITING_PARTS', 'DONE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('PROSPECT', 'QUALIFYING', 'APPROVED', 'UNDER_WATCH', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'TO_APPROVE', 'APPROVED', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomerSegment" AS ENUM ('RETAIL_CHAIN', 'WHOLESALER', 'HORECA', 'ARTISAN', 'EXPORT', 'CORPORATE', 'PARTNER_STORE', 'CONSUMER');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('TO_CALL', 'NO_ANSWER', 'FOLLOW_UP', 'MEETING', 'QUALIFIED', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'PICKING', 'READY', 'SHIPPED', 'DELIVERED', 'INVOICED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PeppolStatus" AS ENUM ('NOT_APPLICABLE', 'TO_SEND', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IncidentKind" AS ENUM ('WORK_ACCIDENT', 'COMMUTE_ACCIDENT', 'NEAR_MISS', 'UNSAFE_CONDITION', 'FIRE', 'ENVIRONMENTAL', 'FOOD_SAFETY');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestCadence" AS ENUM ('DAILY', 'WEEKLY', 'ONE_OFF', 'ONBOARDING');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
    "kboNumber" TEXT,
    "address" JSONB NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BE',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultLocale" TEXT NOT NULL DEFAULT 'fr',
    "logoUrl" TEXT,
    "peppolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "SiteKind" NOT NULL,
    "address" JSONB NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Brussels',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "geofenceRadiusM" INTEGER NOT NULL DEFAULT 150,
    "worldX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worldZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "BuildingKind" NOT NULL,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "worldX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worldZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "depth" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costCenter" TEXT,
    "managerEmployeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shiftPatternId" TEXT,
    "leaderEmployeeId" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "jobFamily" TEXT NOT NULL,
    "workerCategory" "WorkerCategory" NOT NULL,
    "jointCommittee" TEXT NOT NULL,
    "classification" TEXT,
    "requiredTrainings" TEXT[],
    "defaultRoles" TEXT[],
    "isNightWork" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'INVITED',
    "employeeId" TEXT,
    "externalCompany" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecretEnc" TEXT,
    "recoveryCodesHash" TEXT[],
    "notificationPrefs" JSONB NOT NULL DEFAULT '{}',
    "worldPrefs" JSONB NOT NULL DEFAULT '{}',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "mfaVerifiedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "name" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "siteId" TEXT,
    "siteIds" TEXT[],
    "departmentIds" TEXT[],
    "teamIds" TEXT[],
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "source" "AssignmentSource" NOT NULL DEFAULT 'DIRECT',
    "delegatedByUserId" TEXT,
    "reason" TEXT,
    "approvalRequestId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "accessZoneId" TEXT,
    "kind" "DeviceKind" NOT NULL,
    "name" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'PENDING',
    "firmware" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "scopes" TEXT[],
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "onBehalfOfId" TEXT,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "subjectId" TEXT,
    "siteId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "reason" TEXT,
    "breakGlass" BOOLEAN NOT NULL DEFAULT false,
    "requestId" TEXT,
    "prevHash" TEXT,
    "hash" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "kind" "IntegrationKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configEnc" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_requests" (
    "id" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "kind" "DataRequestKind" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "details" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "handledById" TEXT,
    "exportFileKey" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'INFO',
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "positionId" TEXT,
    "managerId" TEXT,
    "employeeNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "preferredName" TEXT,
    "birthDate" DATE,
    "workEmail" TEXT,
    "workPhone" TEXT,
    "personalEmail" TEXT,
    "personalPhone" TEXT,
    "address" JSONB,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "photoUrl" TEXT,
    "languages" TEXT[],
    "jobTitle" TEXT,
    "hireDate" DATE NOT NULL,
    "seniorityDate" DATE,
    "endDate" DATE,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ONBOARDING',
    "employmentType" "EmploymentType" NOT NULL,
    "workerCategory" "WorkerCategory" NOT NULL,
    "jointCommittee" TEXT NOT NULL,
    "weeklyHours" DECIMAL(5,2) NOT NULL,
    "avatar" JSONB NOT NULL DEFAULT '{}',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "questsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false,
    "anonymizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_payroll" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "nissEnc" TEXT,
    "ibanEnc" TEXT,
    "grossMonthly" DECIMAL(14,2),
    "hourlyRate" DECIMAL(14,4),
    "payrollProviderRef" TEXT,
    "mealVouchers" BOOLEAN NOT NULL DEFAULT false,
    "ecoCheques" BOOLEAN NOT NULL DEFAULT false,
    "companyCar" BOOLEAN NOT NULL DEFAULT false,
    "benefits" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_medical" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "fitness" "FitnessStatus" NOT NULL,
    "restrictions" TEXT,
    "riskExposures" TEXT[],
    "lastExamAt" DATE,
    "nextExamAt" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_medical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "positionId" TEXT,
    "type" "EmploymentType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "weeklyHours" DECIMAL(5,2) NOT NULL,
    "jointCommittee" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "documentKey" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "type" "TrainingType" NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "score" INTEGER,
    "certificateKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "retentionUntil" TIMESTAMP(3),
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardings" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" DATE NOT NULL,
    "checklist" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "holderEmployeeId" TEXT,
    "visitorId" TEXT,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "uidHash" TEXT NOT NULL,
    "uidLast4" TEXT NOT NULL,
    "technology" "BadgeTech" NOT NULL,
    "kind" "BadgeKind" NOT NULL,
    "status" "BadgeStatus" NOT NULL DEFAULT 'ACTIVE',
    "pinHash" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "issuedById" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_zones" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "buildingId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "ZoneLevel" NOT NULL,
    "hygieneLevel" "HygieneLevel" NOT NULL DEFAULT 'NONE',
    "requiredTrainingTypes" "TrainingType"[],
    "requiredPpe" TEXT[],
    "maxOccupancy" INTEGER,
    "antiPassback" BOOLEAN NOT NULL DEFAULT false,
    "worldPolygon" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_rules" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "roleKey" TEXT,
    "positionId" TEXT,
    "teamId" TEXT,
    "employeeId" TEXT,
    "schedule" JSONB,
    "allow" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_events" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,
    "zoneId" TEXT,
    "deviceId" TEXT,
    "badgeId" TEXT,
    "employeeId" TEXT,
    "visitorId" TEXT,
    "direction" "AccessDirection" NOT NULL,
    "result" "AccessResult" NOT NULL,
    "denyReason" "DenyReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "hostEmployeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "purpose" TEXT NOT NULL,
    "expectedAt" TIMESTAMP(3) NOT NULL,
    "arrivedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "status" "VisitorStatus" NOT NULL DEFAULT 'EXPECTED',
    "safetyBriefingAt" TIMESTAMP(3),
    "hygieneDeclarationAt" TIMESTAMP(3),
    "ndaSignedAt" TIMESTAMP(3),
    "vehiclePlate" TEXT,
    "consentAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_patterns" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakMinutes" INTEGER NOT NULL DEFAULT 30,
    "isNight" BOOLEAN NOT NULL DEFAULT false,
    "rotation" JSONB,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "date" DATE NOT NULL,
    "shiftPatternId" TEXT,
    "productionLineId" TEXT,
    "plannedStart" TIMESTAMP(3) NOT NULL,
    "plannedEnd" TIMESTAMP(3) NOT NULL,
    "plannedBreakMin" INTEGER NOT NULL DEFAULT 30,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "at" TIMESTAMP(3) NOT NULL,
    "kind" "ClockKind" NOT NULL,
    "source" "ClockSource" NOT NULL,
    "deviceId" TEXT,
    "badgeId" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "accuracyM" INTEGER,
    "isOffline" BOOLEAN NOT NULL DEFAULT false,
    "clientEventId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_corrections" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "date" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "targetTimeEntryId" TEXT,
    "proposedAt" TIMESTAMP(3),
    "proposedKind" "ClockKind",
    "reason" TEXT NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_attendances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "date" DATE NOT NULL,
    "scheduleId" TEXT,
    "firstIn" TIMESTAMP(3),
    "lastOut" TIMESTAMP(3),
    "workedMinutes" INTEGER NOT NULL DEFAULT 0,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "nightMinutes" INTEGER NOT NULL DEFAULT 0,
    "sundayMinutes" INTEGER NOT NULL DEFAULT 0,
    "holidayMinutes" INTEGER NOT NULL DEFAULT 0,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyLeaveMinutes" INTEGER NOT NULL DEFAULT 0,
    "anomalies" TEXT[],
    "status" "AttendanceStatus" NOT NULL DEFAULT 'OK',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheets" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totals" JSONB NOT NULL,
    "status" "TimesheetStatus" NOT NULL DEFAULT 'OPEN',
    "managerApprovedById" TEXT,
    "managerApprovedAt" TIMESTAMP(3),
    "payrollApprovedById" TEXT,
    "payrollApprovedAt" TIMESTAMP(3),
    "payrollExportId" TEXT,
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT true,
    "deductsBalance" BOOLEAN NOT NULL DEFAULT true,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "leaveTypeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "entitledDays" DECIMAL(6,2) NOT NULL,
    "takenDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "plannedDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "carriedOverDays" DECIMAL(6,2) NOT NULL DEFAULT 0,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "leaveTypeId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "startHalf" TEXT,
    "endHalf" TEXT,
    "days" DECIMAL(6,2) NOT NULL,
    "comment" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "type" "AbsenceType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateKey" TEXT,
    "certificateReceivedAt" TIMESTAMP(3),
    "incidentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_holidays" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "label" TEXT NOT NULL,
    "isReplacement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "public_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_exports" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'DRAFT',
    "fileKey" TEXT,
    "checksum" TEXT,
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "generatedById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "gtin" TEXT,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketingName" TEXT,
    "description" TEXT,
    "range" "ProductRange" NOT NULL,
    "season" "Season" NOT NULL DEFAULT 'PERMANENT',
    "cocoaPercent" DECIMAL(5,2),
    "netWeightG" INTEGER NOT NULL,
    "shelfLifeDays" INTEGER NOT NULL,
    "storageConditions" TEXT NOT NULL DEFAULT 'Conserver au sec entre 15 et 18 °C',
    "nutrition" JSONB NOT NULL,
    "ingredientsText" JSONB NOT NULL,
    "claims" TEXT[],
    "images" TEXT[],
    "translations" JSONB NOT NULL DEFAULT '{}',
    "status" "ProductStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergens" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "labels" JSONB NOT NULL,

    CONSTRAINT "allergens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_allergens" (
    "productId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "presence" "AllergenPresence" NOT NULL,

    CONSTRAINT "product_allergens_pkey" PRIMARY KEY ("productId","allergenId")
);

-- CreateTable
CREATE TABLE "item_allergens" (
    "itemId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "presence" "AllergenPresence" NOT NULL,

    CONSTRAINT "item_allergens_pkey" PRIMARY KEY ("itemId","allergenId")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT,
    "version" INTEGER NOT NULL,
    "status" "RecipeStatus" NOT NULL DEFAULT 'DRAFT',
    "yieldKg" DECIMAL(14,3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "supersedesId" TEXT,
    "qualityApprovedById" TEXT,
    "qualityApprovedAt" TIMESTAMP(3),
    "productionApprovedById" TEXT,
    "productionApprovedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_lines" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "uom" "Uom" NOT NULL,
    "lossPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "phase" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "recipe_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "operation" "Operation" NOT NULL,
    "machineType" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "targetParams" JSONB NOT NULL,
    "isCcp" BOOLEAN NOT NULL DEFAULT false,
    "ccpCode" TEXT,
    "instructions" TEXT,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "siteId" TEXT,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "source" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "buildingId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "nominalRateKgH" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "worldX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worldZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "lineId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "serial" TEXT,
    "installedAt" TIMESTAMP(3),
    "status" "MachineStatus" NOT NULL DEFAULT 'IDLE',
    "criticality" TEXT NOT NULL DEFAULT 'B',
    "meterHours" INTEGER NOT NULL DEFAULT 0,
    "meterCycles" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "iotTopic" TEXT,
    "worldX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worldZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_plans" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "lineId" TEXT,
    "planId" TEXT,
    "productId" TEXT,
    "recipeId" TEXT NOT NULL,
    "recipeVersion" INTEGER NOT NULL,
    "kind" "ProductionOrderKind" NOT NULL DEFAULT 'STANDARD',
    "plannedQtyKg" DECIMAL(14,3) NOT NULL,
    "producedQtyKg" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "scrapQtyKg" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "plannedStart" TIMESTAMP(3) NOT NULL,
    "plannedEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "status" "ProductionOrderStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "salesOrderId" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_steps" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "sequence" INTEGER NOT NULL,
    "operation" "Operation" NOT NULL,
    "machineId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "operatorEmployeeIds" TEXT[],
    "measuredParams" JSONB NOT NULL DEFAULT '{}',
    "qtyInKg" DECIMAL(14,3),
    "qtyOutKg" DECIMAL(14,3),
    "comment" TEXT,

    CONSTRAINT "production_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "orderId" TEXT,
    "kind" "BatchKind" NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "producedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "bestBefore" DATE,
    "status" "BatchStatus" NOT NULL DEFAULT 'QUARANTINE',
    "supplierId" TEXT,
    "supplierLotCode" TEXT,
    "goodsReceiptLineId" TEXT,
    "origin" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_genealogy" (
    "id" TEXT NOT NULL,
    "parentBatchId" TEXT NOT NULL,
    "childBatchId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "batch_genealogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downtimes" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "machineId" TEXT,
    "lineId" TEXT,
    "orderId" TEXT,
    "category" "DowntimeCategory" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "reason" TEXT,
    "declaredByEmployeeId" TEXT,
    "workOrderId" TEXT,

    CONSTRAINT "downtimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oee_snapshots" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "shift" TEXT NOT NULL,
    "plannedMinutes" INTEGER NOT NULL,
    "runMinutes" INTEGER NOT NULL,
    "goodQtyKg" DECIMAL(14,3) NOT NULL,
    "totalQtyKg" DECIMAL(14,3) NOT NULL,
    "availability" DECIMAL(5,4) NOT NULL,
    "performance" DECIMAL(5,4) NOT NULL,
    "quality" DECIMAL(5,4) NOT NULL,
    "oee" DECIMAL(5,4) NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oee_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haccp_plans" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scope" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reviewDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "haccp_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haccp_ccps" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hazard" TEXT NOT NULL,
    "criticalLimits" JSONB NOT NULL,
    "monitoring" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "correctiveAction" TEXT NOT NULL,
    "operation" "Operation",

    CONSTRAINT "haccp_ccps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_checks" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "kind" "CheckKind" NOT NULL,
    "ccpId" TEXT,
    "batchId" TEXT,
    "orderId" TEXT,
    "machineId" TEXT,
    "goodsReceiptId" TEXT,
    "performedByEmployeeId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "values" JSONB NOT NULL,
    "result" "CheckResult" NOT NULL,
    "comment" TEXT,
    "attachments" TEXT[],
    "nonConformityId" TEXT,

    CONSTRAINT "quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "non_conformities" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "severity" "NcSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "batchId" TEXT,
    "supplierId" TEXT,
    "customerId" TEXT,
    "productId" TEXT,
    "reportedByEmployeeId" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "rootCause" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,

    CONSTRAINT "non_conformities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capas" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "nonConformityId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerEmployeeId" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "effectivenessCheck" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_analyses" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "batchId" TEXT,
    "sampleCode" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "lab" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultAt" TIMESTAMP(3),
    "results" JSONB,
    "conclusion" "CheckResult",
    "documentKey" TEXT,

    CONSTRAINT "lab_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_releases" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "decision" "ReleaseDecision" NOT NULL,
    "checklist" JSONB NOT NULL,
    "comment" TEXT,
    "decidedById" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recalls" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" "NcSeverity" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "authorityNotifiedAt" TIMESTAMP(3),
    "openedById" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customersNotified" JSONB NOT NULL DEFAULT '[]',
    "recoveredQty" DECIMAL(14,3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "recalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recall_batches" (
    "recallId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,

    CONSTRAINT "recall_batches_pkey" PRIMARY KEY ("recallId","batchId")
);

-- CreateTable
CREATE TABLE "quality_certifications" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "scheme" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" DATE NOT NULL,
    "validUntil" DATE NOT NULL,
    "certificationBody" TEXT NOT NULL,
    "grade" TEXT,
    "documentKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VALID',

    CONSTRAINT "quality_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT,
    "consumerContact" JSONB,
    "channel" TEXT NOT NULL,
    "productId" TEXT,
    "batchCode" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdByEmployeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "nonConformityId" TEXT,
    "response" TEXT,
    "compensation" TEXT,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "category" TEXT NOT NULL,
    "baseUom" "Uom" NOT NULL,
    "purchaseUom" "Uom",
    "conversionFactor" DECIMAL(14,6) NOT NULL DEFAULT 1,
    "isLotTracked" BOOLEAN NOT NULL DEFAULT true,
    "isExpiryTracked" BOOLEAN NOT NULL DEFAULT true,
    "shelfLifeDays" INTEGER,
    "storageConditions" TEXT,
    "minStock" DECIMAL(14,3),
    "maxStock" DECIMAL(14,3),
    "reorderPoint" DECIMAL(14,3),
    "standardCost" DECIMAL(14,4),
    "defaultLocationId" TEXT,
    "defaultSupplierId" TEXT,
    "palletization" JSONB,
    "originCountry" TEXT,
    "hsCode" TEXT,
    "eudrRelevant" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "buildingId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "WarehouseKind" NOT NULL,
    "temperatureMin" DECIMAL(5,2),
    "temperatureMax" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "capacityPallets" INTEGER,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "worldX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worldY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worldZ" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_lots" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "lotKey" TEXT NOT NULL DEFAULT 'NO_LOT',
    "locationId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "reservedQty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" "Uom" NOT NULL,
    "status" "StockStatus" NOT NULL DEFAULT 'AVAILABLE',
    "bestBefore" DATE,
    "unitCost" DECIMAL(14,4),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "type" "MovementType" NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "unitCost" DECIMAL(14,4),
    "reason" TEXT,
    "createdByEmployeeId" TEXT,
    "deviceId" TEXT,
    "reversalOfId" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_counts" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "countedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "varianceValue" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_lines" (
    "id" TEXT NOT NULL,
    "countId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "locationId" TEXT NOT NULL,
    "expectedQty" DECIMAL(14,3) NOT NULL,
    "countedQty" DECIMAL(14,3),
    "varianceQty" DECIMAL(14,3),
    "countedAt" TIMESTAMP(3),
    "recount" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inventory_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "toSiteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_lines" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "receivedQty" DECIMAL(14,3),

    CONSTRAINT "stock_transfer_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_readings" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "deviceId" TEXT,
    "warehouseId" TEXT,
    "zoneId" TEXT,
    "at" TIMESTAMP(3) NOT NULL,
    "temperatureC" DECIMAL(5,2) NOT NULL,
    "humidityPct" DECIMAL(5,2),
    "alert" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "environment_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serial" TEXT,
    "status" "ToolStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "locationId" TEXT,
    "requiresCalibration" BOOLEAN NOT NULL DEFAULT false,
    "calibrationIntervalDays" INTEGER,
    "nextCalibrationAt" TIMESTAMP(3),
    "requiredTrainingType" "TrainingType",
    "productId" TEXT,
    "cavityCount" INTEGER,
    "cycles" INTEGER NOT NULL DEFAULT 0,
    "maxCycles" INTEGER,
    "rfidTag" TEXT,
    "qrCode" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "value" DECIMAL(14,2),
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_loans" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "conditionOut" TEXT NOT NULL DEFAULT 'GOOD',
    "conditionIn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ON_LOAN',
    "deviceId" TEXT,
    "issuedById" TEXT,
    "workOrderId" TEXT,

    CONSTRAINT "tool_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibrations" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "toolId" TEXT,
    "machineId" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "performedBy" TEXT NOT NULL,
    "provider" TEXT,
    "result" TEXT NOT NULL,
    "measurements" JSONB,
    "certificateKey" TEXT,
    "nextDueAt" TIMESTAMP(3),

    CONSTRAINT "calibrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppe_issues" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "itemId" TEXT NOT NULL,
    "size" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "signatureKey" TEXT,

    CONSTRAINT "ppe_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plans" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "intervalDays" INTEGER,
    "intervalHours" INTEGER,
    "intervalCycles" INTEGER,
    "lastDoneAt" TIMESTAMP(3),
    "nextDueAt" TIMESTAMP(3),
    "tasks" JSONB NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "requiredSkills" TEXT[],
    "requiresShutdown" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "maintenance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "teamId" TEXT,
    "machineId" TEXT,
    "toolId" TEXT,
    "planId" TEXT,
    "kind" "WorkOrderKind" NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'P3',
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requestedByEmployeeId" TEXT,
    "assignedToEmployeeId" TEXT,
    "contractorUserId" TEXT,
    "plannedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "downtimeMinutes" INTEGER,
    "laborMinutes" INTEGER,
    "partsCost" DECIMAL(14,2),
    "cause" TEXT,
    "actionTaken" TEXT,
    "requiresHygieneClearance" BOOLEAN NOT NULL DEFAULT false,
    "hygieneClearedById" TEXT,
    "hygieneClearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vatNumber" TEXT,
    "country" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "SupplierStatus" NOT NULL DEFAULT 'PROSPECT',
    "qualityRating" INTEGER,
    "deliveryRating" INTEGER,
    "riskLevel" TEXT NOT NULL DEFAULT 'STANDARD',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "contacts" JSONB NOT NULL DEFAULT '[]',
    "address" JSONB NOT NULL,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "incoterm" TEXT,
    "peppolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_bank_accounts" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "ibanEnc" TEXT NOT NULL,
    "ibanLast4" TEXT NOT NULL,
    "bic" TEXT,
    "holderName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "callbackPhone" TEXT,
    "callbackVerifiedAt" TIMESTAMP(3),
    "callbackVerifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "due_diligences" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "itemId" TEXT,
    "reference" TEXT,
    "commodity" TEXT NOT NULL DEFAULT 'COCOA',
    "countryOfProduction" TEXT NOT NULL,
    "plots" JSONB NOT NULL,
    "riskAssessment" TEXT NOT NULL,
    "mitigation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "due_diligences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_contracts" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "itemId" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalQty" DECIMAL(14,3),
    "uom" "Uom",
    "price" DECIMAL(14,4),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "priceFormula" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "documentKey" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "requestedByEmployeeId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "estimatedAmount" DECIMAL(14,2),
    "neededBy" DATE,
    "justification" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "purchaseOrderId" TEXT,
    "buyerComment" TEXT,
    "approvalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "buyerEmployeeId" TEXT NOT NULL,
    "contractId" TEXT,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" DATE,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "totalExclVat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalVat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "incoterm" TEXT,
    "deliveryAddress" JSONB,
    "notes" TEXT,
    "approvalId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL,
    "receivedQty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "expectedDate" DATE,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "supplierId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedByEmployeeId" TEXT NOT NULL,
    "deliveryNote" TEXT,
    "carrier" TEXT,
    "truckTemperatureC" DECIMAL(5,2),
    "truckCleanOk" BOOLEAN,
    "sealIntact" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_lines" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "poLineId" TEXT,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "supplierLotCode" TEXT,
    "bestBefore" DATE,
    "batchId" TEXT,
    "locationId" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT true,
    "rejectionReason" TEXT,

    CONSTRAINT "goods_receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "siteId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "totalExclVat" DECIMAL(14,2) NOT NULL,
    "totalVat" DECIMAL(14,2) NOT NULL,
    "totalInclVat" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "purchaseOrderId" TEXT,
    "matchStatus" TEXT NOT NULL DEFAULT 'UNMATCHED',
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "peppolDocumentId" TEXT,
    "fileKey" TEXT,
    "approvedById" TEXT,
    "journalEntryId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" "CustomerSegment" NOT NULL,
    "vatNumber" TEXT,
    "peppolId" TEXT,
    "accountManagerEmployeeId" TEXT,
    "billingAddress" JSONB NOT NULL,
    "deliveryAddresses" JSONB NOT NULL DEFAULT '[]',
    "deliveryContact" TEXT,
    "deliveryInstructions" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BE',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "creditLimit" DECIMAL(14,2),
    "creditStatus" TEXT NOT NULL DEFAULT 'OK',
    "priceListId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "worldX" DOUBLE PRECISION,
    "worldZ" DOUBLE PRECISION,
    "buildingStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "ownerEmployeeId" TEXT,
    "company" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "segment" "CustomerSegment" NOT NULL,
    "source" TEXT NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'TO_CALL',
    "score" INTEGER NOT NULL DEFAULT 0,
    "lastContactAt" TIMESTAMP(3),
    "nextActionAt" TIMESTAMP(3),
    "notes" TEXT,
    "convertedCustomerId" TEXT,
    "objectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "ownerEmployeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "amount" DECIMAL(14,2),
    "probability" INTEGER NOT NULL DEFAULT 20,
    "expectedCloseDate" DATE,
    "lostReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "ownerEmployeeId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "opportunityId" TEXT,
    "subject" TEXT NOT NULL,
    "outcome" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER,
    "notes" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "segment" "CustomerSegment",
    "validFrom" DATE NOT NULL,
    "validTo" DATE,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_lines" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "minQty" DECIMAL(14,3) NOT NULL DEFAULT 1,
    "uom" "Uom" NOT NULL DEFAULT 'PIECE',

    CONSTRAINT "price_list_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "productIds" TEXT[],
    "segments" TEXT[],
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "ownerEmployeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "leadId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "validUntil" DATE NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalExclVat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalVat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "approvalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_lines" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "quote_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesRepEmployeeId" TEXT,
    "shippingSiteId" TEXT NOT NULL,
    "quoteId" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'B2B',
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedDeliveryDate" DATE,
    "promisedDate" DATE,
    "totalExclVat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalVat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "incoterm" TEXT,
    "deliveryAddress" JSONB,
    "ediReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_lines" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" "Uom" NOT NULL DEFAULT 'PIECE',
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2) NOT NULL,
    "reservedQty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "shippedQty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "batchAllocations" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "sales_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesRepEmployeeId" TEXT,
    "salesOrderId" TEXT,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "totalExclVat" DECIMAL(14,2) NOT NULL,
    "totalVat" DECIMAL(14,2) NOT NULL,
    "totalInclVat" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "peppolStatus" "PeppolStatus" NOT NULL DEFAULT 'TO_SEND',
    "peppolMessageId" TEXT,
    "structuredCommunication" TEXT,
    "journalEntryId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL,
    "totalExclVat" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "totalExclVat" DECIMAL(14,2) NOT NULL,
    "totalVat" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "peppolStatus" "PeppolStatus" NOT NULL DEFAULT 'TO_SEND',
    "approvalId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "openingHours" JSONB NOT NULL,
    "registerCount" INTEGER NOT NULL DEFAULT 1,
    "clickAndCollect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_sessions" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "cashierEmployeeId" TEXT NOT NULL,
    "registerCode" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingFloat" DECIMAL(14,2) NOT NULL,
    "closingCount" DECIMAL(14,2),
    "expectedCash" DECIMAL(14,2),
    "variance" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "validatedById" TEXT,

    CONSTRAINT "pos_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_sales" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cashierEmployeeId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalInclVat" DECIMAL(14,2) NOT NULL,
    "totalVat" DECIMAL(14,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "loyaltyMemberId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "voidReason" TEXT,
    "voidApprovedById" TEXT,
    "receiptNumber" TEXT NOT NULL,
    "fiscalSignature" TEXT,

    CONSTRAINT "pos_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_sale_lines" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "pos_sale_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_members" (
    "id" TEXT NOT NULL,
    "homeSiteId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthMonth" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "marketingConsentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "loyalty_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picking_lists" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "transferId" TEXT,
    "assignedToEmployeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TO_PICK',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "picking_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picking_lines" (
    "id" TEXT NOT NULL,
    "pickingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "fromLocationId" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "pickedQty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "pickedAt" TIMESTAMP(3),
    "scanConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "picking_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "contact" JSONB NOT NULL DEFAULT '{}',
    "trackingUrlTemplate" TEXT,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "carrierId" TEXT,
    "routeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TO_SHIP',
    "pallets" INTEGER NOT NULL DEFAULT 0,
    "parcels" INTEGER NOT NULL DEFAULT 0,
    "weightKg" DECIMAL(14,3),
    "tempControlled" BOOLEAN NOT NULL DEFAULT true,
    "trackingNumber" TEXT,
    "sscc" TEXT[],
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_routes" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "driverEmployeeId" TEXT,
    "vehicleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "stops" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "distanceKm" DECIMAL(10,2),

    CONSTRAINT "delivery_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "assignedEmployeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "nextServiceAt" TIMESTAMP(3),
    "inspectionDueAt" TIMESTAMP(3),
    "insuranceUntil" TIMESTAMP(3),
    "telematicsId" TEXT,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proofs_of_delivery" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "driverEmployeeId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientName" TEXT NOT NULL,
    "signatureKey" TEXT,
    "photoKeys" TEXT[],
    "temperatureC" DECIMAL(5,2),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "reservations" TEXT,
    "comment" TEXT,

    CONSTRAINT "proofs_of_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "period" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdById" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "costCenter" TEXT,
    "analytics" JSONB,
    "vatCode" TEXT,
    "partnerType" TEXT,
    "partnerId" TEXT,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "valueDate" DATE NOT NULL,
    "counterpartyName" TEXT NOT NULL,
    "ibanLast4" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PREPARED',
    "batchRef" TEXT,
    "invoiceId" TEXT,
    "supplierInvoiceId" TEXT,
    "approvalId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "departmentId" TEXT,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "consumed" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_sheets" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "recipeVersion" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "materialCost" DECIMAL(14,4) NOT NULL,
    "packagingCost" DECIMAL(14,4) NOT NULL,
    "laborCost" DECIMAL(14,4) NOT NULL,
    "energyCost" DECIMAL(14,4) NOT NULL,
    "overheadCost" DECIMAL(14,4) NOT NULL,
    "totalCostPerKg" DECIMAL(14,4) NOT NULL,
    "totalCostPerUnit" DECIMAL(14,4) NOT NULL,
    "assumptions" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "acquisitionDate" DATE NOT NULL,
    "acquisitionValue" DECIMAL(14,2) NOT NULL,
    "depreciationYears" INTEGER NOT NULL,
    "netBookValue" DECIMAL(14,2) NOT NULL,
    "machineId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_reports" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lines" JSONB NOT NULL DEFAULT '[]',
    "approvalId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "reportedByEmployeeId" TEXT NOT NULL,
    "victimEmployeeId" TEXT,
    "kind" "IncidentKind" NOT NULL,
    "severity" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "zoneId" TEXT,
    "machineId" TEXT,
    "description" TEXT NOT NULL,
    "immediateActions" TEXT,
    "witnesses" JSONB NOT NULL DEFAULT '[]',
    "photos" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DECLARED',
    "insurerDeclaredAt" TIMESTAMP(3),
    "rootCause" TEXT,
    "lostDays" INTEGER,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "zoneId" TEXT,
    "machineId" TEXT,
    "positionId" TEXT,
    "title" TEXT NOT NULL,
    "hazards" JSONB NOT NULL,
    "measures" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permits" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "requestedByEmployeeId" TEXT,
    "contractorUserId" TEXT,
    "workOrderId" TEXT,
    "machineId" TEXT,
    "zoneId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "precautions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "approvedById" TEXT,
    "closedById" TEXT,
    "fireWatchUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_metrics" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "meterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environmental_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" JSONB NOT NULL DEFAULT '{}',
    "priority" TEXT NOT NULL DEFAULT 'INFO',
    "requiresAck" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "authorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_acks" (
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_acks_pkey" PRIMARY KEY ("announcementId","userId")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "departmentId" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'RESTRICTED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "tags" TEXT[],
    "reviewDueAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeEmployeeId" TEXT,
    "teamId" TEXT,
    "creatorUserId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "policy" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "requesterEmployeeId" TEXT,
    "amount" DECIMAL(14,2),
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "steps" JSONB NOT NULL,
    "siteId" TEXT,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_decisions" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "deciderUserId" TEXT NOT NULL,
    "onBehalfOfUserId" TEXT,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_templates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "roleKeys" TEXT[],
    "cadence" "QuestCadence" NOT NULL,
    "objective" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "employeeId" TEXT NOT NULL,
    "teamId" TEXT,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "reason" TEXT NOT NULL,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "condition" JSONB NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_achievements" (
    "employeeId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_achievements_pkey" PRIMARY KEY ("employeeId","achievementId")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "title" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "roleKeys" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'MANAGEMENT',
    "definition" JSONB NOT NULL,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_vatNumber_key" ON "companies"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "companies_kboNumber_key" ON "companies"("kboNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_siteId_code_key" ON "buildings"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_siteId_code_key" ON "departments"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "teams_siteId_code_key" ON "teams"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "positions_companyId_code_key" ON "positions"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_credentialId_key" ON "webauthn_credentials"("credentialId");

-- CreateIndex
CREATE INDEX "role_assignments_userId_idx" ON "role_assignments"("userId");

-- CreateIndex
CREATE INDEX "role_assignments_role_idx" ON "role_assignments"("role");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serial_key" ON "devices"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_prefix_key" ON "api_keys"("prefix");

-- CreateIndex
CREATE INDEX "audit_logs_subject_subjectId_idx" ON "audit_logs"("subject", "subjectId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_at_idx" ON "audit_logs"("actorId", "at");

-- CreateIndex
CREATE INDEX "audit_logs_at_idx" ON "audit_logs"("at");

-- CreateIndex
CREATE UNIQUE INDEX "settings_companyId_key_key" ON "settings"("companyId", "key");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");

-- CreateIndex
CREATE INDEX "employees_siteId_departmentId_teamId_idx" ON "employees"("siteId", "departmentId", "teamId");

-- CreateIndex
CREATE INDEX "employees_lastName_firstName_idx" ON "employees"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "employee_payroll_employeeId_key" ON "employee_payroll"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_medical_employeeId_key" ON "employee_medical"("employeeId");

-- CreateIndex
CREATE INDEX "contracts_employeeId_idx" ON "contracts"("employeeId");

-- CreateIndex
CREATE INDEX "trainings_employeeId_type_idx" ON "trainings"("employeeId", "type");

-- CreateIndex
CREATE INDEX "trainings_validUntil_idx" ON "trainings"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "badges_uidHash_key" ON "badges"("uidHash");

-- CreateIndex
CREATE INDEX "badges_holderEmployeeId_idx" ON "badges"("holderEmployeeId");

-- CreateIndex
CREATE UNIQUE INDEX "access_zones_siteId_code_key" ON "access_zones"("siteId", "code");

-- CreateIndex
CREATE INDEX "access_events_siteId_at_idx" ON "access_events"("siteId", "at");

-- CreateIndex
CREATE INDEX "access_events_employeeId_at_idx" ON "access_events"("employeeId", "at");

-- CreateIndex
CREATE INDEX "access_events_zoneId_at_idx" ON "access_events"("zoneId", "at");

-- CreateIndex
CREATE INDEX "visitors_siteId_expectedAt_idx" ON "visitors"("siteId", "expectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "shift_patterns_siteId_code_key" ON "shift_patterns"("siteId", "code");

-- CreateIndex
CREATE INDEX "schedules_siteId_date_idx" ON "schedules"("siteId", "date");

-- CreateIndex
CREATE INDEX "schedules_teamId_date_idx" ON "schedules"("teamId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_employeeId_plannedStart_key" ON "schedules"("employeeId", "plannedStart");

-- CreateIndex
CREATE UNIQUE INDEX "time_entries_clientEventId_key" ON "time_entries"("clientEventId");

-- CreateIndex
CREATE INDEX "time_entries_employeeId_at_idx" ON "time_entries"("employeeId", "at");

-- CreateIndex
CREATE INDEX "time_entries_siteId_at_idx" ON "time_entries"("siteId", "at");

-- CreateIndex
CREATE INDEX "time_entries_teamId_at_idx" ON "time_entries"("teamId", "at");

-- CreateIndex
CREATE INDEX "time_corrections_teamId_status_idx" ON "time_corrections"("teamId", "status");

-- CreateIndex
CREATE INDEX "daily_attendances_siteId_date_idx" ON "daily_attendances"("siteId", "date");

-- CreateIndex
CREATE INDEX "daily_attendances_teamId_date_status_idx" ON "daily_attendances"("teamId", "date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_attendances_employeeId_date_key" ON "daily_attendances"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_employeeId_periodStart_key" ON "timesheets"("employeeId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_companyId_code_key" ON "leave_types"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_leaveTypeId_year_key" ON "leave_balances"("employeeId", "leaveTypeId", "year");

-- CreateIndex
CREATE INDEX "leave_requests_teamId_status_idx" ON "leave_requests"("teamId", "status");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_startDate_idx" ON "leave_requests"("employeeId", "startDate");

-- CreateIndex
CREATE INDEX "absences_teamId_startDate_idx" ON "absences"("teamId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "public_holidays_companyId_date_key" ON "public_holidays"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_gtin_key" ON "products"("gtin");

-- CreateIndex
CREATE UNIQUE INDEX "products_itemId_key" ON "products"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "allergens_code_key" ON "allergens"("code");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_code_version_key" ON "recipes"("code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_steps_recipeId_sequence_key" ON "recipe_steps"("recipeId", "sequence");

-- CreateIndex
CREATE INDEX "demand_forecasts_productId_periodStart_idx" ON "demand_forecasts"("productId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "production_lines_siteId_code_key" ON "production_lines"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "machines_siteId_code_key" ON "machines"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_number_key" ON "production_orders"("number");

-- CreateIndex
CREATE INDEX "production_orders_siteId_status_plannedStart_idx" ON "production_orders"("siteId", "status", "plannedStart");

-- CreateIndex
CREATE INDEX "production_orders_teamId_status_idx" ON "production_orders"("teamId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "production_steps_orderId_sequence_key" ON "production_steps"("orderId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "batches_code_key" ON "batches"("code");

-- CreateIndex
CREATE INDEX "batches_itemId_status_idx" ON "batches"("itemId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "batch_genealogy_parentBatchId_childBatchId_key" ON "batch_genealogy"("parentBatchId", "childBatchId");

-- CreateIndex
CREATE INDEX "downtimes_siteId_startedAt_idx" ON "downtimes"("siteId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "oee_snapshots_lineId_date_shift_key" ON "oee_snapshots"("lineId", "date", "shift");

-- CreateIndex
CREATE UNIQUE INDEX "haccp_plans_siteId_version_key" ON "haccp_plans"("siteId", "version");

-- CreateIndex
CREATE INDEX "quality_checks_siteId_performedAt_idx" ON "quality_checks"("siteId", "performedAt");

-- CreateIndex
CREATE INDEX "quality_checks_batchId_idx" ON "quality_checks"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "non_conformities_number_key" ON "non_conformities"("number");

-- CreateIndex
CREATE INDEX "non_conformities_siteId_status_idx" ON "non_conformities"("siteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lab_analyses_sampleCode_key" ON "lab_analyses"("sampleCode");

-- CreateIndex
CREATE INDEX "batch_releases_batchId_decidedAt_idx" ON "batch_releases"("batchId", "decidedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recalls_number_key" ON "recalls"("number");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_number_key" ON "complaints"("number");

-- CreateIndex
CREATE UNIQUE INDEX "items_sku_key" ON "items"("sku");

-- CreateIndex
CREATE INDEX "items_type_category_idx" ON "items"("type", "category");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_siteId_code_key" ON "warehouses"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON "locations"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "stock_lots_siteId_itemId_idx" ON "stock_lots"("siteId", "itemId");

-- CreateIndex
CREATE INDEX "stock_lots_bestBefore_idx" ON "stock_lots"("bestBefore");

-- CreateIndex
CREATE UNIQUE INDEX "stock_lots_itemId_locationId_lotKey_key" ON "stock_lots"("itemId", "locationId", "lotKey");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_reversalOfId_key" ON "stock_movements"("reversalOfId");

-- CreateIndex
CREATE INDEX "stock_movements_siteId_at_idx" ON "stock_movements"("siteId", "at");

-- CreateIndex
CREATE INDEX "stock_movements_itemId_at_idx" ON "stock_movements"("itemId", "at");

-- CreateIndex
CREATE INDEX "stock_movements_batchId_idx" ON "stock_movements"("batchId");

-- CreateIndex
CREATE INDEX "stock_movements_referenceType_referenceId_idx" ON "stock_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_number_key" ON "stock_transfers"("number");

-- CreateIndex
CREATE INDEX "environment_readings_siteId_at_idx" ON "environment_readings"("siteId", "at");

-- CreateIndex
CREATE INDEX "environment_readings_warehouseId_at_idx" ON "environment_readings"("warehouseId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "tools_code_key" ON "tools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tools_rfidTag_key" ON "tools"("rfidTag");

-- CreateIndex
CREATE UNIQUE INDEX "tools_qrCode_key" ON "tools"("qrCode");

-- CreateIndex
CREATE INDEX "tools_siteId_status_idx" ON "tools"("siteId", "status");

-- CreateIndex
CREATE INDEX "tool_loans_toolId_status_idx" ON "tool_loans"("toolId", "status");

-- CreateIndex
CREATE INDEX "tool_loans_employeeId_status_idx" ON "tool_loans"("employeeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_number_key" ON "work_orders"("number");

-- CreateIndex
CREATE INDEX "work_orders_siteId_status_priority_idx" ON "work_orders"("siteId", "status", "priority");

-- CreateIndex
CREATE INDEX "work_orders_assignedToEmployeeId_status_idx" ON "work_orders"("assignedToEmployeeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "due_diligences_reference_key" ON "due_diligences"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_contracts_number_key" ON "supplier_contracts"("number");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_number_key" ON "purchase_requests"("number");

-- CreateIndex
CREATE INDEX "purchase_requests_siteId_status_idx" ON "purchase_requests"("siteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_number_key" ON "purchase_orders"("number");

-- CreateIndex
CREATE INDEX "purchase_orders_siteId_status_idx" ON "purchase_orders"("siteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_number_key" ON "goods_receipts"("number");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_supplierId_invoiceNumber_key" ON "supplier_invoices"("supplierId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- CreateIndex
CREATE INDEX "leads_ownerEmployeeId_stage_idx" ON "leads"("ownerEmployeeId", "stage");

-- CreateIndex
CREATE INDEX "activities_ownerEmployeeId_at_idx" ON "activities"("ownerEmployeeId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_code_key" ON "price_lists"("code");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_lines_priceListId_productId_minQty_key" ON "price_list_lines"("priceListId", "productId", "minQty");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_number_key" ON "quotes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_number_key" ON "sales_orders"("number");

-- CreateIndex
CREATE INDEX "sales_orders_shippingSiteId_status_idx" ON "sales_orders"("shippingSiteId", "status");

-- CreateIndex
CREATE INDEX "sales_orders_salesRepEmployeeId_status_idx" ON "sales_orders"("salesRepEmployeeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_number_key" ON "credit_notes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "stores_siteId_key" ON "stores"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "pos_sales_number_key" ON "pos_sales"("number");

-- CreateIndex
CREATE INDEX "pos_sales_siteId_at_idx" ON "pos_sales"("siteId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_members_cardNumber_key" ON "loyalty_members"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "picking_lists_number_key" ON "picking_lists"("number");

-- CreateIndex
CREATE INDEX "picking_lists_siteId_status_idx" ON "picking_lists"("siteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_number_key" ON "shipments"("number");

-- CreateIndex
CREATE INDEX "delivery_routes_driverEmployeeId_date_idx" ON "delivery_routes"("driverEmployeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_companyId_code_key" ON "ledger_accounts"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_companyId_journal_number_key" ON "journal_entries"("companyId", "journal", "number");

-- CreateIndex
CREATE UNIQUE INDEX "cost_sheets_productId_period_method_key" ON "cost_sheets"("productId", "period", "method");

-- CreateIndex
CREATE UNIQUE INDEX "assets_code_key" ON "assets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "expense_reports_number_key" ON "expense_reports"("number");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_number_key" ON "incidents"("number");

-- CreateIndex
CREATE INDEX "incidents_siteId_occurredAt_idx" ON "incidents"("siteId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "work_permits_number_key" ON "work_permits"("number");

-- CreateIndex
CREATE UNIQUE INDEX "environmental_metrics_siteId_kind_period_key" ON "environmental_metrics"("siteId", "kind", "period");

-- CreateIndex
CREATE INDEX "tasks_assigneeEmployeeId_status_idx" ON "tasks"("assigneeEmployeeId", "status");

-- CreateIndex
CREATE INDEX "approval_requests_status_policy_idx" ON "approval_requests"("status", "policy");

-- CreateIndex
CREATE INDEX "approval_requests_subjectType_subjectId_idx" ON "approval_requests"("subjectType", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "quest_templates_code_key" ON "quest_templates"("code");

-- CreateIndex
CREATE INDEX "quests_employeeId_date_idx" ON "quests"("employeeId", "date");

-- CreateIndex
CREATE INDEX "xp_events_employeeId_at_idx" ON "xp_events"("employeeId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reports_code_key" ON "reports"("code");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_shiftPatternId_fkey" FOREIGN KEY ("shiftPatternId") REFERENCES "shift_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_accessZoneId_fkey" FOREIGN KEY ("accessZoneId") REFERENCES "access_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payroll" ADD CONSTRAINT "employee_payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_medical" ADD CONSTRAINT "employee_medical_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardings" ADD CONSTRAINT "onboardings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_holderEmployeeId_fkey" FOREIGN KEY ("holderEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_zones" ADD CONSTRAINT "access_zones_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_zones" ADD CONSTRAINT "access_zones_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_rules" ADD CONSTRAINT "access_rules_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "access_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_shiftPatternId_fkey" FOREIGN KEY ("shiftPatternId") REFERENCES "shift_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_corrections" ADD CONSTRAINT "time_corrections_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_attendances" ADD CONSTRAINT "daily_attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_payrollExportId_fkey" FOREIGN KEY ("payrollExportId") REFERENCES "payroll_exports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_holidays" ADD CONSTRAINT "public_holidays_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_allergens" ADD CONSTRAINT "product_allergens_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_allergens" ADD CONSTRAINT "product_allergens_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "allergens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_allergens" ADD CONSTRAINT "item_allergens_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_allergens" ADD CONSTRAINT "item_allergens_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "allergens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_lines" ADD CONSTRAINT "recipe_lines_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_lines" ADD CONSTRAINT "recipe_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "production_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "production_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_planId_fkey" FOREIGN KEY ("planId") REFERENCES "production_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_steps" ADD CONSTRAINT "production_steps_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_genealogy" ADD CONSTRAINT "batch_genealogy_parentBatchId_fkey" FOREIGN KEY ("parentBatchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_genealogy" ADD CONSTRAINT "batch_genealogy_childBatchId_fkey" FOREIGN KEY ("childBatchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downtimes" ADD CONSTRAINT "downtimes_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downtimes" ADD CONSTRAINT "downtimes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "production_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oee_snapshots" ADD CONSTRAINT "oee_snapshots_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "haccp_ccps" ADD CONSTRAINT "haccp_ccps_planId_fkey" FOREIGN KEY ("planId") REFERENCES "haccp_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_checks" ADD CONSTRAINT "quality_checks_ccpId_fkey" FOREIGN KEY ("ccpId") REFERENCES "haccp_ccps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capas" ADD CONSTRAINT "capas_nonConformityId_fkey" FOREIGN KEY ("nonConformityId") REFERENCES "non_conformities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_releases" ADD CONSTRAINT "batch_releases_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_batches" ADD CONSTRAINT "recall_batches_recallId_fkey" FOREIGN KEY ("recallId") REFERENCES "recalls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_batches" ADD CONSTRAINT "recall_batches_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lines" ADD CONSTRAINT "inventory_lines_countId_fkey" FOREIGN KEY ("countId") REFERENCES "inventory_counts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_lines" ADD CONSTRAINT "stock_transfer_lines_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_loans" ADD CONSTRAINT "tool_loans_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_loans" ADD CONSTRAINT "tool_loans_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppe_issues" ADD CONSTRAINT "ppe_issues_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plans" ADD CONSTRAINT "maintenance_plans_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_planId_fkey" FOREIGN KEY ("planId") REFERENCES "maintenance_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bank_accounts" ADD CONSTRAINT "supplier_bank_accounts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "due_diligences" ADD CONSTRAINT "due_diligences_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contracts" ADD CONSTRAINT "supplier_contracts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "supplier_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_lines" ADD CONSTRAINT "price_list_lines_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_lines" ADD CONSTRAINT "price_list_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_lines" ADD CONSTRAINT "quote_lines_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pos_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sale_lines" ADD CONSTRAINT "pos_sale_lines_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "pos_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picking_lines" ADD CONSTRAINT "picking_lines_pickingId_fkey" FOREIGN KEY ("pickingId") REFERENCES "picking_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "delivery_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proofs_of_delivery" ADD CONSTRAINT "proofs_of_delivery_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_sheets" ADD CONSTRAINT "cost_sheets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_acks" ADD CONSTRAINT "announcement_acks_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_templates" ADD CONSTRAINT "quest_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "quest_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_achievements" ADD CONSTRAINT "employee_achievements_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_achievements" ADD CONSTRAINT "employee_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
