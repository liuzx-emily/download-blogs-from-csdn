import { Buffer } from "buffer";
import { createHmac } from "node:crypto";

const listCookie = "";
const detailCookie = "";

export const listReqHeaders = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "zh-CN,zh;q=0.9",
  Connection: "keep-alive",
  Cookie: listCookie,
  Host: "blog.csdn.net",
  Referer: "https://blog.csdn.net/tangran0526?type=blog",
  "Sec-Ch-Ua": `"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"`,
  "Sec-Ch-Ua-Mobile": `?0`,
  "Sec-Ch-Ua-Platform": `"Windows"`,
  "Sec-Fetch-Dest": `empty`,
  "Sec-Fetch-Mode": `cors`,
  "Sec-Fetch-Site": `same-site`,
  "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`,
};

// 编辑页面中获取文章详情的接口，可以取到md内容。这个接口使用headers中的X-Ca-Nonce和X-Ca-Signature校验，这两个值的计算方法和请求地址有关，所以不同的文章有不同的id，得到的signature也不同，没办法使用开控制台复制headers的方法了。必须动态计算
export function getDetailReqHeaders(postId) {
  const reqHeaders = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Cookie: detailCookie,
    Origin: `https://editor.csdn.net`,
    Priority: `u=1, i`,
    Referer: `https://editor.csdn.net/`,
    "Sec-Ch-Ua": `"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"`,
    "Sec-Ch-Ua-Mobile": `?0`,
    "Sec-Ch-Ua-Platform": `"Windows"`,
    "Sec-Fetch-Dest": `empty`,
    "Sec-Fetch-Mode": `cors`,
    "Sec-Fetch-Site": `same-site`,
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`,
    "X-Ca-Key": "203803574",
    // 下面两个是验证的关键，需要计算
    // "X-Ca-Nonce": "20a5d5b5-b3fa-48f7-94aa-ca06b8edaa1c",
    // "X-Ca-Signature": "ZqUTGd/c9/gD3t5XrEdo6/KUN/rPt91Yv7jQMpjaI3k=",
    "X-Ca-Signature-Headers": "x-ca-key,x-ca-nonce",
  };

  // const onceKey = generateNonce()
  const onceKey = "XXXX";
  const sign = generateSignature(
    `/blog-console-api/v3/editor/getArticle?id=${postId}&model_type`,
    onceKey
  );
  reqHeaders["X-Ca-Nonce"] = onceKey;
  reqHeaders["X-Ca-Signature"] = sign;
  return reqHeaders;

  function generateNonce() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
      var e = (16 * Math.random()) | 0;
      return ("x" === t ? e : (3 & e) | 8).toString(16);
    });
  }

  // 参考 https://www.cnblogs.com/Hellowshuo/p/15622154.html
  function generateSignature(fullUrl, onceKey) {
    const ekey = "9znpamsyl2c7cdrr9sas0le9vbc3r6ba"; // 是固定值，写死在csdn代码中的
    const xcakey = "203803574"; // x-ca-key。是固定值，写死在csdn代码中的
    const to_enc = `GET\n*/*\n\n\n\nx-ca-key:${xcakey}\nx-ca-nonce:${onceKey}\n${fullUrl}`;
    const hash = createHmac("sha256", Buffer.from(ekey))
      .update(Buffer.from(to_enc))
      .digest("base64");
    return hash;
  }
}
