import fs from 'fs';
import esbuild from 'esbuild';

const logoBase64 = fs.existsSync('public/acpe-logo.png')
  ? 'data:image/png;base64,' + fs.readFileSync('public/acpe-logo.png').toString('base64')
  : '';

const srcCode = `
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ACPE_LOGO_BASE64 = ${JSON.stringify(logoBase64)};

window.createAcpeBulletinPdf = function(d) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const e = d.employe || {};
  const r = d.rubriques || {};

  const salaireBase = (r.nombreJours || 26) * (r.tauxJournalier || 0);
  const primeAnciennete = Math.round(salaireBase * (r.tauxAnciennete || 0));
  const totalBrut = Math.round(salaireBase + primeAnciennete + (r.indemniteSujetion || 0));

  const cnssPvidSal = Math.round((r.cnssBasePlafond || 0) * (r.tauxCnssPvidSalarial || 0.04));
  const cnssPvidPat = Math.round((r.cnssBasePlafond || 0) * (r.tauxCnssPvidPatronal || 0.08));
  const cnssPlafPat = Math.round((r.cnssBasePlafond || 0) * (r.tauxCnssPlafPatronal || 0.12277));

  const netImposable = Math.round(totalBrut - cnssPvidSal);
  const its = Math.round(r.itsMontant || 0);

  const totalCotisSalariales = Math.round(cnssPvidSal + its + (r.mutuelle || 0) + (r.mutraAcpe || 0));
  const totalCotisPatronales = Math.round(cnssPvidPat + cnssPlafPat);

  const netAPayer = Math.round(totalBrut - totalCotisSalariales + (r.indemniteTransport || 0) + (r.rappelEcarts || 0));

  const c = {
    salaireBase, primeAnciennete, totalBrut,
    cnssPvidSal, cnssPvidPat, cnssPlafPat, its,
    totalCotisSalariales, totalCotisPatronales,
    netImposable, netAPayer
  };

  const fmt = function(n) {
    if (n === undefined || n === null || n === '') return '';
    return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  };

  // 1. Logo officiel et En-tête institutionnel ACPE
  let currentY = 8;

  // Bandeau institutionnel supérieur - Gauche
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text('R\u00C9PUBLIQUE DU CONGO', 10, currentY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('Unit\u00E9 - Travail - Progr\u00E8s', 10, currentY + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(107, 114, 128);
  doc.text(["Minist\u00E8re de la Jeunesse et des Sports,", "de l'Education Civique, de la Formation", "Qualifiante et de l'Emploi"], 10, currentY + 6.8);

  // Bandeau institutionnel supérieur - Droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(31, 78, 121);
  doc.text('DIRECTION G\u00C9N\u00C9RALE', 200, currentY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('Direction des Ressources Humaines', 200, currentY + 3.5, { align: 'right' });
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Service Solde & Traitements', 200, currentY + 7, { align: 'right' });

  // Centre : Logo ACPE et Titres
  if (ACPE_LOGO_BASE64) {
    try {
      doc.addImage(ACPE_LOGO_BASE64, 'PNG', 92, currentY - 1, 26, 11);
    } catch (err) {
      console.warn('Could not render logo in PDF', err);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(31, 78, 121); // #1F4E79
  doc.text('ACPE', 105, currentY + 13.5, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(31, 78, 121);
  doc.text("AGENCE CONGOLAISE POUR L'EMPLOI", 105, currentY + 17, { align: 'center' });

  // Ligne de séparation
  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(0.35);
  doc.line(10, currentY + 19, 200, currentY + 19);

  currentY += 23;

  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('BULLETIN DE SALAIRE \u2014 ' + d.periode.mois + ' ' + d.periode.annee, 105, currentY, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 78, 121);
  doc.text('P\u00E9riode du ' + d.periode.debut + ' au ' + d.periode.fin, 105, currentY + 4, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('Avenue Edith Lucie Bongo Ondimba, zone industrielle de Mpila | BP: 2006 - Brazzaville (R\u00E9publique du Congo)', 105, currentY + 7.5, { align: 'center' });

  // 2. Bloc Identification Agent (Exactement identique au template)
  autoTable(doc, {
    startY: currentY + 10,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 1.2,
      lineColor: [51, 51, 51],
      lineWidth: 0.15,
      textColor: [26, 26, 26]
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', fillColor: [244, 244, 244] },
      1: { cellWidth: 57 },
      2: { cellWidth: 38, fontStyle: 'bold', fillColor: [244, 244, 244] },
      3: { cellWidth: 57 }
    },
    body: [
      ['Nom(s) et Pr\u00E9nom(s)', e.nom || '\u2014', 'Localit\u00E9', e.localite || 'BRAZZAVILLE'],
      ['Matricule', e.matricule || '', 'D\u00E9partement', e.departement || ''],
      ['N\u00B0 CNSS', e.cnss || '', 'Fonction', e.fonction || ''],
      ['Date Embauche', e.dateEmbauche || '', 'Cat\u00E9gorie', e.categorie || ''],
      ['Anciennet\u00E9', (e.anciennete !== undefined ? e.anciennete : '') + ' ans', 'Statut', e.statut || ''],
      ['Sit. Matrimoniale', e.situationMatrimoniale || '', 'Coll\u00E8ge', e.college || ''],
      ['Enfants \u00E0 charge', String(e.enfantsCharge !== undefined ? e.enfantsCharge : 0), 'Mode de Paiement', e.modePaiement || 'Virement'],
      ['Nbre de parts IRPP', String(e.partsIRPP !== undefined ? e.partsIRPP : 0), 'RIB', e.rib || '']
    ]
  });

  // 3. Tableau des Rubriques (mainTableBlock)
  const startY2 = doc.lastAutoTable.finalY + 3;
  autoTable(doc, {
    startY: startY2,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 1.1,
      lineColor: [51, 51, 51],
      lineWidth: 0.15,
      textColor: [26, 26, 26]
    },
    headStyles: {
      fillColor: [217, 226, 243], // #D9E2F3
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 52 },
      2: { cellWidth: 14, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 22, halign: 'right' }
    },
    head: [
      [
        { content: 'N\u00B0', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'D\u00E9signation', rowSpan: 2, styles: { valign: 'middle', halign: 'left' } },
        { content: 'Nombre', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'Base', rowSpan: 2, styles: { valign: 'middle', halign: 'right' } },
        { content: 'Part salariale', colSpan: 3, styles: { halign: 'center' } },
        { content: 'Part patronale', colSpan: 2, styles: { halign: 'center' } }
      ],
      [
        { content: 'Taux', styles: { halign: 'center' } },
        { content: 'Gain', styles: { halign: 'right' } },
        { content: 'Retenue', styles: { halign: 'right' } },
        { content: 'Taux', styles: { halign: 'center' } },
        { content: 'Retenue', styles: { halign: 'right' } }
      ]
    ],
    body: [
      ['1000', 'Salaire de base', String(r.nombreJours || 26), fmt(r.tauxJournalier), '', fmt(c.salaireBase), '', '', ''],
      ['1020', 'Prime anciennet\u00E9', '', fmt(c.salaireBase), String(Math.round((r.tauxAnciennete || 0) * 100)), fmt(c.primeAnciennete), '', '', ''],
      ['1060', 'Indemnit\u00E9 de suj\u00E9tion', '', fmt(r.indemniteSujetion), '', fmt(r.indemniteSujetion), '', '', ''],
      [
        { content: '', styles: { fontStyle: 'bolditalic' } },
        { content: 'Total Brut', styles: { fontStyle: 'bolditalic' } },
        '', '', '',
        { content: fmt(c.totalBrut), styles: { fontStyle: 'bolditalic' } },
        '', '', ''
      ],
      ['9000', 'Cotisation CNSS (PVID)', '', fmt(r.cnssBasePlafond), '4', '', fmt(c.cnssPvidSal), '8', fmt(c.cnssPvidPat)],
      ['9001', 'Cotisation CNSS (Plafonn\u00E9)', '', fmt(r.cnssBasePlafond), '0', '', '0', '12', fmt(c.cnssPlafPat)],
      ['9002', 'Retenue ITS', '', '', '', '', fmt(c.its), '', ''],
      ['9003', 'Retenue Mutuelle (MUTRAPE)', '', fmt(r.mutuelle), '', '', fmt(r.mutuelle), '', ''],
      ['9004', 'MUTRA ACPE', '', fmt(r.mutraAcpe), '', '', fmt(r.mutraAcpe), '', ''],
      [
        { content: '', styles: { fontStyle: 'bolditalic' } },
        { content: 'Total Cotisations', styles: { fontStyle: 'bolditalic' } },
        '', '', '', '',
        { content: fmt(c.totalCotisSalariales), styles: { fontStyle: 'bolditalic' } },
        '',
        { content: fmt(c.totalCotisPatronales), styles: { fontStyle: 'bolditalic' } }
      ],
      ['4000', 'Indemnit\u00E9 de transport', '', fmt(r.indemniteTransport), '', fmt(r.indemniteTransport), '', '', '0'],
      ['9005', 'Rappel sur les \u00E9carts de salaire', '', fmt(r.rappelEcarts), '', fmt(r.rappelEcarts), '', '', '0']
    ]
  });

  // 4. Tableau Cumuls (cumulsBlock)
  const startY3 = doc.lastAutoTable.finalY + 3;
  const cumulsAnn = d.cumulsAnnee || {};
  autoTable(doc, {
    startY: startY3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 1.1,
      lineColor: [51, 51, 51],
      lineWidth: 0.15,
      textColor: [26, 26, 26]
    },
    headStyles: {
      fillColor: [217, 226, 243], // #D9E2F3
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'right' },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    },
    head: [
      ['Cumuls', 'Salaire Brut', 'Charges salariales', 'Charges patronales', 'Avantage en nature', 'Net imposable', 'Heures trav.', 'Heures suppl.', 'NET A PAYER']
    ],
    body: [
      [
        'P\u00E9riode',
        fmt(c.totalBrut),
        fmt(c.totalCotisSalariales),
        fmt(c.totalCotisPatronales),
        '\u2014',
        fmt(c.netImposable),
        '173.33',
        '0',
        { content: fmt(c.netAPayer) + ' FCFA', styles: { fontStyle: 'bold', fillColor: [235, 241, 245] } }
      ],
      [
        'Ann\u00E9es',
        fmt(cumulsAnn.brut),
        fmt(cumulsAnn.chargesSalariales),
        fmt(cumulsAnn.chargesPatronales),
        '\u2014',
        fmt(cumulsAnn.netImposable),
        '\u2014',
        '\u2014',
        '\u2014'
      ]
    ]
  });

  // 5. Bas de page certifié
  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Pour faire valoir ce que de droit.', 10, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text('Mode de r\u00E8glement : ' + (e.modePaiement || 'Virement') + ' \u2014 Devise : ' + (e.devise || 'FCFA'), 10, finalY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 78, 121);
  doc.text('Direction G\u00E9n\u00E9rale \u2014 ACPE', 200, finalY, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("Cachet & Signature de l'Ordonnateur", 200, finalY + 12, { align: 'right' });

  return doc;
};

window.downloadAcpeBulletinPdf = function(d) {
  const doc = window.createAcpeBulletinPdf(d);
  const cleanNom = ((d.employe && d.employe.nom) || 'Agent').replace(/[^a-zA-Z0-9]/g, '_');
  const mat = (d.employe && d.employe.matricule) || 'ACPE';
  const mois = (d.periode && d.periode.mois) || 'Mois';
  const annee = (d.periode && d.periode.annee) || '2026';
  const filename = 'Bulletin_ACPE_' + mat + '_' + cleanNom + '_' + mois + '_' + annee + '.pdf';
  
  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 1000);
    return { success: true, filename: filename };
  } catch (err) {
    doc.save(filename);
    return { success: true, filename: filename };
  }
};
`;

esbuild.buildSync({
  stdin: {
    contents: srcCode,
    resolveDir: process.cwd(),
  },
  bundle: true,
  outfile: 'public/js/acpe-pdf.bundle.js',
  format: 'iife',
  minify: true,
});

fs.copyFileSync('public/js/acpe-pdf.bundle.js', 'js/acpe-pdf.bundle.js');
console.log('acpe-pdf.bundle.js built and copied successfully with inlined logo!');
