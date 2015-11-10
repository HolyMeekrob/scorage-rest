import scorage from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/plays' });
const bodyParser = koaBody();

const playModel = scorage.play;

import baseController from './baseController';
const base = baseController(playModel);

// Get all plays
router.get('/', base.setJsonType, base.getAll);

// Get play
router.get('/:id', base.setJsonType, base.getById);

// Create game
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update game
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

// Delete game
router.delete('/:id', base.setJsonType, base.deleteById);

export default router;
