/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': '3bfd1e7e-96d5-4057-9a4d-15113231735e',
    'password': 'vfnm8ALUl0iv',
    'version_date': '2017-02-27'
});

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/', function(req, res) {
  var parameters = {
    'text': "IBM is an American multinational technology company headquartered in Armonk, New York, United States, with operations in over 170 countries.",
    'features': {
      'entities': {
        'emotion': true,
        'sentiment': true,
        'limit': 3
      },
      'keywords': {
        'emotion': true,
        'sentiment': true,
        'limit': 3
      }
    }
  }

  natural_language_understanding.analyze(parameters, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      res.send(JSON.stringify(response, null, 2));
  });
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
