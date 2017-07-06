
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  var Trial = new mongooseClient.Schema({
    trial_type: { type: String, required: true },
    trial_index: { type: Number, required: true },
    time_elapsed: { type: Number, required: true },
    internal_node_id: { type: String, required: true }
  }, {
    strict: false,
    _id:false       //trials subdocument have no need for id
  });

  return Trial;
}