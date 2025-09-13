-- CreateTable
CREATE TABLE "public"."USER" (
    "id" SERIAL NOT NULL,
    "sub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "USER_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USER_sub_key" ON "public"."USER"("sub");

-- CreateIndex
CREATE UNIQUE INDEX "USER_email_key" ON "public"."USER"("email");
