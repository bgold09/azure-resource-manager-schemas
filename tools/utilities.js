var fs = require("fs");
var path = require("path");
var syncRequest = require("sync-request")

var currentFileDirectory = __dirname;

module.exports.getSchemasFolderPath = getSchemasFolderPath;
function getSchemasFolderPath()
{
    return path.join(currentFileDirectory, "../schemas/");
}

module.exports.getTestsFolderPath = getTestsFolderPath;
function getTestsFolderPath()
{
    return path.join(currentFileDirectory, "../tests/");
}

module.exports.pathExists = pathExists;
function pathExists(path)
{
    var result = true;
    try
    {
        fs.statSync(path);    
    }
    catch(e)
    {
        result = false;
    }
    return result;
}

module.exports.forEachFile = forEachFile;
function forEachFile(folder, callback)
{
    var files = fs.readdirSync(folder);
    for(var fileIndex in files)
    {
        var filePath = path.join(folder, files[fileIndex]);
        
        var fileStats = fs.statSync(filePath);
        if(fileStats.isDirectory())
        {
            forEachFile(filePath, callback);
        }
        else if(fileStats.isFile())
        {
            callback(filePath);
        }
    }
}

module.exports.getFiles = getFiles;
function getFiles(folder, filterFunction)
{
    var files = [];
    
    if(typeof filterFunction === "string")
    {
        var fileExtension = filterFunction;
        filterFunction = function(filePath) { return filePath.endsWith(fileExtension); };
    }
    
    forEachFile(folder, function(filePath)
    {
        if(filterFunction(filePath))
        {
            files.push(filePath);
        }
    });
    
    return files;
}

function stripUTF8BOM(value)
{
    return value.replace(/^\uFEFF/, '');
}

module.exports.readJSONFile = readJSONFile;
function readJSONFile(filePath)
{
    var fileContents = fs.readFileSync(filePath, "utf8");
    var fileContentsWithoutBOM = stripUTF8BOM(fileContents);
    return JSON.parse(fileContentsWithoutBOM);
}

module.exports.readJSONUri = readJSONUri;
function readJSONUri(uri)
{
    var response = syncRequest("GET", uri);
    var responseBody = stripUTF8BOM(response.getBody("utf8"));
    return JSON.parse(responseBody);
}

module.exports.contains = contains;
function contains(container, value, comparisonFunction)
{
    if(!comparisonFunction)
    {
        comparisonFunction = function(lhs, rhs) { return lhs === rhs; };
    }
    
    var result = false;
    
    for(var i = 0; i < container.length; ++i)
    {
        if(comparisonFunction(container[i], value))
        {
            result = true;
            break;
        }
    }
    
    return result;
}

module.exports.unique = unique;
function unique(array)
{
    var result = [];
    
    for(var i = 0; i < this.length; ++i)
    {
        if(!contains(result, array[i]))
        {
            result.push(array[i]);
        }
    }
    
    return result;
}