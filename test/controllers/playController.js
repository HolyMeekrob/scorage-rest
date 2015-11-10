import agent from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	play: {
		get: sinon.stub(),
		getById: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub(),
		deleteById: sinon.stub()
	}
};

const playController = proxyquire(
	'../../src/controllers/playController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/playController': playController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('playController', () => {
	beforeEach(() => {
		scorageStub.play.get.reset();
		scorageStub.play.getById.reset();
		scorageStub.play.create.reset();
		scorageStub.play.updateById.reset();
		scorageStub.play.deleteById.reset();
	});

	describe('GET /plays', () => {
		it('should respond with all of the plays', (done) => {
			const allPlays = [
				{ id: 1, match_id: 11 },
				{ id: 3, match_id: 11, }
			];

			scorageStub.play.get.returns(Promise.resolve(allPlays));

			request
				.get('/plays/')
				.expect(200, allPlays, done);
		});
	});

	describe('GET /plays/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allPlays = [
					{ id: 7, match_id: 11 },
					{ id: 9, match_id: 11 }
				];
				const id = 2;

				scorageStub.play.getById.withArgs(id).returns(Promise.resolve(
					allPlays.filter((play) => {
						return play.id === id;
					})[0]));

				request
					.get(`/plays/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the play', (done) => {
				const allPlays = [
					{ id: 7, match_id: 11 },
					{ id: 9, match_id: 11 }
				];
				const id = 7;

				scorageStub.play.getById.withArgs(id).returns(Promise.resolve(
					allPlays.filter((play) => {
						return play.id === id;
					})[0]));

				request
					.get(`/plays/${id}`)
					.expect(200, allPlays[0], done);
			});
		});
	});

	describe('POST /plays', () => {
		describe('when given a new play', () => {
			it('should return the newly created play', (done) => {
				const playIn = { match_id: 11 };
				const playOut = { id: 88, match_id: 11 };

				scorageStub.play.create.withArgs(playIn).returns(
					Promise.resolve(playOut));

				request
					.post('/plays')
					.send(playIn)
					.expect(200, playOut, done);
			});
		});
	});

	describe('PUT /plays/:id', () => {
		describe('when given an updated play', () => {
			it('should return the updated play', (done) => {
				const play = { match_id: 11 };
				const id = 5;

				const updatedPlay = { id, match_id: play.match_id };

				scorageStub.play.updateById.withArgs(id, play).returns(
					Promise.resolve({ updatedPlay }));

				request
					.put(`/plays/${id}`)
					.send(play)
					.expect(200, { updatedPlay }, done);
			});
		});
	});

	describe('DELETE /plays/:id', () => {
		describe('when deleting a play that doesn\'t exist', () => {
			it('should return an empty object', (done) => {
				const allPlays = [
					{ id: 7, match_id: 11 },
					{ id: 9, match_id: 11 }
				];

				const id = 10;

				scorageStub.play.deleteById.withArgs(id).returns(Promise.resolve({}));

				request
					.del(`/plays/${id}`)
					.expect(200, {}, done);
			});
		});

		describe('when deleting a play that exists', () => {
			it('should return the deleted object', (done) => {
				const allPlays = [
					{ id: 7, match_id: 11 },
					{ id: 9, match_id: 11 }
				];

				const id = 9;

				scorageStub.play.deleteById.withArgs(id).returns(
					Promise.resolve(allPlays.filter((play) => play.id === id)[0])
				);

				request
					.del(`/plays/${id}`)
					.expect(200, allPlays[1], done);
			});
		});
	});
});
