import agent from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	player: {
		get: sinon.stub(),
		getById: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub()
	}
};

const playerController = proxyquire(
	'../../src/controllers/playerController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/playerController': playerController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('playerController', () => {
	beforeEach(() => {
		scorageStub.player.get.reset();
		scorageStub.player.getById.reset();
		scorageStub.player.create.reset();
		scorageStub.player.updateById.reset();
	});

	describe('GET /players', () => {
		it('should respond with all of the players', (done) => {
			const allPlayers = [
				{ id: 1, name: 'hello' },
				{ id: 3, name: 'there', }
			];

			scorageStub.player.get.returns(Promise.resolve(allPlayers));

			request
				.get('/players/')
				.expect(200, allPlayers, done);
		});
	});

	describe('GET /players/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allPlayers = [
					{ id: 7, name: 'Buddy' },
					{ id: 9, name: 'Guy' }
				];
				const id = 2;

				scorageStub.player.getById.withArgs(id).returns(Promise.resolve(
					allPlayers.filter((player) => {
						return player.id === id;
					})[0]));

				request
					.get(`/players/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the player', (done) => {
				const allPlayers = [
					{ id: 7, name: 'Buddy' },
					{ id: 9, name: 'Guy' }
				];
				const id = 7;

				scorageStub.player.getById.withArgs(id).returns(Promise.resolve(
					allPlayers.filter((player) => {
						return player.id === id;
					})[0]));

				request
					.get(`/players/${id}`)
					.expect(200, allPlayers[0], done);
			});
		});
	});

	describe('POST /players', () => {
		describe('when given a new player', () => {
			it('should return the newly created player', (done) => {
				const playerIn = { name: 'Frank' };
				const playerOut = { id: 88, name: 'Frank' };

				scorageStub.player.create.withArgs(playerIn).returns(
					Promise.resolve(playerOut));

				request
					.post('/players')
					.send(playerIn)
					.expect(200, playerOut, done);
			});
		});
	});

	describe('PUT /players/:id', () => {
		describe('when given an updated player', () => {
			it('should return the updated player', (done) => {
				const player = { name: 'Guy' };
				const id = 5;

				const updatedPlayer = { id, name: player.name };

				scorageStub.player.updateById.withArgs(id, player).returns(
					Promise.resolve({ updatedPlayer }));

				request
					.put(`/players/${id}`)
					.send(player)
					.expect(200, { updatedPlayer }, done);
			});
		});
	});
});
