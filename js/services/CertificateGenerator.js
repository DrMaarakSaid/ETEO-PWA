import { jsPDF } from 'https://cdn.skypack.dev/jspdf@2.5.1';

export class CertificateGenerator {
    
    async generateCertificate(data) {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const w = 297;
        const h = 210;
        
        // ============================================================
        // 1. CHARGER LE TEMPLATE
        // ============================================================
        try {
            const imgResponse = await fetch('../images/certificat.jpg');
            const imgBlob = await imgResponse.blob();
            const imgBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(imgBlob);
            });
            doc.addImage(imgBase64, 'JPEG', 0, 0, w, h);
        } catch (e) {
            console.warn('⚠️ Template non trouvé');
            doc.setFillColor(248, 240, 226);
            doc.rect(0, 0, w, h, 'F');
        }
        
        // ============================================================
        // 2. VOS POSITIONS FINALES
        // ============================================================
        const config = {
            nameY: 90,
            specialtyY: 124,
            scoreY: 137,
            dateY: 165,
            dateX: 225,
            codeY: 150,
            fontSizeName: 40,
            fontSizeSpecialty: 28,
            fontSizeScore: 20,
            fontSizeDate: 14,
            fontSizeCode: 12
        };
        
        // ============================================================
        // 3. QR CODE - VOS VALEURS FINALES ✅
        // ============================================================
        const qrX = 140;
        const qrY = 160;
        const qrSize = 20;
        
        // ============================================================
        // 4. POLICE
        // ============================================================
        const romanticFont = 'helvetica';
        
        // --- NOM ---
        doc.setFont(romanticFont, 'bold');
        doc.setFontSize(config.fontSizeName);
        doc.setTextColor(26, 26, 46);
        doc.text(data.userName, w/2, config.nameY, { align: 'center' });
        
        // --- SPÉCIALITÉ (DORÉ BRILLANT) ---
        doc.setFont(romanticFont, 'bold');
        doc.setFontSize(config.fontSizeSpecialty);
        doc.setTextColor(212, 175, 55);
        doc.text(data.specialty, w/2, config.specialtyY, { align: 'center' });
        
        // --- SCORE (UNIQUEMENT LE NOMBRE) ---
        doc.setFont(romanticFont, 'bold');
        doc.setFontSize(config.fontSizeScore);
        doc.setTextColor(76, 175, 80);
        doc.text(`${data.score}`, w/2, config.scoreY, { align: 'center' });
        
        // --- DATE ---
        doc.setFont(romanticFont, 'normal');
        doc.setFontSize(config.fontSizeDate);
        doc.setTextColor(80, 80, 80);
        doc.text(data.date, config.dateX, config.dateY, { align: 'center' });
        
        // --- CODE D'AUTHENTIFICATION ---
        doc.setFont(romanticFont, 'normal');
        doc.setFontSize(config.fontSizeCode);
        doc.setTextColor(80, 80, 80);
        doc.text(`Code d'authentification : ${data.certificateId}`, w/2, config.codeY, { align: 'center' });
        
        // --- NOTE EXPLICATIVE ---
        doc.setFont(romanticFont, 'italic');
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text('Ce code permet de vérifier l\'authenticité de votre certificat', w/2, config.codeY + 6, { align: 'center' });
        
        // ============================================================
        // 5. QR CODE
        // ============================================================
        try {
            const QRCode = await import('https://cdn.skypack.dev/qrcode@1.5.3');
            const verifyUrl = `https://eteo.ma/verify/${data.certificateId}`;
            const qrDataUrl = await QRCode.default.toDataURL(verifyUrl, {
                width: 150,
                margin: 1,
                color: { dark: '#1a1a2e', light: '#ffffff' }
            });
            const qrBase64 = qrDataUrl.split(',')[1];
            doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(5);
            doc.setTextColor(150, 150, 150);
            doc.text('Scannez pour vérifier', qrX + qrSize/2, qrY + qrSize + 3, { align: 'center' });
        } catch (e) {
            console.warn('⚠️ QR Code non généré:', e.message);
        }
        
        // ============================================================
        // 6. GÉNÉRER LE PDF
        // ============================================================
        return doc.output('blob');
    }
    
    // ============================================================
    // GÉNÉRER UN CODE UNIQUE
    // ============================================================
    generateCertificateId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (i < 3) result += '-';
        }
        return result;
    }
}