import scorage from 'scorage';
import db from 'scorage-postgres';

import koa from 'koa';
const app = koa();

scorage.registerDataStore(db);

import routerBuilder from './src/router';
const router = routerBuilder(app);

router.registerRoutes();

app.listen(process.env.WEB_PORT);

export default app;
