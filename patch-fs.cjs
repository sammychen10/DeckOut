"use strict";
/**
 * Node.js 24 on Windows returns EISDIR from fs.readlink() on regular files.
 * Webpack expects EINVAL for non-symlinks and treats any other error as fatal.
 * This patch converts EISDIR → EINVAL so builds work on Node 24 + Windows.
 *
 * Loaded via NODE_OPTIONS=--require=./patch-fs.cjs so it applies in all
 * threads (main + webpack worker) before any other module runs.
 */
const fs = require("fs");

function toEINVAL(err, path) {
  return Object.assign(
    new Error("EINVAL: invalid argument, readlink '" + path + "'"),
    { code: "EINVAL", syscall: "readlink", path: path }
  );
}

const _rl = fs.readlink.bind(fs);
fs.readlink = function (path, options, cb) {
  if (typeof options === "function") { cb = options; options = {}; }
  _rl(path, options, function (err, link) {
    cb(err && err.code === "EISDIR" ? toEINVAL(err, path) : err, link);
  });
};

const _rlSync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function (path, options) {
  try { return _rlSync(path, options); }
  catch (err) { throw (err && err.code === "EISDIR") ? toEINVAL(err, path) : err; }
};

const orig = fs.promises.readlink.bind(fs.promises);
fs.promises.readlink = async function (path, options) {
  try { return await orig(path, options); }
  catch (err) { throw (err && err.code === "EISDIR") ? toEINVAL(err, path) : err; }
};
