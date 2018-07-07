## 简介 ##
基于Koa.js 的微信工具类 [项目地址请戳这里](https://github.com/evont/koa-wechat)

## 功能 ##
1. 获取微信配置信息，用于微信内部浏览器设置转发信息；
2. 获取小程序（小游戏）用户session_key 和 openid 等

## 使用方法 ##
``
git clone https://github.com/evont/koa-wechat.git
npm install
``

## 路由对应##
获取微信配置信息：
http://localhost:8088/wechat/getConfig.action?url=https%3A%2F%2Fgithub.com%2Fevont%2Fkoa-wechat

获取小程序（小游戏）openid等信息：
http://localhost:8088/wechat/mini/login.action?code=aaa&appName=app


