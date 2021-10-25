var express = require('express');
var app = express();
var jsforce = require('jsforce');
let ejs = require('ejs');
var crypto = require("crypto");
var consumerSecretApp = process.env.CANVAS_CONSUMER_SECRET ||'DAB6....5D2C83EEE8B2BF8732E44'; 
var oauthtoken = '';
var username = '';
var userId ='';
var sfdcdata;
var jsforcedata;
const bodyParser = require("body-parser");
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true })); app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static("public"))
app.set('view engine', 'ejs');
app.get("/", function (req, res) {})
app.post('/', function (req, res) {
  var bodyArray = req.body.signed_request.split(".")
  var consumerSecret = bodyArray[0];
  var encoded_envelope = bodyArray[1];
  var check = crypto.createHmac("sha256", consumerSecretApp).update(encoded_envelope).digest("base64"); 
  if (check === consumerSecret) {
    var envelope = JSON.parse(new Buffer(encoded_envelope, "base64").toString("ascii")); 
    oauthtoken =envelope.client.oauthToken;
    username = envelope.context.user.userName;
    userId = envelope.userId;
    //this is data passed from lightning component
    sfdcdata = envelope.context.environment.parameters; 
    //data can be queried from SFDC
    var conn = new jsforce.Connection({serverUrl : 'https://davidbolton-b2bl.my.salesforce.com', sessionId : oauthtoken });
    var myquery = "SELECT Id, Name, parameters__c, Position__c, Product__c FROM Sprite__c where Product__c= '" + sfdcdata.recordId +"'";
    conn.query(myquery, function(err, result) {
        if (err) { return console.error(err); }
        jsforcedata = result;
        var pagevariables ={canvasrecords: sfdcdata, jsforcerecords: jsforcedata}; 
        res.render("index.ejs", {pv: pagevariables});}); }
  else{res.render("index.ejs");} })
app.listen(process.env.PORT || 3000, function () {console.log('Server Listening');});
