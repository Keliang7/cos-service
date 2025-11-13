import COS from "cos-nodejs-sdk-v5";
import dotenv from "dotenv";

dotenv.config();

export const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

export const Bucket = process.env.COS_BUCKET;
export const Region = process.env.COS_REGION;
