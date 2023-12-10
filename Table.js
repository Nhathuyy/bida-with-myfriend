/*
 * @Author: Talos--1660327787@qq.com
 * @Date: 2023-12-03 20:52:28
 * @LastEditors: Talos--1660327787@qq.com
 * @LastEditTime: 2023-12-10 11:17:43
 * @FilePath: /PoolGame-Web/Table.js
 * @Description: 创建球桌
 * 
 * Copyright (c) 2023 by five-forever, All Rights Reserved. 
 */

import * as CANNON from './libs/cannon-es.js' 
import { Ball } from './Ball.js' 
// Debug下添加cannon可视化
function addCannonVisual(body, color=0xAAAAAA){
    if (helper) helper.addVisual(body, color) 
}
// 创建一个绕指定轴的四元数
function createQuaternionFromAxisAngle(axis, angle){
    const q = new CANNON.Quaternion() 
    q.setFromAxisAngle(axis, angle) 
    return q 
}
// 全局参数
let scene, world, debug, helper 
// 球洞的几何表示
class Arch{
    constructor(params){
        this.body = new CANNON.Body({
            mass: 0, // 设为0表示静态
            material: Table.FLOOR_MATERIAL
        }) 
  
        params = params || {} 
        this.position = params.position || {x: 0, y: 0, z: 0} 
        this.radius = params.radius || Ball.RADIUS+0.02 
        this.box_autowidth = params.box_autowidth || false 
        this.box_width = params.box_width || 2 
        this.box_height = params.box_height || 5 
        this.box_thickness = params.box_thickness || 2 
        this.no_of_boxes = params.no_of_boxes || 5 
  
        this.body.position.set(this.position.x, this.position.y, this.position.z) 
        const y_axis = new CANNON.Vec3(0, 1, 0) 
        this.body.quaternion.setFromAxisAngle(y_axis, Math.PI) 
        // 方框中心与圆心夹角的基准值
        const box_increment_angle = Math.PI/(2*this.no_of_boxes) 
        // 根据半径获取x长度 防止重叠
        let x_len = this.radius * Math.tan(box_increment_angle) 
  
        if (!this.box_autowidth) x_len = this.box_width 
        // 方框作为child形状
        const shape = new CANNON.Box(new CANNON.Vec3(x_len, this.box_height, this.box_thickness)) 
  
        for (let i=0; i<this.no_of_boxes; i++) {
            const angle = box_increment_angle + (i * Math.PI / this.no_of_boxes) 
            let b_x = Math.cos(angle) 
            let b_z = Math.sin(angle) 
  
            b_x *= this.radius + this.box_thickness 
            b_z *= this.radius + this.box_thickness 
  
            this.body.addShape(shape,
                new CANNON.Vec3(b_x, 0, b_z),
                createQuaternionFromAxisAngle(y_axis, Math.PI/2 - angle)
            ) 
        }
    }
}
// 创建一个与x轴平行的长墙，用于构建游戏桌的边界
class LongWall{
    constructor(x, y, z, width) {
        const height = 0.04
        const thickness = 0.025 
  
        this.body = new CANNON.Body({
            mass: 0, 
            material: Table.WALL_MATERIAL
        }) 
        // 调整x坐标，改变三角形的角度
        const vertices1 = [
            0,          height,     -2*thickness,     // vertex 0
            0,          height,     0,                // vertex 1
            -0.028,     height,     -2*thickness,     // vertex 2
            0,          -height,    -2*thickness,     // vertex 3
            0,          -height,    0,                // vertex 4
            -0.028,     -height,    -2*thickness      // vertex 5
        ] 
        // 桌角
        const vertices2 = [
            0,      height,     -2*thickness,     // vertex 0
            0,      height,     0,                // vertex 1
            0.08,   height,     -2*thickness,     // vertex 2
            0,      -height,    -2*thickness,     // vertex 3
            0,      -height,    0,                // vertex 4
            0.08,   -height,    -2*thickness      // vertex 5
        ] 
        // 三角网格索引
        const indices = [
            0, 1, 2,
            3, 4, 5,
            5, 0, 2,
            5, 3, 0,
            3, 4, 1,
            3, 1, 0,
            4, 5, 1,
            5, 2, 1
        ] 

        const trimeshShape1 = new CANNON.Trimesh(vertices1, indices) 
        const trimeshShape2 = new CANNON.Trimesh(vertices2, indices) 
  
        this.body.position.set(x,y,z) 
        this.body.addShape(trimeshShape1, new CANNON.Vec3(-width, 0, 0)) 
        this.body.addShape(trimeshShape2, new CANNON.Vec3( width, 0, 0)) 
  
        const boxshape = new CANNON.Box(new CANNON.Vec3(width, height, thickness)) 
  
        this.body.addShape(boxshape, new CANNON.Vec3(0 ,0, -thickness)) 
    }
}
// 创建一个与z轴平行的短墙，用于构建游戏桌的边界
class ShortWall{
    constructor(x, y, z, width) {
        const height = 0.04
        const thickness = 0.04 

        this.body = new CANNON.Body({
            mass: 0,
            material: Table.WALL_MATERIAL
        }) 
        // 用单个三角形制作网格
        const vertices1 = [
            0,       height,    -2*thickness,    // vertex 0
            0,       height,    0,               // vertex 1
            -0.125,  height,    -2*thickness,    // vertex 2
            0,       -height,   -2*thickness,    // vertex 3
            0,       -height,   0,               // vertex 4
            -0.125,  -height,   -2*thickness     // vertex 5
        ] 
        // 桌角
        const vertices2 = [
            0,      height,     -2*thickness,    // vertex 0
            0,      height,     0,               // vertex 1
            0.125,  height,     -2*thickness,    // vertex 2
            0,      -height,    -2*thickness,    // vertex 3
            0,      -height,    0,               // vertex 4
            0.125,  -height,    -2*thickness     // vertex 5
        ] 
        // 三角网格索引
        const indices = [
            0, 1, 2,
            3, 4, 5,
            5, 0, 2,
            5, 3, 0,
            3, 4, 1,
            3, 1, 0,
            4, 5, 1,
            5, 2, 1
        ] 

        const trimeshShape1 = new CANNON.Trimesh(vertices1, indices) 
        const trimeshShape2 = new CANNON.Trimesh(vertices2, indices) 
  
        this.body.position.set(x,y,z) 
        this.body.addShape(trimeshShape1, new CANNON.Vec3(-width, 0, 0)) 
        this.body.addShape(trimeshShape2, new CANNON.Vec3( width, 0, 0)) 
  
        const boxshape = new CANNON.Box(new CANNON.Vec3(width, height, thickness)) 
        this.body.addShape(boxshape, new CANNON.Vec3(0 ,0, -thickness)) 
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI/2) 
    }
}
// 创建一个球洞，包括墙和底部的弯曲结构
class Hole{
    constructor(x, y, z, rotation) {
       // 墙
        this.arch1 = new Arch({
            position: {x, y, z},
            no_of_boxes: 6,
            box_height: 0.06,
            box_autowidth: true,
            box_thickness: 0.01
        }) 
        // 底部
        this.arch2 = new Arch({
            position: {x, y: y - 0.01, z},
            no_of_boxes: 6,
            box_height: 0.01,
            box_width: 0.025,
            box_thickness: 0.03
        }) 
  
        this.arch1.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI - rotation) 
        this.arch2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rotation) 
  
        world.addBody(this.arch1.body) 
        world.addBody(this.arch2.body) 

        if (debug) {
            addCannonVisual(this.arch1.body, scene) 
            addCannonVisual(this.arch2.body, scene) 
        }
    }
}
// 创建球桌 包括桌布、球洞、边界
class Table{
    static LENGTH = 2.7432 
    static WIDTH = 1.3716 
    static HEIGHT = 0.06 
    static FLOOR_MATERIAL = new CANNON.Material('floorMaterial') 
    static WALL_MATERIAL = new CANNON.Material('wallMaterial') 

    constructor(game){
        world = game.world 
        scene = game.scene 
        debug = game.debug 
        helper = game.helper 

        this.createRigidBodies() 
    }

    createRigidBodies(){
        this.felt = this.createFelt()  
        this.holes = this.createHoles() 
        this.walls = this.createWalls() 
    }
    // 桌布
    createFelt(){
        const narrowStripWidth = 0.02 
        const narrowStripLength = Table.WIDTH/2 - 0.05 
        const floorThickness = 0.01 
        const mainAreaX = Table.LENGTH/2 - 2*narrowStripWidth 
        const floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX, floorThickness, Table.WIDTH/2)) 
        const floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength)) 
      
        const body = new CANNON.Body({
          mass: 0, 
          material: Table.floorContactMaterial
        }) 
        body.addShape(floorBox,      new CANNON.Vec3(0, -floorThickness, 0)) 
        body.addShape(floorBoxSmall, new CANNON.Vec3(-mainAreaX - narrowStripWidth, -floorThickness, 0)) 
        body.addShape(floorBoxSmall, new CANNON.Vec3( mainAreaX + narrowStripWidth, -floorThickness, 0)) 
      
        if(debug) addCannonVisual(body, scene) 
          
        world.addBody(body) 
        return body 
    }
    // 球洞
    createHoles(){
        const corner = {x: Table.LENGTH/2 + 0.015, z: Table.WIDTH/2 + 0.015, PIby4: Math.PI/4}
        const middleZ = Table.WIDTH/2 + 0.048 

        const holes = [
            // -z
            new Hole( corner.x, 0, -corner.z,  corner.PIby4),
            new Hole(-corner.x, 0, -corner.z, -corner.PIby4),
            // 中袋
            new Hole(0, 0, -middleZ, 0),
            new Hole(0, 0,  middleZ, Math.PI),
            // +z 
            new Hole( corner.x, 0, corner.z,  3*corner.PIby4),
            new Hole(-corner.x, 0, corner.z, -3*corner.PIby4)
        ] 

        return holes 
    }
    // 边界墙
    createWalls(){
        const pos = {x:Table.LENGTH/4 - 0.008, y:0.02, z:Table.WIDTH/2}
        // -z
        const wall1 = new LongWall( pos.x, pos.y, -pos.z, 0.61) 
        const wall2 = new LongWall(-pos.x, pos.y, -pos.z, 0.61) 
        wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI) 
        // +z
        const wall3 = new LongWall( pos.x, pos.y, pos.z, 0.61) 
        const wall4 = new LongWall(-pos.x, pos.y, pos.z, 0.61) 
        wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0),  Math.PI) 
        wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI) 
        // +x
        pos.x = Table.LENGTH/2 
        const wall5 = new ShortWall(pos.x, pos.y, 0, 0.605) 
        // -x
        const wall6 = new ShortWall(-pos.x, pos.y, 0, 0.605) 
        wall6.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.5 * Math.PI) 

        const walls = [wall1, wall2, wall3, wall4, wall5, wall6] 
        walls.forEach(wall => {
            world.addBody(wall.body) 
            if(debug) addCannonVisual(wall.body, scene) 
        }) 
        return walls 
    }
}

export { Table } 