module.exports.radar_callback = radar_callback;
function radar_callback(callback) {
    var Jimp = require("jimp");
    var async = require('async');
    var imgmeta = require("./nck-aug2017.json");
    var smallimgmeta = imgmeta.slice(0, 4309);
    var bg = require("./images/bg-nck.json");
    var fs = require('fs');
    var input2 = new Buffer(bg.data, "base64");
    var black = Jimp.rgbaToInt(0, 0, 0, 0);

    var txtResult = "latitude,longitude,station,timestamp,value\n";
    async.eachSeries(smallimgmeta, function (item, next) {
        input1 = "http://bigmaster.igridproject.info:19080/v1/object/igrid.rainradar.nck." + item._id + "/data?filetype=jpg";
        var img1 = Jimp.read(input1, function (err, img1) {
            var img2 = Jimp.read(input2, function (err, img2) { //background image
                var img3 = new Jimp(img2.bitmap.width, img2.bitmap.height, black, function (err, img3) {
                    var w = img2.bitmap.width;
                    var h = img2.bitmap.width;
                    for (let y = 0; y <= h; y++) {
                        for (let x = 0; x <= w; x++) {
                            var intCL = img1.getPixelColor(x, y);// เก็บค่าสีinput1
                            var rgbCL = Jimp.intToRGBA(intCL);//แปลงค่าสีจาก int เป็น rgb
                            var intCL2 = img2.getPixelColor(x, y);//เก็บค่าสีinput2
                            var rgbCL2 = Jimp.intToRGBA(intCL2);
                            if (Math.abs(rgbCL.r - rgbCL2.r) > 25 || Math.abs(rgbCL.g - rgbCL2.g) > 25 || Math.abs(rgbCL.b - rgbCL2.b) > 25) {
                                var image3CL = Jimp.rgbaToInt(rgbCL.r, rgbCL.g, rgbCL.b, rgbCL.a);//ดึงค่าสีจาก input1
                                img3.setPixelColor(image3CL, x, y);// setสี input1 ลง output
                            } else {
                                img3.setPixelColor(black, x, y); // setสีดำลง output
                            }
                        }
                    }
                    var dt = new Date(item.meta._ts*1000);
                    /*---------------------------- การคำนวณปริมาณน้ำฝน ----------------------------------*/
                    var sum = 0;
                    var n = 0;
                    var latitude = 13.85958;
                    var longitude = 100.72917;//คลองสามวา
                    var station = "E03";
                    var result;
                    px = Math.round(((longitude - 99.841902) * 1600) / 1.840273);
                    py = Math.round(((14.722223 - latitude) * 1600) / 1.785963);

                    var maxH = py + 5;
                    maxH = (maxH > h) ? h : maxH;
                    var minY = py - 5;
                    minY = (minY < 0) ? 0 : minY;
                    var maxW = px + 5;
                    maxW = (maxW > w) ? w : maxW;
                    var minX = px - 5;
                    minX = (minX < 0) ? 0 : minX;

                    for (let y = minY; y <= maxH; y++) {
                        for (let x = minX; x <= maxW; x++) {
                            if (pointInCircle(x, y, px, py, 5) == true) {
                                var pointCL = img3.getPixelColor(x, y);//เก็บค่าสีของ pixel ภายในวงกลม
                                var pointRGB = Jimp.intToRGBA(pointCL);// แปลงค่าสีเป็น rgb
                                var rainLevel = getrainLevel(pointRGB);
                                n++;
                                result = Math.round((sum += rainLevel) / n);//คำนวณหาค่าเฉลี่ยฝนภายในวงกลมทั้งหมด
                            }
                        }
                    }
                    console.log("Time : " +dt);
                    console.log("Value : " + result);
                    txtResult = txtResult +(latitude).toString()+","+(longitude).toString()+","+(station).toString()+","
                    + (item.meta._ts).toString() + "," + (result).toString() +"\n";

                    function pointInCircle(x, y, cx, cy, radius) {
                        var distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
                        return distancesquared <= radius * radius;
                    }
                    function getrainLevel(rgb) {
                        var dBZ = new Array(); //เก็บค่าสีของเกณฑ์ปริมาณฝน
                        dBZ[0] = { r: 255, g: 255, b: 255 };
                        dBZ[1] = { r: 255, g: 225, b: 255 };
                        dBZ[2] = { r: 255, g: 201, b: 255 };
                        dBZ[3] = { r: 254, g: 127, b: 255 };
                        dBZ[4] = { r: 253, g: 0, b: 255 };
                        dBZ[5] = { r: 255, g: 1, b: 99 };
                        dBZ[6] = { r: 254, g: 0, b: 2 };
                        dBZ[7] = { r: 254, g: 85, b: 2 };
                        dBZ[8] = { r: 253, g: 171, b: 0 };
                        dBZ[9] = { r: 255, g: 199, b: 3 };
                        dBZ[10] = { r: 255, g: 255, b: 1 };
                        dBZ[11] = { r: 0, g: 151, b: 50 };
                        dBZ[12] = { r: 1, g: 173, b: 1 };
                        dBZ[13] = { r: 1, g: 255, b: 0 };
                        dBZ[14] = { r: 0, g: 254, b: 130 };
                        dBZ[15] = { r: 0, g: 0, b: 0 };
                        var delta = new Array(); //เก็บค่าความต่างสีระหว่าง RGB ที่เลือกกับ RGB ของเกณฑ์ปริมาณฝน
                        for (let i = 0; i <= 15; i++) {
                            delta[i] = (Math.abs(dBZ[i].r - pointRGB.r) + Math.abs(dBZ[i].g - pointRGB.g) + Math.abs(dBZ[i].b - pointRGB.b)) / 3;
                        }//นำค่า RGB ในวงกลมลบกับ RGB ของเกณฑ์ปริมาณฝนเก็บไว้ แล้วหาค่าเฉลี่ยความต่าง
                        var min = Math.min(delta[0], delta[1], delta[2], delta[3], delta[4], delta[5], delta[6], delta[7], delta[8], delta[9],
                            delta[10], delta[11], delta[12], delta[13], delta[14], delta[15]);//เลือกค่าที่ความต่างสีน้อยที่สุด (สีเหมือนกันที่สุด)
                        var level;
                        if (min == delta[0]) { //เทียบหาค่า min ตรงกับค่าเฉลี่ยความต่างสีใด และกำหนดระดับน้ำฝน
                            level = 75;
                        } else if (min == delta[1]) {
                            level = 70;
                        } else if (min == delta[2]) {
                            level = 65;
                        } else if (min == delta[3]) {
                            level = 60;
                        } else if (min == delta[4]) {
                            level = 55;
                        } else if (min == delta[5]) {
                            level = 50;
                        } else if (min == delta[6]) {
                            level = 45;
                        } else if (min == delta[7]) {
                            level = 41;
                        } else if (min == delta[8]) {
                            level = 35;
                        } else if (min == delta[9]) {
                            level = 30;
                        } else if (min == delta[10]) {
                            level = 25;
                        } else if (min == delta[11]) {
                            level = 20;
                        } else if (min == delta[12]) {
                            level = 15;
                        } else if (min == delta[13]) {
                            level = 10;
                        } else if (min == delta[14]) {
                            level = 5.5;
                        } else {
                            level = 0;
                        }
                        return level;
                    }
                    next();
                });
            });
        });
    }, function () {
        fs.writeFile('data.csv', txtResult, (err) => {
            if (err) throw err;
        });
        console.log("All completed!");
    });
}