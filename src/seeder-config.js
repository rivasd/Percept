/**
 * The seeded fake data used to populate the database for development.
 * Useful so all instances of this project will share the same users and creds (in development)
 */

module.exports = {
  services: [
    {
      path: 'users',
      template:{
        name: "Testy McTesterson",
        "email": "dev@dev.com",
        "username": "dev",
        "password": "password"
      },
      callback(user, seed){
        //give our single user an experiment
        return seed({
          path: 'experiments',
          template:{
            label: "testexp",
            leadResearcher : user._id.toString()
          },
        })
      } 
    }
  ]
}