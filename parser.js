var fs = require('fs');

var dumpFileRegex = /^dump\..*\.vm-.*.log$/
var goroutineHeaderRegex = /^goroutine (\d+) \[([^,\]]+)(, ([^,\]]+))?(, locked to thread)?\]:$/
const folderToScan = '.';

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

    fs.writeFile('./build/' + fileName.replace('.log','.js'), "document.parsedGoRoutines = " + JSON.stringify(goroutines), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Finished saving parsed content :" + fileName);
    });
  })
}


function parseDumpFiles(){
  fs.readdir(folderToScan, (err, files) => {
    files.forEach(file => {
      var match = file.match(dumpFileRegex);
      if (match) {
        parseDumpFile(file)
      }
    });
  })
}

parseDumpFiles();