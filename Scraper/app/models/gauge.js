var mongoose = require('mongoose');

var gaugeSchema = new mongoose.Schema({
	_id        : {type: Number, unique: true},
	Loc: {
		type       : {type: String},
		coordinates: {type: [Number]}    //[long,lat]
	},
	Address    : String
});

gaugeSchema.index({ Loc: '2dsphere' });



module.exports = mongoose.model('Gauge', gaugeSchema);