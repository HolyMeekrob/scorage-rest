import { agent } from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	match: {
		get: sinon.stub(),
		getById: sinon.stub(),
		getPlays: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub()
	}
};

const matchController = proxyquire(
	'../../src/controllers/matchController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/matchController': matchController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('matchController', () => {
	beforeEach(() => {
		scorageStub.match.get.reset();
		scorageStub.match.getById.reset();
		scorageStub.match.getPlays.reset();
		scorageStub.match.create.reset();
		scorageStub.match.updateById.reset();
	});

	describe('GET /matches', () => {
		it('should respond with all of the matches', (done) => {
			const allMatches = [
				{ id: 1 },
				{ id: 3 }
			];

			scorageStub.match.get.returns(Promise.resolve(allMatches));

			request
				.get('/matches/')
				.expect(200, allMatches, done);
		});
	});

	describe('GET /matches/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allMatches = [
					{ id: 7 },
					{ id: 9 }
				];
				const id = 2;

				scorageStub.match.getById.withArgs(id).returns(Promise.resolve(
					allMatches.filter((match) => {
						return match.id === id;
					})[0]));

				request
					.get(`/matches/${id}`)
					.expect(204, done);
			});
		});

		describe('when given an id that exists within the dataset', () => {
			it('should respond with the match', (done) => {
				const allMatches = [
					{ id: 7 },
					{ id: 9 }
				];
				const id = 7;

				scorageStub.match.getById.withArgs(id).returns(Promise.resolve(
					allMatches.filter((match) => {
						return match.id === id;
					})[0]));

				request
					.get(`/matches/${id}`)
					.expect(200, allMatches[0], done);
			});
		});
	});

	describe('GET /matches/:id/plays', () => {
		describe('when the match has no plays', () => {
			it('should return an empty array', (done) => {
				const allMatches = [
					{ id: 7 },
					{ id: 9 }
				];

				const id = 7;
				const plays = [
					{ id: 100, match_id: 9 },
					{ id: 101, match_id: 9 }
				];

				scorageStub.match.getPlays.withArgs(id).returns(Promise.resolve(
					plays.filter((play) => play.match_id === id)));

				request
					.get(`/matches/${id}/plays`)
					.expect(200, [], done);
			});
		});

		describe('when the match has plays', () => {
			it('should return the plays', (done) => {
				const allMatches = [
					{ id: 7 },
					{ id: 9 }
				];

				const id = 9;
				const plays = [
					{ id: 100, match_id: 9 },
					{ id: 101, match_id: 9 },
					{ id: 102, match_id: 7 }
				];

				scorageStub.match.getPlays.withArgs(id).returns(Promise.resolve(
					plays.filter((play) => play.match_id === id)));

				request
					.get(`/matches/${id}/plays`)
					.expect(200, [plays[0], plays[1]], done);
			});
		});
	});

	describe('POST /matches', () => {
		describe('when given a new match', () => {
			it('should return the newly created match', (done) => {
				const matchIn = { match_site_id: 12 };
				const matchOut = { id: 88, match_site_id: matchIn.match_site_id };

				scorageStub.match.create.withArgs(matchIn).returns(
					Promise.resolve(matchOut));

				request
					.post('/matches')
					.send(matchIn)
					.expect(200, matchOut, done);
			});
		});
	});

	describe('PUT /matches/:id', () => {
		describe('when given an updated match', () => {
			it('should return the updated match', (done) => {
				const match = { match_site_id: 111 };
				const id = 5;

				const updatedMatch = { id, match_site_id: match.match_site_id };

				scorageStub.match.updateById.withArgs(id, match).returns(
					Promise.resolve({ updatedMatch }));

				request
					.put(`/matches/${id}`)
					.send(match)
					.expect(200, { updatedMatch }, done);
			});
		});
	});
});
