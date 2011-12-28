/**
 * ws-chat-client.js
 *
 * depends on jQuery and jQuery UI.
 */

// DUMMY
var io = {};
io.connect = function () {
}
io.connect.prototype = {
  listeners : {},

  on : function (event, listener) {
    this.listeners[event] = listener;

    if (event === 'connected') {
      window.setTimeout(function () {
        var data = {
          logs: [
            {
              type: 'system',
              time: '2011-12-28 12:34:56',
              message: 'System message.'
            },
            {
              type: 'user',
              time: '2011-12-28 12:34:57',
              name: 'foo',
              message: "I'am foo."
            },
            {
              type: 'user',
              time: '2011-12-28 12:34:57',
              name: 'bar',
              message: "I'am bar."
            },
          ]
        };
        listener(data);
      }, 1000);
    }
  },

  emit : function (event, data) {
    if (event === 'join') {
      this.listeners.joined(data);

      var self = this;
      window.setTimeout(function () {
        var msg = {
          type: 'user',
          time: '2011-12-28 12:34:57',
          name: 'foo',
          message: "I'am foo."
        };
        self.listeners['new-message'](msg);
      }, 2000);
    } else if (event === 'post') {
        var msg = {
          type: 'user',
          time: '2011-12-28 12:34:57',
          name: data.name,
          message: data.message
        };
        this.listeners['new-message'](msg);
    } else if (event === 'leave') {
      this.listeners.left({});
    }
  }
};

// Page UI object.
var Page = {
  socket : null,
  joined : false,
  session : {},

  init : function () {
    this.socket = new io.connect();
    this.registerSocketHandlers();
    this.registerHandlers();
  },

  info : function (message) {
    $('#info p').text(message);
    $('#info').css('background-color', '')
              .show('highlight', 'slow');
  },

  notice : function (message) {
    $('#info p').text(message);
    $('#info').css('background-color', 'lightsalmon')
              .show('highlight', {color: 'red'}, 'slow');
  },

  registerSocketHandlers : function () {
    var self = this;
    this.socket.on('connected', function (data) { return self.onConnected(data); });
    this.socket.on('joined', function (data) { return self.onJoined(data); });
    this.socket.on('left', function (data) { return self.onLeft(data); });
    this.socket.on('new-message', function (data) { return self.onNewMessage(data); });
  },

  registerHandlers : function () {
    var self = this;
    $('#join_form').submit(function (event) { return self.onJoin(event); });
    $('#leave').click(function (event) { return self.onLeave(event); });
    $('#post_form').submit(function (event) { return self.onPost(event); });
  },

  onConnected : function (data) {
    if (data.logs) {
      for (var i = 0; i < data.logs.length; i++) {
        this.addMessage(data.logs[i], false);
      }
      $('#log').fadeIn();
    }
  },

  onJoin : function (event) {
    var name = $('#name').val();
    if (name !== null && name.length)
      this.socket.emit('join', { name: name });
    else
      this.notice('Name must be required to join.');
    return false;
  },

  onJoined : function (data) {
    if (data.error) {
      this.notice(data.error);
    } else {
      this.joined = true;
      this.session.name = data.name;

      this.info("Let's post!");
      $('#screen_name').text(data.name);
      $('.left').fadeOut('fast', function () {
        $('.joined').fadeIn('fast');
      });
    }
  },

  onLeave : function (event) {
    if (!this.joined) return false;
    this.socket.emit('leave', { name: this.session.name });
    return false;
  },

  onLeft : function (data) {
    if (data.error) {
      this.notice(data.error);
    } else {
      this.joined = false;
      this.session = {};

      this.info("Let's join the chat!");
      $('#screen_name').text('');
      $('.joined').fadeOut('fast', function () {
        $('.left').fadeIn('fast');
      });
    }
  },

  onNewMessage : function (msg) {
    this.addMessage(msg);
  },

  onPost : function (event) {
    var message = $('#message').val();
    if (this.joined && message !== null && message.length) {
      var data = {
        name: this.session.name,
        message: message
      };
      this.socket.emit('post', data);
    }

    return false;
  },

  addMessage : function (msg, effect) {
    if (effect == null) effect = true;

    var $msg = this.createLog(msg);
    if ($msg) {
      $msg.hide();
      $('#log').prepend($msg);
      if (effect)
        $msg.show('drop', {direction: 'up'}, 'fast');
      else
        $msg.show();
    }

    // Clipping
    var $log = $('#log');
    if (!$log.hasClass('clipped') && $log.children().length > 15) {
      $log.addClass('clipped');
      $log.css({
        height: $log.height(),
        overflow: 'scroll'
      });
    }
  },

  createLog : function (msg) {
    if (msg.type === 'system')
      return this.createSystemLog(msg);
    else if (msg.type === 'user')
      return this.createUserLog(msg);
    return null;
  },

  createSystemLog : function (msg) {
    var $log = $('<div />').addClass('log msg_system');
    $log.append($('<span />').addClass('msg_time').text(msg.time));
    $log.append($('<span />').addClass('msg_sys_message').text(msg.message));
    return $log;
  },

  createUserLog : function (msg) {
    var $log = $('<div />').addClass('log msg_user');
    $log.append($('<span />').addClass('msg_time').text(msg.time));
    $log.append($('<span />').addClass('msg_name').text(msg.name));
    $log.append($('<span />').addClass('msg_post').text(msg.message));
    return $log;
  }
};

$(function () {
  Page.init();
});
