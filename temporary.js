const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { spawn } = require('child_process');
const fs = require('fs');
const sizeOf = require('image-size');
const sharp = require('sharp');

//function resize(path, width, height) {
//  
//    const readStream = fs.createReadStream(path)
//    let transform = sharp()
//    console.log("1");
//    if (width || height) {
//    console.log("2");
//      transform = transform.resize(width, height);
//      console.log("3");
//    }
//    
//    return readStream.pipe(transform)
//}
 

const app = express();
// enable files upload
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 2 * 1024 * 1024 * 1024 //2MB max file(s) size
    },
}));
//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
//app.use(express.static('images'));
app.get('/', (req, res) => {
    res.sendFile(__dirname+"/index.html");
  })
app.get('/acc', (req, res, next) => {
    res.sendFile(__dirname+"/access.html");
  });
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  } 



// upoad single file
app.post('/generate-heatmap', async(req, res) => {
//app.post('/generate-heatmap', (req, res) => {
    try {
        //if(!req.body.base64image && !req.files){
        //    console.log('No i/p');
        //    res.status(404).send( 'No input found');
        //}
        //else if(!req.files) {
            if(!req.files) {
            console.log('No txt file');
            res.status(400).end( 'No txt file uploaded');
        }
        //else if(!req.body.base64image){
        //    console.log('No image');
        //    res.status(400).end( 'No image uploaded!');
        //}
         else {
            //Use the name of the input field (i.e. "txtFile") to retrieve the uploaded files
            let txtFile = req.files.txtFile;
            let img = req.files.base64image;
            console.log(img.name);
            console.log(req.body);
            try{
                 await img.mv('./images/' + img.name);
            }catch(err){
                console.log(err);
            }

            
            
            let y = parseInt(req.body.Height);
            let x = parseInt(req.body.Width);
            
            
            let path="";
            temp = req.files.txtFile.data.toString('utf-8');
            console.log(temp);


            

            

            try {
                await fs.writeFileSync(__dirname+'/uploads/'+txtFile.name, temp);
                //fs.writeFileSync(__dirname+'/uploads/'+txtFile.name, temp);
                path = __dirname+"/uploads/"+txtFile.name;
              } catch (err) {
                console.log(err);
              }
            
               
              

              var dimensions = sizeOf('./images/'+img.name);
              console.log(dimensions.width, dimensions.height);

              //resize('./images/'+img.name, x, y).pipe('./images/'+img.name);
              //console.log(4);

              
              let sx = (dimensions.width/x);
              //
              let sy = (dimensions.height/y);

              //sharp('./images/'+img.name).resize({ height: y, width: x }).toFile('./images/'+img.name)
              //.then(function(newFileInfo) {
              //console.log("Success");
              //})
              //.catch(function(err) {
              //console.log("Error occured");
              //});

            const childPython = spawn('python', ['./conv.py',path,sx,sy]);
            childPython.stdout.on('data', (data)=>{
                console.log('stdout ::'+data);
            });
            
            childPython.stderr.on('err', (data)=>{
                console.log('stderr Chpython : '+data);
            });
            childPython.stdout.on('close', (code)=>{
                console.log(`ChildPython process exited with code : ${code}`);
            });

            await delay(3000);
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            //txtFile.mv(__dirname+'/uploads/' + txtFile.name);
            
            let TEST_CONFIG_JSON = "config.json";
            let rawdata = await fs.readFileSync('config.json');
            //let rawdata = fs.readFileSync('config.json');
            let student = JSON.parse(rawdata);
            console.log(student.results);

            const childPythen = spawn('python', ['./main.py',img.name,TEST_CONFIG_JSON]);
            
            childPythen.stdout.on('data', (data)=>{
                console.log('stdout :: '+data);
            });
            childPythen.stderr.on('error', (data)=>{
                console.log('stderr chPythen:: '+data);
            });
            childPythen.stdout.on('close', (code)=>{
                console.log('ChildPythen process exited with code : '+code);
            });
            
            
            /*var fileName = './signal_strength.png';
            /*res.sendFile(fileName, options, function(err){
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
        */
            await delay(5000);
            //delay(5000);
            fs.readFile(__dirname+"/signal_strength.png", function (err, data) {
                if (err) throw err;
                fs.writeFile(__dirname+'/Heatmaps/image'+Date.now()+'.jpeg', data, function (err) {
                    if (err) throw err;
                    console.log('It\'s saved!');
                });
            });
        
            res.sendFile(__dirname+"/signal_strength.png")
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get('/get_heatmap',(req,res)=>{
    res.sendFile(__dirname+"/signal_strength.png");
})
//make uploads directory static
app.use(express.static('uploads'));
app.use(express.static('images'));
//start app 
const port = process.env.PORT || 3000;
app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);