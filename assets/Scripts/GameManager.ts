import { _decorator, Component, Node, Prefab, instantiate, Vec3, LabelComponent, Label } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

// 赛道各自类型，坑（BT_NONE）或者实格（BT_STONE）
enum BlockType {
    BT_NONE,
    BT_STONE,
}

// 游戏状态
enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

@ccclass('GameManager')
export class GameManager extends Component {

    // 赛道预制
    @property({ type: Prefab })
    public cubePrfb: Prefab | null = null;
    // 赛道长度
    @property
    public roadLength = 50;
    // 赛道
    private _road: BlockType[] = [];
    // 玩家
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;
    // play按钮
    @property({ type: Node })
    public startMenu: Node | null = null;
    // 步数
    @property({ type: Label })
    public stepsLabel: Label | null = null;


    start() {
        this.curState = GameState.GS_INIT;
        // ?.可选链写法
        this.playerCtrl?.node.on("JumpEnd", this.onPlayerJumpEnd, this);
    }

    init() {
        // 激活主界面
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        // 生成赛道
        this.generateRoad();
        if (this.playerCtrl) {
            // 禁止接收用户操作人物移动指令
            this.playerCtrl.setInputActive(false);
            // 重置人物位置
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init()
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    this.stepsLabel.string = "0";
                }
                // 设置 active 为 true 时会直接开始监听鼠标事件，此时鼠标抬起事件还未派发
                // 会出现的现象就是，游戏开始的瞬间人物已经开始移动
                // 因此，这里需要做延迟处理
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1)
                break;
            case GameState.GS_END:
                break
        }
    }

    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = "" + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex)
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            console.log("check", moveIndex, this._road[moveIndex])
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                // 跳到了坑上
                this.curState = GameState.GS_INIT;
            }
        } else {
            // 超过了最大长度
            this.curState = GameState.GS_INIT;
        }
    }

    generateRoad() {
        // 防止游戏重新开始时，赛道还是旧的赛道
        // 因此，需要移除旧赛道，清除旧赛道数据
        this.node.removeAllChildren();
        this._road = []
        // 确保游戏运行时，人物一定站在实路上
        this._road.push(BlockType.BT_STONE);

        // 确保好每一格赛道类型
        for (let i = 1; i < this.roadLength; i++) {
            // 如果上一格是坑，那么这一格一定不能为坑
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                let t = Math.floor(Math.random() * 2);
                this._road.push(t);
            }
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
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }
        return block
    }

    // update(deltaTime: number) {

    // }
}

