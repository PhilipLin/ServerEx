var net = require('net');
var HOST = '127.0.0.1';
var PORT = process.env.PORT || 6969;

var rooms = [{'name':'chat','people':[]},{'name':'hottub','people':[]}];
var people = [{'name':'','socket':'','room':false,'inRoom':''},
              {'name':'philip','socket':'','room':false,'inRoom':''}];
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');


net.createServer(function(sock) {
    greeting(sock);
    sock.on('data', function(data) {
        if(hasLogin(sock)==false){
            login(sock,data);
        }
        else{
            if(decoder.write(data)=="\/rooms"){
                greeting2(sock);//tells client availible rooms
            }
            else if(decoder.write(data)=="\/quit"){
                sock.write('<= BYE')
                removePerson(sock);
                leaveRoom(sock,getPerson(sock).inRoom);
                greeting(sock);
            }
            else if(hasRoom(sock)==false){
                enterroom(sock,data);
            }
            else{
                var temp_person = getPerson(sock);
                broadcastSockets(temp_person.name+": "+decoder.write(data),temp_person.inRoom);
                if(decoder.write(data)=="\/leave"){
                    broadcastSockets("* user has left chat: "+temp_person.name+"\n",temp_person.inRoom);
                    leaveRoom(sock,temp_person.inRoom);
                }
            }
        }
    });
    //how to handle sudden closing from the client-side?????
    sock.on('end', function(data) {
        removePerson(sock);
        leaveRoom(sock,getPerson(sock).inRoom);
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
}).listen(PORT, HOST);
console.log('Server listening on ' + HOST +':'+ PORT);





function login(sock,data){
    var logindata = decoder.write(data)
    if(containsName(people,logindata)==false){
        sock.write('<= Welcome '+logindata+'!\n');
        people.push({'name':logindata,'socket':sock,'room':false,'inRoom':''});//add client to people availible
    }
    else{
        sock.write('<= Sorry, name taken.\n<=Login Name?\n');
    }
}
function enterroom(sock,data){
    var roomdata = decoder.write(data);
    if(containsaddRoom(roomdata,sock)){
        for(var i =0;i<rooms.length;i++){
            if(roomdata ==('\/join '+rooms[i].name)){
                sock.write('<= entering room: '+rooms[i].name+'\n');
                for(var i2=0;i2<(rooms[i].people).length;i2++){
                    sock.write('<= * '+(rooms[i].people)[i2].name+'\n');
                }
                broadcastSocketsExclude('<= * new user joined chat: '+getPerson(sock).name+'\n',rooms[i].name,sock);
            }
        }
    }
    else{
        sock.write('<= Sorry, no room with that name\n');
    }
}






function broadcastSockets(message,room){
    console.log('start broadcast');
    for(var i=0;i<rooms.length;i++){
        if(rooms[i].name==room){
            var people_in_room=rooms[i].people;
            for(var i2=0;i2<people_in_room.length;i2++){
                console.log('INSIDEROOM:'+people_in_room[i2].name);
                people_in_room[i2].socket.write(message);
            }
        }
    }
}
function broadcastSocketsExclude(message,room,excludesock){
    console.log('start broadcast');
    for(var i=0;i<rooms.length;i++){
        if(rooms[i].name==room){
            var people_in_room=rooms[i].people;
            for(var i2=0;i2<people_in_room.length;i2++){
                if(excludesock != people_in_room[i2].socket)
                    people_in_room[i2].socket.write(message);
            }
        }
    }
}





//HELPER FUNCTIONS
function removePerson(sock){
    for(var i=0;i<people.length;i++){
        if(people[i].socket==sock)
            people.splice(i,1);
    }
}
function leaveRoom(sock,room){
    for(var i=0;i<people.length;i++){
        if(people[i].socket==sock){
            people[i].inRoom='';
            people[i].room=false;
        }
    }
    for(var i=0;i<rooms.length;i++){
        if(rooms[i].name==room){
            for(var i2=0;i2<rooms[i].people.length;i2++){
                if(rooms[i].people[i2].socket==sock)
                    rooms[i].people.splice(i, 1);
            }
        }
    }
    console.log()
}
function hasRoom(sock){
    console.log('hasRoom');
    for(var i=0;i<people.length;i++){
        if(people[i].socket==sock && people[i].room==true)
            return true;
    }
    return false;
}
function hasLogin(sock){
    for(var i=0;i<people.length;i++){
        if(people[i].socket==sock)
            return true;
    }
    return false;
}
function cbfunction(){console.log('callback');};//callback
function greeting(sock){
    sock.write('<= Welcome to the XYZ chat server. \n<=Login Name?\n');
}
function greeting2(sock){
    sock.write('<= Active rooms are: \n');
    for(var i=0;i<rooms.length;i++){
        sock.write('<= * '+rooms[i].name+' ('+rooms[i].people.length+')\n');
    }
    sock.write('<= end of list. \n');
}
function containsName(array,name){
    for(var i=0;i<array.length;i++){
        if(name==array[i].name)
            return true;
    }
    return false;
}
function getPerson(sock)
{
    for(var i=0;i<people.length;i++){
        if(people[i].socket==sock)
            return people[i];
    }
    return false;
}
function containsaddRoom(element,sock){
    for(var i=0;i<rooms.length;i++){
        if(element==('\/join '+rooms[i].name)){
            (rooms[i].people).push(getPerson(sock));
            joinRoom(sock,rooms[i].name);
            return true;
        }
    }
    return false;
}
function joinRoom(sock,room){
    console.log('start join');
    for(var i=0;i<people.length;i++)
    {
        if(people[i].socket==sock)
        {
            people[i].room=true;
            people[i].inRoom=room;
            console.log('joined!!!'+people[i].name+' '+people[i].room);
        }
    }
}
