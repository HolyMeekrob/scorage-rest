import scorage from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/players' });
const bodyParser = koaBody();

const playerModel = scorage.player;

import baseController from './baseController';
const base = baseController(playerModel);

// Get all players
router.get('/', base.setJsonType, base.getAll);

// Get player
router.get('/:id', base.setJsonType, base.getById);

// Create player
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update player
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

export default router;
