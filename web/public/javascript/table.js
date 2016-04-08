var data={
    'game1':'游戏场-新手场',
    'game2':'游戏场-初级场',
    'game3':'游戏场-中级场',
    'game4':'游戏场-高级场',
    'three':'比赛场-三人场',
    'six_dali':'比赛场-六人打立场',
    'six_taotai':'比赛场-六人淘汰场',
    'ass':'比赛场-十二人场',
    'newer':'比赛场-二十四人场',
    'free_timer':'比赛场-定时赛',
};

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
                    '<span class="robot-info">启动成功</span>' +
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
                break;
            case 'stop':
                //stopSubmitFunc(forValue);
                break;
            case 'search':
                //checkSubmitFunc();
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
      url: '/data/robot_config',
      success: successcallback,
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

var url = "http://192.168.1.89:8000";
function sendRequest(url){
    var req = new XMLHttpRequest();
    req.open("GET", url);
    req.send(null);
    console.log('url is:' + url);
    req.onreadystatechange = function(){
        if (req.readyState == 4 && req.status == 200){
            var output = document.getElementById("output");
            output.innerHTML = req.responseText;
            console.log('req.responseText');
        }
    }   
}
function checkSubmitFunc(){ 
    var currentUrl = url + "/robot_status";
    sendRequest(currentUrl);
}
function startSubmitFunc(buttonId){
    var currentUrl = url + "/robot_start?kind=" + buttonId;
    sendRequest(currentUrl);
}
function stopSubmitFunc(buttonId){
    var currentUrl = url + "/robot_stop?kind=" + buttonId;
    sendRequest(currentUrl);
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
    //服务器操作
    //
    
    robotConfigure[roomname] = obj;
    var boxid = 'section-' + roomname;
    var boxElem = $('#'+boxid);
    boxElem.find('h1').html(robotConfigure[roomname]["game"]["room_name"]);
    boxElem.find('.content-box .id-start').html(robotConfigure[roomname]["robot"]["robotIdStart"]);
    boxElem.find('.content-box .id-end').html(robotConfigure[roomname]["robot"]["robotIdEnd"]);
    boxElem.find('.content-box .id-num').html(robotConfigure[roomname]["robot"]["robotNum"]);
    return true;
}

function CreateNewConf(roomname, obj) {
    console.log("roomname: " + roomname);
    if (robotConfigure[roomname] != undefined) {
        return false;
    }
    var sendData = JSON.stringify(obj);
    //服务器操作
    $.ajax({
        type: 'POST',
        url: '/data/add_robot_config',
        data: 'roomname=' + roomname + '&data=' + sendData,
        success: function (data) {
            console.log(data);
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
        },
    })
    
    
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
            //
            
            var boxid = 'section-' + roomname;
            if (robotConfigure[roomname] == undefined) {
                ErrorMsg("删除" + roomname + "失败");
                return false;
            }
            var boxid = 'section-' + roomname;
            var thisBox = $('#'+boxid);
            thisBox.remove();
            delete robotConfigure[roomname];
            SuccessMsg("删除" + roomname + "成功");
            layer.close(index);
            return true;
        }
    });
}

function SuccessMsg(msg) {
    layer.msg(msg, {icon: 6});
}

function ErrorMsg(errormsg) {
    layer.msg(errormsg, {icon: 5});
}
