import { agent } from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	season: {
		get: sinon.stub(),
		getById: sinon.stub(),
		getTeams: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub(),
		addTeam: sinon.stub(),
		removeTeam: sinon.stub()
	}
};

const seasonController = proxyquire(
	'../../src/controllers/seasonController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/seasonController': seasonController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('seasonController', () => {
	beforeEach(() => {
		scorageStub.season.get.reset();
		scorageStub.season.getById.reset();
		scorageStub.season.getTeams.reset();
		scorageStub.season.create.reset();
		scorageStub.season.updateById.reset();
		scorageStub.season.addTeam.reset();
		scorageStub.season.removeTeam.reset();
	});

	describe('GET /seasons', () => {
		it('should respond with all of the seasons', (done) => {
			const allSeasons = [
				{ id: 4, name: 'Winter 2012' },
				{ id: 6, name: 'Summer 2013' }
			];

			scorageStub.season.get.returns(Promise.resolve(allSeasons));

			request
				.get('/seasons/')
				.expect(200, allSeasons, done);
		});
	});

	describe('GET /seasons/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allSeasons = [
					{ id: 4, name: 'Winter 2012' },
					{ id: 6, name: 'Summer 2013' }
				];
				const id = 2;

				scorageStub.season.getById.withArgs(id).returns(Promise.resolve(
					allSeasons.filter((season) => {
						return season.id === id;
					})[0]));

				request
					.get(`/seasons/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the season', (done) => {
				const allSeasons = [
					{ id: 4, name: 'Winter 2012' },
					{ id: 6, name: 'Summer 2013' }
				];
				const id = 4;

				scorageStub.season.getById.withArgs(id).returns(Promise.resolve(
					allSeasons.filter((season) => {
						return season.id === id;
					})[0]));

				request
					.get(`/seasons/${id}`)
					.expect(200, allSeasons[0], done);
			});
		});
	});

	describe('GET /seasons/:id/teams', () => {
		describe('when there are no teams for the season', () => {
			it('should return an empty array', (done) => {
				const allSeasons = [
					{ id: 4, name: 'Winter 2012' },
					{ id: 6, name: 'Summer 2013' }
				];

				const teams = [
					{ id: 20, league_id: 4 },
					{ id: 25, league_id: 4 }
				];

				const id = 6;

				scorageStub.season.getTeams.withArgs(id).returns(Promise.resolve(
					teams.filter((team) => team.league_id === id)));

				request
					.get(`/seasons/${id}/teams`)
					.expect(200, [], done);
			});
		});

		describe('when there are teams for the season', () => {
			it('should return the teams', () => {
				const allSeasons = [
					{ id: 4, name: 'Winter 2012' },
					{ id: 6, name: 'Summer 2013' }
				];

				const teams = [
					{ id: 20, league_id: 4 },
					{ id: 22, league_id: 6 },
					{ id: 25, league_id: 4 }
				];

				const id = 4;

				scorageStub.season.getTeams.withArgs(id).returns(Promise.resolve(
					teams.filter((team) => team.league_id === id)));

				request
					.get(`/seasons/${id}/teams`)
					.expect(200, [teams[0], teams[2]]);
			});
		});
	});

	describe('POST /seasons', () => {
		describe('when given a new season', () => {
			it('should return the newly created season', (done) => {
				const seasonIn = { name: 'Millenial' };
				const seasonOut = { id: 88, name: 'Mellenial' };

				scorageStub.season.create.withArgs(seasonIn).returns(
					Promise.resolve(seasonOut));

				request
					.post('/seasons')
					.send(seasonIn)
					.expect(200, seasonOut, done);
			});
		});
	});

	describe('PUT /seasons/:id', () => {
		describe('when given an updated season', () => {
			it('should return the updated season', (done) => {
				const season = { name: 'Wintober' };
				const id = 5;

				const updatedSeason = { id, name: season.name };

				scorageStub.season.updateById.withArgs(id, season).returns(
					Promise.resolve({ updatedSeason }));

				request
					.put(`/seasons/${id}`)
					.send(season)
					.expect(200, { updatedSeason }, done);
			});
		});
	});

	describe('PUT /seasons/:seasonId/team/:teamId', () => {
		it('should return the updated season', (done) => {
			const seasons = [
				{ id: 77, name: 'Leap Year' },
				{ id: 88, name: 'Non-leap year' }
			];

			const teams = [
				{ id: 200, name: 'Frogs' },
				{ id: 201, name: 'Toads' }
			];

			const seasonId = 88;
			const teamId = 200;

			scorageStub.season.addTeam.withArgs(teamId, seasonId).returns(
				Promise.resolve(seasons.filter((season) => season.id === seasonId)[0]));

			request
				.put(`/seasons/${seasonId}/team/${teamId}`)
				.expect(200, seasons[1], done);
		});
	});

	describe('DELETE /seasons/:seasonId/team/:teamId', () => {
		it('should return the updated season', (done) => {
			const seasons = [
				{ id: 77, name: 'Leap Year' },
				{ id: 88, name: 'Non-leap year' }
			];

			const teams = [
				{ id: 200, name: 'Frogs' },
				{ id: 201, name: 'Toads' }
			];

			const seasonId = 88;
			const teamId = 200;

			scorageStub.season.removeTeam.withArgs(teamId, seasonId).returns(
				Promise.resolve(seasons.filter((season) => season.id === seasonId)[0]));

			request
				.del(`/seasons/${seasonId}/team/${teamId}`)
				.expect(200, seasons[1], done);
		});
	});
});
