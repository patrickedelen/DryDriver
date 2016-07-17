var mongoose = require('mongoose');

var incidentSchema = new mongoose.Schema({
	_id        : {type: mongoose.Schema.Types.ObjectId, unique: true},
	Date       : Date,
	Loc: {
		type       : {type: String},
		coordinates: {type: [Number]}    //[long,lat]
	},
	ReportType : String,
	Address    : String
});

incidentSchema.index({ Loc: '2dsphere' });



module.exports = mongoose.model('Incident', incidentSchema);