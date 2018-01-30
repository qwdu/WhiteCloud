# Install
1. $ git pull https://github.com/qwdu/WhiteCloud
2. $ cd WhiteCloud
3. $ npm install 

# Run 
1. set home and public dir
2. $ node app.js

# API 
1. POST 内容格式: json | form
2. 必须参数: method (user.login , file.listdir ...), params

# Plugin
1. 参考 mod.user.js | mod.file.js , 编写对应的 mod.xxx.js
2. 比如插件叫 gallery, API文件为 mod.gallery.js, 内部实现了 list 功能, 访问API method=gallery.list 即可
