import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

// 赛道各自类型，坑（BT_NONE）或者实格（BT_STONE）
enum BlockType {
    BT_NONE,
    BT_STONE,
}

@ccclass('GameManager')
export class GameManager extends Component {

    // 赛道预制
    @property({type: Prefab})
    public cubePrfb: Prefab | null = null;
    // 赛道长度
    @property
    public roadLength = 50;
    private _road: BlockType[] = [];


    start() {
        this.generateRoad();
    }

    generateRoad() {
        // 防止游戏重新开始时，赛道还是旧的赛道
        // 因此，需要移除就赛道，清除旧赛道数据
        this.node.removeAllChildren();
        this._road = []
        // 确保游戏运行时，人物一定站在实路上
        this._road.push(BlockType.BT_STONE);
        
        // 确保好每一格赛道类型
        for (let i = 1; i < this.roadLength; i++) {
            // 如果上一格是坑，那么这一格一定不能为坑
            if (this._road[i-1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                let t = Math.floor(Math.random() * 2);
                console.log("floor", t)
                this._road.push(t);
            }
            console.log("test", this._road.length, i, this._road[i])
        }

        // 根据赛道类型生成赛道
        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockByType(this._road[j]);
            // 判断是否生成了道路，因为 spawnBlockByType 有可能返回坑（值为null）
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.cubePrfb) {
            return null;
        }
        let block: Node | null = null;
        // 赛道类型为实路才生成
        switch(type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }
        return block
    }

    // update(deltaTime: number) {
        
    // }
}
