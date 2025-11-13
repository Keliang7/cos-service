import express from "express";
import multer from "multer";
import fs from "fs";
import { cos, Bucket, Region } from "./cos.js";
import { saveBase64Temp } from "./utils/saveTemp.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @description 上传文件（前端 → 业务后端 → cos-service → COS）
 *
 * 用途：
 * - 前端以 multipart/form-data 上传文件（字段必须为 file）
 * - cos-service 将文件写入 COS 并返回 { key, url }
 *
 * @params {File} file 通过 multer 解析后的文件（req.file）
 *
 * @returns {Object} 上传结果
 * @returns {string} returns.key COS 文件路径
 * @returns {string} returns.url 公网可访问 URL
 *
 * @example
 * please check test/upload/index.js
 */
router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  const Key = `uploads/${Date.now()}-${file.originalname}`;

  cos.putObject(
    {
      Bucket,
      Region,
      Key,
      Body: fs.createReadStream(file.path),
    },
    (err, data) => {
      fs.unlinkSync(file.path);
      if (err) return res.status(500).json({ error: err });

      const url = `https://${Bucket}.cos.${Region}.myqcloud.com/${Key}`;

      res.json({ key: Key, url });
    }
  );
});

/**
 * @description Base64 上传接口（AI 图像、截图、海报生成等场景）
 *
 * @params {string} base64 Base64 字符串
 * @params {string} filename 可选文件名
 *
 * @returns {Object} 上传结果
 * @returns {string} returns.key COS 文件存储路径
 * @returns {string} returns.url 公网可访问 URL
 *
 * @example
 * axios.post("/api/upload/base64", {
 *   base64: "data:image/png;base64,xxxx",
 *   filename: "demo.png"
 * });
 */
router.post("/upload/base64", async (req, res) => {
  try {
    const { base64, filename = "image.png" } = req.body;
    const tempPath = saveBase64Temp(base64);

    const Key = `uploads/${Date.now()}-${filename}`;

    cos.putObject(
      {
        Bucket,
        Region,
        Key,
        Body: fs.createReadStream(tempPath),
      },
      (err, data) => {
        fs.unlinkSync(tempPath);
        if (err) return res.status(500).json({ error: err });

        const url = `https://${Bucket}.cos.${Region}.myqcloud.com/${Key}`;

        res.json({ key: Key, url });
      }
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @description 删除 COS 中指定文件
 *
 * @params {string} key COS 文件路径
 *
 * @returns {Object} 删除结果
 * @returns {string} returns.deleted 被删除的文件路径
 *
 * @example
 * axios.post("/api/delete", { key: "uploads/a.png" });
 */
router.post("/delete", async (req, res) => {
  const { key } = req.body;

  cos.deleteObject(
    {
      Bucket,
      Region,
      Key: key,
    },
    (err, data) => {
      if (err) return res.status(500).json({ error: err });

      res.json({ deleted: key });
    }
  );
});

/**
 * @description 生成 COS 预签名 URL（前端/后端可直传 COS）
 *
 * @params {string} key 文件路径
 * @params {string} method 上传方式（PUT/GET/DELETE）
 *
 * @returns {Object} 签名结果
 * @returns {string} returns.Url 预签名 URL
 * @returns {string} returns.Method 操作方式
 *
 * @example
 * please check test/signed-url/index.js
 */
router.post("/signed-url", async (req, res) => {
  const { key, method = "PUT" } = req.body;

  cos.getObjectUrl(
    {
      Bucket,
      Region,
      Key: key,
      Method: method,
      Sign: true,
      Expires: 600,
    },
    (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    }
  );
});

export default router;
