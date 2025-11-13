import axios from "axios";
import fs from "fs";

const { data } = await axios.post("http://localhost:3000/api/signed-url", {
  key: "uploads/test1600.png",
  method: "PUT",
});

console.log("预签名 URL:", data.Url);

const fileBuffer = fs.readFileSync("../test.png");

axios
  .put(data.Url, fileBuffer)
  .then(res => {
    console.log("上传成功", res.status);
  })
  .catch(err => {
    console.error(
      "上传失败",
      err.response?.status,
      err.response?.data,
      err.message
    );
  });
