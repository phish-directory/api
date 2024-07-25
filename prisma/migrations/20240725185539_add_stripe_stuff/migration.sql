-- Step 1: Add the column as nullable
ALTER TABLE
  "User"
ADD
  COLUMN "stripeCustomerId" TEXT;

-- Step 2: Update the column with incrementing IDs for existing records
WITH updated_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY
        id
    ) AS stripeCustomerId
  FROM
    "User"
)
UPDATE
  "User"
SET
  "stripeCustomerId" = updated_users.stripeCustomerId
FROM
  updated_users
WHERE
  "User".id = updated_users.id;

-- Step 3: Alter the column to be non-nullable
ALTER TABLE
  "User"
ALTER COLUMN
  "stripeCustomerId"
SET
  NOT NULL;
