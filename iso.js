const { exec } = require("child_process");
var text = new Date(parseInt(process.argv[2])).toISOString();
console.log(text);
exec("clip").stdin.end(text);