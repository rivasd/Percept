// experiments-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

var Block = require('../schemas/block');


module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const Schema = mongooseClient.Schema;

  var BlockSchema = Block(app);

  const experiments = new mongooseClient.Schema({
    //a short label for internal use and url generation. should not be updatable
    label: { type: String, required: true, unique: true, match: /^[A-Za-z]+$/ },
    //The displayed title of the experiment    
    title: {type: String},
    //The user responsible for this experiment
    leadResearcher:{type: Schema.Types.ObjectId, ref: 'users', required:true},
    //other accounts allowed to view and edit, but not add others
    researchers:[{type: Schema.Types.ObjectId, ref: 'users'}],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: {type: Boolean, default: false },
    timeline: [BlockSchema]
  });

  return mongooseClient.model('experiments', experiments);
};
