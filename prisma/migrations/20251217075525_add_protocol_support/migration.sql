-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlatformConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "streamKey" TEXT,
    "rtmpUrl" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'RTMP',
    "server" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlatformConnection" ("createdAt", "followers", "id", "isActive", "metadata", "platform", "rtmpUrl", "streamKey", "updatedAt", "userId") SELECT "createdAt", "followers", "id", "isActive", "metadata", "platform", "rtmpUrl", "streamKey", "updatedAt", "userId" FROM "PlatformConnection";
DROP TABLE "PlatformConnection";
ALTER TABLE "new_PlatformConnection" RENAME TO "PlatformConnection";
CREATE INDEX "PlatformConnection_userId_idx" ON "PlatformConnection"("userId");
CREATE UNIQUE INDEX "PlatformConnection_userId_platform_key" ON "PlatformConnection"("userId", "platform");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
