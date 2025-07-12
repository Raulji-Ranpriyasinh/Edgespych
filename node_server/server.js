const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/generate-pdf', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        // ✅ Activate print styles
        await page.emulateMediaType('print');

        // ✅ Remove the download button container before PDF generation
        await page.evaluate(() => {
            const btn = document.querySelector('.button-container');
            if (btn) btn.remove();
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            // optional
            margin: {
                top: '0cm',
                bottom: '0cm',
                left: '0cm',
                right: '0cm'
            },
            preferCSSPageSize: false,
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="MYCAREERCHOICES.pdf"',
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error('Puppeteer error:', err);
        res.status(500).send('Failed to generate PDF');
    }
});

app.listen(3000, () => {
    console.log('📄 Puppeteer PDF server running at http://localhost:3000');
});
