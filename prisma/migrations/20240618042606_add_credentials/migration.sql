-- CreateTable
CREATE TABLE "Credential" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT,
    "externalId" TEXT NOT NULL,
    "publicKey" BLOB NOT NULL,
    "signCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_externalId_key" ON "Credential"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_publicKey_key" ON "Credential"("publicKey");

-- CreateIndex
CREATE INDEX "Credential_externalId_idx" ON "Credential"("externalId");
