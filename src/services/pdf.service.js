const PDFDocument = require('pdfkit');

const EVENT = {
  titleMain: 'VLISCO ICONS NIGHT',
  titleAccent: 'Acte 2',
  tagline: "Et si, pour une nuit, vous deveniez l'icône qu'ils attendent ?",
  intro1: 'Vlisco vous invite à fouler le tapis rouge des icônes.',
  intro2: 'Un événement unique où le style est roi,',
  intro3: "l'attitude est reine et vous êtes l'inspiration.",
  date: '22 Juillet 2026',
  time: '19H00',
  venue: 'Françoise Garden',
  dressCode: "VLISCO, le vrai, l'original",
  notice: 'Cette invitation est personnelle et non transférable.',
};

// Palette fidèle à la carte physique
const CREAM = '#EDEBE6';   // fond clair
const NAVY = '#1A2238';    // texte bleu marine foncé
const MUTED = '#6B7086';   // texte secondaire (code d'invitation)

function generateInvitationPdf({ firstName, lastName, invitationCode }) {
  return new Promise((resolve, reject) => {
    // Format carton d'invitation paysage (proche d'une carte A5 horizontale)
    const doc = new PDFDocument({ size: [842, 595], margin: 0 }); // A4 paysage en points
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const contentW = W - 200;
    const cx = 100; // marge gauche pour bloc centré

    // Fond crème
    doc.rect(0, 0, W, H).fill(CREAM);

    // Cadre décoratif fin (bleu marine)
    doc
      .strokeColor(NAVY)
      .lineWidth(1.5)
      .rect(30, 30, W - 60, H - 60)
      .stroke();

    let y = 70;

    // ---- Titre sur une seule ligne : "VLISCO ICONS NIGHT Acte 2" ----
    // "VLISCO ICONS NIGHT" en gras, "Acte 2" en italique. Centré.
    const titleSize = 28;
    const mainText = EVENT.titleMain + ' ';
    const accentText = EVENT.titleAccent;

    doc.font('Helvetica-Bold').fontSize(titleSize);
    const wMain = doc.widthOfString(mainText);
    doc.font('Helvetica-BoldOblique').fontSize(titleSize);
    const wAccent = doc.widthOfString(accentText);

    const totalW = wMain + wAccent;
    const startX = (W - totalW) / 2;

    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(titleSize)
      .text(mainText, startX, y, { lineBreak: false, continued: true })
      .font('Helvetica-BoldOblique')
      .text(accentText, { lineBreak: false });

    // ---- Nom de l'invité (sans M/Mme) ----
    y += 52;
    doc
      .fillColor(NAVY)
      .font('Helvetica-Oblique')
      .fontSize(16)
      .text(`${firstName} ${lastName}`, cx, y, { align: 'center', width: contentW });

    // Petit trait de séparation sous le nom
    y += 30;
    doc
      .strokeColor(NAVY)
      .lineWidth(0.8)
      .moveTo(W / 2 - 60, y)
      .lineTo(W / 2 + 60, y)
      .stroke();

    // Accroche
    y += 25;
    doc
      .fillColor(NAVY)
      .font('Helvetica')
      .fontSize(13)
      .text(EVENT.tagline, cx, y, { align: 'center', width: contentW });

    // Bloc introduction
    y += 35;
    doc.fontSize(12);
    doc.text(EVENT.intro1, cx, y, { align: 'center', width: contentW });
    y += 20;
    doc.text(EVENT.intro2, cx, y, { align: 'center', width: contentW });
    y += 18;
    doc.text(EVENT.intro3, cx, y, { align: 'center', width: contentW });

    // Bloc informations pratiques
    y += 35;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Date de l'événement : ${EVENT.date}`, cx, y, { align: 'center', width: contentW });
    y += 20;
    doc.text(`Heure : ${EVENT.time}`, cx, y, { align: 'center', width: contentW });
    y += 20;
    doc.text(`Lieu : ${EVENT.venue}`, cx, y, { align: 'center', width: contentW });
    y += 20;
    doc
      .font('Helvetica-Oblique')
      .text(`Dress code exigé : ${EVENT.dressCode}`, cx, y, { align: 'center', width: contentW });

    // Mention "non transférable"
    y += 35;
    doc
      .fillColor(NAVY)
      .font('Helvetica-Oblique')
      .fontSize(10)
      .text(EVENT.notice, cx, y, { align: 'center', width: contentW });

    // Code d'invitation — discret, juste sous la mention
    y += 22;
    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(9)
      .text(`Code d'invitation : ${invitationCode}`, cx, y, { align: 'center', width: contentW });

    // Logo texte Vlisco en bas
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(24)
      .text('VLISCO', 0, H - 90, { align: 'center', characterSpacing: 4 });
    doc
      .font('Helvetica')
      .fontSize(9)
      .text('SINCE 1846', 0, H - 60, { align: 'center', characterSpacing: 3 });

    doc.end();
  });
}

module.exports = generateInvitationPdf;