// Initializes the `participations` service on path `/participations`
const createService = require('feathers-mongoose');
const createModel = require('../../models/participations.model');
const hooks = require('./participations.hooks');
const filters = require('./participations.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'participations',
    Model,
    paginate
  };

  var participationService = createService(options);

  //attaching the documentation
  participationService.docs = {
    description: 'A service to send and receive messages',
    definitions: {
      messages: {
        "type": "object",
        "required": [
          "text"
        ],
        "properties": {
          "text": {
            "type": "string",
            "description": "The message text"
          },
          "useId": {
            "type": "string",
            "description": "The id of the user that sent the message"
          }
        }
      }
    }
  };

  // Initialize our service with any options it requires
  app.use('/participations', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('participations');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
