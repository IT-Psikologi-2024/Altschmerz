import { Request, Response } from 'express';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';
import { gmailSend } from './googleServices/gmailService';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { generateJWT } from '../utils/jwtGenerator';
import { Merch } from '../interfaces/sheetInterface';
import fs from 'fs/promises';
import path from 'path';

const login = async (req: Request, res: Response) => {
    try {   
        const { username, password } = req.body;
        
        const admin_username = process.env.ADMIN_USERNAME
        const admin_password = process.env.ADMIN_PASSWORD

        if ( username !== admin_username || password !== admin_password) {
            res.status(401).json({ error: 'Invalid credentials'});
            return;
        }

        const userId = process.env.ADMIN_ID
        const token = generateJWT(userId)
            
        res.status(200).send({message:"Logged in succesfully", token: token})
    } catch (e) {
        console.error('Error while logging in:', e.message);
        res.status(500).json({ error: 'Error while logging in: ' + e.message });
    }
};

const attend = async (req: Request, res: Response) => {
    try {
        const attendeeId = req.params.id

        const sheetData = await sheetGet('Ticket!A1:P1000')
        const ids = sheetData.map((id : string[]) => id[0])
        const verified = sheetData.map((row : string[]) => row[13]);

        let rowNumber = 0;
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === attendeeId && verified[i] === "Iya") {
                rowNumber = i + 1
                break;
            }
        }

        if (rowNumber === 0) {
            res.status(401).json({error : "Attendance Fail"});
            return;
        }

        await sheetUpdate('Iya', `Ticket!P${rowNumber}`)

        const name = await sheetGet(`Ticket!B${rowNumber}`)
        const nameString = name[0][0]

        res.status(200).json({message : nameString});
    } catch (e) {
        console.error('Error while attending:', e.message);
        res.status(500).json({ error: 'Error while attending: ' + e.message });
    }
};

const getVerifiedAttendee = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Ticket!A1:P1000');

        const data = sheetData
            .filter((row : string[]) => row[13] === "Iya" && row[14] === "Pending")
            .map((row : string[]) => {
                const name = row[1];
                const email = row[4];
                return { name, email };
            });

        res.status(200).json( data );
    } catch (e) {
        console.error('Error while getting verified attendee:', e.message);
        res.status(500).json({ error: 'Error while getting verified attendee: ' + e.message });
    }
}

const ticketEmail = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Ticket!A1:P1000');
        const adminUrl = process.env.ADMIN_URL
        
        const ids = sheetData.map((row : string[])=> row[0]);
        const names = sheetData.map((row : string[])=> row[1]);
        const emails = sheetData.map((row : string[])=> row[4]);
        const kelases = sheetData.map((row : string[])=> row[12]);
        const verified = sheetData.map((row : string[])=> row[13]);
        const emailStatus = sheetData.map((row : string[])=> row[14]);

        for (let i = 1; i < ids.length; i++) {
            const id = ids[i];
            const name = names[i];
            const email = emails[i];
            const kelas = kelases[i];
            const isVerified = verified[i] === "Iya";
            const isPending = emailStatus[i] === "Pending";

            if (isVerified && isPending) {
                
                const qrCodePath = await generateQRCode(adminUrl + "/attendance/" + id);
                const headerPath = path.join(__dirname, '../../public/images/header-email.png');
                const templatePath = path.join(__dirname, '../templates/ticketingEmailTemplate.html');

                let html = await fs.readFile(templatePath, 'utf-8');
                html = html.replace('{{ now }}', Date.now().toString());
                html = html.replace('{{ name }}', name);
                html = html.replace('{{ kelas }}', kelas);
                html = html.replace('{{ whatsappLink }}', 'https://chat.whatsapp.com/BlypVzeSg2A0kqcVHknFme');

                const mailOptions = {
                    from: process.env.GMAIL_EMAIL,
                    to: email,
                    subject: 'Introduction to Psychology - Universitas Indonesia',
                    html: html,
                    attachments: [{
                        filename: 'qrcode.png',
                        path: qrCodePath,
                        cid: 'qrcode'
                    },{
                        filename: 'header-email.png',
                        path: headerPath,
                        cid: 'header'
                    }]
                };
                
                await gmailSend(mailOptions);
                await sheetUpdate('Terkirim', `Ticket!O${i + 1}`);
            }
        }

        res.status(200).json({ message: "Success" });
    } catch (e) {
        console.error('Error while sending ticket email:', e.message);
        res.status(500).json({ error: 'Error while sending ticket email: ' + e.message });
    }
}

const getVerifiedBuyer = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Merch!A1:S1000');

        const data = sheetData
            .filter((row : string[]) => row[17] === "Iya" && row[18] === "Pending")
            .map((row : string[]) => {
                const name = row[1];
                const email = row[3];
                return { name, email };
            });

        res.status(200).json( data );
    } catch (e) {
        console.error('Error while getting verified buyer:', e.message);
        res.status(500).json({ error: 'Error while getting verified buyer: ' + e.message });
    }
}

//TODO
const merchEmail = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Merch!A1:S1000');
        
        const ids = sheetData.map((row : string[])=> row[0]);
        const names = sheetData.map((row : string[])=> row[1]);
        const emails = sheetData.map((row : string[])=> row[4]);
        const addresses = sheetData.map((row : string[])=> row[5]);
        const shippingMethods = sheetData.map((row : string[])=> row[7]);
        const totalOrders = sheetData.map((row : string[])=> row[9]);

        const itemNames = sheetData.map((row : string[])=> row[10]);
        const itemQuantities = sheetData.map((row : string[])=> row[11]);
        const itemPrices = sheetData.map((row : string[])=> row[12]);

        const bubbleWraps = sheetData.map((row : string[])=> row[13]);
        const shippingCosts = sheetData.map((row : string[])=> row[14]);
        const totalPrices = sheetData.map((row : string[])=> row[15]);

        const verified = sheetData.map((row : string[])=> row[17]);
        const emailStatus = sheetData.map((row : string[])=> row[18]);

        for (let i = 1; i < ids.length; i++) {
            const id = ids[i];
            if (id === '') {
                continue;
            }
            const name = names[i];
            const email = emails[i];
            const address = addresses[i];
            const shippingMethod = shippingMethods[i];
            const totalOrder = totalOrders[i];
            const totalPrice = totalPrices[i];
            
            const bubbleWrap = (bubbleWraps[i] === '' ? false : true)
            const shippingCost = shippingCosts[i] 

            let orders : Merch []= []
            for (let j = i ; j < i + Number(totalOrder) ;j++) {
                orders.push({
                    nama: itemNames[j],
                    jumlah: itemQuantities[j],
                    harga: itemPrices[j]
                })
            }

            const isVerified = verified[i] === "Iya";
            const isPending = emailStatus[i] === "Pending";

            if (isVerified && isPending) {
                
                const headerPath = path.join(__dirname, '../../public/images/header-email.png');
                const templatePath = path.join(__dirname, '../templates/merchandiseEmailTemplate.html');

                let html = await fs.readFile(templatePath, 'utf-8');
                html = html.replace('{{ orders }}', `
                    <table>
                    <thead>
                        <tr>
                            <th>Nama Item</th>
                            <th>Jumlah</th>
                            <th>Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ orders.map((item) => `
                            <tr>
                                <td>${item.nama}</td>
                                <td>${item.jumlah}</td>
                                <td>${item.harga}</td>
                            </tr>`
                        ).join('')}

                        ${ bubbleWrap && shippingMethod !== 'Fakultas Psikologi UI'? `
                            <tr>
                                <td>Extra Bubble Wrap</td>
                                <td>-</td>
                                <td>2000</td>
                            </tr>` : ``
                        }
                        
                        ${shippingMethod !== 'Fakultas Psikologi UI' ? `<tr>
                            <td>Ongkir</td>
                            <td>-</td>
                            <td>{{ shippingCost }}</td>
                            </tr>` : ``
                        }
                        
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="2">Total</td>
                            <td>{{ totalPrice }}</td>
                        </tr>
                    </tfoot>
                </table>`
                )

                html = html.replace('{{ shipping }}', `
                    <p>
                        ${shippingMethod != 'Fakultas Psikologi UI' ? `<span>Paket Anda akan dikirim ke alamat berikut: <span class="highlight">{{ address }}</span>` :
                        `Anda telah memilih untuk mengambil paket di Fakultas Psikologi, Universitas Indonesia. Silakan kunjungi alamat berikut untuk mengambil pesanan Anda:<br>
                        <span class="highlight">Fakultas Psikologi, Universitas Indonesia</span><br>
                        <div class="button-container">
                            <a href="https://maps.app.goo.gl/c2VE3jHxTFiKcuUNA" target="_blank" class="button maps-button">Lihat di Google Maps</a>
                        </div>
                        <div class="button-container">
                            <a href="{{ icsDownloadLink }}" target="_blank" class="button calendar-button">Download Tanggal Pengambilan</a>
                        </div>`
                        }
                    </p>`
                )

                html = html.replace('{{ now }}', Date.now().toString());
                html = html.replace('{{ name }}', name);
                html = html.replace('{{ address }}', address);
                html = html.replace('{{ shippingCost }}', shippingCost);
                html = html.replace('{{ totalPrice }}', totalPrice);

                const mailOptions = {
                    from: process.env.GMAIL_EMAIL,
                    to: email,
                    subject: 'Introduction to Psychology - Universitas Indonesia',
                    html: html,
                    attachments: [{
                        filename: 'header-email.png',
                        path: headerPath,
                        cid: 'header'
                    }]
                };
                
                await gmailSend(mailOptions);
                await sheetUpdate('Terkirim', `Ticket!S${i + 1}`);
            }
        }

         res.status(200).json({ message: "Success" });
    } catch (e) {
        console.error('Error while sending ticket email:', e.message);
        res.status(500).json({ error: 'Error while sending ticket email: ' + e.message });
    }
}

export { login, attend, getVerifiedAttendee, ticketEmail, getVerifiedBuyer, merchEmail}