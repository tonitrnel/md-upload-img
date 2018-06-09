/**
 * Created By wktrf on 2018/6/9.
 */
const fs = require('fs');
const tinify = require('tinify');
const mime = require('mime');
const qn = require('qn');
const domain = 'https://r.wktrf.com/';
tinify.key = 'mdN5Svehl0AnwA9JSHPyRnvjXZ6q2bQZ';
const client = qn.create({
    accessKey:'Zn3N6ZXphoD25LC3gBTJMzTEGzEX-3GTOftcsKVi',
    secretKey:'wAiCKE0vy_2qJA1YG7cQtptBylKFLGr6RufRX5dZ',
    bucket:'dreams',
    uploadURL:'https://up-z2.qiniup.com'
});
let filename = process.argv[2];
if(!filename){
    console.error('未指定文件，请带上文件地址');
    return;
}
if(!fs.existsSync(filename)){
    console.error('文件不存在');
    return;
}
fs.readFile(filename,'utf8',((err, data) => {
    if(err){
        console.error(err);
        return;
    }
    parseImg(data).then(async (res)=>{
        let data_list = [...new Set(res)]; // 数组去重
        let index = 0;
        for (let _p of data_list){
            // 判断是否本地图片
            if(!_p.includes('file:///')){
                continue;
            }
            _p = _p.replace('file:///','');
            if(fs.existsSync(_p)){
                await uploads(_p).then(({oldSrc,newSrc})=>{
                    data = data.replace('file:///'+oldSrc,newSrc);
                    index++;
                })
            }
        }
        fs.writeFileSync(filename,data);
        console.log(`执行完成，共上传${index}个文件，失败${res.length-index}个文件`);
    });
}));
let parseImg = (data)=>{
  return new Promise(((resolve, reject) => {
      if(typeof data!=='string'){
          reject('type error');
          return;
      }
      let regx = /!\[img\]\((.*)\)/g;
      let list = [];
      data.replace(regx,(...args)=>{
          list.push(args[1]);
          return args[0];
      });
      resolve(list);
  }))
};
let uploads = (src)=>{
    return new Promise(((resolve, reject) => {
        fs.readFile(src,(err,source)=>{
            if(err)throw err;
            // 压缩图片
            let contentType = mime.getType(src);
            tinify.fromBuffer(source).toBuffer((err,resultData)=>{
                if(err)throw err;
                // 上传数据到七牛
                client.upload(resultData,{contentType},(err,res)=>{
                    if(err)throw err;
                    resolve({oldSrc:src,newSrc:domain+res.hash});
                })
            })
        })
    }))
};