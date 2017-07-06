

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
   * Helper function to get info about current browser. Happily stolen from: https://stackoverflow.com/a/5918791
   */
  _getBrowserInfo(){
    
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
  }

  /**
   * Generates an appropriate handler for jsPsych.init()'s on_data_update parameter to save data locally as the experiment progresses
   * depending on the options, it can either use the socketio connetion to continuously update, or simple keep a localStorage key up-to-date
   * @param {*} opts 
   * @return {function}
   */
  _getLocalSaverFunction(opts){
    //let us take care of saving data to the browser on every new datum generated, an often requested feature
    var localData = {data:[], participation: privates.participationId};
    if(!localStorage.getItem('percept-data')){
      //simply add a jsPsych handler that will update this localStorage item on every data update. include any function that may have been passed by the user
      var copy = opts.on_data_update;
      
      var data_update_func = function(data){
        localData.data.push(data);
        localStorage.setItem('percept-data', JSON.stringify(localData));
        if(typeof copy === 'function'){
          copy();
        }
      }
      return data_update_func;
    }
    else{
      //TODO: handle the case if there is residual data from a previous unsaved run!
      alert("there is already saved data locally");
      localStorage.clear();
    }
  }

  /**
   * Returns an appropriate handler function for the on_finish param of jsPsych.init(). 
   * Saves the generated data to the server or prompts for local download
   * @param   {*} opts 
   * @return  {function}
   */
  _getSaverHandler(opts){
    var copy = opts.on_finish;
    var self = this;
    if(opts.local){
      return function(data){
        //this is dependent on the client side FileSaver.js or even saveTextAs (for very old browsers) API being present
        if(typeof saveAs !== 'undefined'){
          saveAs(data.csv());
        }
        else if(typeof saveAsText !== 'undefined'){
          saveAsText(data.csv());
        }
        else{
          alert("trying to save locally without a FileSaver library present!");
        }
      }
    }
    else{
      //we need to make an API call to the /participations PATCH endpoint
      //we are confident that the endpoint will not treat our request
      return function(data){
        self.app.service('participations').patch(privates.participationId, {$push: {'data':{data: data.values(), browser: self._getBrowserInfo()}} })
        .catch(err => {
          alert(err); //TODO: handle errors
        })
        .then(resp => {
          //if all goes well, we should probable erase the localStorage cache, we dont need it anymore
          localStorage.removeItem('percept-data');
          alert("success!");
        });
      }
    }
  }

  /**
   * Inner helper method to implement experiment launch from params received from the server,
   * whether it's from a continued or a new participation
   * @param {*} opts 
   */
  _handleStartResponse(opts){
    // first, record the _id of the participation we are working on
    privates.participationId = opts._id;
    
    opts.on_data_update = this._getLocalSaverFunction(opts);
    
    //now, we must handle 
    opts.on_finish = this._getSaverHandler(opts);

    //simply call jsPsych.init with it
    jsPsych.init(opts);
  }


  /**
   * Single method to fetch a timeline, register a participation, and start jsPsych in a single call.
   * 
   * @param {object}  opts                  Main parameter object. It will be fed in its entirety to jsPsych.init after fetching the timeline from the server, so use any options described in https://www.youtube.com/watch?v=b9zvhg1gC4g are valid here
   * @param {string}  opts.label
   * @param {string}  opts.display_element
   * @param {boolean} opts.local            Flag to indicate you wish to run the experiment without any interaction with the server. Data will be avaible to directly donwload and save to the user's computer
   * @param {_id}     opts.continue         The _id number of an existing and previous participation that you wish to append data to.
   */
  doExperiment(opts){
    var app = this.app;
    var self = this; //old school trick to never loose sight of the object self-reference

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
      
      //if opts.timeline already exists, there is no need to fetch the experiment timeline from the server, use the one provided
      if(typeof opts.timeline === 'object'){
        self._handleStartResponse(opts);
        return;
      }

      var service = app.service('participations');

      //if this is a new participation, we need to call the CREATE endpoint, otherwise, we need to call the GET endpoint
      if(typeof opts.continue === "undefined"){
        service.create({experiment: opts.label})
        .catch( err => {
          alert(err);         //TODO: handle errors on participation creation
        })
        .then( resp => {
          self._handleStartResponse(Object.assign(resp, opts));
        })
      }
      else{
        service.get(opts.continue)
        .cath( err=> {
          alert(err);
        })
        .then( resp => {
          self._handleStartResponse(Object.assign(resp, opts));
        })
      }
    }
  }
}