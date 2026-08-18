import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-compatible, same client, R2's account-scoped endpoint.
// See: https://developers.cloudflare.com/r2/api/s3/api/
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 is not configured (missing R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY)."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) {
    throw new Error("R2 is not configured (missing R2_BUCKET_NAME/R2_PUBLIC_URL).");
  }

  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

// Best-effort cleanup: trip image edits should not fail if a stale R2 object can't be removed.
export async function deleteFromR2ByUrl(url: string) {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) return;

  const prefix = `${publicUrl.replace(/\/$/, "")}/`;
  if (!url.startsWith(prefix)) return;
  const key = url.slice(prefix.length);

  try {
    const client = getR2Client();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    console.error("R2 delete failed:", err);
  }
}
