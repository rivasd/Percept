/**
 * The seeded fake data used to populate the database for development.
 * Useful so all instances of this project will share the same users and creds (in development)
 */

module.exports = {
  services: [
    {
      path: 'users',
      params:{
        "email": "dev@dev.com",
        "username": "dev",
        "password": "password"
      },
      template:{
        name: "Testy McTesterson"
      }
    }
  ]
}