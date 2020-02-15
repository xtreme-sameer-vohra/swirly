var fs = require('fs');

var tmpDir = "/tmp/" + Math.random().toString(36).substr(2,5)
var goroutineHeaderRegex = /^goroutine (\d+) \[([^,\]]+)(, ([^,\]]+))?(, locked to thread)?\]:$/

fs.mkdirSync(tmpDir)


var fileToParse = process.argv[2];

function GoroutineStack(id, state, waiting, isLocked) {
  this.id = id;
  this.state = state;
  this.waiting = waiting;
  this.isLocked = isLocked;
  this.stack = "";
};

GoroutineStack.prototype.pushStackLine = function(line) {
  this.stack += line + "\n";
};


function getFileWritePath(fileName){
  return tmpDir + "/" + fileName
}

function copyAssetsToDir(){
  assetsDir = "./build"
  fs.readdir(assetsDir, (err, files) => {
    files.forEach(file => {
      fs.copyFileSync(assetsDir + "/" + file, getFileWritePath(file));
    });
  })
  console.log("Dump can be accessed at :" + getFileWritePath("dump.html"));
  
}

function parseDumpFile(fileName){
  var goroutine;
  var goroutines = [];
  
  var lineReader = require('readline').createInterface({
    input: fs.createReadStream(fileName)
  });
  lineReader.on('line', function (line) {
      if (!goroutine) {
        var match = line.match(goroutineHeaderRegex);
        if (!match) {
          console.log("malformed goroutine stack header:", line);
          process.exit(1);
        }

        goroutine = new GoroutineStack(match[1], match[2], match[4], !!match[5]);
      } else if (line == "") {
        goroutines.push(goroutine);
        goroutine = undefined;
      } else {
        goroutine.pushStackLine(line);
      }
  });

  lineReader.on('close', function(){
    console.log('Finished parsing :' + fileName);
    jsFile = getFileWritePath("dump.js");
    fs.writeFileSync(jsFile, "document.parsedGoRoutines = " + JSON.stringify(goroutines));
    copyAssetsToDir();
  })
}

parseDumpFile(fileToParse);

