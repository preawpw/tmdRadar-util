var app = require('express')();
var radar = require('./lib/Radar_IMG');
var avg = require('./lib/Radar_IMG/AVGfunction.js');
var port = process.env.PORT || 7777;
app.get("/currentimage", function(req, res) {
    radar.radar_callback("http://203.155.220.231/Radar/pics/zfiltered.jpg","currentRadar.png", function(err,img){       
        res.type('png');
        res.send(img);       
    });
});
app.get("/avg", function(req, res) {
    avg.avg_callback(req.query.px, req.query.py, function(err,avg){ 
        res.setHeader('Access-Control-Allow-Origin','*');  
        res.send(avg);             
    });
});
app.listen(port, function() {
    console.log('Starting node.js on port ' + port);
});