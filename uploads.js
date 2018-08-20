/**
 * Created By wktrf on 2018/6/9.
 */
const fs  = require('fs');
const tinify = require('tinify');
const mime = require('mime');
const markdown = require('markdown-it')();
const qn = require('qn');
const exec = require('child_process').exec;
const config = require('./config');
const domain = config.domain;;
tinify.key = config.tinify;
const client = qn.create(config.qiniu);
let filename = process.argv[2];
if (!filename) {
    console.error('未指定文件，请带上文件地址');
}
if (!fs.existsSync(filename)) {
    console.error('文件不存在');
}
fs.readFile(filename, 'utf8', ((err, data) => {
    if (err) {
        console.error(err);
        return false;
    }
    parseImg(data).then(async (res) => {
        let data_list = [...new Set(res)]; // 数组去重
        let index = 0;
        let jump = 0;
        for (let _p of data_list) {
            // 判断是否本地图片
            if (/[https|http|ftp]+:\/\//.test(_p)) {
                jump++;
                continue;
            }
            if (fs.existsSync(_p)) {
                await uploads(_p).then(({oldSrc, newSrc}) => {
                    data = data.replace(oldSrc, newSrc);
                    index++;
                })
            }
        }
        fs.writeFileSync(filename, data);
        let output_file_name = `${filename.replace(/^(.+)\..+$/g, '$1')}.txt`;
        console.log(`执行完成，共上传${index}个文件，跳过${jump}，失败${data_list.length - index - jump}个文件`);
        if(fs.existsSync(output_file_name)){
            output_file_name = filename+'.txt';
            fs.writeFileSync(output_file_name,markdown.render(data))
        }else{
            fs.writeFileSync(output_file_name,markdown.render(data))
        }
        exec('notepad '+output_file_name,{encoding:'utf8'},(...r)=>{
            console.log('清理垃圾文件启动');
            // 清理垃圾文件
            fs.unlinkSync(output_file_name);
        });
    });
}));
let parseImg = (data) => {
    return new Promise(((resolve, reject) => {
        if (typeof data !== 'string') {
            reject('type error');
            return;
        }
        let regx = /!\[.*?\]\((.*?)\)/g;
        let list = [];
        data.replace(regx, (...args) => {
            list.push(args[1]);
            return args[0];
        });
        resolve(list);
    }))
};
let uploads = (src) => {
    return new Promise(((resolve, reject) => {
        fs.readFile(src, (err, source) => {
            if (err) throw err;
            // 压缩图片
            let contentType = mime.getType(src);
            tinify.fromBuffer(source).toBuffer((err, resultData) => {
                if (err) throw err;
                // 上传数据到七牛
                client.upload(resultData, {contentType}, (err, res) => {
                    if (err) throw err;
                    resolve({oldSrc: src, newSrc: domain + res.hash});
                })
            })
        })
    }))
};