
const Trial = require("./trial");

module.exports = function (app) {

  const mongooseClient = app.get('mongooseClient');
  const TrialSchema = Trial(app);

  var Session = new mongooseClient.Schema({
    browser: String,
    data: [TrialSchema]
  },
    { _id: false }    //session inner objects have no need for id
  );

  return Session;

}