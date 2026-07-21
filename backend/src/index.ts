import express from "express";
import cors from "cors";
import "./db/index.js";
import transactionsRouter from "./routes/transactions.js";
import dividendsRouter from "./routes/dividends.js";
import holdingsRouter from "./routes/holdings.js";
import portfolioRouter from "./routes/portfolio.js";
import quotesRouter from "./routes/quotes.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/transactions", transactionsRouter);
app.use("/api/dividends", dividendsRouter);
app.use("/api/holdings", holdingsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/quotes", quotesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
