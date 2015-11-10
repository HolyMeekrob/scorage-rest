import scorage from 'scorage';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';
const router = koaRouter({ prefix: '/locations' });
const bodyParser = koaBody();

const locationModel = scorage.location;

import baseController from './baseController';
const base = baseController(locationModel);

// Get all locations
router.get('/', base.setJsonType, base.getAll);

// Get location
router.get('/:id', base.setJsonType, base.getById);

// Create location
router.post('/', bodyParser, base.setJsonType, base.createNew);

// Update location
router.put('/:id', bodyParser, base.setJsonType, base.updateById);

export default router;
