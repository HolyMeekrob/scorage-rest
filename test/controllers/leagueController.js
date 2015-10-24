import { agent } from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	league: {
		get: sinon.stub(),
		getById: sinon.stub(),
		getByFormatterId: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub()
	}
};

const leagueController = proxyquire(
	'../../src/controllers/leagueController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/leagueController': leagueController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('leagueController', () => {
	beforeEach(() => {
		scorageStub.league.get.reset();
		scorageStub.league.getById.reset();
		scorageStub.league.create.reset();
		scorageStub.league.updateById.reset();
	});

	describe('GET /leagues', () => {
		it('should respond with all of the leagues', (done) => {
			const allLeagues = [
				{ id: 1, name: 'American' },
				{ id: 3, name: 'National', }
			];

			scorageStub.league.get.returns(Promise.resolve(allLeagues));

			request
				.get('/leagues/')
				.expect(200, allLeagues, done);
		});
	});

	describe('GET /leagues/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allLeagues = [
					{ id: 7, name: 'Major' },
					{ id: 9, name: 'Minor' }
				];
				const id = 2;

				scorageStub.league.getById.withArgs(id).returns(Promise.resolve(
					allLeagues.filter((league) => {
						return league.id === id;
					})[0]));

				request
					.get(`/leagues/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the league', (done) => {
				const allLeagues = [
					{ id: 7, name: 'Major' },
					{ id: 9, name: 'Minor' }
				];
				const id = 7;

				scorageStub.league.getById.withArgs(id).returns(Promise.resolve(
					allLeagues.filter((league) => {
						return league.id === id;
					})[0]));

				request
					.get(`/leagues/${id}`)
					.expect(200, allLeagues[0], done);
			});
		});
	});

	describe('POST /leagues', () => {
		describe('when given a new league', () => {
			it('should return the newly created league', (done) => {
				const leagueIn = { name: 'Penal' };
				const leagueOut = { id: 88, name: 'Penal' };

				scorageStub.league.create.withArgs(leagueIn).returns(
					Promise.resolve(leagueOut));

				request
					.post('/leagues')
					.send(leagueIn)
					.expect(200, leagueOut, done);
			});
		});
	});

	describe('PUT /leagues/:id', () => {
		describe('when given an updated league', () => {
			it('should return the updated league', (done) => {
				const league = { name: 'Bush' };
				const id = 5;

				const updatedLeague = { id, name: league.name };

				scorageStub.league.updateById.withArgs(id, league).returns(
					Promise.resolve({ updatedLeague }));

				request
					.put(`/leagues/${id}`)
					.send(league)
					.expect(200, { updatedLeague }, done);
			});
		});
	});
});
