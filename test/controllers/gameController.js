import { agent } from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	game: {
		get: sinon.stub(),
		getById: sinon.stub(),
		getByFormatterId: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub()
	}
};

const gameController = proxyquire(
	'../../src/controllers/gameController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/gameController': gameController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('gameController', () => {
	beforeEach(() => {
		scorageStub.game.get.reset();
		scorageStub.game.getById.reset();
		scorageStub.game.create.reset();
		scorageStub.game.updateById.reset();
		scorageStub.game.getByFormatterId.reset();
	});

	describe('GET /games', () => {
		it('should respond with all of the games', (done) => {
			const allGames = [
				{ id: 1, name: 'Backgammon' },
				{ id: 3, name: 'Uno', }
			];

			scorageStub.game.get.returns(Promise.resolve(allGames));

			request
				.get('/games/')
				.expect(200, allGames, done);
		});
	});

	describe('GET /games/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allGames = [
					{ id: 7, name: 'Calvinball' },
					{ id: 9, name: 'Deathmatch' }
				];
				const id = 2;

				scorageStub.game.getById.withArgs(id).returns(Promise.resolve(
					allGames.filter((game) => {
						return game.id === id;
					})[0]));

				request
					.get(`/games/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the game', (done) => {
				const allGames = [
					{ id: 7, name: 'Calvinball' },
					{ id: 9, name: 'Deathmatch' }
				];
				const id = 7;

				scorageStub.game.getById.withArgs(id).returns(Promise.resolve(
					allGames.filter((game) => {
						return game.id === id;
					})[0]));

				request
					.get(`/games/${id}`)
					.expect(200, allGames[0], done);
			});
		});
	});

	describe('GET /formatter/:formatterId', () => {
		describe('and no games match the formatter id', () => {
			it('should respond with an empty array', (done) => {
				const allGames = [
					{
						id: 7,
						name: 'Calvinball',
						formatter_id: '00000000-0000-0000-000000000001'
					},
					{ id: 9,
						name: 'Deathmatch',
						formatter_id: '00000000-0000-0000-000000000002'
					}
				];

				const formatterId = '00000000-0000-0000-000000000003';

				scorageStub.game.getByFormatterId.withArgs(formatterId)
				.returns(Promise.resolve(
					allGames.filter((game) => game.formatter_id === formatterId)));

				request
					.get(`/games/formatter/${formatterId}`)
					.expect(200, [], done);
			});
		});

		describe('and multiple games match the formatter id', () => {
			it('should respond with those games', (done) => {
				const allGames = [
					{
						id: 7,
						name: 'Calvinball',
						formatter_id: '00000000-0000-0000-000000000001'
					},
					{ id: 9,
						name: 'Deathmatch',
						formatter_id: '00000000-0000-0000-000000000002'
					},
					{ id: 12,
						name: 'Deathmatch',
						formatter_id: '00000000-0000-0000-000000000001'
					}
				];

				const formatterId = '00000000-0000-0000-000000000001';

				scorageStub.game.getByFormatterId.withArgs(formatterId)
				.returns(Promise.resolve(
					allGames.filter((game) => game.formatter_id === formatterId)));

				request
					.get(`/games/formatter/${formatterId}`)
					.expect(200, [allGames[0], allGames[2]], done);
			});
		});
	});

	describe('POST /games', () => {
		describe('when given a new game', () => {
			it('should return the newly created game', (done) => {
				const gameIn = { name: 'Frolf' };
				const gameOut = { id: 88, name: 'Frolf' };

				scorageStub.game.create.withArgs(gameIn).returns(
					Promise.resolve(gameOut));

				request
					.post('/games')
					.send(gameIn)
					.expect(200, gameOut, done);
			});
		});
	});

	describe('PUT /games/:id', () => {
		describe('when given an updated game', () => {
			it('should return the updated game', (done) => {
				const game = { name: 'Fetch' };
				const id = 5;

				const updatedGame = { id, name: game.name };

				scorageStub.game.updateById.withArgs(id, game).returns(
					Promise.resolve({ updatedGame }));

				request
					.put(`/games/${id}`)
					.send(game)
					.expect(200, { updatedGame }, done);
			});
		});
	});
});
