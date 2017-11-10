var express = require('express');
var app = express();
var dash = require("./module");

var path = require('path');
var mime = require('mime');
var child_process= require("child_process");
var config = require("./config");
var jobs = require("./jobs");

var routes = require("./routes").routes;

app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/node_modules/material-design-lite'));
app.set('views', __dirname + '/views');

app.set('port', (process.env.PORT || config.port));

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

app.get(routes.root, function(req, res) {
  res.render('index', {
    routes : JSON.stringify(routes),
    options : JSON.stringify({}),
  });
});

app.post(routes.root, function(req, res) {
  if (req.body) {
    doc = req.body;
    jobs.add_or_update(doc);
  }
  res.json({});
});

app.listen(app.get('port'), function() {
  console.log("Running 8000");
});

app.get(routes.recommend, function (req, res) {
  dash.recommend(req.query.uid, (data) => {
    res.json({matches: data});
  });
});
