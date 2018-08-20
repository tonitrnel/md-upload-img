## 这是一个上传markdown文章里面图片到七牛云的工具,然后导出HTML的工具，主要是给WordPress使用
流程：正则解析markdown里面图片的链接->上传到TinyPng进行压缩文件->上传到七牛->得到链接，替换本地链接->解析Markdown文件为HTML代码并使用记事本打开->清理生成的临时文件
## 包含库
- tinify
- qn
- mime
- markdown-it
## 使用方法
`npm install`或者`yarn install`安装包

创建你的配置文件
```js
module.exports = {
    tinypng:'', // 你的TinyPng密钥
    domain: '', // 你绑定到七牛的域名（七牛对测试域名限制挺大的）
    qiniu:{
        accessKey: '', // 可以在 https://portal.qiniu.com/user/key 获取
        secretKey: '',
        bucket: '', // 仓库名
        uploadURL: 'https://up-z2.qiniup.com' // 区域对应的地址
    }
}
```
命令行输入`node uploads.js [文件地址]`