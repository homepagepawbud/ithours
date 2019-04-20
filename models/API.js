var mongoose = require('mongoose');


var APISchema = new mongoose.Schema({
    description:{type:String},
    operation:{type:String},
    model_name:{type:String},
    find_query:{},
    update_query:{},
    path:{},
    operator_id:{type:String},
    CreatedTime: { type: Date, default: Date.now },
    UpdatedTime: { type: Date, default: Date.now },
});

mongoose.model('API', APISchema);
