import { Request, Response } from 'express';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';
import { gmailSend } from './googleServices/gmailService';
import { Merch } from '../interfaces/sheetInterface';
import * as ics from 'ics';
import fs from 'fs/promises';
import path from 'path';

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

const getVerifiedBuyer = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Merch!A1:S1000');

        const data = sheetData
            .filter((row : string[]) => row[17] === "Iya" && row[18] === "Pending")
            .map((row : string[]) => {
                const name = row[1];
                const email = row[4];
                return { name, email };
            });

        res.status(200).json( data );
    } catch (e) {
        console.error('Error while getting verified buyer:', e.message);
        res.status(500).json({ error: 'Error while getting verified buyer: ' + e.message });
    }
}

const ticketEmail = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Ticket!A1:P1000');
        const adminUrl = process.env.ADMIN_URL
        const qrCodeUrl = process.env.QRCODE_URL
        
        const ids = sheetData.map((row : string[])=> row[0]);
        const names = sheetData.map((row : string[])=> row[1]);
        const emails = sheetData.map((row : string[])=> row[4]);
        const kelases = sheetData.map((row : string[])=> row[12]);
        const verified = sheetData.map((row : string[])=> row[13]);
        const emailStatus = sheetData.map((row : string[])=> row[14]);

        const promises = []
        for (let i = 1; i < ids.length; i++) {
            const id = ids[i];
            const name = names[i];
            const email = emails[i];
            const kelas = kelases[i];
            const isVerified = verified[i] === "Iya";
            const isPending = emailStatus[i] === "Pending";

            if (isVerified && isPending) {
                
                const qrCodeURL = qrCodeUrl + adminUrl + "/attendance/" + id;
                const headerPath = path.join(__dirname, '../../public/images/header-email.png');
                const templatePath = path.join(__dirname, '../templates/ticketingEmailTemplate.html');

                let html = await fs.readFile(templatePath, 'utf-8');
                html = html.replace('{{ now }}', Date.now().toString());
                html = html.replace('{{ name }}', name);
                html = html.replace('{{ kelas }}', kelas);
                html = html.replace('{{ qrCodeURL }}', qrCodeURL);
                html = html.replace('{{ whatsappLink }}', 'https://chat.whatsapp.com/BlypVzeSg2A0kqcVHknFme');

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
                
                promises.push (
                    gmailSend(mailOptions)
                    .then (async (recipient : string) => {
                        await sheetUpdate('Terkirim', `Ticket!O${i + 1}`);
                        console.log(`Email sent successfully to: ${recipient}`);
                    })
                    .catch((sendError) => {
                        console.error(`Failed to send email to ${email}:`, sendError.message);
                    })
                )
            }
        }

        await Promise.all(promises)
        res.status(200).json({ message: "Success" });
    } catch (e) {
        res.status(500).json({ error: 'Error while sending ticket email: ' + e.message });
        console.error('Error while sending ticket email:', e.message);
    }
}

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

        const promises = []
                
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

            const event :any = {
                start: [2024, 6, 30, 10, 0],
                duration: { hours: 1 },
                title: 'Pickup Merchandise ITP 2024',
                description: 'Pickup your merchandise at Fakultas Psikologi, Universitas Indonesia.',
                location: 'Fakultas Psikologi, Universitas Indonesia',
                geo: { lat: -6.36275, lon: 106.83197 },
                status: 'CONFIRMED',
                busyStatus: 'BUSY',
                organizer: { name: 'ITP 2024', email: process.env.GMAIL_EMAIL },
                attendees: [{ name, email }]
            };
              
            const value = ics.createEvent(event)

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

                const attachments : any = [{
                    filename: 'header-email.png',
                    path: headerPath,
                    cid: 'header'
                }]

                if (shippingMethod === 'Fakultas Psikologi UI') {
                    attachments.push({
                        filename: 'Pickup Merchandise ITP 2024.ics',
                        content: `${value.value}`,
                        contentType: 'text/calendar',
                        cid: 'merch-pickup'
                    })
                }

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
                    <br>
                        ${shippingMethod != 'Fakultas Psikologi UI' ? `<p>Paket kamu akan dikirim ke alamat berikut: <span class="highlight">{{ address }}</span></p>` :
                        `<p>Kamu memilih untuk mengambil paket di <span class="highlight">Fakultas Psikologi, Universitas Indonesia.</span> </p>
                         <p>Silakan kunjungi alamat berikut untuk mengambil pesanan kamu di tanggal yang sudah ditentukan, ya:</p>
                         <div class="button-container">
                            <a style="color: #FFFFFF; text-decoration: none;" href="https://maps.app.goo.gl/c2VE3jHxTFiKcuUNA" target="_blank" class="button maps-button">Lihat di Google Maps</a>
                         </div>
                         <p>Kamu bisa download lampiran kalender untuk tanggal pengambilannya.</p>`}
                    </p>
                    <br>`
                );

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
                    attachments: attachments
                };
                
                promises.push (
                    gmailSend(mailOptions)
                    .then (async (recipient : string) => {
                        await sheetUpdate('Terkirim', `Merch!S${i + 1}`);
                        console.log(`Email sent successfully to: ${recipient}`);
                    })
                    .catch((sendError) => {
                        console.error(`Failed to send email to ${email}:`, sendError.message);
                    })
                )
            }
        }

         await Promise.all(promises)
         res.status(200).json({ message: "Success" });
    } catch (e) {
        console.error('Error while sending merch email:', e.message);
        res.status(500).json({ error: 'Error while sending merch email: ' + e.message });
    }
}

export { ticketEmail, merchEmail, getVerifiedAttendee, getVerifiedBuyer}