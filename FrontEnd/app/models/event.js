var mongoose = require('mongoose');

module.exports = mongoose.model('Event', {
    CreateDate : Date,
    ClosedDate : Date,
    Coordinates : [String],    //[long,lat]
    SourceType : String,
    Address : String, // street address
    sourceMeta : {
        caseNumber : String,
        caseType : String
    }
});