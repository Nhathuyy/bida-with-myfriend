/*
 * @Author: Talos--1660327787@qq.com
 * @Date: 2023-12-03 20:52:28
 * @LastEditors: Talos--1660327787@qq.com
 * @LastEditTime: 2023-12-09 22:42:16
 * @FilePath: /PoolGame-Web/GameUI.js
 * @Description: 管理游戏中出现的ui，切换隐藏和显示
 * 
 * Copyright (c) 2023 by five-forever, All Rights Reserved. 
 */

import { StrengthBar } from "./StrengthBar.js" 

class GameUI{
  constructor() {
    this.strengthBar = new StrengthBar() 
  }
  // 添加CSS类
  addClass(el, className) {
    if (el.classList) {
      el.classList.add(className) 
    } else {
      el.className += ' ' + className 
    }
  }
  // 移除CSS类
  removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className) 
    } else { // TODO：有待优化
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ') 
    }
  } 
  // 移除hide属性来展示
  show(elmId) {
    const node = document.getElementById(elmId) 
    this.removeClass(node, 'hide') 
  }
  // 添加hide属性隐藏
  hide(elmId) {
    const node = document.getElementById(elmId) 
    this.addClass(node, 'hide') 
  }
  // 更新出手计时器
  updateTimer(timerVal) {
    document.getElementsByClassName('timer')[0].textContent = timerVal 
  }
  // 添加游戏日志
  log(str) {
    const node = document.createElement('li') 
    node.textContent = str 
    document.getElementsByClassName('gamelog')[0].appendChild(node) 
  }
  // 更新当前玩家名
  updateTurn(str) {
    this.removeClass(document.getElementsByClassName('player1')[0], 'active') 
    this.removeClass(document.getElementsByClassName('player2')[0], 'active') 
    this.addClass(document.getElementsByClassName(str)[0], 'active') 
  }
  // 更新球的状态（solid、striped、unknown） ballArr记录落袋的球
  updateBalls(ballArr, sides){
    const p1side = sides.player1 == '?' ? 'unknown' : sides.Player1 
    const p2side = sides.player2 == '?' ? 'unknown' : sides.Player2 

    this.removeClass(document.getElementsByClassName('player1')[0], 'solid') 
    this.removeClass(document.getElementsByClassName('player2')[0], 'solid') 
    this.removeClass(document.getElementsByClassName('player1')[0], 'striped') 
    this.removeClass(document.getElementsByClassName('player2')[0], 'striped') 
    this.removeClass(document.getElementsByClassName('player1')[0], 'unknown') 
    this.removeClass(document.getElementsByClassName('player2')[0], 'unknown') 
    this.addClass(document.getElementsByClassName('player1')[0], p1side) 
    this.addClass(document.getElementsByClassName('player2')[0], p2side) 

    if(p1side == 'unknown') return 

    let elem = document.createElement('ul') 

    for (let i=1; i<8; i++){
      const el = document.createElement('li') 
      el.textContent = i 
      if(ballArr.indexOf(i) > -1){

      } else {
        this.addClass(el, 'pocketed') 
      }

      elem.appendChild(el) 
    }

    document.getElementsByClassName(p1side == 'solid' ? 'player1' : 'player2')[0].replaceChild(elem, document.getElementsByClassName(p1side == 'solid' ? 'player1' : 'player2')[0].children[1]) 
    
    elem = document.createElement('ul') 

    for (let i=9; i<16; i++) {
      const el = document.createElement('li') 
      el.textContent = i 
      if(ballArr.indexOf(i) > -1){

      } else {
        this.addClass(el, 'pocketed') 
      }

      elem.appendChild(el) 
    }

    document.getElementsByClassName(p1side == 'striped' ? 'player1' : 'player2')[0].replaceChild(elem, document.getElementsByClassName(p1side == 'striped' ? 'player1' : 'player2')[0].children[1]) 
  }
  // 显示或隐藏HUD
  showGameHud(mode){
    if (mode){
      this.hide('playBtn') 
      this.show('player1') 
      this.show('player2') 
      this.show('timer') 
      this.show('gamelog') 
    }else{
      this.show('playBtn') 
      this.hide('player1') 
      this.hide('player2') 
      this.hide('timer') 
      this.hide('gamelog') 
    }
  }
  // 打印消息
  showMessage(title, body) {
    document.getElementById("message").children[0].textContent = title 
    document.getElementById("message").children[1].textContent = body 
    this.show('message') 
  }
  // 更新游戏加载进度条
  update(){
    if(this.strengthBar.visible) this.strengthBar.update() 
  }
}

export { GameUI } 
