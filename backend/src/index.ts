import cors from "cors";
import express from "express";
import { getMigrationsAsync } from "./migrations/get-migrations-async";
import { pool } from "./pool";
import { createBitAsync } from "./bits/create-bit-async";
import { deleteBitAsync } from "./bits/delete-bit-async";
import { getBitAsync } from "./bits/get-bit-async";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "healthy",
      database: "connected",
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.get("/api/migration", async (req, res) => {
  try {
    const migrations = await getMigrationsAsync();
    res.json(migrations);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.post("/api/bit", async (req, res) => {
  try {
    const bit = await createBitAsync({});
    res.json(bit);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.get("/api/bit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const bit = await getBitAsync({ id });
    res.json(bit);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.delete("/api/bit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const bit = await deleteBitAsync({ id });
    res.json(bit);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
