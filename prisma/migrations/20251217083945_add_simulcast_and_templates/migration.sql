-- CreateTable
CREATE TABLE "StreamPlatform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streamId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "bitrate" INTEGER,
    "resolution" TEXT,
    "rtmpUrl" TEXT NOT NULL,
    "streamKey" TEXT,
    "protocol" TEXT NOT NULL DEFAULT 'RTMP',
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "connectedAt" DATETIME,
    "disconnectedAt" DATETIME,
    "platformConnectionId" TEXT,
    CONSTRAINT "StreamPlatform_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamPlatform_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "PlatformConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StreamTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "config" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "StreamTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StreamTemplateUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "streamId" TEXT,
    "userId" TEXT NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StreamTemplateUsage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StreamTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamTemplateUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stream" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rtmpKey" TEXT,
    "thumbnailUrl" TEXT,
    "isRecording" BOOLEAN NOT NULL DEFAULT false,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "brandColor" TEXT NOT NULL DEFAULT '#5c4dff',
    "showOverlay" BOOLEAN NOT NULL DEFAULT true,
    "userName" TEXT,
    "userTitle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Stream_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StreamTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Stream" ("brandColor", "createdAt", "description", "endedAt", "id", "isLive", "isRecording", "rtmpKey", "showOverlay", "startedAt", "status", "thumbnailUrl", "title", "type", "updatedAt", "userId", "userName", "userTitle", "viewerCount") SELECT "brandColor", "createdAt", "description", "endedAt", "id", "isLive", "isRecording", "rtmpKey", "showOverlay", "startedAt", "status", "thumbnailUrl", "title", "type", "updatedAt", "userId", "userName", "userTitle", "viewerCount" FROM "Stream";
DROP TABLE "Stream";
ALTER TABLE "new_Stream" RENAME TO "Stream";
CREATE UNIQUE INDEX "Stream_rtmpKey_key" ON "Stream"("rtmpKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StreamPlatform_streamId_idx" ON "StreamPlatform"("streamId");

-- CreateIndex
CREATE INDEX "StreamPlatform_platformId_idx" ON "StreamPlatform"("platformId");

-- CreateIndex
CREATE INDEX "StreamPlatform_status_idx" ON "StreamPlatform"("status");

-- CreateIndex
CREATE INDEX "StreamTemplate_category_idx" ON "StreamTemplate"("category");

-- CreateIndex
CREATE INDEX "StreamTemplate_isPublic_idx" ON "StreamTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "StreamTemplate_userId_idx" ON "StreamTemplate"("userId");

-- CreateIndex
CREATE INDEX "StreamTemplateUsage_templateId_idx" ON "StreamTemplateUsage"("templateId");

-- CreateIndex
CREATE INDEX "StreamTemplateUsage_userId_idx" ON "StreamTemplateUsage"("userId");

-- CreateIndex
CREATE INDEX "StreamTemplateUsage_usedAt_idx" ON "StreamTemplateUsage"("usedAt");
