import { league as leagueModel } from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/leagues' });
const bodyParser = koaBody();

import baseController from './baseController';
const base = baseController(leagueModel);

// Get all leagues
router.get('/', base.setJsonType, base.getAll);

// Get league
router.get('/:id', base.setJsonType, base.getById);

// Create league
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update league
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

// Get seasons
router.get('/:id/seasons', base.setJsonType, function* (next) {
	const seasons = yield leagueModel.getSeasons(parseInt(this.params.id, 10));
	this.body = seasons;

	yield next;
});

export default router;
