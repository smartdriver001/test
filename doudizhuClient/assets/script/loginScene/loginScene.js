import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // let socket = io("http://localhost:3000");
        // socket.on('welcome', (data)=>{
        //     console.log('welcome ' + data);
        // });
        global.socket.init();

        global.eventListener.on('test', (data)=>{
            console.log('test success' + data);
        });
        global.eventListener.on('test', (data)=>{
            console.log('test 1 sucess' + data);
        });
        global.eventListener.fire('test', 'ok');


    },

    onButtonClick(event, customData){
        switch (customData){
            case 'wx_login':
                console.log('wx 登陆');
                global.socket.requestLogin({
                    uniqueID: global.playerData.uniqueID,
                    accountID: global.playerData.accountID,
                    nickName: global.playerData.nickName,
                    avatarUrl: global.playerData.avatarUrl
                },(err, result)=>{
                    if (err){
                        console.log('err = ' + err);
                    }else {
                        console.log('result = ' + JSON.stringify(result));
                        global.playerData.goldCount = result.goldCount;
                        cc.director.loadScene('hallScene');
                    }
                });
                break;
            default:
                break;
        }
    }
    // update (dt) {},
});
