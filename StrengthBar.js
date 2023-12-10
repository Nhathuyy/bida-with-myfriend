/*
 * @Author: Talos--1660327787@qq.com
 * @Date: 2023-12-03 20:52:28
 * @LastEditors: Talos--1660327787@qq.com
 * @LastEditTime: 2023-12-09 18:56:33
 * @FilePath: /PoolGame-Web/StrengthBar.js
 * @Description: 击球时的蓄力进度条样式
 * 
 * Copyright (c) 2023 by five-forever, All Rights Reserved. 
 */

class StrengthBar{
	constructor(options){
		// DOM容器
		this.domElement = document.createElement("div") 
		const domStyle = this.domElement.style 
		domStyle.position = 'fixed' 
		domStyle.bottom = '40px' 
		domStyle.width = '50%' 
		domStyle.left = '50%' 
		domStyle.transform = 'translateX(-50%)' 
		domStyle.height = '15px' 
		domStyle.display = 'none' 
		domStyle.alignItems = 'center' 
		domStyle.justifyContent = 'center' 
		domStyle.zIndex = '1111' 
		// 轮廓
		const barBase = document.createElement("div") 
		barBase.style.background = '#aaa' 
		barBase.style.width = '100%' 
		barBase.style.minWidth = '100px' 
		barBase.style.borderRadius = '10px' 
		barBase.style.height = '15px' 
		this.domElement.appendChild(barBase) 
		// 填充
		const bar = document.createElement("div") 
		bar.style.background = '#22a' 
		bar.style.width = '0%' 
		bar.style.borderRadius = '10px' 
		bar.style.height = '100%' 
		bar.style.width = '0' 
		barBase.appendChild(bar) 
		this.strengthBar = bar 
		this._strength = 0 
		
		document.body.appendChild(this.domElement) 
	}
	// 蓄力增加力度
	update(){
		if (this.visible){
			this._strength += 0.01 
			this.strength = this._strength 
		}
	}
	// 获取实际力度
	get strength(){
		return this._strength * 1.4 
	}
	// 确保力度合法 更新长度
	set strength(strength){
		if (strength<0) strength = 0 
		if (strength>1) strength = 1 
		this._strength = strength 
		const percent = strength*100 
		this.strengthBar.style.width = `${percent}%` 
	}
	// 设置力度条可见状态
	set visible(value){
		if (value){
			if (!this.visible) this._strength = 0 
			this.domElement.style.display = 'flex' 
		}else{
			this.domElement.style.display = 'none' 
		}
	}
	// 检测可见状态，样式flex可见 
	get visible(){
		return this.domElement.style.display == 'flex' 
	}
}

export { StrengthBar } 