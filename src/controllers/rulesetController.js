import { ruleset as rulesetModel } from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/rulesets' });
const bodyParser = koaBody();

import baseController from './baseController';
const base = baseController(rulesetModel);

// Get all rulesets
router.get('/', base.setJsonType, base.getAll);

// Get ruleset
router.get('/:id', base.setJsonType, base.getById);

// Get by game id
router.get('/game/:gameId', base.setJsonType, function* (next) {
	yield rulesetModel.getByGameId(parseInt(this.params.gameId, 10))
		.then((rulesets) => {
			this.body = rulesets;
		});

	yield next;
});

// Create ruleset
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update ruleset
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

export default router;
