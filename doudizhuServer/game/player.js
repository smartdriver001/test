module.exports = function (spec, socket, cbIndex, gameContorller) {
    let that = {};
    let _socket = socket;
    console.log('create new player = ' + JSON.stringify(spec));
    that.nickName = spec.nick_name;
    that.accountID = spec.account_id;
    that.avatarUrl = spec.avatar_url;
    that.gold = spec.gold_count;
    that.seatIndex = 0;
    that.isReady = false;
    that.cards = [];
    let _room = undefined;
    const notify = function (type, data, callBackIndex) {
        console.log('notify =' + JSON.stringify(data));
        _socket.emit('notify', {
            type: type,
            data: data,
            callBackIndex: callBackIndex
        });
    };
    notify('login',{
        goldCount: that.gold
    }, cbIndex);

    _socket.on('disconnect', ()=>{
        console.log('玩家掉线');
        if (_room){
            _room.playerOffLine(that);
        }
    });
    _socket.on('notify', (notifyData)=>{
        let type = notifyData.type;
        console.log('notify data = ' + JSON.stringify(notifyData.data));
        let callBackIndex = notifyData.callBackIndex;
        switch (type){
            case 'create_room':
                // notify('create_room',{data: 'create_room'},callBackIndex);
                gameContorller.createRoom(notifyData.data, that, (err, data)=>{
                    if (err){
                        console.log('err =' + err);
                        notify('create_room',{err: err},callBackIndex);

                    }else {
                        console.log('data = ' + JSON.stringify(data));
                        notify('create_room',{data: data},callBackIndex);

                    }
                });

                break;

            case 'join_room':
                console.log('join room data = ' + JSON.stringify(notifyData.data));
                gameContorller.joinRoom(notifyData.data, that,(err, data)=>{
                    if (err){
                        notify('join_room', {err: err}, callBackIndex);
                    }else{
                        _room = data.room;
                        notify('join_room', {data: data.data}, callBackIndex);
                    }
                });
                break;
            case 'enter_room_scene':
                if (_room){
                    _room.playerEnterRoomScene(that,(data)=>{
                        that.seatIndex = data.seatIndex;
                        notify('enter_room_scene', data, callBackIndex);
                    });
                }
                break;
            case 'ready':
                that.isReady = true;
                if (_room){
                    _room.playerReady(that);
                }
                break;
            case 'start_game':
                if (_room){
                    _room.houseManagerStartGame(that, (err, data)=>{
                        if (err){
                            notify('start_game', {err: err}, callBackIndex);
                        }else {
                            notify('start_game', {data: data}, callBackIndex);

                        }
                    });
                }
                break;
            case 'rob-state':
                if (_room){
                    _room.playerRobStateMaster(that, notifyData.data);
                }


                break;
            case 'myself-push-card':
                if (_room){
                    _room.playerPushCard(that, notifyData.data, (err, data)=>{
                        if (err){
                            notify('myself-push-card', {err: err}, callBackIndex);
                        }else {
                            notify('myself-push-card', {data: data}, callBackIndex);

                        }
                    });
                }
                break;
            case 'request-tips':
                if (_room){
                    _room.playerRequestTips(that, (err, data)=>{
                       if (err){
                           notify('request-tips', {err: err}, callBackIndex);
                       } else {
                           notify('request-tips', {data: data}, callBackIndex);
                       }
                    });
                }
                break;
            default:
                break;
        }
    });

    that.sendPlayerJoinRoom = function (data) {
        notify('player_join_room', data, null);
    };

    that.sendPlayerReady = function (data) {
        notify('player_ready', data, null);
    };
    that.sendGameStart = function () {
        notify('game_start', {}, null);
    };
    that.sendChangeHouseManager = function (data) {
        notify('change_house_manager', data, null);
    };
    that.sendPushCard = function (cards) {
        that.cards = cards;
        notify('push_card', cards, null);
    };
    that.sendPlayerCanRobMater = function (data) {
        notify('can-rob-master', data, null);
    };
    that.sendPlayerRobStateMater = function (accountID, value) {
        notify('player-rob-state', {accountID: accountID, value: value}, null);
    };
    that.sendChangeMaster = function (player, cards) {
        if (that.accountID  === player.accountID){
            for (let i = 0 ; i < cards.length ; i ++){
                this.cards.push(cards[i]);
            }
        }
        notify('change-master', player.accountID);
    };
    that.sendShowBottomCard = function (data) {
        notify('show-bottom-card' , data);
    };
    that.sendPlayerCanPushCard = function (data) {
        notify('can-push-card', data);
    };
    that.sendPlayerPushCard = function (data) {
        let accountID = data.accountID;
        if (accountID === that.accountID){
            let cards = data.cards;
            for (let i = 0 ; i < cards.length ; i ++){
                let card = cards[i];
                for (let j = 0 ; j < that.cards.length ; j ++){
                    if (card.id === that.cards[j].id){
                        that.cards.splice(j, 1);
                    }
                }
            }
        }
        notify('player-push-card', data);
    };

    // that.send
    //
    // Object.defineProperty(that, 'nickName', {
    //     get(){
    //         return _nickName
    //     }
    // });

    return that;
};