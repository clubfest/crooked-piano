
Feedbacks = new Meteor.Collection('feedbacks');

Meteor.methods({
  'submitFeedback': function(content) {
    check(content, String);
    var data = {content: content}
    var user = Meteor.user();

    if (user && user.emails && user.emails.length > 0) {
      data.email = user.emails[0].address;
      data.userId = user._id;
    }
    Feedbacks.insert(data);
  }
})