/**
 * ws-chat-client.js
 *
 * depends on jQuery and jQuery UI.
 */

// Page UI object.
var Page = {
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
    var post = {
      time: '2011-12-28 12:34:56',
      name: 'foobar',
      post: 'This is a dummy post.',
    };

    this.addUserPost(post);
    return false;
  },

  addUserPost : function (post) {
    var $log = $('<div />').addClass('log msg_user').hide();
    $log.append($('<span />').addClass('msg_time').text(post.time));
    $log.append($('<span />').addClass('msg_name').text(post.name));
    $log.append($('<span />').addClass('msg_post').text(post.post));

    $('#log').prepend($log);
    $log.show('drop', {direction: 'up'}, 'fast');
  }
};

$(function () {
  Page.registerHandlers();
});
