const {Schema, model} = require('mongoose');

const productModel = new Schema({
	title: {
		type: String,
		unique: true,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	images: {
		type: [String]
	},
	category: {
		type: String,
		required: true
	},
	slug: {
		type: String
	}
});

module.exports = model('Product', productModel)