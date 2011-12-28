/**
 * ws-chat-client.js
 *
 * depends on jQuery and jQuery UI.
 */

// Page UI object.
var Page = {
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

  registerHandlers : function () {
    var self = this;
    $('#join_form').submit(function (event) { return self.onJoin(event); });
    $('#leave').click(function (event) { return self.onLeave(event); });
    $('#post_form').submit(function (event) { return self.onPost(event); });
  },

  onJoin : function (event) {
    return false;
  },

  onLeave : function (event) {
    return false;
  },

  onPost : function (event) {
    // DUMMY
    var msg = {
      type: 'user',
      time: '2011-12-28 12:34:56',
      name: 'foobar',
      post: 'This is a dummy post.',
    };

    this.addMessage(msg);
    return false;
  },

  addMessage : function (msg) {
    var $log = null;
    if (msg.type === 'system')
      $log = this.createSystemLog(msg);
    else if (msg.type === 'user')
      $log = this.createUserLog(msg);

    if ($log) {
      $log.hide();
      $('#log').prepend($log);
      $log.show('drop', {direction: 'up'}, 'fast');
    }
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
    $log.append($('<span />').addClass('msg_post').text(msg.post));
    return $log;
  }
};

$(function () {
  Page.registerHandlers();
});
