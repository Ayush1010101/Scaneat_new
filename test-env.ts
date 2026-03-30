import "dotenv/config";
import { ENV } from "./server/_core/env";
console.log("Access key:", ENV.awsAccessKeyId);
console.log("Secret key exists?:", !!ENV.awsSecretAccessKey);
console.log("Bucket:", ENV.awsS3Bucket);
