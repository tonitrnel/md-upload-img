/**
 * Created By wktrf on 2018/6/9.
 */
import fs from 'fs';
import tinify from 'tinify';
import mime from 'mime';
import markdown from 'markdown-it';
import qn from 'qn';
markdown = markdown();
const domain = 'https://r.wktrf.com';
tinify.key = 'xlbhXJjzGKEnFedbZro4iCme8op77nhG';
const client = qn.create({
    accessKey: '6LIBEj55NH-8RR-IBvb8IxJ_-coSmVQBJPPOyXxD',
    secretKey: 'BmNWKBUZrecuOcnp0wVtuAI4_Hx8THSAGtXCwtCb',
    bucket: 'dreams',
    uploadURL: 'https://up-z2.qiniup.com'
});
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
        for (let _p of data_list) {
            // 判断是否本地图片
            if (/[https|http|ftp]+:\/\//.test(_p)) {
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
        console.log(`执行完成，共上传${index}个文件，失败${res.length - index}个文件`);
        fs.writeFileSync(filename+'.txt',markdown.render(data))
    });
}));
let parseImg = (data) => {
    return new Promise(((resolve, reject) => {
        if (typeof data !== 'string') {
            reject('type error');
            return;
        }
        let regx = /!\[.*?\]\((.*)\)/g;
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