

var privates = {

};


/**
 * A module to ease communication with the Percept server through experiment-related methods
 * 
 * @author Daniel Rivas
 */
export class Percept{

  /**
   * 
   * @param {object}    opts      The constructor parameters (encapsulator object)
   * @param {feathers}  opts.app  An instance of feathers-client configured with the appropriate connection 
   */
  constructor(opts){
    this.app = opts.app;
  }

  /**
   * Inner helper method to implement experiment launch from params received from the server,
   * whether it's from a continued or a new participation
   * @param {*} resp 
   */
  _handleStartResponse(resp){
    // first, record the _id of the participation we are working on
    privates.participationId = resp._id;
    
  }


  /**
   * Single method to fetch a timeline, register a participation, and start jsPsych in a single call.
   * 
   * @param {object}  opts
   * @param {string}  opts.label
   * @param {string}  opts.display_element
   * @param {boolean} opts.local            Flag to indicate you wish to run the experiment without any interaction with the server. Data will be avaible to directly donwload and save to the user's computer
   * @param {_id}     opts.continue         The _id number of an existing and previous participation that you wish to append data to.
   */
  doExperiment(opts){
    var app = this.app;
    //fancy ES6 way to take care of default values for the opts object
    var defaults = {
      label: '',
      display_element: 'jsPsychTarget',
      local: false
    }
    var opts = Object.assign({}, defaults, opts);

    //if a local run was requested, do not authenticate the request first
    if(!opts.local){
      app.authenticate()
      .catch(err => {
        alert(err);
      })
      .then(resp =>{
        start(app);
      });
    }
    else{
      start(app);
    }

    function start(app){

      var service = app.service('participations');

      //if this is a new participation, we need to call the CREATE endpoint, otherwise, we need to call the GET endpoint
      if(typeof opts.continue === "undefined"){
        service.create({experiment: opts.label})
        .catch( err => {
          alert(err);         //TODO: handle errors on participation creation
        })
        .then(_handleStartResponse)
      }
      else{
        service.get(opts.continue)
        .cath( err=> {
          alert(err);
        })
        .then(_handleStartResponse)
      }
    }
  }
}