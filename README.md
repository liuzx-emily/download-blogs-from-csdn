## 简述

开发个人博客网站时需要把我之前在 csdn 上写的文章下载到本地，并转换为指定格式。用 nodejs 实现爬虫。

文章下载到 posts 目录下，名称为 `${createTime}_${title}.md`，内容包括 metadata 和正文。文章中引用的图片下载到 postAssets 目录下，并且文章中图片的链接已修改为本地链接。具体见 [《个人博客网站开发记录 - 将 csdn 文章下载到本地》](https://liuzx-emily.github.io/liuzx-emily/#/post/8fdbb844-41f8-487e-816d-3cee2b948c54)

## 运行爬虫

在浏览器中登录 csdn，访问文章列表页面找到列表接口，访问编辑文章页面找到获取文章详情接口。把这两个接口的请求头中的 cookie 值分别赋给 `src/reqHeaders.js` 中对应变量。

执行 `npm run download`
