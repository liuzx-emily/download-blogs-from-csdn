import axios from "axios";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getDetailReqHeaders, listReqHeaders } from "./reqHeaders.js";
import { _getPath, downladAsset } from "./utils.js";

const POSTS_DIR = "posts";
const POSTASSETS_DIR = "postAssets";

async function downloadBlogsFromCSDN() {
  console.log("正在将CSDN上的文章下载到本地...");
  mkdir(_getPath(POSTS_DIR));
  mkdir(_getPath(POSTASSETS_DIR));

  const res = await axios({
    url: "https://blog.csdn.net/community/home-api/v1/get-business-list",
    method: "get",
    headers: listReqHeaders,
    params: { businessType: "blog", username: "tangran0526", page: 1, size: 1000 },
  });
  const { list } = res.data.data;
  for (const blog of list) {
    // createTime 格式为 2000-01-01 00:00:00
    const { articleId, postTime: createTime } = blog;
    let {
      title,
      markdowncontent: mdContent,
      categories,
      tags,
      description,
    } = await getBlogDetail(articleId);
    if (description.includes("\n")) {
      console.warn(`文章《${title}》的description存在换行符，格式错误。将description置空`);
      description = "";
    }
    let filename = title;
    // title中可能含有特殊字符，无法直接作为文件名称，需要处理
    if (/:/g.test(filename)) {
      console.warn(`文章《${filename}》的标题含有:，不能直接用作文件名。将英文:修改为中文：`);
      filename = filename.replaceAll(/:/g, "：");
    }
    if (/\//g.test(filename)) {
      console.warn(`文章《${filename}》的标题含有字符/，不能直接用作文件名。将/修改为斜杠`);
      filename = filename.replaceAll(/\//g, "斜杠");
    }
    if (/[\\/:*?"<>|]/.test(filename)) {
      throw new Error(`文章《${filename}》的标题含有非法字符，不能直接用作文件名`); // \/:*?"<>|
    }
    filename = `${createTime.slice(0, 10)}_${filename}`; // filename形如2000-01-01_abcdef
    // 处理metadata
    const metadata = {
      title,
      createTime,
      categories,
      tags,
      description,
    };
    let metadataStr = `---\n`;
    for (const key in metadata) {
      const value = metadata[key];
      metadataStr += `${key}: ${value}\n`;
    }
    metadataStr += "---\n";
    // 把网络资源替换为本地资源
    mdContent = await convertHttpAssetsToLocalAssetsInMarkdown(mdContent, POSTASSETS_DIR);
    await writeFile(_getPath(`${POSTS_DIR}/${filename}.md`), metadataStr + mdContent);
  }
  console.log("全部文章下载完成！");
}

async function getBlogDetail(postId) {
  const res = await axios({
    url: `https://bizapi.csdn.net/blog-console-api/v3/editor/getArticle`,
    method: "get",
    headers: getDetailReqHeaders(postId),
    params: {
      id: postId,
      model_type: "",
    },
  });
  return res.data.data;
}

/**
 * 将markdown中的http资源转化为本地链接资源。下载的资源放在localAssetsDir中
 * @param {String} markdownStr 内容为markdown的字符串
 * @param {String} localAssetsDir 存放本地assets的路径（相对项目根目录）
 */
async function convertHttpAssetsToLocalAssetsInMarkdown(markdownStr, localAssetsDir) {
  const httpAssetsLinkReg = /!\[.*?\]\(((https|http).*?)\)/gi;
  const linkArray = [];
  let tempResult = httpAssetsLinkReg.exec(markdownStr);
  while (tempResult) {
    linkArray.push(tempResult[1]);
    tempResult = httpAssetsLinkReg.exec(markdownStr);
  }
  for (const url of linkArray) {
    const localAssetFileName = await downladAsset(url, _getPath(localAssetsDir));
    markdownStr = markdownStr.replaceAll(url, path.join("../", localAssetsDir, localAssetFileName));
  }
  return markdownStr;
}

downloadBlogsFromCSDN();
