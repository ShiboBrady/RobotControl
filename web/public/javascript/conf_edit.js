$(function(){
    $('.button-cancel').click(function(){
        console.log("cancel button click.");
        CloseThisWindow();
    })
    if (window.location.href.indexOf("?") > 0) {
        console.log("Come from edit page.");
        var roomname = getQueryString('roomname');
        console.log("roomname is: " + roomname);
        var parameter = window.parent.GetAssignedConf(roomname);
        console.log("parameter is: " + parameter);
        var ip = parameter["server"]["ip"];
        var port = parameter["server"]["port"];
        var IQLevel = parameter["robot"]["IQLevel"];
        var robotIdStart = parameter["robot"]["robotIdStart"];
        var robotIdEnd = parameter["robot"]["robotIdEnd"];
        var robotNum = parameter["robot"]["robotNum"];

        var isMatch = parameter["switch"]["isMatch"];
        var isCheckKeepPlay = parameter["switch"]["isCheckKeepPlay"];

        var room_name = parameter["game"]["room_name"];
        var type = parameter["game"]["type"];
        var sessionKey = parameter["game"]["sessionKey"];
        var matchid = parameter["game"]["matchid"];
        var name = parameter["game"]["name"];
        var minPlayerNum = parameter["game"]["minPlayerNum"];
        var playerNum = parameter["game"]["playerNum"];
        var logConf = parameter["game"]["logConf"];

        var heartBeat = parameter["timer"]["heartBeat"];
        var roomstate = parameter["timer"]["roomstate"];
        var activeMsgDelay = parameter["timer"]["activeMsgDelay"];
        var passiveMsgDelay = parameter["timer"]["passiveMsgDelay"];

        console.log(ip);
        console.log(port);

        $('.select-ip').val(ip);
        $('.input-port').val(port);
        $('.input-id-start').val(robotIdStart);
        $('.input-id-end').val(robotIdEnd);
        $('.input-robotnum').val(robotNum);
        $('.select-robotlevel').val(IQLevel);
        $('.input-roomname').val(room_name);
        $('.input-gametype').val(type);
        $('.input-sessionkey').val(sessionKey);
        $('.input-matchid').val(matchid);
        $('.input-gamename').val(name);
        $('.input-minplayernum').val(minPlayerNum);
        $('.input-maxplayernum').val(playerNum);
        $('.input-logpath').val(logConf);
        // $('.switch-isMatch').attr("checked","checked");
        $('.switch-isMatch').attr("checked",isMatch);
        $('.switch-isKeepplay').attr("checked",isCheckKeepPlay);
        $('.input-heartbeattime').val(heartBeat);
        $('.input-checkroomtime').val(roomstate);
        $('.input-activemsgtime').val(activeMsgDelay);
        $('.input-passivemsgtime').val(passiveMsgDelay);
        $('.button-submit').click(function(){
            console.log("submit button click.");
            if (!CheckParams()) {
                return false;
            }
            var newJsonObj = {};
            GenerateJsonObjWhenButtonClick(newJsonObj);

            var oldJsonData = JSON.stringify(parameter);
            var newJsonData = JSON.stringify(newJsonObj);
            console.log(oldJsonData);
            console.log(newJsonData);

            if (oldJsonData == newJsonData) {
                console.log("Not modify.");
            } else {
                console.log("Modifyed.");
                window.parent.ModifyAssignedConf(roomname, newJsonObj);
            }

            CloseThisWindow();

            // var newip = $('.select-ip').val();
            // var newport = $('.input-port').val();
            // var newrobotIdStart = $('.input-id-start').val();
            // var newrobotIdEnd = $('.input-id-end').val();
            // var newrobotNum = $('.input-robotnum').val();
            // var newIQLevel = $('.select-robotlevel').val();
            // var newroom_name = $('.input-roomname').val();
            // var newtype = $('.input-gametype').val();
            // var newsessionKey = $('.input-sessionkey').val();
            // var newmatchid = $('.input-matchid').val();
            // var newname = $('.input-gamename').val();
            // var newminPlayerNum = $('.input-minplayernum').val();
            // var newplayerNum = $('.input-maxplayernum').val();
            // var newlogConf = $('.input-logpath').val();
            // // $new('.switch-isMatch').attr("checked","checked");
            // var newisMatch = $('.switch-isMatch').attr("checked");
            // var newisCheckKeepPlay = $('.switch-isKeepplay').attr("checked");
            // var newheartBeat = $('.input-heartbeattime').val();
            // var newroomstate = $('.input-checkroomtime').val();
            // var newactiveMsgDelay = $('.input-activemsgtime').val();
            // var newpassiveMsgDelay = $('.input-passivemsgtime').val();
            // if (newip == ip &&
            //     newport == port &&
            //     newrobotIdStart == robotIdStart &&
            //     newrobotIdEnd == robotIdEnd &&
            //     newrobotNum == robotNum &&
            //     newIQLevel == IQLevel &&
            //     newroom_name == room_name &&
            //     newtype == type &&
            //     newsessionKey == sessionKey &&
            //     newmatchid == matchid &&
            //     newname == name &&
            //     newminPlayerNum == minPlayerNum &&
            //     newplayerNum == playerNum &&
            //     newlogConf == logConf &&
            //     newisMatch == isMatch &&
            //     newisCheckKeepPlay == isCheckKeepPlay &&
            //     newheartBeat == heartBeat &&
            //     newroomstate == roomstate &&
            //     newactiveMsgDelay == activeMsgDelay &&
            //     newpassiveMsgDelay == passiveMsgDelay) {
            //     console.log("not modified.");
            // }
        })
    } else {
        console.log("Come from create page.");
         $('.button-submit').click(function(){
            console.log("submit button click.");
            if (!CheckParams()) {
                return false;
            }
            var newJsonObj = {};
            GenerateJsonObjWhenButtonClick(newJsonObj);
            var ret = window.parent.CreateNewConf($('.input-gamename').val(), newJsonObj);
            if (!ret) {
                console.log("create error.");
            } else {
                console.log("create successed.");
                CloseThisWindow();
            }
        })
    }
})

function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

function CloseThisWindow() {
    var index = parent.layer.getFrameIndex(window.name); //关闭本窗口
    parent.layer.close(index);
}

function CheckParams() {
    var port = $('.input-port').val();
    var robotIdStart = $('.input-id-start').val();
    var robotIdEnd = $('.input-id-end').val();
    var robotNum = $('.input-robotnum').val();
    var room_name = $('.input-roomname').val();
    var type = $('.input-gametype').val();
    var sessionKey = $('.input-sessionkey').val();
    var matchid = $('.input-matchid').val();
    var name = $('.input-gamename').val();
    var minPlayerNum = $('.input-minplayernum').val();
    var playerNum = $('.input-maxplayernum').val();
    var logConf = $('.input-logpath').val();
    var heartBeat = $('.input-heartbeattime').val();
    var roomstate = $('.input-checkroomtime').val();
    var activeMsgDelay = $('.input-activemsgtime').val();
    var passiveMsgDelay = $('.input-passivemsgtime').val();

    if (!CheckValueIsNull(port)) {
        WarnMsg("port-check");
        return false;
    }

    if (!CheckValueIsNull(robotIdStart)) {
        WarnMsg("id-start-check");
        return false;
    }

    if (!CheckValueIsNull(robotIdEnd)) {
        WarnMsg("id-end-check");
        return false;
    }

    if (!CheckValueIsNull(robotNum)) {
        WarnMsg("robotnum-check");
        return false;
    }

    if (!CheckValueIsNull(room_name)) {
        WarnMsg("roomname-check");
        return false;
    }

    if (!CheckValueIsNull(type)) {
        WarnMsg("gametype-check");
        return false;
    }

    if (!CheckValueIsNull(sessionKey)) {
        WarnMsg("sessionkey-check");
        return false;
    }

    if (!CheckValueIsNull(matchid)) {
        WarnMsg("matchid-check");
        return false;
    }

    if (!CheckValueIsNull(name)) {
        WarnMsg("gamename-check");
        return false;
    }

    if (!CheckValueIsNull(minPlayerNum)) {
        WarnMsg("minplayernum-check");
        return false;
    }

    if (!CheckValueIsNull(playerNum)) {
        WarnMsg("maxplayernum-check");
        return false;
    }

    if (!CheckValueIsNull(logConf)) {
        WarnMsg("logpath-check");
        return false;
    }

    if (!CheckValueIsNull(heartBeat)) {
        WarnMsg("heartbeattime-check");
        return false;
    }

    if (!CheckValueIsNull(roomstate)) {
        WarnMsg("checkroomtime-check");
        return false;
    }

    if (!CheckValueIsNull(activeMsgDelay)) {
        WarnMsg("activemsgtime-check");
        return false;
    }

    if (!CheckValueIsNull(passiveMsgDelay)) {
        WarnMsg("passivemsgtime-check");
        return false;
    }
    return true;
}

function WarnMsg(itemId) {
    layer.tips("该项未填写", '#'+itemId);
}

function CheckValueIsNull(value) {
    if (value == null || value == "") {
        return false;
    }
    return true;
}

function GenerateJsonObjWhenButtonClick(newJsonObj) {
    var newip = $('.select-ip').val();
    var newport = Number($('.input-port').val());
    var newrobotIdStart = Number($('.input-id-start').val());
    var newrobotIdEnd = Number($('.input-id-end').val());
    var newrobotNum = Number($('.input-robotnum').val());
    var newIQLevel = Number($('.select-robotlevel').val());
    var newroom_name = $('.input-roomname').val();
    var newtype = $('.input-gametype').val();
    var newsessionKey = $('.input-sessionkey').val();
    var newmatchid = Number($('.input-matchid').val());
    var newname = $('.input-gamename').val();
    var newminPlayerNum = Number($('.input-minplayernum').val());
    var newplayerNum = Number($('.input-maxplayernum').val());
    var newlogConf = $('.input-logpath').val();
    // $new('.switch-isMatch').attr("checked","checked");
    var newisMatch = false;
    var newisCheckKeepPlay = false;
    var newheartBeat = Number($('.input-heartbeattime').val());
    var newroomstate = Number($('.input-checkroomtime').val());
    var newactiveMsgDelay = Number($('.input-activemsgtime').val());
    var newpassiveMsgDelay = Number($('.input-passivemsgtime').val());

    if ($('.switch-isMatch').attr("checked") == "checked") {
        newisMatch = true;
    }            
    if ($('.switch-isKeepplay').attr("checked") == "checked") {
        newisCheckKeepPlay = true;
    }

    newJsonObj["server"] = {};
    newJsonObj["robot"] = {};
    newJsonObj["switch"] = {};
    newJsonObj["game"] = {};
    newJsonObj["timer"] = {};

    newJsonObj["server"]["ip"] = newip;
    newJsonObj["server"]["port"] = newport;

    newJsonObj["robot"]["IQLevel"] = newIQLevel;
    newJsonObj["robot"]["robotIdStart"] = newrobotIdStart;
    newJsonObj["robot"]["robotIdEnd"] = newrobotIdEnd;
    newJsonObj["robot"]["robotNum"] = newrobotNum;

    newJsonObj["switch"]["isMatch"] = newisMatch;
    newJsonObj["switch"]["isCheckKeepPlay"] = newisCheckKeepPlay;

    newJsonObj["game"]["room_name"] = newroom_name;
    newJsonObj["game"]["type"] = newtype;
    newJsonObj["game"]["sessionKey"] = newsessionKey;
    newJsonObj["game"]["matchid"] = newmatchid;
    newJsonObj["game"]["name"] = newname;
    newJsonObj["game"]["minPlayerNum"] = newminPlayerNum;
    newJsonObj["game"]["playerNum"] = newplayerNum;
    newJsonObj["game"]["logConf"] = newlogConf;

    newJsonObj["timer"]["heartBeat"] = newheartBeat;
    newJsonObj["timer"]["activeMsgDelay"] = newactiveMsgDelay;
    newJsonObj["timer"]["passiveMsgDelay"] = newpassiveMsgDelay;
    newJsonObj["timer"]["roomstate"] = newroomstate;
}