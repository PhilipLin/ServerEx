var net = require('net');
var readline = require('readline');
var HOST = '54.213.69.170';
var PORT = 6969;

var client = new net.Socket();
var loginname=''
var roomname='';
var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

function kybdinput(callback){
	rl.question("", function(string) {
	  if(callback){callback(string);}
	});
}
function connect(){
	client.connect(PORT, HOST, function() {
		console.log('Im Connecting!!');
	});
}
function write(message){ client.write(message); }


connect();
client.on('data', function(data) {
    console.log(decoder.write(data));
    //if(decoder.write(data)=='<= BYE')
    	//rl.close();
    	//client.destroy();
    kybdinput(write);
});

client.on('close', function() {
    console.log('Connection closed');
    rl.close();
    client.destroy();
});
