var mongoose = require('mongoose');

var incidentSchema = new mongoose.Schema({
	Date       : Date,
	Loc: {
		type: {type: String},
		coordinates: {type: [Number]}    //[long,lat]
	},
	ReportType       : String,
	Address    : String
});

incidentSchema.index({ Loc: '2dsphere' });

//removed 	Id         : {type: String, unique: true},

module.exports = mongoose.model('Incident', incidentSchema);