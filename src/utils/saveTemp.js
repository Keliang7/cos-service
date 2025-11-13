import fs from "fs";
import path from "path";

export function saveBase64Temp(base64Str) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const filename = `temp-${Date.now()}.png`;
  const filePath = path.join(tempDir, filename);

  const data = base64Str.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(filePath, Buffer.from(data, "base64"));

  return filePath;
}
