import scorage from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/seasons' });
const bodyParser = koaBody();

const seasonModel = scorage.season;

import baseController from './baseController';
const base = baseController(seasonModel);

// Get all seasons
router.get('/', base.setJsonType, base.getAll);

// Get season
router.get('/:id', base.setJsonType, base.getById);

// Get teams
router.get('/:id/teams', base.setJsonType, function* (next) {
	yield seasonModel.getTeams(parseInt(this.params.id, 10))
		.then((teams) => {
			this.body = teams;
		});

	yield next;
});

// Create season
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update season
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

// Add team
router.put('/:seasonId/team/:teamId', base.setJsonType, function* (next) {
	const updatedList = yield seasonModel.addTeam(
		parseInt(this.params.teamId, 10), parseInt(this.params.seasonId, 10));
	this.body = updatedList;

	yield next;
});

// Remove team
router.delete('/:seasonId/team/:teamId', base.setJsonType, function* (next) {
	const updatedList = yield seasonModel.removeTeam(
		parseInt(this.params.teamId, 10), parseInt(this.params.seasonId, 10));
	this.body = updatedList;

	yield next;
});

export default router;
