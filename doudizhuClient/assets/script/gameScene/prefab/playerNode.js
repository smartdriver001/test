import global from "../../global";

cc.Class({
    extends: cc.Component,
    properties: {
        headImage: cc.Sprite,
        idLabel: cc.Label,
        nickNameLabel: cc.Label,
        goldLabel: cc.Label,
        readyIcon: cc.Node,
        offlineIcon: cc.Node,
        cardsNode: cc.Node,
        pushCardNode: cc.Node,
        cardPrefab: cc.Prefab,
        tipsLabel: cc.Label,
        infoNode: cc.Node,
        timeLabel: cc.Label,
        robIconSp: cc.Sprite,
        masterIcon: cc.Node,
        robIcon: cc.SpriteFrame,
        noRobIcon: cc.SpriteFrame
    },
    onLoad() {
        this.cardList = [];
        this.readyIcon.active = false;
        this.offlineIcon.active = false;
        this.node.on('game-start', () => {
            this.readyIcon.active = false;
        });
        this.node.on('push-card', () => {
            if (this.accountID !== global.playerData.accountID) {
                this.pushCard();
            }
        });
        this.node.on('can-rob-mater', (event) => {
            let detail = event.detail;
            if (detail === this.accountID && detail !== global.playerData.accountID) {
                this.infoNode.active = true;
                this.tipsLabel.string = '正在抢地主';
                this.timeLabel.string = '5';
            }
        });
        this.node.on('rob-state', (event) => {
            let detail = event.detail;
            console.log(' player node  rob state detail = ' + JSON.stringify(detail));
            if (detail.accountID === this.accountID) {
                this.infoNode.active = false;
                switch (detail.value) {
                    case 'ok':
                        this.robIconSp.node.active = true;
                        this.robIconSp.spriteFrame = this.robIcon;
                        break;
                    case 'no-ok':
                        this.robIconSp.node.active = true;
                        this.robIconSp.spriteFrame = this.noRobIcon;
                        break;
                    default:
                        break;
                }
            }
        });
        this.node.on('change-master', (event) => {
            let detail = event.detail;
            this.robIconSp.node.active = false;
            if (detail === this.accountID) {
                this.masterIcon.active = true;
                this.masterIcon.scale = 0.6;
                this.masterIcon.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()));
            }
        });
        this.node.on('add-three-card', (event) => {
            let detail = event.detail;
            if (detail === this.accountID) {
                for (let i = 0; i < 3; i++) {
                    this.pushOneCard();
                }
            }
        });
        this.node.on('player-push-card', (event) => {
            let detail = event.detail;
            // {
            //     accountID: player.accountID,
            //         cards: cards
            // }

            if (detail.accountID === this.accountID && this.accountID !== global.playerData.accountID) {
                this.playerPushCard(detail.cards);
            }
        });
        // this.pushCard();
        // for (let i = 0 ; i < 3 ; i ++){
        //     this.pushOneCard();
        // }
    },
    initWithData(data, index) {
        // {"nickName":"小明14","accountID":"2162095","avatarUrl":"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1665110666,1033370706&fm=27&gp=0.jpg","gold":100}]}
        this.accountID = data.accountID;
        this.idLabel.string = 'ID:' + data.accountID;
        this.nickNameLabel.string = data.nickName;
        this.goldLabel.string = data.gold;
        this.index = index;
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex) => {
            cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImage.node.width;
            console.log('old withd' + oldWidth);
            this.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImage.node.width;
            console.log('old withd' + newWidth);
            this.headImage.node.scale = oldWidth / newWidth;
        });


        this.node.on('player_ready', (event) => {
            let detail = event.detail;
            console.log('player ready detail = ' + detail);
            if (detail === this.accountID) {
                this.readyIcon.active = true;
            }
        });


        if (index === 1) {
            this.cardsNode.x *= -1;
            this.pushCardNode.x *= -1;
        }
    },
    pushCard() {
        this.cardsNode.active = true;
        for (let i = 0; i < 17; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.cardsNode;
            card.scale = 0.4;
            let height = card.height;
            card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
            this.cardList.push(card);
        }
    },
    pushOneCard() {
        let card = cc.instantiate(this.cardPrefab);
        card.parent = this.cardsNode;
        card.scale = 0.4;
        let height = card.height;
        card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - this.cardList.length * height * 0.4 * 0.3;
        this.cardList.push(card);
    },
    playerPushCard(cardsData) {
        for (let i = 0 ; i < this.pushCardNode.children.length ; i ++){
            this.pushCardNode.children[i].destroy();
        }
        for (let i = 0; i < cardsData.length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.pushCardNode;
            card.scale = 0.25;
            let height = card.height;
            card.y = (cardsData.length - 1) * 0.5 * height * 0.4 * 0.3 - i * height * 0.4 * 0.3;
            card.getComponent('card').showCard(cardsData[i]);
        }

        for (let i = 0; i < cardsData.length; i++) {
            let card = this.cardList.pop();
            card.destroy();
        }
        this.referCardPos();
    },
    referCardPos() {
        for(let i = 0 ; i < this.cardList.length ; i ++){
            let card = this.cardList[i];
            let height = card.height;
            card.y = (this.cardList.length - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
        }
    }
});