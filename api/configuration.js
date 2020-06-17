module.exports.loadConfiguration = function(fileName) {
    // Loads bot configuration.

    const fs = require('fs');

    let output_unparsed = fs.readFileSync(fileName);
    
    return JSON.parse(output_unparsed)
}