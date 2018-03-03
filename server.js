var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users=[];//保存所有在线用户的昵称
app.use('/', express.static(__dirname + '/www'));
server.listen(80);
//socket部分
io.on('connection', function(socket) {
    //昵称设置
    socket.on('login', function(name) {
        if (users.indexOf(name) > -1) {
            socket.emit('用户已存在');
        } else {
            socket.userIndex = users.length;
            socket.name = name;
            users.push(name);
            socket.emit('用户登录成功');
            io.sockets.emit('system', name); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    });
		//断开连接的事件
		socket.on('disconnect', function() {
    	//将断开连接的用户从users中删除
    	users.splice(socket.userIndex, 1);
    	//通知除自己以外的所有人
    	socket.broadcast.emit('system', socket.name, users.length, 'logout');
	});
	
	//接收新消息
    socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
	
	//接收用户发来的图片
 	socket.on('img', function(imgData) {
    	//通过一个newImg事件分发到除自己外的每个用户
     	socket.broadcast.emit('newImg', socket.nickname, imgData);
 	});
	
});


socket.on('login', function(name) {
     if (users.indexOf(name) > -1) {
         socket.emit('用户已存在');
     } else {
         socket.userIndex = users.length;
         socket.name = name;
         users.push(name);
         socket.emit('用户登录成功');
         io.sockets.emit('system', name, users.length, 'login');
     };
 });
 