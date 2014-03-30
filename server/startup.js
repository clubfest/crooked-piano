
// Meteor.AppCache.config({onlineOnly: ['/packages/jquery-ui', '/packages/x-editable-bootstrap']});
Meteor.startup(function() {
  SongFiles._ensureIndex('createdAt', {unique: 1, sparse: 1});
  SongFiles._ensureIndex('viewCount');
})