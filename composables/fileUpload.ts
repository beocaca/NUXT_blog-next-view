import process from 'node:process';
import fs from 'node:fs';
import COS from 'cos-nodejs-sdk-v5';
import crypto from 'node:crypto';

export function upload(filePath: string, filename: string): string {
	const secret_ID = process.env.COS_SECRET_ID;
	const secret_KEY = process.env.COS_SECRET_KEY;

	const cos = new COS({
		SecretId: secret_ID as string,
		SecretKey: secret_KEY as string,
	});

	const date = new Date();
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');

	const key = `/blog/${year}/${month}/${filename}`;

	cos.putObject(
		{
			Bucket: process.env.BUCKET_NAME
				? process.env.BUCKET_NAME
				: '' /* 填入您自己的存储桶，必须字段 */,
			Region: process.env.REGION_NAME
				? process.env.REGION_NAME
				: '' /* 存储桶所在地域，例如 ap-beijing，必须字段 */,
			Key: key /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
			StorageClass: 'STANDARD',
			/* 当 Body 为 stream 类型时，ContentLength 必传，否则 onProgress 不能返回正确的进度信息 */
			Body: fs.createReadStream(filePath), // 上传文件对象
			ContentLength: fs.statSync(filePath).size,
		},
		(err, data) => {
			if (err) {
				console.error(err);
				return err;
			}
			console.warn(data);
			return data;
		}
	);
	return `${process.env.IMAGE_PREVIEW_URI}${key}`;
}

export function getFileHashSync(filePath: string, algorithm = 'sha256') {
	try {
		const hash = crypto.createHash(algorithm);

		const data = fs.readFileSync(filePath);

		hash.update(data);

		return hash.digest('hex');
	} catch (err) {
		console.error('获取文件哈希值时出错:', err);
		return null;
	}
}

export function uuidv4() {
	return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
		(c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
	);
}
