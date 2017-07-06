// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const populate = require("feathers-hooks-common").populate;
const iff = require("feathers-hooks-common").iff;
const isProvider = require("feathers-hooks-common").isProvider;

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars

  var populatePartSchema = {
    schema:{
      service:'participations',
      include:[{
        service:'experiments',
        nameAs: 'experiment',
        parentField:'experimentId',
        childField:'_id',
        query:{
          $select: ['label', 'researchers']
        }
      }]
    }
  }


  return iff(isProvider('external'),populate(populatePartSchema));
};
