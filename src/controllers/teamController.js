import { team as teamModel } from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/teams' });
const bodyParser = koaBody();

import baseController from './baseController';
const base = baseController(teamModel);

// Get all teams
router.get('/', base.setJsonType, base.getAll);

// Get team
router.get('/:id', base.setJsonType, base.getById);

// Get roster
router.get('/:id/roster', base.setJsonType, function* (next) {
	yield teamModel.getRoster(parseInt(this.params.id, 10))
		.then((players) => {
			this.body = players;
		});

	yield next;
});

// Create team
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update team
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

// Add player
router.put('/:teamId/player/:playerId', base.setJsonType, function* (next) {
	const updatedRoster = yield teamModel.addPlayer(
		parseInt(this.params.playerId, 10), parseInt(this.params.teamId, 10));
	this.body = updatedRoster;

	yield next;
});

// Remove player
router.delete('/:teamId/player/:playerId', base.setJsonType, function* (next) {
	const updatedRoster = yield teamModel.removePlayer(
		parseInt(this.params.playerId, 10), parseInt(this.params.teamId, 10));
	this.body = updatedRoster;

	yield next;
});

export default router;
