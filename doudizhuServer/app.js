const socket = require('socket.io');
const app = socket(3000);
const myDB = require('./db');
const defines = require('./defines');
const gameController = require('./game/game-controller');
console.log('defines = ' + defines.defaultGoldCount);
myDB.connect({
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "chu7758521",
    "database": "doudizhu_wangyi"
});
myDB.getPlayerInfoWithUniqueID('100000', (err, data) => {
    console.log('data = ' + JSON.stringify(data));
});
app.on('connection', function (socket) {
    console.log('a  user connection');
    socket.emit('connection', 'connection success');
    socket.on('notify', (notifyData) => {
        console.log('notify ' + JSON.stringify(notifyData));
        switch (notifyData.type) {
            case 'login':
                let uniqueID = notifyData.data.uniqueID;
                let callBackIndex = notifyData.callBackIndex;
                myDB.getPlayerInfoWithUniqueID(uniqueID, (err, data) => {
                    if (err) {
                        console.log('err =  ' + err);
                    } else {
                        console.log('data =  ' + JSON.stringify(data));
                        if (data.length === 0) {
                            let loginData = notifyData.data;
                            myDB.createPlayerInfo(
                                loginData.uniqueID,
                                loginData.accountID,
                                loginData.nickName,
                                defines.defaultGoldCount,
                                loginData.avatarUrl
                            );
                            // {"unique_id":"100000",
                            //     "account_id":"2162095",
                            //     "nick_name":"小明14",
                            //     "gold_count":100,
                            //     "avatar_url":"https://ss2.bdstatic.com/70cFSh_Q1YnxGkpoWK1HF6hhy/it/u=1665110666,1033370706&fm=27&gp=0.jpg"}]
                            gameController.createPlayer({
                                "unique_id": notifyData.data.uniqueID,
                                "account_id": notifyData.data.accountID,
                                "nick_name": notifyData.data.nickName,
                                "gold_count": defines.defaultGoldCount,
                                "avatar_url": notifyData.data.avatarUrl
                            }, socket,callBackIndex);
                        } else {
                            console.log('data = ' + JSON.stringify(data));
                            gameController.createPlayer(data[0], socket, callBackIndex);
                        }
                    }
                });
                break;
            default:
                break;
        }

    });
});