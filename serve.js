const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { spawn } = require('child_process');

const app = express();
//const router = express.Router();

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
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
//app.use(express.static('images'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+"/index.html");
  })

app.get('/acc', (req, res, next) => {
    res.sendFile(__dirname+"/access.html");
  });

// upoad single file
app.post('/generate-heatmap', (req, res) => {
    try {
        if(!req.files || (req.files.avatar && !req.files.floor) || (req.files.avatar && !req.files.floor)) {
            
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {



            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded files
            let avatar = req.files.avatar;
            let img = req.files.floor;
            //let val=true;
            
            
            const childPython = spawn('python', ['conv.py','config.json',avatar.name]);
            childPython.stdout.on('data', (data)=>{
                console.log('stdout ::'+data);
            });
            
            childPython.stderr.on('data', (data)=>{
                console.log('stderr :: '+data);
            });
            
            childPython.stdout.on('close', (code)=>{
                console.log('ChildPython process exited with code : '+code);
            });
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/' + avatar.name);
            img.mv('./images/' + img.name);
            

            
            
            let TEST_CONFIG_JSON = "config.json";

            const childPythen = spawn('python', ['main.py',img.name,TEST_CONFIG_JSON]);
            
            childPythen.stdout.on('data', (data)=>{
                console.log('stdout :: '+data);
            });
            childPythen.stderr.on('data', (data)=>{
                console.log('stderr :: '+data);
            });
            childPythen.stdout.on('close', (code)=>{
                console.log('ChildPythen process exited with code : '+code);
            });
            
            
            
            res.sendFile(__dirname+"/signal_strength.png");
            /*res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    name2: img.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            })
            */
            
        }
    } catch (err) {
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