

# Upload 测试示例

此文档展示 **前端（浏览器/前端页面）代码示例** 和 **后端（Node.js）代码示例**，用于调用 `/upload` 和 `/signed-url` 进行文件上传。

---

## 📌 前端示例（使用 axios + FormData）

以下代码适用于：

- Vue / React / 原生 HTML 前端
- 浏览器环境（已有内置 FormData）
- 上传接口：`/api/upload`

```html
<input type="file" id="fileInput" />

<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
  async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) return alert("请选择文件！");

    const form = new FormData();
    form.append("file", file);

    const res = await axios.post("http://localhost:3000/api/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("上传成功：", res.data);
  }

  document.getElementById("fileInput").addEventListener("change", uploadFile);
</script>
```

---

## 📌 前端示例（使用 signed-url 直传 COS）

适用于：

- H5 直接上传大文件到 COS
- 更高性能的直传模式（推荐给视频 / 大文件）

```js
async function uploadViaSignedUrl(file) {
  // 获取预签名 URL
  const { data } = await axios.post("http://localhost:3000/api/signed-url", {
    key: "uploads/demo-file.png",
    method: "PUT",
  });

  console.log("预签名 URL:", data.Url);

  // 直传到 COS
  await axios.put(data.Url, file, {
    headers: { "Content-Type": file.type },
  });

  console.log("上传成功，文件路径:", data.key);
}
```

---

## 📌 后端示例（Node.js 调用 /upload）

---

## 📌 后端示例（前端上传文件 → 业务后端转发到 cos-service）

适用于：

- 前端把文件上传到“业务后端”
- 业务后端不保存文件，直接把文件转发给 cos-service
- 最常见的生产场景（统一鉴权、统一日志、统一权限）

> ⚠ 注意：这是“后端中转”模式。业务后端需要使用 `multer` 接收前端文件，再用 axios + FormData 将文件转发到 cos-service。

### 业务后端代码示例（Express）

```js
import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "temp/" }); // 临时目录

// 前端 → 业务后端（接收文件并转发） → cos-service
router.post("/forward-upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file; // 前端上传的文件
    if (!file) return res.status(400).json({ error: "未收到文件" });

    // ⭐ 用 FormData 构造转发请求
    const form = new FormData();
    form.append("file", fs.createReadStream(file.path));

    // ⭐ 转发给 cos-service
    const result = await axios.post(
      "http://cos-service:3000/api/upload", 
      form,
      { headers: form.getHeaders() }
    );

    // 删除后端本地临时文件
    fs.unlinkSync(file.path);

    // 把 cos-service 的返回原样给前端
    res.json(result.data);
  } catch (err) {
    console.error("转发失败:", err);
    res.status(500).json({ error: "上传失败" });
  }
});
```

### 前端调用方式（业务后端）

```js
const form = new FormData();
form.append("file", fileInput.files[0]);

axios.post("/forward-upload", form, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

---

适用于：

- 业务后端服务调用 cos-service
- 内网 Docker 网络互相访问

```js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function uploadToCosService() {
  const form = new FormData();
  form.append("file", fs.createReadStream("./test.png"));

  const res = await axios.post(
    "http://localhost:3000/api/upload",
    form,
    { headers: form.getHeaders() }
  );

  console.log("上传成功：", res.data);
}

uploadToCosService();
```

---

## 📌 后端示例（Node.js + signed-url 直传 COS）

适用于：

- 业务后端需要绕过中转，直接写入 COS
- 上传本地文件、AI生成文件等

```js
import axios from "axios";
import fs from "fs";

async function uploadViaSignedUrl() {
  // 获取预签名 URL
  const { data } = await axios.post("http://localhost:3000/api/signed-url", {
    key: "uploads/test1600.png",
    method: "PUT",
  });

  const buffer = fs.readFileSync("./test.png");

  await axios.put(data.Url, buffer);

  console.log("上传成功");
}

uploadViaSignedUrl();
```

---

以上示例可直接复制使用。