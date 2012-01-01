/**
 * ws-chat-server.js
 *
 * depends on socket.io(WebSocket).
 */

var io = require('socket.io');

function WSChatServer(maxCacheLogs) {
  this.maxCacheLogs = maxCacheLogs || 15;
}
WSChatServer.prototype = {
  ws : null,

  users : [],

  logs : [],

  attach : function (app) {
    this.ws = io.listen(app);

    var self = this;
    this.ws.sockets.on('connection', function (socket) { return self.onConnection(socket); });
  },

  onConnection : function (socket) {
    var self = this;
    socket.on('join', function (data) { return self.onJoin(socket, data); });
    socket.on('leave', function (data) { return self.onLeave(socket, data); });
    socket.on('post', function (data) { return self.onPost(socket, data); });
    socket.on('disconnect', function () { return self.onDisconnect(socket); });

    socket.emit('connected', { logs: this.logs });
  },

  onDisconnect : function (socket) {
    var self = this;
    socket.get('name', function (err, name) {
      var res = {};
      if (!err && name in self.users) {
        delete self.users[name];

        var msg = self.createLeaveMessage(name);
        self.addMessage(msg);
        self.sendMessage(socket, msg);
      }
    });
  },

  onJoin : function (socket, data) {
    var res = {};
    if (data.name == null) {
      res.error = 'Please enter user name.';
      socket.emit('joined', res);
      return;
    } else if (data.name in this.users) {
      res.error = 'User name "' + data.name + '" already used.';
      socket.emit('joined', res);
      return;
    }

    var self = this;
    socket.set('name', data.name, function () {
      self.users[data.name] = {};
      res.name = data.name;
      socket.emit('joined', res);

      var msg = self.createJoinMessage(data.name);
      self.addMessage(msg);
      self.sendMessage(socket, msg);
    });
  },

  onLeave : function (socket, data) {
    var self = this;
    socket.get('name', function (err, name) {
      var res = {};
      if (err) {
        res.error = 'An error occured.';
        socket.emit('left', res);
      } else {
        delete self.users[name];
        socket.emit('left', res);

        var msg = self.createLeaveMessage(name);
        self.addMessage(msg);
        self.sendMessage(socket, msg);
      }
    });
  },

  onPost : function (socket, data) {
    if (data.message == null || data.message.length == 0) {
      var res = {
        error: 'Message is empty.',
      };
      socket.emit('posted', res);
      return;
    }

    var self = this;
    socket.get('name', function (err, name) {
      var res = {};
      if (err) {
        res.error = 'An error occured.';
        socket.emit('posted', res);
      } else {
        socket.emit('posted', res);

        var msg = self.createUserMessage(name, data.message);
        self.addMessage(msg);
        self.sendMessage(socket, msg);
      }
    });
  },

  addMessage : function (msg) {
    this.logs.push(msg);
    if (this.logs.length > this.maxCacheLogs)
      this.logs.shift();
  },

  sendMessage : function (socket, msg) {
    socket.emit('new-message', msg);
    socket.broadcast.emit('new-message', msg);
  },

  createJoinMessage : function (name) {
    return this.createSystemMessage(name + ' has joined the chat!');
  },

  createLeaveMessage : function (name) {
    return this.createSystemMessage(name + ' has left the chat.');
  },

  createSystemMessage : function (message) {
    return {
      type: 'system',
      time: (new Date()).getTime(),
      message: message
    };
  },

  createUserMessage : function (name, message) {
    return {
      type: 'user',
      time: (new Date()).getTime(),
      name: name,
      message: message
    };
  }
};

exports.createServer = function () {
  return new WSChatServer();
}
