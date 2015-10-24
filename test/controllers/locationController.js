import { agent } from 'supertest';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const scorageStub = {
	location: {
		get: sinon.stub(),
		getById: sinon.stub(),
		create: sinon.stub(),
		updateById: sinon.stub()
	}
};

const locationController = proxyquire(
	'../../src/controllers/locationController',
	{ 'scorage': scorageStub });

const routerBuilder = proxyquire(
	'../../src/router',
	{ './controllers/locationController': locationController }
);

const app = proxyquire(
	'../../index',
	{ './src/router': routerBuilder });

import chai from 'chai';
chai.should();

const request = agent(app.listen());

describe('locationController', () => {
	beforeEach(() => {
		scorageStub.location.get.reset();
		scorageStub.location.getById.reset();
		scorageStub.location.create.reset();
		scorageStub.location.updateById.reset();
	});

	describe('GET /locations', () => {
		it('should respond with all of the locations', (done) => {
			const allLocations = [
				{ id: 1, name: 'American' },
				{ id: 3, name: 'National', }
			];

			scorageStub.location.get.returns(Promise.resolve(allLocations));

			request
				.get('/locations/')
				.expect(200, allLocations, done);
		});
	});

	describe('GET /locations/:id', () => {
		describe('when given an id that does not exist within the dataset', () => {
			it('should respond with no content', (done) => {
				const allLocations = [
					{ id: 7, name: 'Major' },
					{ id: 9, name: 'Minor' }
				];
				const id = 2;

				scorageStub.location.getById.withArgs(id).returns(Promise.resolve(
					allLocations.filter((location) => {
						return location.id === id;
					})[0]));

				request
					.get(`/locations/${id}`)
					.expect(204, done);
			});
		});
		describe('when given an id that exists within the dataset', () => {
			it('should respond with the location', (done) => {
				const allLocations = [
					{ id: 7, name: 'Major' },
					{ id: 9, name: 'Minor' }
				];
				const id = 7;

				scorageStub.location.getById.withArgs(id).returns(Promise.resolve(
					allLocations.filter((location) => {
						return location.id === id;
					})[0]));

				request
					.get(`/locations/${id}`)
					.expect(200, allLocations[0], done);
			});
		});
	});

	describe('POST /locations', () => {
		describe('when given a new location', () => {
			it('should return the newly created location', (done) => {
				const locationIn = { name: 'Penal' };
				const locationOut = { id: 88, name: 'Penal' };

				scorageStub.location.create.withArgs(locationIn).returns(
					Promise.resolve(locationOut));

				request
					.post('/locations')
					.send(locationIn)
					.expect(200, locationOut, done);
			});
		});
	});

	describe('PUT /locations/:id', () => {
		describe('when given an updated location', () => {
			it('should return the updated location', (done) => {
				const location = { name: 'Bush' };
				const id = 5;

				const updatedLocation = { id, name: location.name };

				scorageStub.location.updateById.withArgs(id, location).returns(
					Promise.resolve({ updatedLocation }));

				request
					.put(`/locations/${id}`)
					.send(location)
					.expect(200, { updatedLocation }, done);
			});
		});
	});
});
