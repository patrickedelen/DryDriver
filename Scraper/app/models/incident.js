var mongoose = require('mongoose');

module.exports = mongoose.model('Incident', {
	Id         : {type: String, unique: true},
	Date       : Date,
	Coordinates: [String],    //[long,lat]
	Type       : String,
	Address    : String
});