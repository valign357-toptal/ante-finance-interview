-- CreateTable
CREATE TABLE "Blockchain" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "chainId" VARCHAR(50) NOT NULL,
    "rpcEndpoint" VARCHAR(255) NOT NULL,
    "coingeckoPlatformId" VARCHAR(100) NOT NULL,
    "antePoolFactoryContractAddress" VARCHAR(42) NOT NULL,

    CONSTRAINT "Blockchain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "totalValueLockedInUsd" DECIMAL(20,2) NOT NULL,
    "blockchainId" UUID NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnteTest" (
    "id" UUID NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "totalValueLockedInUsd" DECIMAL(20,2) NOT NULL,
    "blockchainId" UUID NOT NULL,
    "protocolId" UUID NOT NULL,

    CONSTRAINT "AnteTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntePool" (
    "id" UUID NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "totalValueLockedInUsd" DECIMAL(20,2) NOT NULL,
    "blockchainId" UUID NOT NULL,
    "tokenId" UUID NOT NULL,
    "testId" UUID NOT NULL,

    CONSTRAINT "AntePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" UUID NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "priceInUsd" DOUBLE PRECISION NOT NULL,
    "blockchainId" UUID NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blockchain_name_key" ON "Blockchain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Blockchain_chainId_key" ON "Blockchain"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "Blockchain_rpcEndpoint_key" ON "Blockchain"("rpcEndpoint");

-- CreateIndex
CREATE UNIQUE INDEX "Blockchain_coingeckoPlatformId_key" ON "Blockchain"("coingeckoPlatformId");

-- CreateIndex
CREATE UNIQUE INDEX "Protocol_name_blockchainId_key" ON "Protocol"("name", "blockchainId");

-- CreateIndex
CREATE UNIQUE INDEX "AnteTest_contractAddress_blockchainId_key" ON "AnteTest"("contractAddress", "blockchainId");

-- CreateIndex
CREATE UNIQUE INDEX "AntePool_contractAddress_blockchainId_key" ON "AntePool"("contractAddress", "blockchainId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_contractAddress_blockchainId_key" ON "Token"("contractAddress", "blockchainId");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "Blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnteTest" ADD CONSTRAINT "AnteTest_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "Blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnteTest" ADD CONSTRAINT "AnteTest_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntePool" ADD CONSTRAINT "AntePool_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "Blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntePool" ADD CONSTRAINT "AntePool_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntePool" ADD CONSTRAINT "AntePool_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AnteTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_blockchainId_fkey" FOREIGN KEY ("blockchainId") REFERENCES "Blockchain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
