module.exports.log = function(msg) {
    console.log("[Jolastu] " + msg);
}

module.exports.log_fatal = function(msg) {
    console.error("[FATAL] [Jolastu] " + msg);

    // Throws the application out if the error return didn't do it.
    process.exit(1);
}