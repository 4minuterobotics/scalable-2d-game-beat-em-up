export let Randomizer = {
	nextInt: function (low, high) {
		// Check if either parameter is not an integer
		if (typeof low !== 'number' || typeof high !== 'number') {
			throw new Error('Parameters must be integers');
		}
		if (low > high) {
			throw new Error('Low range should be less than or equal to high range');
		}
		return Math.floor(Math.random() * (high - low + 1)) + low;
	},
};
