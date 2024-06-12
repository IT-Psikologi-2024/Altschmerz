import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

async function generateQRCode(link : string) {
    try {
        const qrCodeDir = path.join(__dirname, '../../public/images');
        const qrCodePath = path.join(qrCodeDir, 'qrcode.png');
        await ensureDirectoryExistence(qrCodePath);
        await QRCode.toFile(qrCodePath, link, { errorCorrectionLevel: 'H' });
        return qrCodePath;
    } catch (err) {
        console.error('Failed to generate QR code:', err);
        throw err;
    }
}

async function ensureDirectoryExistence(filePath : string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

export { generateQRCode };