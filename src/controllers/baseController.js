const baseController = (model) => {
	const setJsonType = function* (next) {
		this.type = 'application/json';
		yield next;
	};

	const getAll = function* (next) {
		yield model.get()
			.then((allRows) => {
				this.body = allRows;
			});

		yield next;
	};

	const getById = function* (next) {
		yield model.getById(parseInt(this.params.id, 10))
			.then((row) => {
				this.body = row;
			});

		yield next;
	};

	const createNew = function* (next) {
		this.accepts('application/json');

		const newRow = yield model.create(this.request.body);
		this.body = newRow;

		yield next;
	};

	const updateById = function* (next) {
		this.accepts('application/json');

		const updatedRow = yield model.updateById(
			parseInt(this.params.id, 10), this.request.body);
		this.body = updatedRow;

		yield next;
	};

	const deleteById = function* (next) {
		yield model.deleteById(parseInt(this.params.id, 10))
			.then((row) => {
				this.body = row;
			});

		yield next;
	};

	return Object.freeze({
		setJsonType,
		getAll,
		getById,
		createNew,
		updateById,
		deleteById
	});
};

export default baseController;
