/*jshint esversion: 6 */
var rest = require("./rest");
var config = require("./config");
var jobs = require("./jobs");
var geolib = require("geolib");
 var fs = require("fs");
 var cities = JSON.parse(fs.readFileSync("cities.json"));

var urls = {
	SENTIMENT: "https://arcane-tor-13582.herokuapp.com/",
	TEXT_EXTRACTION: "https://gateway-a.watsonplatform.net/calls/url/URLGetText?url={url}&outputMode=json&apikey=",
	RECOMMENDATIONS: "https://arcane-tor-13582.herokuapp.com/",
  MS: "http://localhost:5002/",
  AMADEUS: "https://mighty-coast-61519.herokuapp.com/"
};

exports.get_sentiment = function(text, callback){
	rest.post(urls.SENTIMENT, {content: text}, callback);
};

exports.get_sentiment_url = function(url, callback){
	rest.get(urls.TEXT_EXTRACTION.replace("{url}", url) + config.bluemix_key, (data) => {
		exports.get_sentiment(data, callback);
	});
};

exports.get_travel_blog_sentiment = function(place, callback) {
  rest.get(urls.MS + "search/" + place + " travel blogs/1", (data) => {
    console.log(data[0]);
  });
};

exports.get_all_travel_urls = function(){
  Object.keys(cities).forEach((key)=>{
    exports.get_travel_blog_sentiment(key, console.log);
  });
};

exports.recommend = function(uid, callback){
	jobs.get_friend_stranger_locations(uid, (data) => {
        console.log("HERE!!!!HERERE")
        exports.get_all_travel_urls();
			rest.post(urls.RECOMMENDATIONS, data, (raw) => {
					raw = data.visited_places;
					cities_recommend = new Set();
					for (let i=0; i<raw.length; i++){
						let min_dist = 10000000;
						let min_city;
						for (let key in cities){
							let distance = geolib.getDistance({latitude: raw[i].latitude, longitude: raw[i].longitude}, {latitude: cities[key].lat, longitude: cities[key].lng});
							if (distance < min_dist) {
								min_dist = distance;
								min_city = key;
							}
						}
						cities_recommend.add(min_city);
					}
					callback(Array.from(cities_recommend));
			});
	});
};
