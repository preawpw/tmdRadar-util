module.exports.avg_callback = avg_callback;
function avg_callback(px, py, callback) {
    console.log("px :"+px);
    console.log("py :"+py);
    if (px < 0 || px > 1600 || py < 0 || py > 1600) { //บริเวณนอกรูป เซตค่าฝนเป็น 0
        var avg = { "avg": 0 };
        callback(null, avg);
    } else {
        var Jimp = require("jimp");
        var sum = 0;
        var n = 0;
        var image = Jimp.read("http://localhost:7777/currentimage", function (err, image) {
        var w = image.bitmap.width;
        var h = image.bitmap.height;
        var result;
            for (var y = 0; y <= h; y++) {
                for (var x = 0; x <= w; x++) {
                    if (pointInCircle(x, y, px, py, 5) == true) {
                        var pointCL = image.getPixelColor(x, y);//เก็บค่าสีของ pixel ภายในวงกลม
                        var pointRGB = Jimp.intToRGBA(pointCL);// แปลงค่าสีเป็น rgb
                        var rainLevel = getrainLevel(pointRGB);
                        n++;
                        result = Math.round((sum += rainLevel) / n);//คำนวณหาค่าเฉลี่ยฝนภายในวงกลมทั้งหมด
                    }
                }
            }
            console.log("AVG : " + result);
            var avg = { "avg": result };
            callback(null, avg);

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
                for (var i = 0; i <= 15; i++) {
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
        });
    }
}