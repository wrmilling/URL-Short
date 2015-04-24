// Check that our configuration file exists, throw error if it doesn't.
var fs = require("fs"),
    cfe = fs.existsSync("config.js");
    
if (!cfe){
    console.log("config.js does not exist, please create it.");
}

// Load the configuration and check if the database exists, create if it doesn't.
var config = require('./config.js'),
    dbe = fs.existsSync(config.databasePath);
    
    
if (!dbe) {
    console.log("Creating SQLite Database.");
    fs.openSync(config.databasePath, "w");
}

// Load the database and webserver modules.
var http = require("http"),
    crypto = require('crypto'),
    md5 = crypto.createHash('md5'),
    sqlite3 = require("sqlite3"),
    database = new sqlite3.Database(config.databasePath);

if (!dbe) {
    database.serialize(function() {
        database.run("CREATE TABLE urls (hash TEXT PRIMARY KEY, url TEXT");
    });
}

// Handle all requests to the node.js server
var handleRequest = function(request, response) {
    //TODO: Handle the http requests
};

// Redirects to the given URL
var redirect = function(response, url) {
    response.writeHead(302, {
        'Location': url
    });
};

// Grab the URL from the SQLite database
var getUrl = function(hash, callback) {
    database.get('SELECT url FROM urls WHERE hash = $hash LIMIT 1', {$hash: hash}, function(err, row){
        if (err) {
            console.log("Error while inserting to database: " + err);
        } else if (row !== undefined) {
            callback(row);
        } else {
            //TODO: Nothing Found Logic
        }
    });
};

// Create a URL entry in the SQLite database
var createUrl = function(hash, url, callback){
    if (null == hash) {
        // Dirty Hash Generation
        hash = md5.update(url).digest('hex').slice(0,5);
    }
    database.run('INSERT INTO urls VALUES ($hash, $url)', {$hash: hash, $url: url}, function(err){
        if (err) {
            //TODO: Error logic.
        } else {
            callback(hash);
        }
    });
};

// Open our server
http.createServer(handleRequest).listen(config.port);