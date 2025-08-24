import express from 'express';
import cors from 'cors';
import exportRouter from './server/routes/export';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/export', exportRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
