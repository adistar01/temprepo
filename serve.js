const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { spawn } = require('child_process');
const fs = require('fs')
const mime = require('mime')

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




// index page displayed for get request in case file and image are uploaded through web
app.get('/', (req, res) => {
    res.sendFile(__dirname+"/index.html");
  })

// for adding delay until response file is generated
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  } 



// api for handling post request and sending heatmap generated
app.post('/generate-heatmap', async(req, res) => {
    try {

        // if both file and base64 image are not present
        if(!req.body.base64image && !req.files){
            console.log('No i/p');
            res.status(404).send( 'No input found');
        }


        // if text file is not sent
        else if(!req.files) {
            console.log('No txt file');
            res.status(400).end( 'No txt file uploaded');
        }


        // if image file is not sent
        else if(!req.body.base64image){
            console.log('No image');
            res.status(400).end( 'No image uploaded!');
        }



        else {
            //Use the name of the input field (i.e. "txtFile") to retrieve the uploaded files
            let txtFile = req.files.txtFile;

            // image buffer to store the buffer value of image sent
            let imageBuffer = new Buffer(req.body.base64image, 'base64');
            
            //saving image file sent
            let fileName = 'image'+Date.now()+'.png';
            try {
            fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
            } catch (e) {
            next(e);
            }
            
            // storing the text file sent
            let path="";
            temp = req.files.txtFile.data.toString('utf-8');
            console.log(temp);
            try {
                await fs.writeFileSync(__dirname+'/uploads/'+txtFile.name, temp);
                path = __dirname+"/uploads/"+txtFile.name;
              } catch (err) {
                console.log(err);
              }


            // running spawn method to generate the json file according to which heatmap will be generated
            const childPython = spawn('python', ['./conv.py',path]);

        
            childPython.stdout.on('data', (data)=>{
                console.log('stdout ::'+data);
            });
            
            // in case error occurs
            childPython.stderr.on('err', (data)=>{
                console.log('stderr Chpython : '+data);
            });


            // after script execution is complete
            childPython.stdout.on('close', (code)=>{
                console.log(`ChildPython process exited with code : ${code}`);
            });

            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            txtFile.mv(__dirname+'/uploads/' + txtFile.name);
            
            let TEST_CONFIG_JSON = "config.json";
            

            //running spawn method to generate the heatmap according to json file generated
            const childPythen = spawn('python', ['main.py',fileName,TEST_CONFIG_JSON]);
            
            childPythen.stdout.on('data', (data)=>{
                console.log('stdout :: '+data);
            });

            childPythen.stderr.on('error', (data)=>{
                console.log('stderr chPythen:: '+data);
            });

            childPythen.stdout.on('close', (code)=>{
                console.log();
                console.log('ChildPythen process exited with code : '+code);
            });


            // waiting for heatmap to get generated
            await delay(7000);

            //storing the heatmap generated
            fs.readFile(__dirname+"/signal_strength.png", function (err, data) {
                if (err) throw err;
                fs.writeFile(__dirname+'/Heatmaps/image'+Date.now()+'.png', data, function (err) {
                    if (err) throw err;
                    console.log('It\'s saved!');
                });
            });
        
            // sending heatmap as response
            res.sendFile(__dirname+"/signal_strength.png")
        }
    } catch (err) {
        // in case of any internal error on server
        res.status(500).send(err);
    }
});


//make uploads directory static
app.use(express.static('uploads'));
app.use(express.static('images'));





//start app 
const port = process.env.PORT || 3000;

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);