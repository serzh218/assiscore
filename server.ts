import express from 'express';
import cors from 'cors';
import exportRouter from './server/routes/export';
import executeRouter from './server/routes/execute';
import logsRouter from './server/routes/logs';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/export', exportRouter);
app.use('/api/execute', executeRouter);
app.use('/api/logs', logsRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
