'use strict';

const config = require('./config');

class Pool {
	constructor(io) {
		this.io = io;
		this.pool = [];
		this.maxSize = config.poolMaxsize;
	}

	add(items) {
		items.forEach(item => {
			if (this.pool.includes(item)) return;
			this.pool.push(item);
			this.emit(item);
			if (this.pool.length > this.maxSize) {
				this.pool.shift();
			}
		});
	}

	emit(item) {
		this.io.emit('post', [item]);
	}

	get() {
		return this.pool.slice(-config.chunkMaxSize).reverse();
	}
}

module.exports  = Pool;
