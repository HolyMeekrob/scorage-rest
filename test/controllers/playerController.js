import { agent } from 'supertest';
import proxyquire from 'proxyquire';

const allPlayers = [
	{ id: 1, name: 'hello' },
	{ id: 3, name: 'there', }
];

const scorageStub = {
	player: {
		get: () => Promise.resolve(allPlayers),
		getById: (id) => {
			return Promise.resolve(
				allPlayers.filter((player) => {
					return player.id === id;
				})[0]);
		}
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
	describe('GET /players', () => {
		it('should respond with all of the players', (done) => {
			request
				.get('/players/')
				.expect(200, allPlayers, done);
		});
	});

	describe('GET /players/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const id = 2;
				request
					.get(`/players/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the player', (done) => {
				const id = 1;
				request
					.get(`/players/${id}`)
					.expect(200, { id: 1, name: 'hello' }, done);
			});
		});
	});
});
