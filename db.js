const mongoDB = require("mongodb");

const connectionString = ''

mongoDB.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  try {
    if (err) throw err;
    module.exports = client
    console.log(" Database successfully Connected")
    let app = require('./server')
    app.listen(3000)
  } catch (error) {
    console.log("Database Connection Failed" + error)
  }
})

