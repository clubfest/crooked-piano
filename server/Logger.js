
Meteor.methods({
  log: function(content) {
    var fs = Npm.require('fs');
    fs.writeFileSync('/home/lam/final/tests/log.txt', content);
  },
})