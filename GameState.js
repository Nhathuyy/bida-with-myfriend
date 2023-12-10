/*
 * @Author: Talos--1660327787@qq.com
 * @Date: 2023-12-03 20:52:28
 * @LastEditors: Talos--1660327787@qq.com
 * @LastEditTime: 2023-12-09 18:54:44
 * @FilePath: /PoolGame-Web/GameState.js
 * @Description: 管理游戏状态和交互
 * 
 * Copyright (c) 2023 by five-forever, All Rights Reserved. 
 */

import { GameUI } from './GameUI.js' 

class GameState{
    constructor(game)
    {
      this.game = game 
      this.ui = new GameUI() 
      this.initGame() 
      const btn = document.getElementById('playBtn') 
      // 绑定点击开始事件和空格蓄力事件
      btn.onclick = this.startGame.bind(this) 
      document.addEventListener('keydown', this.keydown.bind(this)) 
      document.addEventListener('keyup', this.keyup.bind(this)) 
    }
    
    showPlayBtn(){
      this.ui.show('playBtn') 
    }
    // 开始游戏：显示UI->重置世界状态->初始化游戏->开始回合
    startGame(){
      this.ui.showGameHud(true) 
      this.game.reset() 
      this.initGame() 
      this.startTurn() 
    }
    // 空格显示蓄力
    keydown(evt){
      if (this.state !== 'turn') return 
      
      if (evt.keyCode == 32){
          this.ui.strengthBar.visible = true 
      }
    }
    // 释放空格 击打白球
    keyup(evt){
      if (this.state !== 'turn') return 
      
      if (evt.keyCode == 32){
          this.ui.strengthBar.visible = false 
          this.hit(this.ui.strengthBar.strength) 
      }
    }
    // 初始化游戏状态，包括桌上的编号球、当前回合的玩家、球的归属方向等
    initGame(){
      this.numberedBallsOnTable = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] 
      
      this.turn = 'player1' 
      
      this.sides = {
        player1: '?',
        player2: '?'
      } 
      // 未开局
      this.pocketingOccurred = false 
      this.state = 'notstarted' 
      this.ticker = undefined 
    }
    // 开启新回合
    startTurn(){
      if (this.state == 'gameover') return 
      // 开启计时器
      this.timer = 30 
      this.tickTimer() 
      this.state = 'turn' 
      this.ui.updateTurn(this.turn) 
      this.ui.updateBalls(this.numberedBallsOnTable, this.sides) 
      this.ui.log(`${this.turn} to play`) 
    }
    // 白球摔袋 打印log
    whiteBallEnteredHole(){
      this.ui.log(`Cue ball pocketed by ${this.turn}!`) 
    }
    // 进球
    coloredBallEnteredHole(id){
      if (id === undefined) return 
      
      this.numberedBallsOnTable = this.numberedBallsOnTable.filter(num => {
          return num != id 
      }) 

      if (id == 0)  return 
  
      if (id == 8){ // 进黑八
        if (this.numberedBallsOnTable.length > 1){
            this.ui.log(`Game over! 8 ball pocketed too early by ${this.turn}`) 
            this.turn = this.getOpponent() 
        }
        setTimeout(this.endGame.bind(this), 2000) 
      } else { // 进普通球
      if (this.sides.player1 == '?' || this.sides.player2 == '?'){ 
        // 定花色
        this.sides[this.turn] = id < 8 ? 'solid' : 'striped' 
        this.sides[this.getOpponent()] = id > 8 ? 'solid' : 'striped' 
        this.pocketingOccurred = true 
      } else {
        if ((this.sides[this.turn] == 'solid' && id < 8) || 
            (this.sides[this.turn] == 'striped' && id > 8)){
          // 进自家球连杆
          this.pocketingOccurred = true 
          this.ui.log(`${this.turn} pocketed ball ${id}, continue pocketing`) 
        } else {
          // 进对手球
          this.pocketingOccurred = false 
          this.ui.log(`${this.turn} pocketed opponent's ball!`) 
        }
      }
    }
  }
  // 每秒更新计时器
  tickTimer(){
    this.ui.updateTimer(this.timer) 
    if (this.timer == 0) {
      this.ui.log(`${this.turn} ran out of time`) 
      this.state = "outoftime" 
      this.switchSides() 
      setTimeout(this.startTurn.bind(this), 1000) 
    } else {
      this.timer-- 
      this.ticker = setTimeout(this.tickTimer.bind(this), 1000) 
    }
  }
  // 获取对手id
  getOpponent(){
    return this.turn == 'player1' ? 'player2': 'player1' 
  }  
  // 换边
  switchSides(){
    this.turn = this.getOpponent() 
  }
  // 结束游戏
  endGame(){
    this.state = 'gameover' 
    clearTimeout(this.ticker) 
    this.ui.showMessage(`${this.turn} 获胜!`, '感谢游玩！') 
  }
  // 处理击打 等待回合结算
  hit(strength){
    this.game.strikeCueball(strength) 
    clearTimeout(this.ticker) 
    this.state = 'turnwaiting' 
  }
  // 检查球睡眠状态，所有球静止则结算换边
  checkSleeping(){
    if (!this.game.cueball.isSleeping) return 
    // TODO: 需要优化写法
    for (let i=1; i<this.game.balls.length; i++) {
      if (!this.game.balls[i].isSleeping && 
          this.numberedBallsOnTable.indexOf(Number(game.balls[i].name.split('ball')[0])) > -1) {
        return 
      }
    }

    if (!this.pocketingOccurred) this.switchSides() 
    this.pocketingOccurred = false 
    this.state = 'paused' 
    setTimeout(this.startTurn.bind(this), 500) 
  }
  // 检测是否碰撞完毕
  update(dt){
    if (this.state == 'turnwaiting') this.checkSleeping() 
    this.ui.update() 
  }
}

export { GameState } 