import { promises as fs } from "fs";
import path from "path";
import { pool } from "../pool";
import { readdir } from "fs/promises";
import { join } from "path";
import { Pool } from "pg";

type Migration = {
  id?: string;
  name?: string;
  timestamp?: Date;
  sql?: string;
  file_name: string;
  applied_date: Date | null;
  order: number;
  should_apply: boolean;
  content?: string;
};

type MigrationFile = {
  id?: string;
  name?: string;
  sql?: string;
  fileName: string;
  content: string;
};

type ProcessMigrationParams = {
  fileName: string;
  content: string;
  shouldInsert: boolean;
};

type GetMigrationsParams = {
  pool?: Pool;
  migrationsDir?: string;
  isApplied?: boolean[];
  shouldApply?: boolean[];
  fileNames?: string[];
};

type TableColumn = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

export async function getMigrationsAsync(): Promise<MigrationFile[]> {
  await createMigrationsTableIfNeededAsync();

  const sqlMigrationFiles = await _getSqlMigrationFilesAsync();
  console.log({ sqlMigrationFiles });

  const migrationsFromDb = await _getMigrationsAsync();
  const migrationsFromDbCount = migrationsFromDb.length;

  const migrationNamesFromDbSet = new Set(
    migrationsFromDb.map((m) => m.file_name)
  );

  const migrationsToWrite = sqlMigrationFiles.filter(
    (migration) => !migrationNamesFromDbSet.has(migration.fileName)
  );

  if (
    sqlMigrationFiles.length - migrationsToWrite.length !==
    migrationsFromDbCount
  ) {
    throw new Error("Migrations table is out of sync with the SQL directory");
  }

  for (const migration of migrationsToWrite) {
    await _processMigrationAsync({
      fileName: migration.fileName,
      content: migration.content,
      shouldInsert: true,
    });
  }

  console.log(`Processed ${migrationsToWrite.length} new migrations`);

  const pendingMigrationsFromDb = (
    await _getMigrationsAsync({
      isApplied: [false],
      shouldApply: [true],
    })
  ).map(({ file_name, content }) => ({
    fileName: file_name,
    content: content || "",
    shouldInsert: false,
  }));

  for (const migration of pendingMigrationsFromDb) {
    await _applyMigrationAsync(migration);
  }

  console.log(`Processed ${migrationsToWrite.length} pending migrations`);
  return pendingMigrationsFromDb;
}

async function _processMigrationAsync({
  fileName,
  content,
  shouldInsert,
}: ProcessMigrationParams): Promise<void> {
  console.log(`Processing migration: ${fileName}`);
  await _applyMigrationAsync({ fileName, content });

  if (shouldInsert) {
    await _insertMigrationAsync(fileName);
  } else {
    await _updateAppliedTimeMigrationAsync(fileName);
  }
}

async function _insertMigrationAsync(fileName: string): Promise<void> {
  console.log(`Inserting migration: ${fileName}`);
  await pool.query(
    `
      INSERT INTO migrations (file_name)
      VALUES ($1);
    `,
    [fileName]
  );
}

async function _updateAppliedTimeMigrationAsync(
  fileName: string
): Promise<void> {
  console.log(`Updating applied time for migration: ${fileName}`);

  await pool.query(
    `
      UPDATE migrations
      SET applied_date = CURRENT_TIMESTAMP
      WHERE file_name = $1;
    `,
    [fileName]
  );
}

async function _applyMigrationAsync(migration: MigrationFile): Promise<void> {
  console.log(`Applying migration: ${migration.fileName}`);
  await pool.query(migration.content);
}

async function createMigrationsTableIfNeededAsync(): Promise<void> {
  let migrationsTables = await _getTableAsync("migrations");

  if (migrationsTables?.length) {
    console.info("Found migrations table");
  } else {
    console.info("Creating migrations table");
    await _createMigrationsTableAsync();
  }
}

async function _getTableAsync(tableName: string): Promise<TableColumn[]> {
  const query = `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    `;

  const result = await pool.query<TableColumn>(query, [tableName]);
  return result.rows;
}

async function _createMigrationsTableAsync(): Promise<void> {
  try {
    const sqlPath = path.join(
      __dirname,
      "sql",
      "00000-create-migrations-table.sql"
    );

    const sqlContent = await fs.readFile(sqlPath, "utf-8");
    await pool.query(sqlContent);
    console.log("Migrations table created successfully");
  } catch (err) {
    console.error("Error creating migrations table:", err);
    throw err;
  }
}

async function _getMigrationsAsync({
  isApplied = [],
  shouldApply = [],
  fileNames = [],
}: GetMigrationsParams = {}): Promise<Migration[]> {
  const hasNonNullAppliedDate = isApplied.includes(true)
    ? "applied_date IS NOT NULL"
    : "";

  const hasNullAppliedDate = isApplied.includes(false)
    ? "applied_date IS NULL"
    : "";

  const appliedDateCondition = [hasNonNullAppliedDate, hasNullAppliedDate]
    .filter(Boolean)
    .join(" OR ");

  const shouldApplyCondition =
    new Set(shouldApply).size === 1
      ? `should_apply = ${shouldApply[0] ? "true" : "false"}`
      : "";

  const fileNamesCondition = fileNames.length
    ? `file_name IN (${fileNames.map((name) => `'${name}'`).join(",")})`
    : "";

  const condition = [
    appliedDateCondition,
    shouldApplyCondition,
    fileNamesCondition,
  ]
    .filter(Boolean)
    .join(" AND ");

  const query = `
    SELECT
      file_name,
      applied_date,
      "order",
      should_apply
    FROM migrations
      ${condition ? `WHERE ${condition}` : ""}
    ORDER BY "order" ASC;
  `;

  console.log({ query });

  const result = await pool.query<Migration>(query);
  return result.rows;
}

async function _getSqlMigrationFilesAsync(): Promise<MigrationFile[]> {
  const sqlDirPath = path.join(__dirname, "sql");
  const files = await fs.readdir(sqlDirPath);

  // Only process .sql files and sort them by name
  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

  const migrations = await Promise.all(
    sqlFiles.map(async (fileName) => {
      const filePath = path.join(sqlDirPath, fileName);
      const content = await fs.readFile(filePath, "utf-8");

      return {
        fileName,
        content,
      };
    })
  );

  return migrations;
}
