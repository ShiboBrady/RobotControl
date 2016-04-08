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

var GetRobotConf = '/data/robot_config';
var AddRobotConf = '/data/add_robot_config';
var DelRobotConf = '/data/del_robot_config';
var ModRobotConf = '/data/mod_robot_config';

var StartRobotProgram = '';
var StopRobotProgram = '';
var SearchRobotProgram = '';

var SUCCESS = 0;

var retMsg = {
    0 : 'success',
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

app.post('/data/robot_status', function(req, res){
    console.log('query robot status.');
    var workerProcess = child_process.exec('cd ' + bashPath + ' && ./s.sh ' + 'status', function (error, stdout, stderr) {
        if (error){
            response = {
                ErrorCode: error.code,
                SignalReceived: error.signal
            };
            console.log(error.stack);
            console.log(response);
        }
        else{
            response = {
                stdout: stdout,
                stderr: stderr
            };
            console.log(response);
        }
        res.end(JSON.stringify(response));
    });
    workerProcess.on('exit', function (code) {
        console.log('child progress exit code: ' + code);
    });
})

app.post('/data/robot_start', function(req, res){
    var param = req.query.kind;
    console.log('start robot for ' + param);
    var workerProcess = child_process.exec('cd ' + bashPath + ' && ./s.sh ' + 'start ' + param, function (error, stdout, stderr) {
        console.log('start command execute over.');
        if (error){
            response = {
                ErrorCode: error.code,
                SingnalReceived: error.signal
            };
        }else{
            response = {
                stdout: stdout,
                stderr: stderr
            };
        }
        console.log(response);
        res.end(JSON.stringify(response));
    });
    workerProcess.on('exit', function (code) {
        console.log('child progress exit code: ' + code);
    });
})

app.post('/data/robot_stop', function(req, res){
    var param = req.query.kind;
    console.log('stop robot for ' + param);
    var workerProcess = child_process.exec('cd ' + bashPath + ' && ./s.sh ' + 'stop ' + param, function (error, stdout, stderr) {
        if (error){
            response = {
                ErrorCode: error.code,
                SingnalReceived: error.signal
            };
        }else{
            response = {
                stdout: stdout,
                stderr: stderr
            };
        }
        console.log(response);
        res.end(JSON.stringify(response));
    });
    workerProcess.on('exit', function (code) {
        console.log('child progress exit code: ' + code);
    });
})

app.post(GetRobotConf, function(req, res){
    var config=JSON.parse(fs.readFileSync(bashPath + confPath  + '/robot.conf','utf-8'));
    console.log(config);
    var response = {};
    response['errcode'] = 0;
    response['message'] = 'success';
    response['result'] = config;
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

app.post(AddRobotConf, function(req, res){
    var strNewObjName = req.body.roomname;
    var strNewObj = req.body.data;
    console.log(strNewObjName);
    console.log(strNewObj);
    var newObj = JSON.parse(strNewObj);
    AddRobotConfFromConfFile(strNewObjName, newObj);//从进程配置文件中添加
    AddRobotConfFromLogConfFile(strNewObjName);//从日志配置文件中添加
    AddRobotConfFromShellFile(strNewObjName);//从启动脚本中添加
    var response = {};
    response['errcode'] = 0;
    response['message'] = 'success';
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

app.post(DelRobotConf, function(req, res){
    var strObjName = req.body.roomname;
    DelRobotConfFromConfFile(strObjName); //从进程配置文件中删除
    DelRobotConfFromLogConfFile(strObjName); //从日志配置文件中删除
    DelRobotConfFormShellFile(strObjName); //从启动脚本中删除
    var response = {};
    response['errcode'] = 0;
    response['message'] = 'success';
    var sendRet = JSON.stringify(response);
    console.log(sendRet);
    res.end(sendRet);
})

app.post(ModRobotConf, function(req, res){
    var strObjName = req.body.roomname;
    var strObj = req.body.data;
    ModRobotConfFromConfFile(strObjName, strObj);
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
    var fileContent = fs.readFileSync(wholeConfFileName,'utf-8');
    console.log('file content is: ' + fileContent);
    var config=JSON.parse(fileContent);
    console.log(config);
    if (config[roomname] != undefined) {
        console.error("Already exist this roomname configure: " + roomname);
        return false;
    }

    config[roomname] = obj;

    fs.writeFile(wholeConfFileName, JSON.stringify(config, null, '\n'), function(err){
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
    var shellFileName = bashPath + confPath + 'roomname.conf'; 
    var allRoomName = fs.readFileSync(shellFileName,'utf-8');
    var roomNameArr = allRoomName.split(/\s+/);
    console.log(roomNameArr);
    var ret = roomNameArr.indexOf(roomNameArr);
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
        fs.writeFile(shellFileName, newAllRoomName, function(err){
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
    var config=JSON.parse(fs.readFileSync(bashPath + confPath + '/robot.conf','utf-8'));
    console.log(config);
    if (config[roomname] != undefined) {
        delete config.roomname;
    }
    fs.writeFile(robotConfFileName, config, function(){
        if(err) {
            console.error(err);
        } else {
            console.log('写入成功');
        }
    });
}

function DelRobotConfFromLogConfFile(roomname) {
    var fileName = roomname + '.properties';
    fs.exists(fileName, function(exists) {
        if (exists) {
            var wholeFilename = bashPath + confPath + '/' + fileName; 
            console.log('whole File name is: ' + wholeFilename);
            fs.unlinkSync(wholeFilename);
        } else {
            console.log('File ' + fileName + ' doesn\'t exist.');
        }
    });
}

function DelRobotConfFromShellFile(roomname) {
    var shellFileName = bashPath + confPath + 'roomname.conf'; 
    var allRoomName = fs.readFileSync(shellFileName,'utf-8');
    var roomNameArr = allRoomName.split(/\s+/);
    console.log(roomNameArr);
    var ret = roomNameArr.indexOf(roomNameArr);
    if (-1 == ret) {
        console.log('Room name ' + roomname + ' doesn\'t exist.');
        return;
    } else {
        roomNameArr.splite(ret, 1);
        var newAllRoomName = '';
        for (var roomIndex in roomNameArr) {
            newAllRoomName += roomNameArr[roomIndex];
            if (roomIndex != (roomNameArr.length() - 1)) {
                newAllRoomName += ' ';
            }
        }
        console.log('New room name is: ' + newAllRoomName);
        fs.writeFile(shellFileName, newAllRoomName, function(err){
            if(err) {
                console.error(err);
            } else {
                console.log('写入成功');
            }
        });
    }
}


function ModRobotConfFromConfFile(roomname, obj) {
    var robotConfFileName = 'robot.conf';
    var config=JSON.parse(fs.readFileSync(bashPath + confPath + robotConfFileName,'utf-8'));
    console.log(config);
    if (config[roomname] != undefined) {
        console.log("Exist.");
    }

    config[roomname] = obj;

    fs.writeFile(robotConfFileName, JSON.stringify(config, null, '\n'), function(){
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
