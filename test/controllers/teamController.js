import agent from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	team: {
		get: sinon.stub(),
		getById: sinon.stub(),
		getRoster: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub(),
		addPlayer: sinon.stub(),
		removePlayer: sinon.stub()
	}
};

const teamController = proxyquire(
	'../../src/controllers/teamController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/teamController': teamController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('teamController', () => {
	beforeEach(() => {
		scorageStub.team.get.reset();
		scorageStub.team.getById.reset();
		scorageStub.team.getRoster.reset();
		scorageStub.team.create.reset();
		scorageStub.team.updateById.reset();
		scorageStub.team.addPlayer.reset();
		scorageStub.team.removePlayer.reset();
	});

	describe('GET /teams', () => {
		it('should respond with all of the teams', (done) => {
			const allTeams = [
				{ id: 1, name: 'Longhorns' },
				{ id: 3, name: 'Aggies', }
			];

			scorageStub.team.get.returns(Promise.resolve(allTeams));

			request
				.get('/teams/')
				.expect(200, allTeams, done);
		});
	});

	describe('GET /teams/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allTeams = [
					{ id: 7, name: 'Yankees' },
					{ id: 9, name: 'Sox' }
				];
				const id = 2;

				scorageStub.team.getById.withArgs(id).returns(Promise.resolve(
					allTeams.filter((team) => {
						return team.id === id;
					})[0]));

				request
					.get(`/teams/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the team', (done) => {
				const allTeams = [
					{ id: 7, name: 'Yankees' },
					{ id: 9, name: 'Sox' }
				];
				const id = 7;

				scorageStub.team.getById.withArgs(id).returns(Promise.resolve(
					allTeams.filter((team) => {
						return team.id === id;
					})[0]));

				request
					.get(`/teams/${id}`)
					.expect(200, allTeams[0], done);
			});
		});
	});

	describe('GET /teams/:id/roster', () => {
		it('should return the roster', (done) => {
			const allTeams = [
				{ id: 7, name: 'Yankees' },
				{ id: 9, name: 'Sox' }
			];

			const id = 7;

			const roster = [
				{ id: 1, name: 'Ruth' },
				{ id: 2, name: 'Gehrig' },
				{ id: 3, name: 'DiMaggio' },
				{ id: 4, name: 'Berra' },
				{ id: 5, name: 'Jeter' },
				{ id: 6, name: 'Rivera' },
				{ id: 7, name: 'Ford' }
			];

			scorageStub.team.getRoster.withArgs(id).returns(Promise.resolve(
				roster
			));

			request
				.get(`/teams/${id}/roster`)
				.expect(200, roster, done);
		});
	});

	describe('POST /teams', () => {
		describe('when given a new team', () => {
			it('should return the newly created team', (done) => {
				const teamIn = { name: 'Dolphins' };
				const teamOut = { id: 88, name: 'Dolphins' };

				scorageStub.team.create.withArgs(teamIn).returns(
					Promise.resolve(teamOut));

				request
					.post('/teams')
					.send(teamIn)
					.expect(200, teamOut, done);
			});
		});
	});

	describe('PUT /teams/:id', () => {
		describe('when given an updated team', () => {
			it('should return the updated team', (done) => {
				const team = { name: 'Whalers' };
				const id = 5;

				const updatedTeam = { id, name: team.name };

				scorageStub.team.updateById.withArgs(id, team).returns(
					Promise.resolve({ updatedTeam }));

				request
					.put(`/teams/${id}`)
					.send(team)
					.expect(200, { updatedTeam }, done);
			});
		});
	});

	describe('PUT /teams/:teamId/player/:playerId', () => {
		it('should return the updated roster', (done) => {
			const teamId = 1;
			const playerId = 8;

			const allPlayers = [
				{ id: 1, name: 'Ruth' },
				{ id: 2, name: 'Gehrig' },
				{ id: 3, name: 'DiMaggio' },
				{ id: 4, name: 'Berra' },
				{ id: 5, name: 'Jeter' },
				{ id: 6, name: 'Rivera' },
				{ id: 7, name: 'Ford' },
				{ id: 8, name: 'Mattingly' }
			];

			scorageStub.team.addPlayer.withArgs(playerId, teamId).returns(
				Promise.resolve(
					allPlayers.slice(0, 7).concat(allPlayers[7])
			));

			request
				.put(`/teams/${teamId}/player/${playerId}`)
				.expect(200, allPlayers, done);
		});
	});

	describe('DELETE /teams/:teamId/player/:playerId', (done) => {
		const teamId = 1;
		const playerId = 4;

		const allPlayers = [
			{ id: 1, name: 'Ruth' },
			{ id: 2, name: 'Gehrig' },
			{ id: 3, name: 'DiMaggio' },
			{ id: 4, name: 'Berra' },
			{ id: 5, name: 'Jeter' },
			{ id: 6, name: 'Rivera' },
			{ id: 7, name: 'Ford' },
			{ id: 8, name: 'Mattingly' }
		];

		scorageStub.team.removePlayer.withArgs(playerId, teamId).returns(
			Promise.resolve(
				allPlayers.filter((player) => player.id !== playerId)
		));

		request
			.del(`/teams/${teamId}/player/${playerId}`)
			.expect(200, allPlayers.filter((player) => playerId !== playerId), done);
	});
});
