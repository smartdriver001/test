const Player = require('./player');
const Room = require('./room');
const defines = require('./../defines');
let _playerList = [];
let _roomList = [];
// const createRoomConfig = {
//     'rate_1': {
//         needCostGold: 10
//     },
//     'rate_2': {
//         needCostGold: 100
//     },
//     'rate_3': {
//         needCostGold: 200
//     },
//     'rate_4': {
//         needCostGold: 500
//     }
// };
exports.createPlayer = function (data, socket, callBackIndex) {
    let player = Player(data, socket, callBackIndex, this);
    _playerList.push(player);
};
exports.createRoom = function (data, player, cb) {
    //gold = 100;
    //player = 101;
    //todo 检测金币是够足够
    let needCostGold = defines.createRoomConfig[data.rate];
    if (player.gold < needCostGold) {
        if (cb) {
            cb('gold not enough');
        }
        return;
    }

    let room = Room(data, player);
    _roomList.push(room);
    if (cb) {
        cb(null, room.roomID);
    }
};
exports.joinRoom = function (data, player, cb) {
    console.log('data = ' + typeof data);
    for (let i = 0; i < _roomList.length; i++) {
        console.log('room id = ' + typeof _roomList[i].roomID);
        console.log('data = ' + data);
        if (_roomList[i].roomID === data) {
            let room = _roomList[i];
            room.joinPlayer(player);
            if (cb) {
                cb(null, {
                    room: room,
                    data: {bottom: room.bottom, rate: room.rate}
                });
            }
            return;

        }
    }
    if (cb) {
        cb('no have this room' + data);
    }
};