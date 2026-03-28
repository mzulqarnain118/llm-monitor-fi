import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { llmTracker } from './middleware/llmTracker';
import { metricsRouter } from './routes/metrics';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use(llmTracker());
app.use('/metrics', metricsRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected error';
  res.status(500).json({ error: message });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`LLM monitor backend listening on port ${port}`);
});
