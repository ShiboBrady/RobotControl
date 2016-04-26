var htmlcontent = '<section class="notepad">' +
            '<div class="notepad-heading">' +
            '<h1>游戏场-新手场</h1>' +
            '</div>' +
            '<blockquote class="content-box">' +
                '<div>' +
                    '<label>RobotId:</label>' +
                    '<span class="id-start">110000</span>' +
                    '<span>~</span>' +
                    '<span class="id-end">112000</span>' +
                '</div>' +
                '<div>' +
                    '<label>RobotNum:</label>' +
                    '<span class="id-num">100</span>' +
                '</div>' +
                '<div>' +
                    '<label>Info:</label>' +
                    '<span class="robot-info">未启动</span>' +
                '</div>' +
                '<div>' +
                    '<label>RobotRunning:</label>' +
                    '<span class="robot-run">100</span>' +
                '</div>' +
            '</blockquote>' +
            '<blockquote class="button-box">' +
                '<a href="#" class="button button-blue" action="edit" for="">编辑</a>' +
                '<a href="#" class="button button-gray" action="delete" for="">删除</a>' +
                '<a href="#" class="button button-green" action="start" for="">启动</a>' +
                '<a href="#" class="button button-red" action="stop" for="">停止</a>' +
            '</blockquote>' +
        '</section>';

var robotConfigure;
// {
//     "game1":{
//         "server":{
//             "ip":"192.168.1.88",
//             "port": 4001
//         },
//         "robot":{
//             "IQLevel": 2,
//             "robotIdStart": 110000,
//             "robotIdEnd": 112000,
//             "robotNum": 100
//         },
//         "switch":{
//             "isMatch":false,
//             "isCheckKeepPlay":false
//         },
//         "game":{
//             "room_name":"游戏场-新手场",
//             "type":"ddz",
//             "sessionKey":"session_",
//             "matchid": 1,
//             "name":"org_ddz_game_cj_01",
//             "minPlayerNum": 1,
//             "playerNum": 3,
//             "logConf":"../configure/game1.properties"
//         },
//         "timer":{
//             "heartBeat":30,
//             "activeMsgDelay":6,
//             "passiveMsgDelay":3,
//             "roomstate":3
//         }
//     }
// };

$(function(){
    GetRobotConf();
    $('.wraper').on('click', 'section a', (function(){
        var actionName = $(this).attr('action');
        var forValue = $(this).attr('for');
        console.log('actionName: ' + actionName);
        console.log('forValue: ' + forValue);
        switch (actionName) {
            case 'start':
                StartRobot(forValue);
                break;
            case 'stop':
                StopRobot(forValue);
                break;
            case 'edit':
                OpenEditConfPage(forValue);
                break;
            case 'delete':
                DeleteAssignedConf(forValue);
                break;
            default:
                console.log("Cann't find this action " + actionName);
            break;
        }
    }));
    $('.button-refresh').on('click', function(){
        GetRobotStatus(true);
        GetRobotNum(true);
    });

    $('.button-create').on('click', function(){
        layer.open({
            type: 2,
            title: 'Robot Configure Edit',
            maxmin: true,
            shadeClose: false, //点击遮罩关闭层
            area : ['700px' , '900px'],
            content: 'conf_edit.html'
        });
    });
})

function successcallback(data) {
    var rtnData = JSON.parse(data);
    var errcode = rtnData.errcode;
    var message = rtnData.message;
    var result = rtnData.result;
    console.log(result);
    robotConfigure = result;
    InitRoomInfo(robotConfigure);
}

function GetRobotConf() {
    $.ajax({
      type: 'POST',
      url: 'data/robot_config',
      success: function (data) {
            var rtnData = JSON.parse(data);
            var errcode = rtnData.errcode;
            var message = rtnData.message;
            var result = rtnData.result;
            console.log(result);
            robotConfigure = result;
            InitRoomInfo(robotConfigure);
            GetRobotStatus(false);
            GetRobotNum(false);
        },
    });
}

function InitRoomInfo(data){
    var robotInfoBox = $('.wraper');
    for (var index in data) {
        var boxid = 'section-' + index;
        robotInfoBox.append(htmlcontent);
        robotInfoBox.children().last().attr('id', boxid);
        var thisBox = $('#'+boxid);
        thisBox.find('h1').html(data[index]["game"]["room_name"]);
        thisBox.find('.button-box').children().attr("for", index);
        thisBox.find('.content-box .id-start').html(data[index]["robot"]["robotIdStart"]);
        thisBox.find('.content-box .id-end').html(data[index]["robot"]["robotIdEnd"]);
        thisBox.find('.content-box .id-num').html(data[index]["robot"]["robotNum"]);
    }
}

function sendRequest(url, sendData){
    $.ajax({
        type: 'POST',
        data: sendData,
        url: url,
        success: function(data){

        },
    })   
}

function GetRobotStatus(bIsDisplay){ 
    var currentUrl = 'data/robot_status';
    $.ajax({
        type: 'POST',
        url: currentUrl,
        success: function(data){
            console.log(data);
            var retData = JSON.parse(data);
            var errcode = retData['errcode'];
            var message = retData['message'];
            if (0 != errcode) {
                ErrorMsg(message);
            } else {
                var result = retData['result'];
                console.log(result);
                $('.wraper').children().each(function(){
                    $(this).find('.robot-info').html('未启动');
                });
                for (var index in result) {
                    var boxId = 'section-' + result[index];
                    console.log('boxId: ' + boxId);
                    $('#'+boxId+' .robot-info').html('运行中');
                }
                if (bIsDisplay) {
                    SuccessMsg('刷新成功');
                }
            }
        },
    })
}

function GetRobotNum(bIsDisplay) {
    var currentUrl = 'data/robot_num';
    $.ajax({
        type: 'POST',
        url: currentUrl,
        success: function(data) {
            console.log(data);
            var retData = JSON.parse(data);
            var errcode = retData['errcode'];
            var message = retData['message'];
            if (0 != errcode) {
                ErrorMsg(message);
            } else {
                var result = retData['result'];
                console.log(result);
                $('.wraper').children().each(function(){
                    $(this).find('.robot-run').html('0');
                })
                for (var item in result) {
                    var robotNum = result[item];
                    var boxId = 'section-' + item;
                    console.log('boxId: ' + boxId);
                    $('#'+boxId+' .robot-run').html(robotNum);
                }
                if (bIsDisplay) {
                    SuccessMsg('获取运行中的机器人个数成功');
                }
            }
        }
    })
}

function StartRobot(buttonId){
    var currentUrl = 'data/robot_start';
    var sendData = 'roomname=' + buttonId;
    $.ajax({
        type: 'POST',
        data: sendData,
        url: currentUrl,
        success: function(data){
            console.log(data);
            var retData = JSON.parse(data);
            var errcode = retData['errcode'];
            var message = retData['message'];
            if (0 != errcode) {
                ErrorMsg(message);
                $('#'+boxId+' .robot-info').html('未启动');
            } else {
                var boxId = 'section-' + buttonId;
                console.log('boxId: ' + boxId);
                $('#'+boxId+' .robot-info').html('运行中');
                SuccessMsg('启动成功');
            }
        },
    })
}

function StopRobot(buttonId){
    var currentUrl = 'data/robot_stop';
    var sendData = 'roomname=' + buttonId;
    $.ajax({
        type: 'POST',
        data: sendData,
        url: currentUrl,
        success: function(data){
            console.log(data);
            var retData = JSON.parse(data);
            var errcode = retData['errcode'];
            var message = retData['message'];
            if (0 != errcode) {
                ErrorMsg(message);
            } else {
                var boxId = 'section-' + buttonId;
                console.log('boxId: ' + boxId);
                $('#'+boxId+' .robot-info').html('未启动');
                SuccessMsg('停止成功');
            }
        },
    })
}

function OpenEditConfPage(roomname){
    layer.open({
        type: 2,
        title: 'Robot Configure Edit',
        maxmin: true,
        shadeClose: false, //点击遮罩关闭层
        area : ['700px' , '900px'],
        content: 'conf_edit.html' + '?roomname=' + roomname,
    });
}

function GetAssignedConf(roomname){
    console.log("roomname: " + roomname);
    return robotConfigure[roomname];
}

function ModifyAssignedConf(roomname, obj) {
    console.log("roomname: " + roomname);
    var sendData = 'roomname=' + roomname + '&data=' + JSON.stringify(obj);
    console.log('send data is: ' + sendData);
    //服务器操作
    $.ajax({
        type: 'POST',
        url: 'data/mod_robot_config',
        data: sendData,
        success: function (data) {
            console.log(data);
            var retData = JSON.parse(data);
            var errcode = retData['errcode'];
            var message = retData['message'];
            if (0 != errcode) {
                ErrorMsg(message);
            } else {
                console.log("Send modify post request success.");
                delete robotConfigure[roomname];
                robotConfigure[roomname] = obj;
                var boxid = 'section-' + roomname;
                var boxElem = $('#'+boxid);
                boxElem.find('h1').html(robotConfigure[roomname]["game"]["room_name"]);
                boxElem.find('.content-box .id-start').html(robotConfigure[roomname]["robot"]["robotIdStart"]);
                boxElem.find('.content-box .id-end').html(robotConfigure[roomname]["robot"]["robotIdEnd"]);
                boxElem.find('.content-box .id-num').html(robotConfigure[roomname]["robot"]["robotNum"]);
                SuccessMsg('修改成功');
            }
        }
    })
}

function CreateNewConf(roomname, obj) {
    console.log("roomname: " + roomname);
    if (robotConfigure[roomname] != undefined) {
        ErrorMsg('Already exist gamename: ' + roomname);
        return false;
    }
    var sendData = 'roomname=' + roomname + '&data=' + JSON.stringify(obj);
    console.log('send data is: ' + sendData);
    //服务器操作
    $.ajax({
        type: 'POST',
        url: 'data/add_robot_config',
        data: sendData,
        success: function (data) {
            console.log(data);
            var retData = JSON.parse(data);
            var errcode = retData['errcode'];
            var message = retData['message'];
            if (0 != errcode) {
                ErrorMsg(message);
            } else {
                var robotInfoBox = $('.wraper');
                robotConfigure[roomname] = obj;
                var boxid = 'section-' + roomname;
                robotInfoBox.append(htmlcontent);
                robotInfoBox.children().last().attr('id', boxid);
                var thisBox = $('#'+boxid);
                thisBox.find('.button-box').children().attr("for", roomname);
                thisBox.find('h1').html(robotConfigure[roomname]["game"]["room_name"]);
                thisBox.find('.content-box .id-start').html(robotConfigure[roomname]["robot"]["robotIdStart"]);
                thisBox.find('.content-box .id-end').html(robotConfigure[roomname]["robot"]["robotIdEnd"]);
                thisBox.find('.content-box .id-num').html(robotConfigure[roomname]["robot"]["robotNum"]);
                SuccessMsg('新建配置成功');
            }
        },
    });
    return true;
}

function DeleteAssignedConf(roomname){
    layer.msg('确定要删除吗？', {
        time: 0,
        btn: ['确定', '取消'],
        yes: function(index) {
            console.log("User delete this item.");
            console.log("roomname: " + roomname);
            //服务器操作
            $.ajax({
                type: 'POST',
                url: 'data/del_robot_config',
                data: 'roomname=' + roomname,
                success: function(data) {
                    console.log(data);
                    var retData = JSON.parse(data);
                    var errcode = retData['errcode'];
                    var message = retData['message'];
                    if (0 != errcode) {
                        ErrorMsg(message);
                    } else {
                        var boxid = 'section-' + roomname;
                        if (robotConfigure[roomname] == undefined) {
                            ErrorMsg("删除" + roomname + "失败");
                        }
                        var boxid = 'section-' + roomname;
                        var thisBox = $('#'+boxid);
                        thisBox.remove();
                        delete robotConfigure[roomname];
                        SuccessMsg("删除" + roomname + "成功");
                        layer.close(index);
                    }
                },
            });
        }
    });
}

function SuccessMsg(msg) {
    layer.msg(msg, {icon: 6});
}

function ErrorMsg(errormsg) {
    layer.msg(errormsg, {icon: 5});
}
