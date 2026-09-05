import fs from 'fs';
import esbuild from 'esbuild';

const logoBase64 = fs.existsSync('public/acpe-logo.png')
  ? 'data:image/png;base64,' + fs.readFileSync('public/acpe-logo.png').toString('base64')
  : '';

const srcCode = `
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ACPE_LOGO_BASE64 = ${JSON.stringify(logoBase64)};

// Formateur de nombres spécial PDF : utilise un espace standard ASCII (U+0020)
// au lieu de l'espace insécable fine (U+202F de toLocaleString) qui s'affiche sous forme de slashes '/' avec les polices de base PDF (WinAnsi).
function fmt(n) {
  if (n === undefined || n === null || n === '') return '';
  const num = typeof n === 'string' ? parseFloat(n.replace(/\\s/g, '').replace(',', '.')) : Number(n);
  if (isNaN(num)) return String(n);
  const rounded = Math.round(num);
  return String(rounded).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ' ');
}

window.createAcpeBulletinPdf = function(d) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false
  });

  const e = d.employe || {};
  const r = d.rubriques || {};

  const salaireBase = Math.round((r.nombreJours || 26) * (r.tauxJournalier || 0));
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

  // 1. En-tête : Logo à gauche, Mois & Période à droite (ne touche pas)
  let currentY = 10;

  // Logo officiel à gauche (ne pas toucher)
  if (ACPE_LOGO_BASE64) {
    try {
      doc.addImage(ACPE_LOGO_BASE64, 'PNG', 10, currentY - 1, 30, 13);
    } catch (err) {
      console.warn('Could not render logo in PDF', err);
    }
  }

  // Mois et Période à droite (ne pas toucher)
  const moisAffiche = (d.periode && d.periode.mois) || '';
  const anneeAffiche = (d.periode && d.periode.annee) || '';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39);
  doc.text(moisAffiche + ' ' + anneeAffiche, 200, currentY + 3.5, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  const debutAffiche = (d.periode && d.periode.debut) || '';
  const finAffiche = (d.periode && d.periode.fin) || '';
  doc.text('P\\u00E9riode du ' + debutAffiche + ' au ' + finAffiche, 200, currentY + 8, { align: 'right' });

  // Ligne de séparation sous le bandeau logo / mois / période
  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(0.35);
  doc.line(10, currentY + 15, 200, currentY + 15);

  // Titre "BULLETIN DE PAIE" baissé au centre (avec adresse)
  currentY += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(31, 78, 121);
  doc.text('BULLETIN DE PAIE', 105, currentY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Avenue Edith Lucie Bongo Ondimba, zone industrielle de Mpila | BP: 2006, Brazzaville (R\\u00E9publique du Congo)', 105, currentY + 4.5, { align: 'center' });

  currentY += 8.5;

  // 2. Bloc Identification Agent (Calibré à 190 mm total)
  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.3,
      lineColor: [60, 60, 60],
      lineWidth: 0.15,
      textColor: [26, 26, 26],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', fillColor: [244, 244, 244] },
      1: { cellWidth: 57 },
      2: { cellWidth: 38, fontStyle: 'bold', fillColor: [244, 244, 244] },
      3: { cellWidth: 57 }
    },
    body: [
      ['Nom(s) et Pr\\u00E9nom(s)', e.nom || '', 'Localit\\u00E9', e.localite || 'BRAZZAVILLE'],
      ['Matricule', e.matricule || '', 'D\\u00E9partement', e.departement || ''],
      ['N\\u00B0 CNSS', e.cnss || '', 'Fonction', e.fonction || ''],
      ['Date Embauche', e.dateEmbauche || '', 'Cat\\u00E9gorie', e.categorie || ''],
      ['Anciennet\\u00E9', (e.anciennete !== undefined ? e.anciennete : '') + ' ans', 'Statut', e.statut || ''],
      ['Sit. Matrimoniale', e.situationMatrimoniale || '', 'Coll\\u00E8ge', e.college || ''],
      ['Enfants \\u00E0 charge', String(e.enfantsCharge !== undefined ? e.enfantsCharge : 0), 'Mode de Paiement', e.modePaiement || 'Virement bancaire'],
      ['Nbre de parts IRPP', String(e.partsIRPP !== undefined ? e.partsIRPP : 0), 'RIB', e.rib || '']
    ]
  });

  // 3. Tableau des Rubriques (Calibrage précis 190 mm, fusions esthétiques et formatage propre)
  // Deuxième bloc : colonnes avec séparateurs verticaux, sans lignes horizontales entre les cellules de données
  const startY2 = doc.lastAutoTable.finalY + 3.5;
  autoTable(doc, {
    startY: startY2,
    margin: { left: 10, right: 10 },
    theme: 'plain',
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.15,
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 1.1,
      lineWidth: { top: 0, right: 0.15, bottom: 0, left: 0.15 },
      lineColor: [203, 213, 225],
      textColor: [26, 26, 26],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [217, 226, 243], // #D9E2F3
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.15,
      lineColor: [148, 163, 184]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // N°
      1: { cellWidth: 53, halign: 'left' },   // Désignation
      2: { cellWidth: 12, halign: 'center' }, // Nombre
      3: { cellWidth: 23, halign: 'right' },  // Base
      4: { cellWidth: 11, halign: 'center' }, // Taux salarial
      5: { cellWidth: 23, halign: 'right' },  // Gain salarial
      6: { cellWidth: 23, halign: 'right' },  // Retenue salariale
      7: { cellWidth: 12, halign: 'center' }, // Taux patronal
      8: { cellWidth: 23, halign: 'right' }   // Retenue patronale
    },
    head: [
      [
        { content: 'N\\u00B0', rowSpan: 2 },
        { content: 'D\\u00E9signation', rowSpan: 2, styles: { halign: 'left' } },
        { content: 'Nombre', rowSpan: 2 },
        { content: 'Base', rowSpan: 2, styles: { halign: 'right' } },
        { content: 'Part salariale', colSpan: 3, styles: { halign: 'center' } },
        { content: 'Part patronale', colSpan: 2, styles: { halign: 'center' } }
      ],
      [
        { content: 'Taux' },
        { content: 'Gain', styles: { halign: 'right' } },
        { content: 'Retenue', styles: { halign: 'right' } },
        { content: 'Taux' },
        { content: 'Retenue', styles: { halign: 'right' } }
      ]
    ],
    body: [
      ['1000', 'Salaire de base', String(r.nombreJours || 26), fmt(r.tauxJournalier), '', fmt(c.salaireBase), '', '', ''],
      ['1020', 'Prime anciennet\\u00E9', '', fmt(c.salaireBase), '', fmt(c.primeAnciennete), '', '', ''],
      ['1060', 'Indemnit\\u00E9 de suj\\u00E9tion', '', fmt(r.indemniteSujetion), '', fmt(r.indemniteSujetion), '', '', ''],
      [
        { content: '', styles: { fillColor: [248, 250, 252], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: 'Total Brut', colSpan: 4, styles: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], textColor: [17, 24, 39], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: fmt(c.totalBrut), styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252], textColor: [31, 78, 121], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: '', colSpan: 3, styles: { fillColor: [248, 250, 252], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } }
      ],
      ['9000', 'Cotisation CNSS (PVID)', '', fmt(r.cnssBasePlafond), '', '', fmt(c.cnssPvidSal), '', fmt(c.cnssPvidPat)],
      ['9001', 'Cotisation CNSS (Plafonn\\u00E9)', '', fmt(r.cnssBasePlafond), '', '', '', '', fmt(c.cnssPlafPat)],
      ['9002', 'Retenue ITS', '', fmt(c.netImposable), '', '', fmt(c.its), '', ''],
      ['9003', 'Retenue Mutuelle (MUTRAPE)', '', fmt(r.mutuelle), '', '', fmt(r.mutuelle), '', ''],
      ['9004', 'MUTRA ACPE', '', fmt(r.mutraAcpe), '', '', fmt(r.mutraAcpe), '', ''],
      [
        { content: '', styles: { fillColor: [248, 250, 252], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: 'Total Cotisations', colSpan: 5, styles: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], textColor: [17, 24, 39], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: fmt(c.totalCotisSalariales), styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252], textColor: [31, 78, 121], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: '', styles: { fillColor: [248, 250, 252], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } },
        { content: fmt(c.totalCotisPatronales), styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252], textColor: [31, 78, 121], lineWidth: { top: 0.15, right: 0.15, bottom: 0.15, left: 0.15 } } }
      ],
      ['4000', 'Indemnit\\u00E9 de transport', '', fmt(r.indemniteTransport), '', fmt(r.indemniteTransport), '', '', ''],
      ['9005', 'Rappel sur les \\u00E9carts de salaire', '', r.rappelEcarts ? fmt(r.rappelEcarts) : '', '', r.rappelEcarts ? fmt(r.rappelEcarts) : '', '', '', '']
    ]
  });

  // 4. Tableau Cumuls (cumulsBlock) - Calibré à 190 mm avec 30 mm pour NET A PAYER
  const startY3 = doc.lastAutoTable.finalY + 3.5;
  const cumulsAnn = d.cumulsAnnee || {};
  autoTable(doc, {
    startY: startY3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 1.1,
      lineColor: [60, 60, 60],
      lineWidth: 0.15,
      textColor: [26, 26, 26],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [217, 226, 243], // #D9E2F3
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.15,
      lineColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 22, halign: 'right' },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 17, halign: 'center' },
      7: { cellWidth: 17, halign: 'center' },
      8: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    head: [
      ['Cumuls', 'Salaire Brut', 'Charges salariales', 'Charges patronales', 'Avantage en nature', 'Net imposable', 'Heures trav.', 'Heures suppl.', 'NET A PAYER']
    ],
    body: [
      [
        'P\\u00E9riode',
        fmt(c.totalBrut),
        fmt(c.totalCotisSalariales),
        fmt(c.totalCotisPatronales),
        '',
        fmt(c.netImposable),
        '173,33',
        '0',
        {
          content: fmt(c.netAPayer) + ' FCFA',
          styles: {
            fontStyle: 'bold',
            halign: 'right',
            fillColor: [225, 237, 248],
            textColor: [31, 78, 121],
            fontSize: 7.5
          }
        }
      ],
      [
        'Ann\\u00E9e',
        fmt(cumulsAnn.brut),
        fmt(cumulsAnn.chargesSalariales),
        fmt(cumulsAnn.chargesPatronales),
        '',
        fmt(cumulsAnn.netImposable),
        '',
        '',
        { content: '', styles: { halign: 'center', textColor: [150, 150, 150] } }
      ]
    ]
  });

  // 5. Bas de page : signatures de l'employé et de l'employeur (abaissé vers le bas de la page A4)
  const finalY = Math.max(doc.lastAutoTable.finalY + 36, 236);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(10, finalY, 200, finalY);

  const signY = finalY + 6;
  // Signature de l'employé (à gauche)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 78, 121);
  doc.text("Signature de l'employé", 10, signY);

  // Zone signature employé
  doc.setDrawColor(148, 163, 184);
  doc.line(10, signY + 18, 70, signY + 18);

  // Signature de l'employeur (à droite)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 78, 121);
  doc.text("Signature de l'employeur", 200, signY, { align: 'right' });

  // Zone signature employeur
  doc.line(140, signY + 18, 200, signY + 18);

  // Validation de conformité au système de paie (centrée en bas)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Validation de conformit\\u00E9 : Document certifi\\u00E9 conforme g\\u00E9n\\u00E9r\\u00E9 par le Syst\\u00E8me Int\\u00E9gr\\u00E9 de Paie ACPE", 105, signY + 26, { align: 'center' });

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
console.log('acpe-pdf.bundle.js built and copied successfully with inlined logo and perfect formatting!');
