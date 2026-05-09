import app from './app.js';
import { env } from './config/env.js';

console.log(`Env PORT - ${env.PORT}`);
console.log(`Env NODE_ENV - ${env.NODE_ENV}`);
console.log(`Env DATABASE_URL - ${env.DATABASE_URL}`);
console.log(`Env CORS_ORIGIN - ${env.CORS_ORIGIN}`);
console.log(`Env API_BASE_URL - ${env.API_BASE_URL}`);

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
