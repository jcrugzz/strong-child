
var os = require('os');
var fs = require('fs');
var once = require('one-time');
var path = require('path');
var Forkee = require('forkee');
var duplexify = require('duplexify');
var uuid = require('uuid');

module.exports = StrongChild;

function StrongChild() {
  if (!(this instanceof StrongChild)) return new StrongChild();

  this.stream = duplexify();
  this.fork = new Forkee()
    .on('request', this._onReq.bind(this));

  //
  // Add a log message to the stream that proxies a log event to the parent
  //
  this.stream.log = this.log.bind(this);

  return this.stream;

}

StrongChild.prototype.log = function (obj) {
  this.fork.notify('log', obj);
};

StrongChild.prototype._onReq = function (message, callback) {
  this.callback = once(callback);
  this.stream.on('error', this.callback);

  this.filePath = message.__file;
  this.returnPath =  message.__return || path.join(os.tmpdir(), uuid.v4());
  if (Object.keys(message).length > 1) {
    delete message.__file;
    this.stream.emit('request', message);
  }

  //
  // Set both sides of the Duplex
  //
  this.stream.setReadable(fs.createReadStream(this.filePath));
  this.writable = fs.createWriteStream(this.returnPath)
    .on('finish', this._onFinish.bind(this));

  this.stream.setWritable(this.writable);
};

//
// Return the callback with the path to the file that the parent will use to
// read from
//
StrongChild.prototype._onFinish = function () {
  this.callback(null, { __file: this.returnPath });
  this.writable = null;
};
