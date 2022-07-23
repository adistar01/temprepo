const caller = ()=>{
const {spawn} = require('child_process');

const childPython = spawn('python', ['./conv.py']);

childPython.stdout.on('data', (data)=>{
    console.log('stdout :: '+data);
});

childPython.stderr.on('data', (data)=>{
    console.log('stderr :: '+data);
});

childPython.stdout.on('close', (code)=>{
    console.log('Child process exited with code : '+code);
});
}

module.exports = caller;