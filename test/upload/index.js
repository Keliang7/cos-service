import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function upload() {
  const form = new FormData();
  form.append("file", fs.createReadStream("../test.png")); // 本地文件路径

  const res = await axios.post(
    "http://localhost:3000/api/upload",
    form,
    { headers: form.getHeaders() } // 关键：设置 multipart/form-data header
  );

  console.log("上传成功：", res.data);
}

upload();
