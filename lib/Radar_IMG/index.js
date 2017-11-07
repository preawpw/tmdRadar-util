module.exports.radar_callback = radar_callback;
function radar_callback(input1,output, callback) {
    var  Jimp  =  require("jimp");
    var img1 = Jimp.read(input1, function  (err,  img1)  {      
    var bg = require("./images/bg-nck.json");
    var input2 = new Buffer(bg.data,"base64");
    var img2 = Jimp.read(input2, function  (err,  img2)  { //background image
    var black = Jimp.rgbaToInt(0,  0,  0, 0);
    var img3  =  new  Jimp(img1.bitmap.width,  img1.bitmap.height, black,  function  (err,  img3)  {
    var w = img1.bitmap.width;
    var h = img1.bitmap.width;
                for (var y = 0; y <= h; y++) {
                    for (var x = 0; x <= w; x++) {
                        var intCL = img1.getPixelColor(x, y);// เก็บค่าสีinput1
                        var rgbCL = Jimp.intToRGBA(intCL);//แปลงค่าสีจาก int เป็น rgb
                        var intCL2 = img2.getPixelColor(x, y);//เก็บค่าสีinput2
                        var rgbCL2 = Jimp.intToRGBA(intCL2);
                        if (Math.abs(rgbCL.r-rgbCL2.r)>15 || Math.abs(rgbCL.g-rgbCL2.g)>15 || Math.abs(rgbCL.b-rgbCL2.b)>15){
                            var image3CL = Jimp.rgbaToInt(rgbCL.r,  rgbCL.g,  rgbCL.b,  rgbCL.a);//ดึงค่าสีจาก input1
                            img3.setPixelColor(image3CL, x, y);// setสี input1 ลง output
                        } else{
                            img3.setPixelColor(black, x, y); // setสีดำลง output
                        }
                    }
                }
                img3.write(output); 
                img3.getBuffer(Jimp.MIME_PNG, function (err, img) {
                    callback(null, img);
                })
            });
        });
    });
}

