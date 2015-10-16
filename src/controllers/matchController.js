import { match as matchModel } from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/matches' });
const bodyParser = koaBody();

import baseController from './baseController';
const base = baseController(matchModel);

// Get all matches
router.get('/', base.setJsonType, base.getAll);

// Get match
router.get('/:id', base.setJsonType, base.getById);

// Get match plays (in order)
router.get('/:id/plays', base.setJsonType, function * (next) {
	yield matchModel.getMatchPlays(parseInt(this.params.id, 10));

	yield next;
});

// Create match
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update match
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

export default router;
