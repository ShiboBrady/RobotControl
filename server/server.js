var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var multer = require('multer');
var child_process = require('child_process');

var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: false})
app.use(urlencodedParser);
app.use(multer({dest:'/tmp/'}).array('image'));
app.use(cookieParser());
app.use(express.static('public'));

var RobotStatus = '/data/robot_status';
var StartRobot = '/data/robot_start';
var StopRobot = '/data/robot_stop';
var GetRobotConf = '/data/robot_config';
var AddRobotConf = '/data/add_robot_config';
var DelRobotConf = '/data/del_robot_config';
var ModRobotConf = '/data/mod_robot_config';

var StartRobotProgram = '';
var StopRobotProgram = '';
var SearchRobotProgram = '';

var errorInfo = { 
    0 : "success",
    1 : "exist pid file",
    2 : "not exist exe file",
    3 : "set core space failed",
    4 : "write pid to file failed",
    5 : "start robot program failed",
    6 : "not exist pid folder",
    7 : "not exist pid file",
    8 : "pid file is empty",
    9 : "stop robot program failed",
    10: "second params not exist",
    11: "useless second param",
    12: "param error",

    100: "config file format error",
    101: "parameter error.",
    102: "already exist this config item.",
    103: "already exit this log config file.",
}

var webPort = 8989;
var bashPath = '/home/zhangshibo/bin/compile/my_new_robot/';
var binPath = 'bin/';
var logPath = 'log/';
var confPath = 'configure/';

app.get('/', function(req, res){
    res.sendFile(__dirname + "/" + "index.html");
})

app.get('/index.html', function(req, res){
    res.sendFile(__dirname + "/" + "index.html");
})

app.post(RobotStatus, function(req, res){
    console.log('query robot status.');
    var strCommand = 'cd ' + bashPath + ' && ./s.sh ' + 'status';
    console.log(strCommand);
    var workerProcess = child_process.exec(strCommand, function (error, stdout, stderr) {
        console.log('Status command execute over. stdout: ' + stdout + ' ,stderr: ' + stderr);
        var response = {};
        if (error){
            console.log('Get robot status action error.');
            response['errcode'] = error.code;
            response['message'] = errorInfo[error.code];
        }else{
            var statueList = stdout.split('\n');
            statueList.pop();
            response['errcode'] = 0;
            response['message'] = errorInfo[0];
            response['result'] = statueList;
            console.log('Get robot status action success. ');
        }
        var strSend = JSON.stringify(response);
        console.log('Send to client: ' + strSend);
        res.end(strSend);
    });
    workerProcess.on('exit', function (code) {
        console.log('child progress exit code: ' + code);
    });
})

app.post(StartRobot, function(req, res){
    var strRoomName = req.body.roomname;
    console.log('Start robot for ' + strRoomName);
    var strCommand = 'cd ' + bashPath + ' && ./s.sh ' + 'start ' + strRoomName;
    console.log(strCommand);
    var workerProcess = child_process.exec(strCommand, function (error, stdout, stderr) {
        console.log('start command execute over. stdout: ' + stdout + ' ,stderr: ' + stderr);
        var response = {};
        if (error) {
            response['errcode'] = error.code;
            response['message'] = errorInfo[error.code];
        } else {
            response['errcode'] = 0;
            response['message'] = 'Robot started success.';
            console.log('Start robot action success.');
        }
        var strSend = JSON.stringify(response);
        console.log('Send to client: ' + strSend);
        res.end(strSend);
    });
    workerProcess.on('exit', function (code) {
        console.log('child progress exit code: ' + code);
    });
})

app.post(StopRobot, function(req, res){
    var strRoomName = req.body.roomname;
    console.log('Stop robot for ' + strRoomName);
    var strCommand = 'cd ' + bashPath + ' && ./s.sh ' + 'stop ' + strRoomName;
    console.log(strCommand);
    var workerProcess = child_process.exec(strCommand, function (error, stdout, stderr) {
        console.log('Stop command execute over. stdout: ' + stdout + ' ,stderr: ' + stderr);
        var response = {};
        if (error) {
            response['errcode'] = error.code;
            response['message'] = errorInfo[error.code];
        } else {
            response['errcode'] = 0;
            response['message'] = 'Robot stoped success.';
            console.log('Stop robot action success.');
        }
        var strSend = JSON.stringify(response);
        console.log('Send to client: ' + strSend);
        res.end(strSend);
    });
    workerProcess.on('exit', function (code) {
        console.log('child progress exit code: ' + code);
    });
})

app.post(GetRobotConf, function(req, res){
    var response = {};
    try {
        var fileContent = fs.readFileSync(bashPath + confPath  + '/robot.conf','utf-8');
        if (fileContent == "" || fileContent == null) {
            console.log("file is empty.");
            response['result'] = {};
        } else {
            var config = JSON.parse(fileContent);
            console.log(config);
            response['result'] = config;
        }
        response['errcode'] = 0;
        response['message'] = errorInfo[response['errcode']];
    } catch (error) {
        console.error(error);
        response['errcode'] = 100;
        response['message'] = errorInfo[response['errcode']];
    }
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

app.post(AddRobotConf, function(req, res){
    var response = {};
    try {
        var strNewObjName = req.body.roomname;
        var strNewObj = req.body.data;
        console.log(strNewObjName);
        console.log(strNewObj);
        var newObj = JSON.parse(strNewObj);        
    } catch (error) {
        console.error(error);
        response['errcode'] = 101;
        response['message'] = errorInfo[response['errcode']];
        var sendRet = JSON.stringify(response);
        console.log(sendRet);
        res.end(sendRet);
        return;
    }

    try {
        AddRobotConfFromConfFile(strNewObjName, newObj);//从进程配置文件中添加
        AddRobotConfFromLogConfFile(strNewObjName);//从日志配置文件中添加
        AddRobotConfFromShellFile(strNewObjName);//从启动脚本中添加
    } catch (error) {
        console.error(error);
        response['errcode'] = error;
        response['message'] = errorInfo[response['errcode']];
        var sendRet = JSON.stringify(response);
        console.log(sendRet);
        res.end(sendRet);
        return;
    }
    response['errcode'] = 0;
    response['message'] = 'success';
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

app.post(DelRobotConf, function(req, res){
    try {
        var strObjName = req.body.roomname;
    } catch (error) {
        console.error(error);
        response['errcode'] = 101;
        response['message'] = errorInfo[response['errcode']];
        var sendRet = JSON.stringify(response);
        console.log(sendRet);
        res.end(sendRet);
        return;
    }

    try {
        DelRobotConfFromConfFile(strObjName); //从进程配置文件中删除
        DelRobotConfFromLogConfFile(strObjName); //从日志配置文件中删除
        DelRobotConfFromShellFile(strObjName); //从启动脚本中删除
    } catch (error) {
        console.error(error);
        response['errcode'] = error;
        response['message'] = errorInfo[response['errcode']];
        var sendRet = JSON.stringify(response);
        console.log(sendRet);
        res.end(sendRet);
        return;
    }
    var response = {};
    response['errcode'] = 0;
    response['message'] = 'success';
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

app.post(ModRobotConf, function(req, res){
    try {
        var strObjName = req.body.roomname;
        var strObj = req.body.data;
        console.log(strObjName);
        console.log(strObj);
        var newObj = JSON.parse(strObj);
    } catch (error) {
        console.error(error);
        response['errcode'] = 101;
        response['message'] = errorInfo[response['errcode']];
        var sendRet = JSON.stringify(response);
        console.log(sendRet);
        res.end(sendRet);
        return;
    }

    try {
        ModRobotConfFromConfFile(strObjName, newObj);//修改进程配置文件
    } catch (error) {
        console.error(error);
        response['errcode'] = error;
        response['message'] = errorInfo[response['errcode']];
        var sendRet = JSON.stringify(response);
        console.log(sendRet);
        res.end(sendRet);
        return;
    }

    var response = {};
    response['errcode'] = 0;
    response['message'] = 'success';
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

function AddRobotConfFromConfFile(roomname, obj) {
    var wholeConfFileName = bashPath + confPath + 'robot.conf';
    console.log('whole File name is: ' + wholeConfFileName);
    var config = {};
    var fileContent = fs.readFileSync(wholeConfFileName,'utf-8');
    if (fileContent == "" || fileContent == null) {
        console.log('file is empty.');
    } else {
        console.log('file content is: ' + fileContent);
        try {
            config = JSON.parse(fileContent);
        } catch (error) {
            console.error(error);
            throw 100;
        }
        console.log('after parse: ' + JSON.stringify(config));
    }
    
    if (config[roomname] != undefined) {
        console.error("Already exist this roomname configure: " + roomname);
        throw 102;
    }
    config[roomname] = obj;
    fs.writeFile(wholeConfFileName, JSON.stringify(config, null, 4), function(err){
        if(err) {
            console.error(err);
        } else {
            console.log('写入成功');
        }
    });
}

function AddRobotConfFromLogConfFile(roomname) {
    var fileName = roomname + '.properties';
    var wholeFilename = bashPath + confPath + fileName; 
    console.log('whole File name is: ' + wholeFilename);
    fs.exists(wholeFilename, function(exists) {
        if (exists) {
            console.log('File ' + fileName + ' is already exist.');
            throw 103;
        } else {
            var logConf = 
            '#配置文件（其它日志级别配置相同）： \r\n' +
            'log4cplus.rootLogger=DEBUG, DEBUG_MSGS \r\n' +
            '################################DEBUG#################################### \r\n' +
            '#设置日志追加到文件尾  \r\n' +
            'log4cplus.appender.DEBUG_MSGS=log4cplus::RollingFileAppender \r\n' +
            '#设置日志文件大小  \r\n' +
            'log4cplus.appender.DEBUG_MSGS.MaxFileSize=10240MB  \r\n' +
            '#设置生成日志最大个数  \r\n' +
            'log4cplus.appender.DEBUG_MSGS.MaxBackupIndex=5 \r\n' +
            '#设置输出日志路径 \r\n' +
            'log4cplus.appender.DEBUG_MSGS.File=../log/' + roomname + '/debug.log  \r\n' +
            'log4cplus.appender.DEBUG_MSGS.layout=log4cplus::PatternLayout  \r\n' +
            '#设置日志打印格式  \r\n' +
            'log4cplus.appender.DEBUG_MSGS.layout.ConversionPattern=[%D{%Y-%m-%d %H:%M:%S}]%p%m%n  \r\n';
            
            fs.writeFile(wholeFilename, logConf, function(err){
                if(err) {
                    console.error(err);
                } else {
                    console.log('写入成功');
                }
            });
        }
    });
}

function AddRobotConfFromShellFile(roomname) {
    var wholeShellFileName = bashPath + confPath + 'roomname.conf'; 
    var allRoomName = fs.readFileSync(wholeShellFileName,'utf-8');
    var roomNameArr = allRoomName.split(/\s+/);
    console.log(roomNameArr);
    var ret = roomNameArr.indexOf(roomname);
    if (-1 == ret) {
        roomNameArr.push(roomname);
        var newAllRoomName = '';
        for (var roomIndex in roomNameArr) {
            newAllRoomName += roomNameArr[roomIndex];
            if (roomIndex != (roomNameArr.length - 1)) {
                newAllRoomName += ' ';
            }
        }
        console.log('New room name is: ' + newAllRoomName);
        fs.writeFile(wholeShellFileName, newAllRoomName, function(err){
            if(err) {
                console.error(err);
            } else {
                console.log('写入成功');
            }
        });
        return;
    } else {
        console.log('Room name ' + roomname + ' already exist.');
    }
}

function DelRobotConfFromConfFile(roomname) {
    var wholeConfFileName = bashPath + confPath + 'robot.conf';
    console.log('whole File name is: ' + wholeConfFileName);
    var fileContent = fs.readFileSync(wholeConfFileName,'utf-8');
    if (fileContent == "" || fileContent == null) {
        console.log('conf is empty.');
    } else {
        console.log('file content is: ' + fileContent);
        try {
            var config = JSON.parse(fileContent);
        } catch (error) {
            console.error(error);
            throw 100;
        }
        console.log('after parse: ' + JSON.stringify(config));
        if (config[roomname] != undefined) {
            delete config[roomname];
            console.log('Has delete roomname ' + roomname + ' in robot.conf.');
            fs.writeFile(wholeConfFileName, JSON.stringify(config, null, 4), function(err){
                if(err) {
                    console.error(err);
                } else {
                    console.log('写入成功');
                }
            });
        } else {
            console.error("Cannot find roomname " + roomname + " in robot.conf");
        }
    }
}

function DelRobotConfFromLogConfFile(roomname) {
    var fileName = roomname + '.properties';
    var wholeFilename = bashPath + confPath + fileName; 
    console.log('whole File name is: ' + wholeFilename);
    fs.exists(wholeFilename, function(exists) {
        if (exists) {
            fs.unlinkSync(wholeFilename);
            console.error('Delete file ' + wholeFilename);
        } else {
            console.error('File ' + wholeFilename + ' doesn\'t exist.');
        }
    });
}

function DelRobotConfFromShellFile(roomname) {
    var wholeShellFileName = bashPath + confPath + 'roomname.conf'; 
    var allRoomName = fs.readFileSync(wholeShellFileName,'utf-8');
    var roomNameArr = allRoomName.split(/\s+/);
    console.log(roomNameArr);
    var ret = roomNameArr.indexOf(roomname);
    if (-1 == ret) {
        console.log('Room name ' + roomname + ' doesn\'t exist.');
        return;
    } else {
        roomNameArr.splice(ret, 1);
        var newAllRoomName = '';
        for (var roomIndex in roomNameArr) {
            newAllRoomName += roomNameArr[roomIndex];
            if (roomIndex != (roomNameArr.length - 1)) {
                newAllRoomName += ' ';
            }
        }
        console.log('New room name is: ' + newAllRoomName);
        fs.writeFile(wholeShellFileName, newAllRoomName, function(err){
            if(err) {
                console.error(err);
            } else {
                console.log('写入成功');
            }
        });
    }
}


function ModRobotConfFromConfFile(roomname, obj) {
    var wholeConfFileName = bashPath + confPath + 'robot.conf';
    console.log('whole File name is: ' + wholeConfFileName);
    var fileContent = fs.readFileSync(wholeConfFileName,'utf-8');
    console.log('file content is: ' + fileContent);
    var config = {};
    if (fileContent == "" || fileContent == null) {
        console.error('Robot config file is empty.');
    } else {
        try {
            config = JSON.parse(fileContent);
        } catch (error) {
            console.error(error);
            throw 100;
        }
    }
    console.log('after parse: ' + JSON.stringify(config));
    if (config[roomname] != undefined) {
        console.error("Doesn't exist roomname " + roomname + " config.");
    }
    config[roomname] = obj;
    fs.writeFile(wholeConfFileName, JSON.stringify(config, null, 4), function(err){
        if(err) {
            console.error(err);
        } else {
            console.log('写入成功');
        }
    });
}

var server = app.listen(webPort, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log("http://%s:%s", host, port);
})
