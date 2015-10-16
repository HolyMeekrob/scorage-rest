import koa from 'koa';
const app = koa();

import routerBuilder from './src/router';
const router = routerBuilder(app);

router.registerRoutes();

app.listen(process.env.WEB_PORT);
