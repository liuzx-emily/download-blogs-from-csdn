import { writeFile } from "fs/promises";
import https from "https";
import path from "node:path";
import process from "process";
import { v4 as uuidv4 } from "uuid";

export function _getPath(str) {
  return path.join(process.cwd(), str);
}

export function downladAsset(url, dir) {
  return new Promise(function (resolve, reject) {
    https.get(url, (res) => {
      var imgData = "";
      res.setEncoding("binary"); // 下载图片需要设置为 binary, 否则图片会打不开
      res.on("data", (chunk) => {
        imgData += chunk;
      });
      res.on("end", async () => {
        const filename = uuidv4() + ".png";
        const filePath = path.join(dir, filename);
        await writeFile(filePath, imgData, "binary");
        resolve(filename);
      });
      res.on("error", async () => {
        console.error("error downloading asset" + url);
        reject();
      });
    });
  });
}
