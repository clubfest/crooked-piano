var HEADER_LENGTH = 14;

SimpleWriter = {
  init: function(data) {
    this.data = data;
    this.file = this.getMidiHeader(); 
  },

  getMidiHeader: function() {
    var ret = new Uint8Array(HEADER_LENGTH);
  },

  extend: function(){

  },

}