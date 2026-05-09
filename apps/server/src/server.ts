import app from './app.js';
import { env } from './config/env.js';

const PORT = process.env.PORT || 3000;

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
