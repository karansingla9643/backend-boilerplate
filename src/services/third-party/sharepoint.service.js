const axios = require('axios');
const fs = require('fs');
const qs = require('qs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const config = {
    tenantId: '',
    clientId: '',
    clientSecret: '',
    siteUrl: '',
    sitePath: ''
}

/**
 * 1️⃣ Get a SharePoint (Graph) access token via client-credentials
 */
async function getSharePointAccessToken() {
    const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    const body = qs.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default'
    });

    const res = await axios.post(tokenUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data.access_token;
}

/**
 * 2️⃣ Ensure a folder exists under the root of the site drive
 *    Calls GET .../drive/root:/{folderName}; if 404, POST root/children to create
 */
async function createFolderIfNeeded(siteId, folderName, accessToken) {
    const checkUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${folderName}`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
        await axios.get(checkUrl, { headers });
        console.log(`Folder "${folderName}" already exists.`);
    } catch (err) {
        if (err.response?.status === 404) {
            const createUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root/children`;
            const payload = {
                name: folderName,
                folder: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            };
            const r = await axios.post(createUrl, payload, {
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
            console.log(`Created folder "${folderName}" (id=${r.data.id})`);
        } else {
            console.error('Error checking/creating folder:', err.response?.data || err.message);
            throw err;
        }
    }
}

/**
 * 3️⃣ Upload a file buffer to SharePoint, then (optionally) create a guest-share link.
 *
 * @param {Buffer} fileBuffer      – the raw bytes of the file
 * @param {string} originalName    – e.g. "report.pdf"
 * @param {string?} fileName       – if provided, used (plus extension); otherwise UUID
 * @param {string} folder          – folder name under root, e.g. "evidence"
 * @param {boolean} shareWithGuest – whether to generate an anonymous view link
 * @returns {Promise<{fileName:string,fileId:string,shareLink?:string}>}
 */
async function uploadFileToSharePoint(
    fileBuffer,
    originalName,
    fileName = null,
    folder = 'evidence',
    shareWithGuest = true
) {
    // 1. Grab a token
    const token = await getSharePointAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Resolve the Graph siteId from your siteUrl + sitePath
    const { host } = new URL(config.siteUrl);
    const siteRelative = config.sitePath.split('/').slice(1).join('/'); // "trik-evidence"
    const siteIdUrl = `https://graph.microsoft.com/v1.0/sites/${host}:/sites/${siteRelative}`;
    const { data: siteInfo } = await axios.get(siteIdUrl, { headers });
    const siteId = siteInfo.id;

    // 3. Ensure the folder exists
    await createFolderIfNeeded(siteId, folder, token);

    // 4. Pick a unique filename
    const ext = path.extname(originalName);
    const base = fileName || uuidv4();
    const uniqueName = `${base}${ext}`;

    // 5. Upload via PUT /drive/root:/{folder}/{uniqueName}:/content
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${folder}/${uniqueName}:/content`;
    const upRes = await axios.put(uploadUrl, fileBuffer, {
        headers: {
            ...headers,
            'Content-Type': 'application/octet-stream'
        }
    });
    const fileId = upRes.data.id;

    const result = { fileName: uniqueName, fileId };

    // 6. (Optional) Create anonymous view link
    if (shareWithGuest) {
        const shareUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${fileId}/createLink`;
        const sharePayload = { type: 'view', scope: 'anonymous' };
        const shareRes = await axios.post(shareUrl, sharePayload, {
            headers: { ...headers, 'Content-Type': 'application/json' }
        });
        result.shareLink = shareRes.data.link.webUrl;
    }

    console.log(result)

    return result;
}

async function deleteFileFromSharePoint(fileId) {
    // 1️⃣ Get token + headers
    const token = await getSharePointAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // 2️⃣ Resolve Graph siteId dynamically
    const { host } = new URL(config.siteUrl);
    // e.g. config.sitePath = 'sites/trik-evidence' → ['sites','trik-evidence'] → 'trik-evidence'
    const siteName = config.sitePath.split('/').pop();
    const siteLookupUrl =
        `https://graph.microsoft.com/v1.0/sites/${host}:/sites/${siteName}`;
    const siteRes = await axios.get(siteLookupUrl, { headers });
    const siteId = siteRes.data.id;

    // 3️⃣ Now delete the file by its driveItem id
    const deleteUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${fileId}`;
    await axios.delete(deleteUrl, { headers });

    console.log(`✅ Deleted file ${fileId} from site ${siteName} (id=${siteId})`);
}

module.exports = {
    getSharePointAccessToken,
    createFolderIfNeeded,
    uploadFileToSharePoint,
    deleteFileFromSharePoint
};
