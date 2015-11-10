import scorage from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/games' });
const bodyParser = koaBody();

const gameModel = scorage.game;

import baseController from './baseController';
const base = baseController(gameModel);

// Get all games
router.get('/', base.setJsonType, base.getAll);

// Get game
router.get('/:id', base.setJsonType, base.getById);

// Get by formatter_id
router.get('/formatter/:formatterId', base.setJsonType, function* (next) {
	yield gameModel.getByFormatterId(this.params.formatterId)
		.then((games) => {
			this.body = games;
		});

	yield next;
});

// Create game
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update game
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

export default router;
