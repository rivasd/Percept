// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {uniqueField:'email', targetModel:'users', replacedField:'leadResearcher'}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations
    const mongooseClient = hook.app.get("mongooseClient");

    

    if(! mongooseClient.Types.ObjectId.isValid(hook.data[options.replacedField])){
      //we did not receive directly an ID, but it might a a valid email, lets try and find a matching user

      //we'll use a Mongoose call directly, no need for all the fancy Feathers/service stuff
      var Model = mongooseClient.model(options.targetModel);
      var query = {};
      query[options.uniqueField] = hook.data[options.replacedField];

      return new Promise(function(resolve, reject){
        Model.findOne(query, function(err, user){
          if(err){
            reject(err);
          }
          if(!user){
            reject(new Error("Provided email: "+ hook.data[options.replacedField] + " for leadResearcher did not match any user"));
          }
          else{
            hook.data[options.replacedField] = user._id;
            resolve(hook);
          }
        });
      });
      
    }
    else{
      return hook;
    }
    
  };
};
