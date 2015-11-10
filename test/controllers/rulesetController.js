import agent from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	ruleset: {
		get: sinon.stub(),
		getById: sinon.stub(),
		getByGameId: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub()
	}
};

const rulesetController = proxyquire(
	'../../src/controllers/rulesetController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/rulesetController': rulesetController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('rulesetController', () => {
	beforeEach(() => {
		scorageStub.ruleset.get.reset();
		scorageStub.ruleset.getById.reset();
		scorageStub.ruleset.getByGameId.reset();
		scorageStub.ruleset.create.reset();
		scorageStub.ruleset.updateById.reset();
	});

	describe('GET /rulesets', () => {
		it('should respond with all of the rulesets', (done) => {
			const allRulesets = [
				{ id: 1, name: 'Singles' },
				{ id: 3, name: 'Doubles', }
			];

			scorageStub.ruleset.get.returns(Promise.resolve(allRulesets));

			request
				.get('/rulesets/')
				.expect(200, allRulesets, done);
		});
	});

	describe('GET /rulesets/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allRulesets = [
					{ id: 7, name: 'Singles' },
					{ id: 9, name: 'Doubles' }
				];
				const id = 2;

				scorageStub.ruleset.getById.withArgs(id).returns(Promise.resolve(
					allRulesets.filter((ruleset) => {
						return ruleset.id === id;
					})[0]));

				request
					.get(`/rulesets/${id}`)
					.expect(204, done);
			});
		});

		describe('when given an id that exists within the dataset', () => {
			it('should respond with the ruleset', (done) => {
				const allRulesets = [
					{ id: 7, name: 'Singles' },
					{ id: 9, name: 'Doubles' }
				];
				const id = 7;

				scorageStub.ruleset.getById.withArgs(id).returns(Promise.resolve(
					allRulesets.filter((ruleset) => {
						return ruleset.id === id;
					})[0]));

				request
					.get(`/rulesets/${id}`)
					.expect(200, allRulesets[0], done);
			});
		});
	});

	describe('GET /rulesets/game/:gameId', () => {
		describe('when there are no rulesets for that game', () => {
			it('should return an empty array', (done) => {
				const allRulesets = [
					{ id: 7, name: 'Singles' },
					{ id: 9, name: 'Doubles' }
				];

				const gameId = 100;

				scorageStub.ruleset.getByGameId.withArgs(gameId).returns(
					Promise.resolve(
						allRulesets.filter((ruleset) => ruleset.game_id === gameId)
					));

				request
					.get(`/rulesets/game/${gameId}`)
					.expect(200, [], done);
			});
		});

		describe('when there are rulesets for that game', () => {
			it('should return the rulesets', (done) => {
				const allRulesets = [
					{ id: 7, name: 'Singles', game_id: 101 },
					{ id: 9, name: 'Doubles', game_id: 101 },
					{ id: 11, name: 'Hold \'Em', game_id: 102 }
				];

				const gameId = 101;

				scorageStub.ruleset.getByGameId.withArgs(gameId).returns(
					Promise.resolve(
						allRulesets.filter((ruleset) => ruleset.game_id === gameId)
					));

				request
					.get(`/rulesets/game/${gameId}`)
					.expect(200, [allRulesets[0], allRulesets[1]], done);
			});
		});
	});

	describe('POST /rulesets', () => {
		describe('when given a new ruleset', () => {
			it('should return the newly created ruleset', (done) => {
				const rulesetIn = { name: 'Quadruples' };
				const rulesetOut = { id: 88, name: 'Quadruples' };

				scorageStub.ruleset.create.withArgs(rulesetIn).returns(
					Promise.resolve(rulesetOut));

				request
					.post('/rulesets')
					.send(rulesetIn)
					.expect(200, rulesetOut, done);
			});
		});
	});

	describe('PUT /rulesets/:id', () => {
		describe('when given an updated ruleset', () => {
			it('should return the updated ruleset', (done) => {
				const ruleset = { name: 'Triples' };
				const id = 5;

				const updatedRuleset = { id, name: ruleset.name };

				scorageStub.ruleset.updateById.withArgs(id, ruleset).returns(
					Promise.resolve({ updatedRuleset }));

				request
					.put(`/rulesets/${id}`)
					.send(ruleset)
					.expect(200, { updatedRuleset }, done);
			});
		});
	});
});
