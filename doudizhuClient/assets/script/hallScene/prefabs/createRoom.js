import global from './../../global'
cc.Class({
    extends: cc.Component,

    properties: {

    },
    onButtonClick(event, customData){

        if (customData.indexOf('rate') !== -1){
            global.socket.requestCreateRoom({rate: customData}, (err, data)=>{
                if (err){
                    console.log('create room = ' + err);
                }else {
                    console.log('create room = ' + JSON.stringify(data));
                    let roomID = data.data;
                    global.socket.requestJoinRoom(roomID, (err, data)=>{
                        if (err){
                            console.log('err = ' + err);
                        }else {
                            // {"data":{"bottom":10,"rate":2}}
                            console.log('join room =' + JSON.stringify(data));
                            global.playerData.bottom = data.data.bottom;
                            global.playerData.rate = data.data.rate;
                            cc.director.loadScene('gameScene');
                        }
                    });
                }
            });

        }
        this.node.destroy();

    }
});
