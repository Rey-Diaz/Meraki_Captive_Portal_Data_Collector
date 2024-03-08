var express = require("express");
var app = express();
var fs = require('fs'); // File system module
var bodyParser = require('body-parser');
var path = require('path'); // For handling and transforming file paths

// Express Middleware - BodyParser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// serve static public site files
app.use(express.static('public'));

/* serves main page */
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/fail", function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'fail.html'));
});

app.get("/success", function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

var logDirectory = path.join(__dirname, 'log'); // Path to log directory

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

app.post('/form', function(req, res) {
    var name = req.body.name || 'Unknown';
    var email = req.body.email || 'Unknown';
    var company = req.body.company || 'Unknown';
    var clientMac = req.body.clientMac || 'Unknown'; // Provides a default value if undefined

    var csvHeader = 'Name,Email,Company,Client MAC\n';
    var csvLine = `${name},${email},${company},${clientMac}\n`;
    var logFilePath = path.join(logDirectory, 'log.csv'); // Path to the log file within the log directory

    // Append data or write header if file doesn't exist
    fs.appendFile(logFilePath, csvLine, function(err) {
        if (err) {
            console.error('Error writing to CSV:', err);
            return res.status(500).send('Error logging data');
        }
        console.log('Data logged to CSV:', csvLine);
        return res.redirect('/success');
    });

    fs.stat(logFilePath, function(err, stats) {
        if (err) {
            // Handle the error, file might not exist which is ok since appendFile will create it
            console.log(err);
        } else if (stats.size === 0) {
            // File exists but is empty, let's assume we need to add the header
            fs.writeFile(logFilePath, csvHeader, { flag: 'a' }, function(err) {
                if (err) {
                    console.error('Error writing header to CSV:', err);
                }
            });
        }
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
