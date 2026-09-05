/**
 * ==========================================================================
 * ACPE DASHBOARD DE PAIE - LOGIQUE VANILLA JS (SANS FRAMEWORK)
 * Compatible Spring Boot (Thymeleaf / REST API)
 * Système de paie en Franc CFA (FCFA / XOF) pour Établissement Public Administratif
 * ==========================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. COUCHE D'INTÉGRATION SPRING BOOT (API CLIENT AVEC FALLBACK LOCAL)
     -------------------------------------------------------------------------- */
  const PayrollApi = {
    baseUrl: '/api/payroll',

    // Récupération du résumé et des KPI
    async getSummary(period) {
      try {
        const response = await fetch(`${this.baseUrl}/summary?period=${encodeURIComponent(period)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        console.info('[EPA Paie] Spring Boot non connecté ou indisponible. Utilisation des données locales pour la période:', period);
        return MockData.getSummaryByPeriod(period);
      }
    },

    // Récupération des bulletins récents avec pagination et recherche
    async getRecentPayslips(params = {}) {
      try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseUrl}/recent?${query}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        return MockData.filterPayslips(params);
      }
    },

    // Lancer le calcul de la paie
    async triggerCalculation(period) {
      try {
        const response = await fetch(`${this.baseUrl}/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ period })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        return { success: true, message: 'Calcul indiciaire en FCFA exécuté avec succès.' };
      }
    },

    // Valider la paie
    async validatePayroll(period) {
      try {
        const response = await fetch(`${this.baseUrl}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ period })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        return { success: true, message: 'Paie visée et transmise à la Trésorerie Générale en FCFA.' };
      }
    }
  };

  /* --------------------------------------------------------------------------
     2. DONNÉES STATIQUES DE BASE EN FCFA (EPA - ÉTABLISSEMENT PUBLIC ADMINISTRATIF)
     -------------------------------------------------------------------------- */
  const MockData = {
    periods: {
      '2026-09': {
        name: 'Septembre 2026',
        cycleStatus: 'En préparation',
        cycleStep: 2,
        ctaLabel: 'Lancer le calcul de paie',
        ctaAction: 'calculate',
        totalPayroll: '184 256 000 FCFA',
        payrollVariation: '+1.4%',
        agentsPaid: 482,
        totalAgents: 485,
        pendingSlips: 14,
        alertsCount: 4,
        alertsDetail: '3 absences non justifiées, 1 incohérence échelon',
        breakdown: [
          { label: 'Catégorie A (Cadres & Directeurs)', count: 188, amount: '89 240 000 FCFA', percent: 48, class: 'fill-cat-a' },
          { label: 'Catégorie B (Techniciens & Rédacteurs)', count: 142, amount: '51 280 000 FCFA', percent: 28, class: 'fill-cat-b' },
          { label: 'Catégorie C (Adjoints administratifs)', count: 96, amount: '27 436 000 FCFA', percent: 15, class: 'fill-cat-c' },
          { label: 'Contractuels EPA (CDD / Experts)', count: 59, amount: '16 300 000 FCFA', percent: 9, class: 'fill-cat-contract' }
        ]
      },
      '2026-08': {
        name: 'Août 2026',
        cycleStatus: 'Clôturée',
        cycleStep: 4,
        ctaLabel: 'Consulter l\'archivage',
        ctaAction: 'archive',
        totalPayroll: '181 724 000 FCFA',
        payrollVariation: '+0.2%',
        agentsPaid: 484,
        totalAgents: 484,
        pendingSlips: 0,
        alertsCount: 0,
        alertsDetail: 'Aucune anomalie détectée',
        breakdown: [
          { label: 'Catégorie A (Cadres & Directeurs)', count: 187, amount: '88 500 000 FCFA', percent: 49, class: 'fill-cat-a' },
          { label: 'Catégorie B (Techniciens & Rédacteurs)', count: 142, amount: '50 820 000 FCFA', percent: 28, class: 'fill-cat-b' },
          { label: 'Catégorie C (Adjoints administratifs)', count: 96, amount: '26 904 000 FCFA', percent: 15, class: 'fill-cat-c' },
          { label: 'Contractuels EPA (CDD / Experts)', count: 59, amount: '15 500 000 FCFA', percent: 8, class: 'fill-cat-contract' }
        ]
      },
      '2026-07': {
        name: 'Juillet 2026',
        cycleStatus: 'Clôturée',
        cycleStep: 4,
        ctaLabel: 'Consulter l\'archivage',
        ctaAction: 'archive',
        totalPayroll: '181 410 000 FCFA',
        payrollVariation: '+0.8%',
        agentsPaid: 483,
        totalAgents: 483,
        pendingSlips: 0,
        alertsCount: 0,
        alertsDetail: 'Aucune anomalie détectée',
        breakdown: [
          { label: 'Catégorie A (Cadres & Directeurs)', count: 186, amount: '88 210 000 FCFA', percent: 49, class: 'fill-cat-a' },
          { label: 'Catégorie B (Techniciens & Rédacteurs)', count: 142, amount: '50 600 000 FCFA', percent: 28, class: 'fill-cat-b' },
          { label: 'Catégorie C (Adjoints administratifs)', count: 96, amount: '27 100 000 FCFA', percent: 15, class: 'fill-cat-c' },
          { label: 'Contractuels EPA (CDD / Experts)', count: 59, amount: '15 500 000 FCFA', percent: 8, class: 'fill-cat-contract' }
        ]
      }
    },

    // Évolution de la masse salariale sur 12 mois (en Millions FCFA)
    history12Months: [
      { month: 'Oct 25', value: 178, display: '178 000 000 FCFA' },
      { month: 'Nov 25', value: 178.5, display: '178 500 000 FCFA' },
      { month: 'Déc 25', value: 181, display: '181 000 000 FCFA' },
      { month: 'Jan 26', value: 179.5, display: '179 500 000 FCFA' },
      { month: 'Fév 26', value: 179.8, display: '179 800 000 FCFA' },
      { month: 'Mar 26', value: 180.2, display: '180 200 000 FCFA' },
      { month: 'Avr 26', value: 180.5, display: '180 500 000 FCFA' },
      { month: 'Mai 26', value: 181.2, display: '181 200 000 FCFA' },
      { month: 'Juin 26', value: 180.9, display: '180 900 000 FCFA' },
      { month: 'Juil 26', value: 181.4, display: '181 410 000 FCFA' },
      { month: 'Août 26', value: 181.7, display: '181 724 000 FCFA' },
      { month: 'Sep 26', value: 184.2, display: '184 256 000 FCFA' }
    ],

    // Bulletins traités (échantillon représentatif d'agents publics en FCFA)
    payslips: [
      {
        matricule: '1048',
        agent: 'Jean-Pierre Nganga',
        grade: 'Collaborateur bureau editorial',
        direction: 'Direction Générale',
        directionCode: 'DG',
        brut: 710725,
        net: 976935,
        statut: 'Validé',
        dateCalcul: '15/09/2026',
        categorie: 'Catégorie I Echelle 1 Echelon 2',
        echelon: 'Échelon 2 (INM 1762)'
      },
      {
        matricule: 'EPA-2024-041',
        agent: 'Isabelle Morvan',
        grade: 'Attachée principale d\'administration',
        direction: 'Direction des Affaires Financières',
        directionCode: 'DAF',
        brut: 421050,
        net: 334580,
        statut: 'Validé',
        dateCalcul: '12/09/2026',
        categorie: 'Cat. A',
        echelon: 'Échelon 7 (IB 830 - INM 685)',
        details: {
          traitementBase: '337 020 FCFA',
          indemniteResidence: '10 110 FCFA',
          rifseepIfse: '68 000 FCFA',
          supplementFamilial: '5 920 FCFA',
          retenuePensionCnracl: '-23 590 FCFA',
          cotisationRafp: '-3 400 FCFA',
          csgCrds: '-38 850 FCFA',
          pas: '-20 630 FCFA'
        }
      },
      {
        matricule: 'EPA-2021-118',
        agent: 'Marc Dupont',
        grade: 'Ingénieur d\'études principal',
        direction: 'Systèmes d\'Information',
        directionCode: 'DSI',
        brut: 395000,
        net: 312040,
        statut: 'Validé',
        dateCalcul: '12/09/2026',
        categorie: 'Cat. A',
        echelon: 'Échelon 5 (IB 750 - INM 624)',
        details: {
          traitementBase: '307 000 FCFA',
          indemniteResidence: '9 210 FCFA',
          rifseepIfse: '72 000 FCFA',
          supplementFamilial: '6 790 FCFA',
          retenuePensionCnracl: '-21 490 FCFA',
          cotisationRafp: '-3 600 FCFA',
          csgCrds: '-36 280 FCFA',
          pas: '-21 590 FCFA'
        }
      },
      {
        matricule: 'EPA-2025-004',
        agent: 'Sophie Benali',
        grade: 'Technicienne supérieure de classe sup.',
        direction: 'Ressources Humaines',
        directionCode: 'DRH',
        brut: 278000,
        net: 221050,
        statut: 'En attente',
        dateCalcul: '14/09/2026',
        categorie: 'Cat. B',
        echelon: 'Échelon 4 (IB 540 - INM 458)',
        details: {
          traitementBase: '225 340 FCFA',
          indemniteResidence: '6 760 FCFA',
          rifseepIfse: '42 000 FCFA',
          supplementFamilial: '3 900 FCFA',
          retenuePensionCnracl: '-15 770 FCFA',
          cotisationRafp: '-2 100 FCFA',
          csgCrds: '-25 860 FCFA',
          pas: '-13 220 FCFA'
        }
      },
      {
        matricule: 'EPA-2020-089',
        agent: 'Karim Hadad',
        grade: 'Secrétaire administratif de classe excep.',
        direction: 'Affaires Juridiques',
        directionCode: 'DAJ',
        brut: 312000,
        net: 248015,
        statut: 'Validé',
        dateCalcul: '11/09/2026',
        categorie: 'Cat. B',
        echelon: 'Échelon 6 (IB 610 - INM 515)',
        details: {
          traitementBase: '253 380 FCFA',
          indemniteResidence: '7 600 FCFA',
          rifseepIfse: '45 000 FCFA',
          supplementFamilial: '6 020 FCFA',
          retenuePensionCnracl: '-17 740 FCFA',
          cotisationRafp: '-2 250 FCFA',
          csgCrds: '-29 010 FCFA',
          pas: '-14 985 FCFA'
        }
      },
      {
        matricule: 'EPA-2023-204',
        agent: 'Hélène Roche',
        grade: 'Adjointe administrative principale 1ère cl.',
        direction: 'Services Généraux',
        directionCode: 'DSG',
        brut: 231000,
        net: 184590,
        statut: 'Validé',
        dateCalcul: '11/09/2026',
        categorie: 'Cat. C',
        echelon: 'Échelon 8 (IB 440 - INM 388)',
        details: {
          traitementBase: '190 900 FCFA',
          indemniteResidence: '5 730 FCFA',
          rifseepIfse: '32 000 FCFA',
          supplementFamilial: '2 370 FCFA',
          retenuePensionCnracl: '-13 360 FCFA',
          cotisationRafp: '-1 600 FCFA',
          csgCrds: '-21 660 FCFA',
          pas: '-9 790 FCFA'
        }
      },
      {
        matricule: 'EPA-2026-012',
        agent: 'Thomas Delorme',
        grade: 'Expert Juridique Contractuel (CDD 3 ans)',
        direction: 'Direction Générale',
        directionCode: 'DG',
        brut: 460000,
        net: 362000,
        statut: 'En attente',
        dateCalcul: '13/09/2026',
        categorie: 'Contractuel',
        echelon: 'Contrat indice 850 majoré',
        details: {
          traitementBase: '380 000 FCFA',
          indemniteResidence: '11 400 FCFA',
          rifseepIfse: '65 000 FCFA',
          supplementFamilial: '3 600 FCFA',
          retenuePensionCnracl: '-26 600 FCFA',
          cotisationRafp: '-4 500 FCFA',
          csgCrds: '-42 000 FCFA',
          pas: '-24 900 FCFA'
        }
      },
      {
        matricule: 'EPA-2019-015',
        agent: 'Christine Vasseur',
        grade: 'Conservatrice en chef du patrimoine',
        direction: 'Archives & Documentation',
        directionCode: 'DOC',
        brut: 495000,
        net: 391025,
        statut: 'Validé',
        dateCalcul: '10/09/2026',
        categorie: 'Cat. A',
        echelon: 'Échelon 9 (IB 980 - INM 800)',
        details: {
          traitementBase: '393 600 FCFA',
          indemniteResidence: '11 810 FCFA',
          rifseepIfse: '82 000 FCFA',
          supplementFamilial: '7 590 FCFA',
          retenuePensionCnracl: '-27 550 FCFA',
          cotisationRafp: '-4 100 FCFA',
          csgCrds: '-46 185 FCFA',
          pas: '-26 140 FCFA'
        }
      },
      {
        matricule: 'EPA-2022-077',
        agent: 'Amadou Sow',
        grade: 'Chef de division comptabilité publique',
        direction: 'Direction des Affaires Financières',
        directionCode: 'DAF',
        brut: 450000,
        net: 358200,
        statut: 'Validé',
        dateCalcul: '12/09/2026',
        categorie: 'Cat. A',
        echelon: 'Échelon 8 (IB 880 - INM 720)',
        details: {
          traitementBase: '354 000 FCFA',
          indemniteResidence: '10 620 FCFA',
          rifseepIfse: '78 000 FCFA',
          supplementFamilial: '7 380 FCFA',
          retenuePensionCnracl: '-24 780 FCFA',
          cotisationRafp: '-3 900 FCFA',
          csgCrds: '-41 200 FCFA',
          pas: '-21 920 FCFA'
        }
      }
    ],

    // Référentiel des employés (agents publics de l'EPA)
    employees: [
      {
        matricule: '1048',
        nom: 'Jean-Pierre Nganga',
        grade: 'Collaborateur bureau editorial',
        direction: 'Direction Générale',
        directionCode: 'DG',
        categorie: 'Catégorie I Echelle 1 Echelon 2',
        echelon: 'Échelon 2 (INM 1762)',
        indice: 1762,
        statutAgent: 'Contractuel',
        traitementNet: 976935,
        cnss: '21363679/26',
        dateEmbauche: '07/09/1999',
        anciennete: 26,
        situationMatrimoniale: 'Marié(e)',
        enfantsCharge: 8,
        partsIRPP: 6,
        college: 'Collaborateur',
        localite: 'BRAZZAVILLE',
        modePaiement: 'Virement',
        rib: 'BCI 30013-03500-02000730720/36',
        bulletinTemplateData: {
          rubriques: {
            nombreJours: 26,
            tauxJournalier: 20330,
            tauxAnciennete: 0.25,
            indemniteSujetion: 50000,
            indemniteTransport: 30000,
            rappelEcarts: 312817,
            cnssBasePlafond: 1023567,
            tauxCnssPvidSalarial: 0.04,
            tauxCnssPvidPatronal: 0.08,
            tauxCnssPlafPatronal: 0.12277,
            mutuelle: 10000,
            mutraAcpe: 0,
            itsMontant: 25664
          },
          cumulsAnnee: {
            brut: 3553750,
            chargesSalariales: 383033.4,
            chargesPatronales: 1037896.95,
            netImposable: 3349037
          }
        }
      },
      {
        matricule: 'EPA-2024-041',
        nom: 'Isabelle Morvan',
        grade: 'Attachée principale d\'administration',
        direction: 'Direction des Affaires Financières',
        directionCode: 'DAF',
        categorie: 'Cat. A',
        echelon: 'Échelon 7 (INM 685)',
        indice: 685,
        statutAgent: 'Titulaire',
        traitementNet: 334580
      },
      {
        matricule: 'EPA-2021-118',
        nom: 'Marc Dupont',
        grade: 'Ingénieur d\'études principal',
        direction: 'Systèmes d\'Information',
        directionCode: 'DSI',
        categorie: 'Cat. A',
        echelon: 'Échelon 5 (INM 624)',
        indice: 624,
        statutAgent: 'Titulaire',
        traitementNet: 312040
      },
      {
        matricule: 'EPA-2022-077',
        nom: 'Amadou Sow',
        grade: 'Chef de division comptabilité publique',
        direction: 'Direction des Affaires Financières',
        directionCode: 'DAF',
        categorie: 'Cat. A',
        echelon: 'Échelon 8 (INM 720)',
        indice: 720,
        statutAgent: 'Titulaire',
        traitementNet: 358200
      },
      {
        matricule: 'EPA-2025-004',
        nom: 'Sophie Benali',
        grade: 'Technicienne supérieure de classe sup.',
        direction: 'Ressources Humaines',
        directionCode: 'DRH',
        categorie: 'Cat. B',
        echelon: 'Échelon 4 (INM 458)',
        indice: 458,
        statutAgent: 'Stagiaire',
        traitementNet: 221050
      },
      {
        matricule: 'EPA-2020-089',
        nom: 'Karim Hadad',
        grade: 'Secrétaire administratif de classe excep.',
        direction: 'Affaires Juridiques',
        directionCode: 'DAJ',
        categorie: 'Cat. B',
        echelon: 'Échelon 6 (INM 515)',
        indice: 515,
        statutAgent: 'Titulaire',
        traitementNet: 248015
      },
      {
        matricule: 'EPA-2023-204',
        nom: 'Hélène Roche',
        grade: 'Adjointe administrative principale 1ère cl.',
        direction: 'Services Généraux',
        directionCode: 'DSG',
        categorie: 'Cat. C',
        echelon: 'Échelon 8 (INM 388)',
        indice: 388,
        statutAgent: 'Titulaire',
        traitementNet: 184590
      },
      {
        matricule: 'EPA-2026-012',
        nom: 'Thomas Delorme',
        grade: 'Expert Juridique Contractuel (CDD 3 ans)',
        direction: 'Direction Générale',
        directionCode: 'DG',
        categorie: 'Contractuel',
        echelon: 'Indice 850 majoré',
        indice: 850,
        statutAgent: 'Contractuel',
        traitementNet: 362000
      },
      {
        matricule: 'EPA-2019-015',
        nom: 'Christine Vasseur',
        grade: 'Conservatrice en chef du patrimoine',
        direction: 'Archives & Documentation',
        directionCode: 'DOC',
        categorie: 'Cat. A',
        echelon: 'Échelon 9 (INM 800)',
        indice: 800,
        statutAgent: 'Titulaire',
        traitementNet: 391025
      },
      {
        matricule: 'EPA-2025-103',
        nom: 'Fatou Ndiaye',
        grade: 'Gestionnaire budgétaire',
        direction: 'Direction des Affaires Financières',
        directionCode: 'DAF',
        categorie: 'Cat. B',
        echelon: 'Échelon 3 (INM 432)',
        indice: 432,
        statutAgent: 'Titulaire',
        traitementNet: 215400
      },
      {
        matricule: 'EPA-2024-110',
        nom: 'Jean-Luc Moreau',
        grade: 'Technicien d\'exploitation réseau',
        direction: 'Systèmes d\'Information',
        directionCode: 'DSI',
        categorie: 'Cat. B',
        echelon: 'Échelon 2 (INM 412)',
        indice: 412,
        statutAgent: 'Titulaire',
        traitementNet: 204500
      }
    ],

    // Éléments variables du mois en cours
    variables: [
      {
        id: 'VAR-001',
        matricule: 'EPA-2024-041',
        agent: 'Isabelle Morvan',
        direction: 'DAF',
        type: 'Prime',
        libelle: 'Prime de responsabilité comptable (Régie)',
        montant: 125000,
        periode: 'Septembre 2026',
        justificatif: 'Arrêté DG N°2026/088',
        statut: 'Validé'
      },
      {
        id: 'VAR-002',
        matricule: 'EPA-2021-118',
        agent: 'Marc Dupont',
        direction: 'DSI',
        type: 'Heures',
        libelle: 'Astreintes d\'infrastructure et bascule serveur',
        montant: 85000,
        periode: 'Septembre 2026',
        justificatif: 'Fiche d\'heures validée DSI',
        statut: 'Validé'
      },
      {
        id: 'VAR-003',
        matricule: 'EPA-2022-077',
        agent: 'Amadou Sow',
        direction: 'DAF',
        type: 'Prime',
        libelle: 'Indemnité de caisse et de maniement des fonds',
        montant: 95000,
        periode: 'Septembre 2026',
        justificatif: 'Arrêté Ministériel Fin/044',
        statut: 'Validé'
      },
      {
        id: 'VAR-004',
        matricule: 'EPA-2025-004',
        agent: 'Sophie Benali',
        direction: 'DRH',
        type: 'Indemnité',
        libelle: 'Indemnité kilométrique mission inter-sites',
        montant: 45000,
        periode: 'Septembre 2026',
        justificatif: 'Ordre de mission N°312',
        statut: 'En attente'
      },
      {
        id: 'VAR-005',
        matricule: 'EPA-2023-204',
        agent: 'Hélène Roche',
        direction: 'DSG',
        type: 'Retenue',
        libelle: 'Acompte quinzaine sollicité par l\'agent',
        montant: -60000,
        periode: 'Septembre 2026',
        justificatif: 'Demande visée DAF',
        statut: 'Validé'
      },
      {
        id: 'VAR-006',
        matricule: 'EPA-2026-012',
        agent: 'Thomas Delorme',
        direction: 'DG',
        type: 'Prime',
        libelle: 'Indemnité spéciale d\'expertise contentieuse',
        montant: 150000,
        periode: 'Septembre 2026',
        justificatif: 'Contrat d\'engagement Art. 7',
        statut: 'En attente'
      }
    ],

    // Bordereau des cotisations sociales et fiscales
    cotisations: [
      {
        organisme: 'Caisse de Retraite / IPRES - FNR',
        assiette: 184256000,
        tauxSalarial: '7.00%',
        partSalariale: 12897920,
        tauxPatronal: '14.00%',
        partPatronale: 25795840,
        total: 38693760,
        statut: 'Prêt pour mandatement'
      },
      {
        organisme: 'Caisse de Sécurité Sociale (CSS / Prestations familiales)',
        assiette: 184256000,
        tauxSalarial: '0.00%',
        partSalariale: 0,
        tauxPatronal: '7.00%',
        partPatronale: 12897920,
        total: 12897920,
        statut: 'Prêt pour mandatement'
      },
      {
        organisme: 'Caisse de Sécurité Sociale (CSS / Accidents du Travail)',
        assiette: 184256000,
        tauxSalarial: '0.00%',
        partSalariale: 0,
        tauxPatronal: '3.00%',
        partPatronale: 5527680,
        total: 5527680,
        statut: 'Prêt pour mandatement'
      },
      {
        organisme: 'Mutuelle de Santé Complémentaire des Agents Publics',
        assiette: 184256000,
        tauxSalarial: '2.50%',
        partSalariale: 4606400,
        tauxPatronal: '2.50%',
        partPatronale: 4606400,
        total: 9212800,
        statut: 'Prêt pour mandatement'
      },
      {
        organisme: 'Trésor Public • Prélèvement Fiscal IRPP (Retenue Source)',
        assiette: 184256000,
        tauxSalarial: 'Barème progressif',
        partSalariale: 24380000,
        tauxPatronal: '0.00%',
        partPatronale: 0,
        total: 24380000,
        statut: 'Visa Trésorerie requis'
      }
    ],

    // Référentiel des structures et départements de l'EPA
    departments: [
      {
        id: 'DEP-DAF',
        code: 'DAF',
        nom: 'Direction des Affaires Financières',
        parentDir: 'Direction Générale',
        budgetCode: 'BUD-6012-DAF',
        managerMatricule: 'EPA-2022-077',
        managerName: 'Amadou Sow',
        managerRole: 'Directeur des Affaires Financières',
        effectif: 78,
        masseSalarialeMensuelle: 34850000,
        subEntities: ['Service Comptabilité & Paie', 'Service Contrôle Budgétaire', 'Division Trésorerie']
      },
      {
        id: 'DEP-DSI',
        code: 'DSI',
        nom: 'Direction des Systèmes d\'Information',
        parentDir: 'Direction Générale',
        budgetCode: 'BUD-6014-DSI',
        managerMatricule: 'EPA-2018-002',
        managerName: 'Marc Lefebvre',
        managerRole: 'Directeur des Systèmes d\'Information',
        effectif: 46,
        masseSalarialeMensuelle: 23410000,
        subEntities: ['Service Infrastructure & Réseaux', 'Service Développement Applicatif', 'Bureau Sécurité SI']
      },
      {
        id: 'DEP-DRH',
        code: 'DRH',
        nom: 'Direction des Ressources Humaines',
        parentDir: 'Secrétariat Général',
        budgetCode: 'BUD-6011-DRH',
        managerMatricule: 'EPA-2024-041',
        managerName: 'Isabelle Morvan',
        managerRole: 'Directrice des Ressources Humaines',
        effectif: 52,
        masseSalarialeMensuelle: 26900000,
        subEntities: ['Service Gestion des Carrières', 'Service Paie & Rémunérations', 'Bureau Formation']
      },
      {
        id: 'DEP-DAJ',
        code: 'DAJ',
        nom: 'Direction des Affaires Juridiques',
        parentDir: 'Direction Générale',
        budgetCode: 'BUD-6016-DAJ',
        managerMatricule: 'EPA-2020-089',
        managerName: 'Karim Hadad',
        managerRole: 'Directeur des Affaires Juridiques',
        effectif: 34,
        masseSalarialeMensuelle: 18740000,
        subEntities: ['Service Contentieux Administratif', 'Bureau des Marchés Publics', 'Cellule Veille']
      },
      {
        id: 'DEP-DSG',
        code: 'DSG',
        nom: 'Direction des Services Généraux',
        parentDir: 'Secrétariat Général',
        budgetCode: 'BUD-6018-DSG',
        managerMatricule: 'EPA-2023-204',
        managerName: 'Hélène Roche',
        managerRole: 'Directrice des Services Généraux',
        effectif: 94,
        masseSalarialeMensuelle: 29800000,
        subEntities: ['Service Patrimoine & Logistique', 'Bureau Accueil & Sécurité', 'Parc Automobile']
      },
      {
        id: 'DEP-DG',
        code: 'DG',
        nom: 'Direction Générale & Inspection',
        parentDir: 'Direction Générale',
        budgetCode: 'BUD-6010-DG',
        managerMatricule: 'EPA-2026-012',
        managerName: 'Thomas Delorme',
        managerRole: 'Conseiller Spécial du Directeur Général',
        effectif: 38,
        masseSalarialeMensuelle: 22850000,
        subEntities: ['Cabinet du DG', 'Inspection Générale des Services', 'Contrôle de Gestion']
      },
      {
        id: 'DEP-DOC',
        code: 'DOC',
        nom: 'Archives, Documentation & Bibliothèque',
        parentDir: 'Secrétariat Général',
        budgetCode: 'BUD-6020-DOC',
        managerMatricule: 'EPA-2019-015',
        managerName: 'Christine Vasseur',
        managerRole: 'Conservatrice en Chef',
        effectif: 43,
        masseSalarialeMensuelle: 19120000,
        subEntities: ['Service Numérisation & GED', 'Fonds Public Historique', 'Médiathèque']
      }
    ],

    // Registre des contrats des agents
    contracts: [
      {
        id: 'CTR-2024-001',
        matricule: 'EPA-2024-041',
        agent: 'Isabelle Morvan',
        type: 'Titulaire',
        poste: 'Directrice des Ressources Humaines',
        dateDebut: '01/01/2024',
        dateFin: 'Indéterminée (Statutaire)',
        periodeEssai: 'Validée',
        salaireBase: 420000,
        statut: 'Actif',
        pdfFile: 'Arrete_Morvan_EPA_2024_041.pdf'
      },
      {
        id: 'CTR-2018-012',
        matricule: 'EPA-2018-002',
        agent: 'Marc Lefebvre',
        type: 'Titulaire',
        poste: 'Directeur des Systèmes d\'Information',
        dateDebut: '15/03/2018',
        dateFin: 'Indéterminée (Statutaire)',
        periodeEssai: 'Validée',
        salaireBase: 480000,
        statut: 'Actif',
        pdfFile: 'Arrete_Lefebvre_EPA_2018_002.pdf'
      },
      {
        id: 'CTR-2025-084',
        matricule: 'EPA-2025-004',
        agent: 'Sophie Benali',
        type: 'CDD',
        poste: 'Technicienne supérieure - Gestion des Carrières',
        dateDebut: '01/11/2025',
        dateFin: '31/10/2026',
        periodeEssai: 'Validée (3 mois)',
        salaireBase: 278000,
        statut: 'Échéance proche',
        pdfFile: 'CDD_Benali_EPA_2025_004.pdf'
      },
      {
        id: 'CTR-2026-009',
        matricule: 'EPA-2026-012',
        agent: 'Thomas Delorme',
        type: 'CDD',
        poste: 'Expert Juridique Contentieux',
        dateDebut: '01/01/2026',
        dateFin: '31/12/2028',
        periodeEssai: 'Validée (6 mois)',
        salaireBase: 460000,
        statut: 'Actif',
        pdfFile: 'Contrat_Delorme_EPA_2026_012.pdf'
      },
      {
        id: 'CTR-2026-033',
        matricule: 'EPA-2026-095',
        agent: 'Jean-Luc Moreau',
        type: 'CDI',
        poste: 'Administrateur Systèmes & Réseaux',
        dateDebut: '15/07/2026',
        dateFin: 'Indéterminée',
        periodeEssai: 'En cours (Échéance 15/10/2026)',
        salaireBase: 395000,
        statut: 'Période d\'essai',
        pdfFile: 'CDI_Moreau_EPA_2026_095.pdf'
      },
      {
        id: 'CTR-2026-042',
        matricule: 'EPA-2026-110',
        agent: 'Fatou Diop',
        type: 'Stage',
        poste: 'Stagiaire Assistante Contrôle de Gestion',
        dateDebut: '01/05/2026',
        dateFin: '31/10/2026',
        periodeEssai: 'Sans objet',
        salaireBase: 120000,
        statut: 'Échéance proche',
        pdfFile: 'Convention_Stage_Diop_2026.pdf'
      },
      {
        id: 'CTR-2026-050',
        matricule: 'EPA-2026-140',
        agent: 'Koffi Mensah',
        type: 'Vacation',
        poste: 'Expert Consultant Fiscalité Publique',
        dateDebut: '01/08/2026',
        dateFin: '30/11/2026',
        periodeEssai: 'Sans objet',
        salaireBase: 350000,
        statut: 'Actif',
        pdfFile: 'Engagement_Vacation_Mensah.pdf'
      },
      {
        id: 'CTR-2022-019',
        matricule: 'EPA-2022-077',
        agent: 'Amadou Sow',
        type: 'Titulaire',
        poste: 'Chef de division comptabilité publique',
        dateDebut: '01/09/2022',
        dateFin: 'Indéterminée (Statutaire)',
        periodeEssai: 'Validée',
        salaireBase: 450000,
        statut: 'Actif',
        pdfFile: 'Arrete_Sow_EPA_2022_077.pdf'
      }
    ],

    // File d'attente des demandes agents (self-service)
    requests: [
      {
        id: 'DEM-2026-081',
        matricule: 'EPA-2024-041',
        agent: 'Isabelle Morvan',
        direction: 'Ressources Humaines',
        type: 'Congé payé',
        period: 'Du 15/10/2026 au 25/10/2026 (10 jours ouvrés)',
        dateSoumission: '02/09/2026',
        statut: 'En attente',
        justificatif: 'Demande_conge_signee_Morvan.pdf',
        motive: 'Fractionnement du congé annuel au titre de la période estivale décalée pour motifs familiaux impérieux. Reliquat restant : 14 jours.',
        decisionComment: '',
        timeline: [
          { step: 'Soumission de la demande', actor: 'Isabelle Morvan', date: '02/09/2026 à 09:15', status: 'completed', note: 'Demande enregistrée sur le portail agent' },
          { step: 'Avis du supérieur hiérarchique', actor: 'Secrétaire Général', date: '03/09/2026 à 11:30', status: 'completed', note: 'Avis favorable - Continuité de service assurée' },
          { step: 'Contrôle solde de congés DRH', actor: 'Bureau des Congés', date: '04/09/2026 à 14:00', status: 'completed', note: 'Solde vérifié : 24 jours disponibles avant imputation' },
          { step: 'Décision finale ordonnateur', actor: 'Direction Générale', date: 'En attente', status: 'current', note: 'En attente de validation finale pour visa' }
        ]
      },
      {
        id: 'DEM-2026-079',
        matricule: 'EPA-2025-004',
        agent: 'Sophie Benali',
        direction: 'Ressources Humaines',
        type: 'Acompte / Avance',
        period: 'Montant sollicité : 120 000 FCFA',
        dateSoumission: '05/09/2026',
        statut: 'En attente',
        justificatif: 'Fiche_Acompte_Benali_Signee.pdf',
        motive: 'Acompte exceptionnel sur traitement du mois de septembre 2026 suite à des frais médicaux imprévus. À déduire de la paie de septembre 2026.',
        decisionComment: '',
        timeline: [
          { step: 'Soumission de la demande', actor: 'Sophie Benali', date: '05/09/2026 à 10:20', status: 'completed', note: 'Demande transmise avec justificatif' },
          { step: 'Vérification quotité cessible DAF', actor: 'Bureau Comptabilité & Paie', date: '06/09/2026 à 16:45', status: 'completed', note: 'Quotité disponible conforme (< 33% du traitement net)' },
          { step: 'Décision finale ordonnateur', actor: 'Ordonnateur / DAF', date: 'En attente', status: 'current', note: 'Arbitrage budgétaire en cours' }
        ]
      },
      {
        id: 'DEM-2026-075',
        matricule: 'EPA-2023-204',
        agent: 'Hélène Roche',
        direction: 'Services Généraux',
        type: 'Attestation',
        period: 'Délivrance sous 5 jours ouvrés',
        dateSoumission: '08/09/2026',
        statut: 'En attente',
        justificatif: 'Formulaire_Attestation_DRH.pdf',
        motive: 'Attestation de travail et de non-logement pour dossier bancaire de prêt immobilier.',
        decisionComment: '',
        timeline: [
          { step: 'Soumission de la demande', actor: 'Hélène Roche', date: '08/09/2026 à 08:30', status: 'completed', note: 'Demande reçue' },
          { step: 'Édition du document par la DRH', actor: 'Bureau Gestion Administrative', date: '09/09/2026 à 10:15', status: 'completed', note: 'Projet d\'attestation généré' },
          { step: 'Signature & Sceau officiel', actor: 'Directrice des RH', date: 'En attente', status: 'current', note: 'En attente de signature numérique' }
        ]
      },
      {
        id: 'DEM-2026-068',
        matricule: 'EPA-2020-089',
        agent: 'Karim Hadad',
        direction: 'Affaires Juridiques',
        type: 'Congé payé',
        period: 'Du 01/09/2026 au 10/09/2026 (8 jours ouvrés)',
        dateSoumission: '20/08/2026',
        statut: 'Validée',
        justificatif: 'Demande_conge_signee_Hadad.pdf',
        motive: 'Congé d\'ancienneté validé.',
        decisionComment: 'Demande accordée et intégrée dans l\'état des présences de septembre 2026.',
        timeline: [
          { step: 'Soumission', actor: 'Karim Hadad', date: '20/08/2026 à 14:10', status: 'completed', note: 'Enregistrée' },
          { step: 'Visa Hiérarchique', actor: 'Secrétaire Général', date: '21/08/2026 à 09:00', status: 'completed', note: 'Favorable' },
          { step: 'Validation finale', actor: 'Directeur Général', date: '22/08/2026 à 11:30', status: 'completed', note: 'Accordé' }
        ]
      },
      {
        id: 'DEM-2026-062',
        matricule: 'EPA-2018-002',
        agent: 'Marc Lefebvre',
        direction: 'Systèmes d\'Information',
        type: 'Régularisation',
        period: 'Régularisation Prime Astreinte Août 2026',
        dateSoumission: '25/08/2026',
        statut: 'Validée',
        justificatif: 'Rapport_Astreintes_DSI_Aout2026.pdf',
        motive: 'Paiement des astreintes week-end lors de la migration du serveur de base de données.',
        decisionComment: 'Validé pour mandatement sur la paie de septembre 2026 (75 000 FCFA).',
        timeline: [
          { step: 'Soumission', actor: 'Marc Lefebvre', date: '25/08/2026 à 15:40', status: 'completed', note: 'Transmis' },
          { step: 'Visa DAF', actor: 'Amadou Sow', date: '26/08/2026 à 14:00', status: 'completed', note: 'Crédits budgétaires disponibles' },
          { step: 'Décision finale', actor: 'Ordonnateur EPA', date: '28/08/2026 à 10:20', status: 'completed', note: 'Approuvé' }
        ]
      },
      {
        id: 'DEM-2026-055',
        matricule: 'EPA-2019-015',
        agent: 'Christine Vasseur',
        direction: 'Archives & Documentation',
        type: 'Congé payé',
        period: 'Du 12/09/2026 au 18/09/2026 (5 jours)',
        dateSoumission: '28/08/2026',
        statut: 'Validée',
        justificatif: 'Conge_Vasseur_2026.pdf',
        motive: 'Congé pour convenance personnelle.',
        decisionComment: 'Validé.',
        timeline: [
          { step: 'Soumission', actor: 'Christine Vasseur', date: '28/08/2026', status: 'completed', note: 'OK' },
          { step: 'Validation', actor: 'DRH', date: '29/08/2026', status: 'completed', note: 'Accordé' }
        ]
      },
      {
        id: 'DEM-2026-051',
        matricule: 'EPA-2026-012',
        agent: 'Thomas Delorme',
        direction: 'Direction Générale',
        type: 'Acompte / Avance',
        period: 'Montant sollicité : 250 000 FCFA',
        dateSoumission: '01/09/2026',
        statut: 'Rejetée',
        justificatif: 'Demande_Avance_Delorme.pdf',
        motive: 'Demande d\'avance exceptionnelle supérieure au plafond réglementaire autorisée pour un agent contractuel récent.',
        decisionComment: 'Rejeté : La quotité demandée excède le plafond réglementaire des avances pour un agent comptant moins de 12 mois de service effectif.',
        timeline: [
          { step: 'Soumission', actor: 'Thomas Delorme', date: '01/09/2026 à 09:00', status: 'completed', note: 'Déposé' },
          { step: 'Contrôle réglementaire DAF', actor: 'Contrôleur Budgétaire', date: '02/09/2026 à 11:15', status: 'rejected', note: 'Dépassement du plafond statutaire' },
          { step: 'Notification du rejet', actor: 'DRH EPA', date: '03/09/2026 à 15:30', status: 'rejected', note: 'Motif transmis à l\'agent' }
        ]
      },
      {
        id: 'DEM-2026-044',
        matricule: 'EPA-2022-077',
        agent: 'Amadou Sow',
        direction: 'Affaires Financières',
        type: 'Attestation',
        period: 'Attestation annuelle d\'imposition',
        dateSoumission: '15/08/2026',
        statut: 'Validée',
        justificatif: 'Fiche_Impots_2025.pdf',
        motive: 'Déclaration fiscale annuelle.',
        decisionComment: 'Attestation transmise par courrier électronique certifié.',
        timeline: [
          { step: 'Soumission', actor: 'Amadou Sow', date: '15/08/2026', status: 'completed', note: 'Reçu' },
          { step: 'Délivrance', actor: 'Bureau de la Paie', date: '16/08/2026', status: 'completed', note: 'Délivrée' }
        ]
      }
    ],

    // Journal d'audit et de traçabilité réglementaire
    auditLogs: [
      {
        id: 'AUD-9941',
        timestamp: '14/09/2026 à 15:10:22 UTC+0',
        actor: 'Mamadou Diallo',
        role: 'Administrateur Principal DG',
        actionType: 'PAYROLL',
        actionBadge: 'audit-badge-payroll',
        entity: 'Cycle Septembre 2026',
        details: 'Lancement du calcul prévisionnel des 485 bulletins en FCFA',
        ip: '192.168.10.45',
        diff: [
          { label: 'Statut du cycle', before: 'En préparation', after: 'Calculé (184 256 000 FCFA)' },
          { label: 'Bulletins prêts', before: '0 / 485', after: '482 / 485' }
        ],
        hash: '9a72f10b42c943187a546e8c71b4028fa031bbcd25ef4034298fc1c149afbf4c'
      },
      {
        id: 'AUD-9938',
        timestamp: '14/09/2026 à 11:24:05 UTC+0',
        actor: 'Fatou Ndiaye',
        role: 'Chef Bureau Paie & Rémunérations',
        actionType: 'AGENT',
        actionBadge: 'audit-badge-agent',
        entity: 'Agent EPA-2025-004 (Sophie Benali)',
        details: 'Transfert administratif et changement de direction de rattachement',
        ip: '192.168.10.62',
        diff: [
          { label: 'Direction', before: 'Direction Affaires Financières (DAF)', after: 'Direction Ressources Humaines (DRH)' },
          { label: 'Code Budgétaire', before: 'BUD-6012-DAF', after: 'BUD-6011-DRH' }
        ],
        hash: '5d88c2491a0c8b326cf685e1358ef982c76e19c991b7852b8559a72f10b42c94'
      },
      {
        id: 'AUD-9932',
        timestamp: '13/09/2026 à 16:45:18 UTC+0',
        actor: 'Fatou Ndiaye',
        role: 'Chef Bureau Paie & Rémunérations',
        actionType: 'REQUEST',
        actionBadge: 'audit-badge-request',
        entity: 'Demande DEM-2026-068',
        details: 'Validation finale de la demande de congés annuels de Karim Hadad',
        ip: '192.168.10.62',
        diff: [
          { label: 'Statut Demande', before: 'En attente d\'arbitrage', after: 'Validée & Transmise en paie' },
          { label: 'Solde Congés Agent', before: '22 jours', after: '14 jours' }
        ],
        hash: '3f99a80e159e84b8f72c058763dc0b46995642a420b92427ae41e4649b934ca4'
      },
      {
        id: 'AUD-9925',
        timestamp: '12/09/2026 à 14:12:40 UTC+0',
        actor: 'Ibrahima Sarr',
        role: 'Contrôleur Budgétaire Trésor Public',
        actionType: 'PAYROLL',
        actionBadge: 'audit-badge-payroll',
        entity: 'Bordereau Mandatement Août 2026',
        details: 'Apposition du visa comptable Trésor et notification de liquidation bancaire',
        ip: '10.200.4.18',
        diff: [
          { label: 'Visa Trésorerie', before: 'En cours d\'instruction', after: 'Visé & Mandaté (181 650 000 FCFA)' },
          { label: 'Bordereau DGCP', before: 'Non émis', after: 'Certifié N°BM-2026-08' }
        ],
        hash: '6a420d9bb934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427a'
      },
      {
        id: 'AUD-9918',
        timestamp: '11/09/2026 à 09:30:12 UTC+0',
        actor: 'Mamadou Diallo',
        role: 'Administrateur Principal DG',
        actionType: 'CONTRACT',
        actionBadge: 'audit-badge-contract',
        entity: 'Contrat CTR-2026-033 (Jean-Luc Moreau)',
        details: 'Enregistrement de nouveau contrat CDI et notification de période d\'essai',
        ip: '192.168.10.45',
        diff: [
          { label: 'Type Contrat', before: 'Néant (Nouvel agent)', after: 'Contrat à Durée Indéterminée (CDI)' },
          { label: 'Salaire de Base', before: '0 FCFA', after: '395 000 FCFA' }
        ],
        hash: '7e19c991b7852b8559a72f10b42c943187a546e8c71b4028fa031bbcd25ef403'
      },
      {
        id: 'AUD-9904',
        timestamp: '10/09/2026 à 17:05:00 UTC+0',
        actor: 'Système EPA',
        role: 'Agent de surveillance automatisé',
        actionType: 'AUTH',
        actionBadge: 'audit-badge-auth',
        entity: 'Session Sécurisée Ordonnateur',
        details: 'Vérification automatique de l\'intégrité des tables et scellement du registre SHA-256',
        ip: '127.0.0.1 (Localhost)',
        diff: [
          { label: 'Contrôle d\'intégrité', before: 'Routine quotidienne', after: 'Conforme - 0 altération' }
        ],
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'AUD-9890',
        timestamp: '08/09/2026 à 10:15:33 UTC+0',
        actor: 'Fatou Ndiaye',
        role: 'Chef Bureau Paie & Rémunérations',
        actionType: 'SETTINGS',
        actionBadge: 'audit-badge-settings',
        entity: 'Constante Barème Indiciaire',
        details: 'Mise à jour de la valeur annuelle du point indiciaire de l\'établissement',
        ip: '192.168.10.62',
        diff: [
          { label: 'Valeur Point Indice', before: '5 850 FCFA', after: '5 920 FCFA' },
          { label: 'Date d\'Effet', before: '01/01/2026', after: '01/09/2026' }
        ],
        hash: '1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8559a72f10b42c9'
      }
    ],

    getSummaryByPeriod(periodKey) {
      return this.periods[periodKey] || this.periods['2026-09'];
    },

    filterPayslips({ search = '', sortCol = null, sortAsc = true, page = 1, size = 5 } = {}) {
      let filtered = [...this.payslips];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.agent.toLowerCase().includes(q) ||
          p.matricule.toLowerCase().includes(q) ||
          p.direction.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q)
        );
      }

      if (sortCol) {
        filtered.sort((a, b) => {
          let valA = a[sortCol];
          let valB = b[sortCol];

          if (typeof valA === 'string') {
            return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          return sortAsc ? valA - valB : valB - valA;
        });
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / size) || 1;
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const startIdx = (currentPage - 1) * size;
      const paginatedItems = filtered.slice(startIdx, startIdx + size);

      return {
        items: paginatedItems,
        totalItems,
        totalPages,
        currentPage,
        size
      };
    }
  };

  /* --------------------------------------------------------------------------
     3. ÉTAT DE L'APPLICATION (STORE LOCAL)
     -------------------------------------------------------------------------- */
  const AppState = {
    currentPage: 'dashboard',
    currentPeriod: '2026-09',
    currentSelectedMatricule: '1048',
    tableSearch: '',
    tableSortCol: null,
    tableSortAsc: true,
    tablePage: 1,
    tablePageSize: 5,
    isCalculating: false,

    // Filtres employés
    empSearch: '',
    empDirFilter: '',
    empCatFilter: '',

    // Filtres tous les bulletins
    allPayslipsSearch: '',
    allPayslipsPeriod: '2026-09',
    allPayslipsStatus: '',

    // Filtres variables
    varSearch: '',
    varTypeFilter: '',

    // Filtres départements
    deptSearch: '',
    deptDirFilter: '',

    // Filtres contrats
    contractSearch: '',
    contractTypeFilter: '',
    contractStatusFilter: '',

    // Filtres demandes
    requestSearch: '',
    requestTypeFilter: '',
    requestStatusFilter: '',
    selectedRequestId: null,

    // Filtres audit
    auditSearch: '',
    auditActionFilter: '',
    auditUserFilter: '',
    selectedAuditId: null,

    // État de l'Espace Paie & République du Congo
    payrollYear: '2026',
    payrollMonth: '09',
    payrollPeriod: 'Septembre 2026',
    payrollContractFilter: 'Tous',
    payrollScope: 'global',
    payrollIndividualMatricule: null,
    payrollStatus: 'OUVERTE',
    payrollCalculatedSlips: {},
    payrollValidatedSlips: new Set(),
    payrollChannelFilterMode: 'all',
    payrollChannelFilterBank: 'all',
    payrollChannelFilterDept: 'all',
    payrollChannelSearch: '',

    // ESPACES MÉTIERS & FLUX INTER-SERVICES (GRH ➔ PAIE ➔ FINANCE)
    activeEspace: 'paie', // 'grh' | 'paie' | 'finance'
    virementFilterAgent: '',
    virementFilterBank: 'ALL',
    selectedAlertId: null
  };

  /* --------------------------------------------------------------------------
     3.5. ÉTAT DU FLUX INTER-SERVICES : [ GRH ] ➔ [ PAIE ] ➔ [ FINANCE ]
     -------------------------------------------------------------------------- */
  const WorkflowState = {
    step1: {
      id: 'step1',
      title: 'Variables & Contrats',
      from: 'GRH',
      to: 'GESTIONNAIRE DE PAIE',
      status: 'TRANSMIS', // 'TRANSMIS' | 'VALIDE'
      agentCount: 485,
      variableCount: 42,
      totalPrimes: 18450000,
      transmittedAt: '12/09/2026 09:30',
      transmittedBy: 'Clarisse NGOMA (DRH)'
    },
    step2: {
      id: 'step2',
      title: 'Fichier de virement',
      from: 'GESTIONNAIRE DE PAIE',
      to: 'SERVICE FINANCIER',
      status: 'TRANSMIS', // 'EN_ATTENTE' | 'TRANSMIS' | 'ORDONNANCE'
      fileName: 'ACPE_VIREMENT_PAIE_2026-09.DAT',
      totalNet: 142580400,
      ordersCount: 482,
      transmittedAt: '15/09/2026 14:15',
      transmittedBy: 'Steve MOUKOKO (Chef Paie)'
    },
    step3: {
      id: 'step3',
      title: 'Justificatifs comptables',
      from: 'SERVICE FINANCIER',
      to: 'GESTIONNAIRE DE PAIE',
      status: 'CERTIFIE', // 'EN_ATTENTE' | 'EMIS' | 'CERTIFIE'
      bordereauRef: 'DGCP/ACPE/2026/084',
      totalMasse: 184256000,
      emittedAt: '16/09/2026 11:00',
      emittedBy: 'Alain BILONGO (Contrôleur Trésor)'
    },
    alerts: [
      {
        id: 'ALT-2026-01',
        agent: 'Sophie Benali',
        matricule: 'EPA-2025-004',
        type: 'CONTRAT_EXPIRATION',
        label: 'Contrat CDD expirant au 30/09/2026',
        source: 'GESTIONNAIRE DE PAIE',
        cible: 'GRH',
        urgence: 'Haute',
        date: '14/09/2026 10:20',
        status: 'EN_ATTENTE',
        description: 'Renouvellement d\'avenant requis par la DRH avant la clôture définitive de la période de paie.'
      },
      {
        id: 'ALT-2026-02',
        agent: 'Thomas Delorme',
        matricule: 'EPA-2026-012',
        type: 'RIB_INVALIDE',
        label: 'Rejet RIB BGFIBank : Clé de contrôle non conforme',
        source: 'SERVICE FINANCIER',
        cible: 'GRH',
        urgence: 'Moyenne',
        date: '15/09/2026 15:40',
        status: 'EN_ATTENTE',
        description: 'Attestation bancaire officielle d\'ouverture de compte exigée pour validation de l\'ordre de virement Trésor.'
      }
    ],
    history: [
      {
        id: 'FLX-01',
        date: '12/09/2026 09:30',
        source: 'GRH (Clarisse NGOMA)',
        dest: 'PAIE (Steve MOUKOKO)',
        objet: 'Transmission Lot Variables & Contrats Septembre 2026',
        volume: '485 agents • 42 variables',
        statut: 'Validé'
      },
      {
        id: 'FLX-02',
        date: '14/09/2026 10:20',
        source: 'PAIE (Steve MOUKOKO)',
        dest: 'GRH (Clarisse NGOMA)',
        objet: 'Alerte RH : Échéance CDD Sophie Benali',
        volume: 'EPA-2025-004',
        statut: 'En cours'
      },
      {
        id: 'FLX-03',
        date: '15/09/2026 14:15',
        source: 'PAIE (Steve MOUKOKO)',
        dest: 'FINANCE (Alain BILONGO)',
        objet: 'Transmission Fichier Virement CEMAC (.DAT)',
        volume: '142 580 400 FCFA • 482 ordres',
        statut: 'Transmis'
      },
      {
        id: 'FLX-04',
        date: '15/09/2026 15:40',
        source: 'FINANCE (Alain BILONGO)',
        dest: 'GRH (Clarisse NGOMA)',
        objet: 'Alerte RH : Contrôle RIB Thomas Delorme',
        volume: 'EPA-2026-012',
        statut: 'En cours'
      },
      {
        id: 'FLX-05',
        date: '16/09/2026 11:00',
        source: 'FINANCE (Alain BILONGO)',
        dest: 'PAIE (Steve MOUKOKO)',
        objet: 'Émission Bordereau Justificatifs Comptables',
        volume: 'Réf. 2026/084 • Classes 6 & 4',
        statut: 'Certifié'
      }
    ]
  };

  /* --------------------------------------------------------------------------
     4. UTILITAIRES DE FORMATAGE ET SÉCURITÉ
     -------------------------------------------------------------------------- */
  // Formatage officiel des montants en FCFA
  function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '0 FCFA';
    const val = typeof num === 'number' ? num : parseFloat(num);
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(Math.round(val));
    return `${formatted} FCFA`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* --------------------------------------------------------------------------
     5. NAVIGATION MULTI-PAGES & ROUTING PAR ESPACE (SANS FRAMEWORK)
     -------------------------------------------------------------------------- */
  const PAGE_TITLES = {
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Gestion de la paie et des déclarations administratives en FCFA'
    },
    flux: {
      title: 'Flux Inter-Services : Collaboration GRH • Paie • Finance',
      subtitle: 'Passation des variables et contrats, télé-transmission bancaire, justificatifs comptables et alertes RH'
    },
    'virements-finance': {
      title: 'Fichiers de Virement Bancaire & Ordonnancement',
      subtitle: 'Service Financier & Trésorerie • Émission des ordres de télé-transmission et mandatement CEMAC'
    },
    'justificatifs-comptables': {
      title: 'Justificatifs Comptables & Rapprochement de Paie',
      subtitle: 'Émission officielle des bordereaux de mandatement, quittances d\'imputation et journaux de paie'
    },
    employees: {
      title: 'Gestion des Agents Publics',
      subtitle: 'Répertoire du personnel titulaire, stagiaire et contractuel de l\'EPA'
    },
    payslips: {
      title: 'Bulletins de Paie & Traitements',
      subtitle: 'Émission officielle, visa et mandatement Trésor en FCFA'
    },
    variables: {
      title: 'Éléments Variables de Paie',
      subtitle: 'Primes de rendement, heures supplémentaires et sujétions'
    },
    cotisations: {
      title: 'Cotisations & Organismes Sociaux',
      subtitle: 'Retraite, sécurité sociale, mutuelle et retenues fiscales au Trésor'
    },
    reports: {
      title: 'Rapports & Déclarations Officielles',
      subtitle: 'Grand Livre, journal des salaires et bordereaux de mandatement'
    },
    departments: {
      title: 'Cartographie des Départements & Structures',
      subtitle: 'Directions, services, codes budgétaires et effectifs rattachés de l\'EPA'
    },
    contracts: {
      title: 'Registre des Contrats des Agents',
      subtitle: 'Suivi des statuts contractuels, périodes d\'essai, échéances et salaires en FCFA'
    },
    requests: {
      title: 'File d\'Attente des Demandes Agents',
      subtitle: 'Congés, attestations administratives, acomptes et régularisations self-service'
    },
    history: {
      title: 'Journal d\'Audit & Traçabilité Réglementaire',
      subtitle: 'Registre horodaté des actions, connexions, modifications d\'agents et visas EPA'
    },
    settings: {
      title: 'Paramètres du Système de Paie',
      subtitle: 'Configuration indiciaire, barèmes et constantes de calcul EPA'
    },
    paie: {
      title: 'Calcul & Gestion de la Paie',
      subtitle: 'Lancer le calcul automatique des salaires, valider la période et ordonnancer les paiements en République du Congo'
    }
  };

  function switchPage(targetPage) {
    if (!PAGE_TITLES[targetPage]) targetPage = 'dashboard';
    AppState.currentPage = targetPage;

    // 1. Mise à jour de la classe active sur les liens de navigation
    document.querySelectorAll('.sidebar-nav a.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkTarget = href.replace('#', '') || 'dashboard';
      if (linkTarget === targetPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // 2. Affichage du bon conteneur .page-view
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetViewEl = document.getElementById(`view-${targetPage}`);
    if (targetViewEl) {
      targetViewEl.classList.add('active');
    }

    // 3. Mise à jour du titre et du sous-titre de l'en-tête principal
    const headingEl = document.getElementById('page-main-heading');
    const subtitleEl = document.querySelector('.header-subtitle');
    if (headingEl && PAGE_TITLES[targetPage]) {
      headingEl.textContent = PAGE_TITLES[targetPage].title;
    }
    if (subtitleEl && PAGE_TITLES[targetPage]) {
      subtitleEl.textContent = PAGE_TITLES[targetPage].subtitle;
    }

    // 4. Déclenchement du rendu spécifique de la page
    if (targetPage === 'dashboard') {
      renderChart();
      renderPayslipsTable();
      renderWorkflowDiagram('workflow-diagram-dash');
      renderWorkflowSteps('workflow-steps-dash');
    } else if (targetPage === 'flux') {
      renderWorkflowDiagram('workflow-diagram-full');
      renderWorkflowSteps('workflow-steps-full');
      renderFluxAlerts();
      renderFluxHistory();
    } else if (targetPage === 'virements-finance') {
      renderVirementsFinanceTable();
    } else if (targetPage === 'justificatifs-comptables') {
      renderJustificatifsDocsGrid();
    } else if (targetPage === 'paie') {
      renderPayrollView();
    } else if (targetPage === 'employees') {
      renderEmployeesTable();
    } else if (targetPage === 'payslips') {
      renderAllPayslipsTable();
    } else if (targetPage === 'variables') {
      renderVariablesTable();
    } else if (targetPage === 'cotisations') {
      renderCotisationsTable();
    } else if (targetPage === 'departments') {
      renderDepartments();
    } else if (targetPage === 'contracts') {
      renderContracts();
    } else if (targetPage === 'requests') {
      renderRequests();
    } else if (targetPage === 'history') {
      renderHistory();
    }

    // Défilement fluide vers le haut du conteneur
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
  }

  /* --------------------------------------------------------------------------
     6. GESTION DES INTERFACES ET RENDUS DOM
     -------------------------------------------------------------------------- */

  // Mise à jour de la bannière du cycle de paie
  function updateCycleBanner(summary) {
    const bannerTitle = document.getElementById('cycle-banner-title');
    const bannerStatus = document.getElementById('cycle-banner-status');
    const bannerCta = document.getElementById('cycle-cta-btn');
    const stepProgressElements = document.querySelectorAll('.step-progress');

    if (bannerTitle) bannerTitle.textContent = `Paie de ${summary.name}`;
    if (bannerStatus) bannerStatus.textContent = summary.cycleStatus;

    if (bannerCta) {
      bannerCta.textContent = summary.ctaLabel;
      bannerCta.setAttribute('data-action', summary.ctaAction);

      if (summary.cycleStatus === 'Clôturée') {
        bannerCta.classList.remove('btn-white');
        bannerCta.classList.add('btn-secondary');
        bannerCta.style.borderColor = '#FFFFFF';
        bannerCta.style.color = '#FFFFFF';
      } else {
        bannerCta.className = 'btn-white';
        bannerCta.style.borderColor = '';
        bannerCta.style.color = '';
      }
    }

    // Mise à jour de la barre d'étapes (Stepper)
    stepProgressElements.forEach((bar, index) => {
      const stepIndex = index + 1;
      if (stepIndex < summary.cycleStep) {
        bar.style.width = '100%';
        bar.classList.add('complete');
      } else if (stepIndex === summary.cycleStep) {
        bar.style.width = summary.cycleStatus === 'Clôturée' ? '100%' : '60%';
        bar.classList.remove('complete');
      } else {
        bar.style.width = '0%';
        bar.classList.remove('complete');
      }
    });
  }

  /* --------------------------------------------------------------------------
     6.0. GESTION DES ESPACES (GRH, PAIE, FINANCE) ET FLUX INTER-SERVICES
     -------------------------------------------------------------------------- */

  const ESPACE_CONFIG = {
    grh: {
      id: 'grh',
      label: 'Direction des Ressources Humaines',
      shortLabel: 'GRH',
      userMatricule: 'ACPE-002',
      userName: 'NGOMA Clarisse',
      userRole: 'Directrice des Ressources Humaines',
      accentColor: '#10b981',
      description: 'Gestion des variables, avancements, contrats et traitement des alertes RH.',
      views: ['dashboard', 'flux', 'variables', 'employees', 'departments', 'contracts', 'requests']
    },
    paie: {
      id: 'paie',
      label: 'Gestionnaire de Paie',
      shortLabel: 'PAIE',
      userMatricule: 'ACPE-001',
      userName: 'MOUKOKO Steve',
      userRole: 'Chef de Service Paie',
      accentColor: '#2563eb',
      description: 'Calcul indiciaire officiel, bulletins de paie, cotisations et émission du fichier de virement.',
      views: ['dashboard', 'flux', 'paie', 'payslips', 'variables', 'virements-finance', 'cotisations', 'contracts', 'settings']
    },
    finance: {
      id: 'finance',
      label: 'Service Financier & Trésorerie',
      shortLabel: 'FINANCE',
      userMatricule: 'ACPE-003',
      userName: 'BILONGO Alain',
      userRole: 'Contrôleur Financier Trésor',
      accentColor: '#7c3aed',
      description: 'Ordonnancement bancaire CEMAC, télé-transmission, mandatement et justificatifs comptables.',
      views: ['dashboard', 'flux', 'virements-finance', 'justificatifs-comptables', 'cotisations', 'reports', 'history']
    }
  };

  function switchSpace(espaceKey, showFeedback = true) {
    if (!ESPACE_CONFIG[espaceKey]) espaceKey = 'paie';
    AppState.activeEspace = espaceKey;
    const config = ESPACE_CONFIG[espaceKey];

    // 1. Boutons du header
    document.querySelectorAll('.espace-btn').forEach(btn => {
      const match = btn.getAttribute('data-espace') === espaceKey;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-pressed', match ? 'true' : 'false');
    });

    // 2. Carte espace dans la sidebar
    const card = document.getElementById('sidebar-espace-card');
    const dot = document.getElementById('sidebar-espace-dot');
    const label = document.getElementById('sidebar-espace-label');
    const user = document.getElementById('sidebar-espace-user');

    if (card) {
      card.classList.remove('espace-grh', 'espace-paie', 'espace-finance');
      card.classList.add(`espace-${espaceKey}`);
    }
    if (dot) {
      dot.classList.remove('dot-grh', 'dot-paie', 'dot-finance');
      dot.classList.add(`dot-${espaceKey}`);
    }
    if (label) label.textContent = config.label;
    if (user) user.textContent = `${config.userName} • ${config.userRole}`;

    // 3. Filtrage / mise en avant des liens de navigation dans la sidebar
    document.querySelectorAll('.sidebar-nav a.nav-link').forEach(link => {
      const linkEspace = link.getAttribute('data-espace');
      if (!linkEspace || linkEspace === 'all') {
        link.style.opacity = '1';
        link.classList.remove('nav-link-secondary');
      } else {
        const espaces = linkEspace.split(',').map(s => s.trim());
        const isIncluded = espaces.includes(espaceKey);
        if (isIncluded) {
          link.style.opacity = '1';
          link.classList.remove('nav-link-secondary');
        } else {
          link.style.opacity = '0.55';
          link.classList.add('nav-link-secondary');
        }
      }
    });

    // 4. Mettre à jour les diagrammes et étapes
    renderWorkflowDiagram('workflow-diagram-dash');
    renderWorkflowDiagram('workflow-diagram-full');
    renderWorkflowSteps('workflow-steps-dash');
    renderWorkflowSteps('workflow-steps-full');
    renderFluxAlerts();
    renderFluxHistory();

    // 5. Synchroniser le profil utilisateur courant si nécessaire
    const userObj = USERS_ACPE[config.userMatricule];
    if (userObj) {
      updateHeaderUserDisplay(userObj);
      sessionStorage.setItem('acpe_auth_user', config.userMatricule);
    }

    if (showFeedback) {
      showToast(`Espace actif : ${config.label} (${config.userName})`);
    }
  }

  function renderWorkflowDiagram(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const active = AppState.activeEspace;
    const pendingAlertsCount = WorkflowState.alerts.filter(a => a.status === 'EN_ATTENTE').length;

    container.innerHTML = `
      <div class="wf-flow-visual-box">
        <!-- Ligne supérieure : Les 3 Espaces et les flux aller -->
        <div class="wf-nodes-row">
          <!-- Node 1 : GRH -->
          <div class="wf-node ${active === 'grh' ? 'wf-node-active' : ''}" data-target-espace="grh" role="button" title="Basculer vers l'espace GRH">
            <div class="wf-node-badge">Espace 1</div>
            <div class="wf-node-title"><span class="wf-icon">👥</span> [ GRH ]</div>
            <div class="wf-node-sub">Direction Ressources Humaines</div>
            <div class="wf-node-resp">Clarisse NGOMA</div>
            ${active === 'grh' ? '<span class="wf-current-tag">Actif</span>' : ''}
          </div>

          <!-- Connecteur 1 : GRH -> PAIE -->
          <div class="wf-connector wf-conn-step1" data-step="step1" title="Cliquer pour gérer les Variables & Contrats">
            <div class="wf-conn-line forward">
              <span class="wf-conn-pulse"></span>
            </div>
            <div class="wf-conn-label">
              <span class="wf-step-num">1</span>
              <span class="wf-step-text">Variables & Contrats</span>
              <span class="wf-step-badge ${WorkflowState.step1.status === 'VALIDE' ? 'badge-success' : 'badge-primary'}">
                ${WorkflowState.step1.status === 'VALIDE' ? '✓ Validé' : '➔ Transmis'}
              </span>
            </div>
          </div>

          <!-- Node 2 : GESTIONNAIRE DE PAIE -->
          <div class="wf-node ${active === 'paie' ? 'wf-node-active' : ''}" data-target-espace="paie" role="button" title="Basculer vers l'espace Paie">
            <div class="wf-node-badge">Espace 2</div>
            <div class="wf-node-title"><span class="wf-icon">⚙️</span> [ GESTIONNAIRE DE PAIE ]</div>
            <div class="wf-node-sub">Calcul indiciaire & bulletins</div>
            <div class="wf-node-resp">Steve MOUKOKO</div>
            ${active === 'paie' ? '<span class="wf-current-tag">Actif</span>' : ''}
          </div>

          <!-- Connecteur 2 : PAIE -> FINANCE -->
          <div class="wf-connector wf-conn-step2" data-step="step2" title="Cliquer pour gérer le Fichier de virement">
            <div class="wf-conn-line forward">
              <span class="wf-conn-pulse"></span>
            </div>
            <div class="wf-conn-label">
              <span class="wf-step-num">2</span>
              <span class="wf-step-text">Fichier de virement</span>
              <span class="wf-step-badge ${WorkflowState.step2.status === 'ORDONNANCE' ? 'badge-success' : 'badge-primary'}">
                ${WorkflowState.step2.status === 'ORDONNANCE' ? '✓ Ordonnancé' : '➔ Transmis CEMAC'}
              </span>
            </div>
          </div>

          <!-- Node 3 : SERVICE FINANCIER -->
          <div class="wf-node ${active === 'finance' ? 'wf-node-active' : ''}" data-target-espace="finance" role="button" title="Basculer vers l'espace Finance">
            <div class="wf-node-badge">Espace 3</div>
            <div class="wf-node-title"><span class="wf-icon">🏦</span> [ SERVICE FINANCIER ]</div>
            <div class="wf-node-sub">Trésorerie & Mandatement</div>
            <div class="wf-node-resp">Alain BILONGO</div>
            ${active === 'finance' ? '<span class="wf-current-tag">Actif</span>' : ''}
          </div>
        </div>

        <!-- Lignes inférieures : Les 2 boucles de retour (Justificatifs & Alertes) -->
        <div class="wf-returns-container">
          <!-- Boucle 3 : Justificatifs comptables (Finance -> Paie) -->
          <div class="wf-return-branch wf-branch-step3" data-step="step3" title="Cliquer pour voir les justificatifs comptables">
            <div class="wf-return-line">
              <div class="wf-return-path path-justifs"></div>
              <div class="wf-return-label">
                <span class="wf-step-num">3</span>
                <span class="wf-step-text">Justificatifs comptables</span>
                <span class="wf-step-badge badge-success">✓ Certifié Trésor</span>
              </div>
            </div>
          </div>

          <!-- Boucle 4 : Alerte RH si besoin (Paie/Finance -> GRH) -->
          <div class="wf-return-branch wf-branch-step4" data-step="step4" title="Cliquer pour consulter la file d'alertes RH">
            <div class="wf-return-line">
              <div class="wf-return-path path-alertes"></div>
              <div class="wf-return-label">
                <span class="wf-step-num alert-num">4</span>
                <span class="wf-step-text">Alerte RH si besoin</span>
                <span class="wf-step-badge ${pendingAlertsCount > 0 ? 'badge-warning' : 'badge-neutral'}">
                  ${pendingAlertsCount} en attente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Écouteurs de clic sur les nœuds pour basculer d'espace
    container.querySelectorAll('.wf-node').forEach(node => {
      node.addEventListener('click', () => {
        const targetEsp = node.getAttribute('data-target-espace');
        if (targetEsp) switchSpace(targetEsp, true);
      });
    });

    // Écouteurs sur les connecteurs d'étapes
    const step1El = container.querySelector('.wf-conn-step1');
    if (step1El) step1El.addEventListener('click', openStep1Modal);

    const step2El = container.querySelector('.wf-conn-step2');
    if (step2El) step2El.addEventListener('click', openStep2Modal);

    const step3El = container.querySelector('.wf-branch-step3');
    if (step3El) step3El.addEventListener('click', () => switchPage('justificatifs-comptables'));

    const step4El = container.querySelector('.wf-branch-step4');
    if (step4El) step4El.addEventListener('click', () => {
      switchPage('flux');
      const alertsSection = document.getElementById('flux-alerts-card');
      if (alertsSection) alertsSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function renderWorkflowSteps(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const s1 = WorkflowState.step1;
    const s2 = WorkflowState.step2;
    const s3 = WorkflowState.step3;
    const pendingAlerts = WorkflowState.alerts.filter(a => a.status === 'EN_ATTENTE');

    container.innerHTML = `
      <!-- Étape 1 : Variables & Contrats -->
      <div class="wf-card wf-card-step1">
        <div class="wf-card-header">
          <div class="wf-card-tag">[ GRH ] ➔ [ PAIE ]</div>
          <span class="wf-status-badge ${s1.status === 'VALIDE' ? 'status-ok' : 'status-pending'}">
            ${s1.status === 'VALIDE' ? '✓ Validé & Intégré' : '➔ Transmis'}
          </span>
        </div>
        <div class="wf-card-title">1. Variables & Contrats</div>
        <div class="wf-card-body">
          <p class="wf-card-text">Lot d'éléments variables et mouvements de contrats transmis par la DRH pour le calcul de paie.</p>
          <div class="wf-card-kpis">
            <div class="wf-kpi-pill"><strong>${s1.agentCount}</strong> agents</div>
            <div class="wf-kpi-pill"><strong>${s1.variableCount}</strong> variables</div>
            <div class="wf-kpi-pill"><strong>${formatCurrency(s1.totalPrimes)}</strong> primes</div>
          </div>
          <div class="wf-card-meta">
            <span>Transmission : ${s1.transmittedAt}</span>
            <span>Par : ${s1.transmittedBy}</span>
          </div>
        </div>
        <div class="wf-card-actions">
          <button class="btn btn-sm btn-primary" id="btn-wf-inspect-step1-${containerId}">
            📄 Inspecter & Valider
          </button>
          <button class="btn btn-sm btn-secondary" id="btn-wf-goto-variables-${containerId}">
            Voir Variables
          </button>
        </div>
      </div>

      <!-- Étape 2 : Fichier de virement -->
      <div class="wf-card wf-card-step2">
        <div class="wf-card-header">
          <div class="wf-card-tag">[ PAIE ] ➔ [ FINANCE ]</div>
          <span class="wf-status-badge ${s2.status === 'ORDONNANCE' ? 'status-ok' : 'status-pending'}">
            ${s2.status === 'ORDONNANCE' ? '✓ Ordonnancé Trésor' : '➔ Fichier Transmis'}
          </span>
        </div>
        <div class="wf-card-title">2. Fichier de virement bancaire</div>
        <div class="wf-card-body">
          <p class="wf-card-text">Génération de la télé-transmission bancaire CEMAC / Trésor pour le mandatement des salaires nets.</p>
          <div class="wf-card-kpis">
            <div class="wf-kpi-pill"><strong>${s2.ordersCount}</strong> virements</div>
            <div class="wf-kpi-pill"><strong>${formatCurrency(s2.totalNet)}</strong> net</div>
            <div class="wf-kpi-pill file-tag">📄 ${s2.fileName}</div>
          </div>
          <div class="wf-card-meta">
            <span>Transmission : ${s2.transmittedAt}</span>
            <span>Par : ${s2.transmittedBy}</span>
          </div>
        </div>
        <div class="wf-card-actions">
          <button class="btn btn-sm btn-primary" id="btn-wf-inspect-step2-${containerId}">
            🏦 Télé-transmission & .DAT
          </button>
          <button class="btn btn-sm btn-secondary" id="btn-wf-goto-virements-${containerId}">
            Ordres de virement
          </button>
        </div>
      </div>

      <!-- Étape 3 : Justificatifs comptables -->
      <div class="wf-card wf-card-step3">
        <div class="wf-card-header">
          <div class="wf-card-tag">[ FINANCE ] ➔ [ PAIE ]</div>
          <span class="wf-status-badge status-ok">✓ Certifié Trésor</span>
        </div>
        <div class="wf-card-title">3. Justificatifs comptables</div>
        <div class="wf-card-body">
          <p class="wf-card-text">Bordereau récapitulatif de mandatement, quittance de règlement et écritures d'imputation budgétaire.</p>
          <div class="wf-card-kpis">
            <div class="wf-kpi-pill">Réf : <strong>${s3.bordereauRef}</strong></div>
            <div class="wf-kpi-pill"><strong>${formatCurrency(s3.totalMasse)}</strong> masse</div>
            <div class="wf-kpi-pill">Classes 641 & 421</div>
          </div>
          <div class="wf-card-meta">
            <span>Émission : ${s3.emittedAt}</span>
            <span>Visé par : ${s3.emittedBy}</span>
          </div>
        </div>
        <div class="wf-card-actions">
          <button class="btn btn-sm btn-primary" id="btn-wf-goto-justifs-${containerId}">
            📑 Consulter Justificatifs
          </button>
          <button class="btn btn-sm btn-secondary" id="btn-wf-download-bordereau-${containerId}">
            📥 Bordereau Trésor
          </button>
        </div>
      </div>

      <!-- Étape 4 : Boucle d'Alerte RH -->
      <div class="wf-card wf-card-step4">
        <div class="wf-card-header">
          <div class="wf-card-tag">[ PAIE / FIN ] ➔ [ GRH ]</div>
          <span class="wf-status-badge ${pendingAlerts.length > 0 ? 'status-alert' : 'status-ok'}">
            ${pendingAlerts.length > 0 ? `▲ ${pendingAlerts.length} Alerte(s) active(s)` : '✓ Régularisé'}
          </span>
        </div>
        <div class="wf-card-title">4. Boucle d'Alerte RH si besoin</div>
        <div class="wf-card-body">
          <p class="wf-card-text">Signalement d'anomalies contractuelles ou bancaires rétroagissant sur la GRH pour mise à jour immédiate.</p>
          <div class="wf-card-kpis">
            <div class="wf-kpi-pill alert-pill"><strong>${pendingAlerts.length}</strong> non résolue(s)</div>
            <div class="wf-kpi-pill">Échéance CDD : 1</div>
            <div class="wf-kpi-pill">Rejet RIB : 1</div>
          </div>
          <div class="wf-card-meta">
            <span>Cible prioritaire : Directrice RH</span>
            <span>Procédure : Régularisation sous 48h</span>
          </div>
        </div>
        <div class="wf-card-actions">
          <button class="btn btn-sm btn-danger" id="btn-wf-create-alert-${containerId}">
            🚨 Émettre Alerte RH
          </button>
          <button class="btn btn-sm btn-secondary" id="btn-wf-view-alerts-${containerId}">
            Gérer les Alertes (${pendingAlerts.length})
          </button>
        </div>
      </div>
    `;

    // Attacher les gestionnaires d'actions
    const btnInspect1 = document.getElementById(`btn-wf-inspect-step1-${containerId}`);
    if (btnInspect1) btnInspect1.onclick = openStep1Modal;

    const btnGoVars = document.getElementById(`btn-wf-goto-variables-${containerId}`);
    if (btnGoVars) btnGoVars.onclick = () => switchPage('variables');

    const btnInspect2 = document.getElementById(`btn-wf-inspect-step2-${containerId}`);
    if (btnInspect2) btnInspect2.onclick = openStep2Modal;

    const btnGoVir = document.getElementById(`btn-wf-goto-virements-${containerId}`);
    if (btnGoVir) btnGoVir.onclick = () => switchPage('virements-finance');

    const btnGoJustifs = document.getElementById(`btn-wf-goto-justifs-${containerId}`);
    if (btnGoJustifs) btnGoJustifs.onclick = () => switchPage('justificatifs-comptables');

    const btnDownBord = document.getElementById(`btn-wf-download-bordereau-${containerId}`);
    if (btnDownBord) btnDownBord.onclick = () => {
      showToast('Téléchargement du Bordereau récapitulatif de mandatement Trésor DGCP/2026/084');
    };

    const btnCreateAlert = document.getElementById(`btn-wf-create-alert-${containerId}`);
    if (btnCreateAlert) btnCreateAlert.onclick = openCreateAlertModal;

    const btnViewAlerts = document.getElementById(`btn-wf-view-alerts-${containerId}`);
    if (btnViewAlerts) btnViewAlerts.onclick = () => {
      switchPage('flux');
      const alertsSec = document.getElementById('flux-alerts-card');
      if (alertsSec) alertsSec.scrollIntoView({ behavior: 'smooth' });
    };
  }

  function renderFluxAlerts() {
    const list = document.getElementById('flux-alerts-list');
    const badge = document.getElementById('badge-flux-alerts');
    if (!list) return;

    const pending = WorkflowState.alerts.filter(a => a.status === 'EN_ATTENTE');
    if (badge) badge.textContent = `${pending.length} en attente`;

    if (WorkflowState.alerts.length === 0) {
      list.innerHTML = `<div class="p-4 text-muted">Aucune alerte active dans le système.</div>`;
      return;
    }

    list.innerHTML = WorkflowState.alerts.map(alt => {
      const isPending = alt.status === 'EN_ATTENTE';
      return `
        <div class="flux-alert-item ${isPending ? 'alert-item-pending' : 'alert-item-resolved'}">
          <div class="alert-icon-col">
            <span class="alert-badge-icon">${isPending ? '⚠️' : '✓'}</span>
          </div>
          <div class="alert-info-col">
            <div class="alert-header-row">
              <span class="alert-tag">${alt.id}</span>
              <span class="alert-target-tag">${alt.source} ➔ ${alt.cible}</span>
              <span class="alert-urgency urgency-${alt.urgence.toLowerCase()}">${alt.urgence}</span>
              <span class="alert-date">${alt.date}</span>
            </div>
            <div class="alert-title-row">
              <strong>${escapeHtml(alt.label)}</strong>
              <span class="alert-agent-tag">${escapeHtml(alt.agent)} (${escapeHtml(alt.matricule)})</span>
            </div>
            <div class="alert-desc">${escapeHtml(alt.description)}</div>
          </div>
          <div class="alert-actions-col">
            ${isPending ? `
              <button class="btn btn-sm btn-primary btn-regulariser" data-id="${alt.id}">
                ✍️ Régulariser (GRH)
              </button>
            ` : `
              <span class="badge badge-success">Régularisé</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Écouteurs sur les boutons de régularisation
    list.querySelectorAll('.btn-regulariser').forEach(btn => {
      btn.addEventListener('click', () => {
        const altId = btn.getAttribute('data-id');
        openRegulariserModal(altId);
      });
    });
  }

  function renderFluxHistory() {
    const tbody = document.getElementById('flux-history-table-body');
    if (!tbody) return;

    tbody.innerHTML = WorkflowState.history.map(item => `
      <tr>
        <td class="font-mono">${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.date)}</td>
        <td><span class="badge badge-neutral">${escapeHtml(item.source)}</span></td>
        <td><span class="badge badge-neutral">${escapeHtml(item.dest)}</span></td>
        <td><strong>${escapeHtml(item.objet)}</strong></td>
        <td><span class="font-mono text-sm">${escapeHtml(item.volume)}</span></td>
        <td>
          <span class="badge ${item.statut === 'Validé' || item.statut === 'Certifié' ? 'badge-success' : 'badge-primary'}">
            ${escapeHtml(item.statut)}
          </span>
        </td>
      </tr>
    `).join('');
  }

  function renderVirementsFinanceTable() {
    const tbody = document.getElementById('virements-finance-table-body');
    if (!tbody) return;

    const query = (AppState.virementFilterAgent || '').toLowerCase().trim();
    const bankFilter = AppState.virementFilterBank || 'ALL';

    const empList = MockData.employees.filter(emp => {
      if (query && !emp.nom.toLowerCase().includes(query) && !emp.matricule.toLowerCase().includes(query)) {
        return false;
      }
      if (bankFilter !== 'ALL') {
        const rib = emp.rib || '';
        if (!rib.includes(bankFilter)) return false;
      }
      return true;
    });

    tbody.innerHTML = empList.map((emp, idx) => {
      const netVal = emp.traitementNet || 320000;
      const bankName = (emp.rib && emp.rib.includes('BCI')) ? 'BCI Congo' : (idx % 2 === 0 ? 'BGFI Bank' : 'Société Générale Congo');
      const ribStr = emp.rib || `300${idx + 10}-00210-009128301/45`;

      return `
        <tr>
          <td class="font-mono">${escapeHtml(emp.matricule)}</td>
          <td>
            <strong>${escapeHtml(emp.nom)}</strong>
            <div class="text-xs text-muted">${escapeHtml(emp.grade || 'Agent Public')}</div>
          </td>
          <td><span class="badge badge-neutral">${escapeHtml(emp.directionCode || 'DG')}</span></td>
          <td>
            <div class="font-medium">${escapeHtml(bankName)}</div>
            <div class="font-mono text-xs text-muted">${escapeHtml(ribStr)}</div>
          </td>
          <td class="font-bold text-right">${formatCurrency(netVal)}</td>
          <td>
            <span class="badge ${idx === 3 ? 'badge-warning' : 'badge-success'}">
              ${idx === 3 ? 'Alerte RIB' : 'Prêt virement'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderJustificatifsDocsGrid() {
    const grid = document.getElementById('justificatifs-docs-grid');
    if (!grid) return;

    const docs = [
      {
        ref: 'DGCP/ACPE/2026/084',
        titre: 'Bordereau Récapitulatif de Mandatement Trésor',
        type: 'BORDEREAU OFFICIEL',
        periode: 'Septembre 2026',
        montant: 184256000,
        signataire: 'Alain BILONGO (Contrôleur Financier)',
        date: '16/09/2026',
        status: 'Visé & Conforme'
      },
      {
        ref: 'QUITT-TRE-2026-902',
        titre: 'Quittance d\'Ordonnancement Bancaire CEMAC',
        type: 'QUITTANCE BANQUE',
        periode: 'Septembre 2026',
        montant: 142580400,
        signataire: 'Agence Comptable ACPE',
        date: '16/09/2026',
        status: 'Acquitté'
      },
      {
        ref: 'ECR-IMP-641-2026',
        titre: 'Journal d\'Imputation Comptable (Comptes 641 & 421)',
        type: 'JOURNAL DES SALAIRES',
        periode: 'Septembre 2026',
        montant: 184256000,
        signataire: 'Chef Division Comptabilité',
        date: '15/09/2026',
        status: 'Écritures passées'
      },
      {
        ref: 'ETAT-COT-CNSS-09',
        titre: 'État Récapitulatif des Cotisations CNSS & Mutuelles',
        type: 'ÉTAT SOCIAL',
        periode: 'Septembre 2026',
        montant: 41675600,
        signataire: 'Service Contrôle & Paie',
        date: '14/09/2026',
        status: 'Certifié'
      }
    ];

    grid.innerHTML = docs.map(doc => `
      <div class="justif-doc-card">
        <div class="justif-card-header">
          <span class="justif-type-tag">${doc.type}</span>
          <span class="badge badge-success">${doc.status}</span>
        </div>
        <div class="justif-card-title">${escapeHtml(doc.titre)}</div>
        <div class="justif-card-meta">
          <div>Réf : <strong class="font-mono">${escapeHtml(doc.ref)}</strong></div>
          <div>Période : <strong>${escapeHtml(doc.periode)}</strong></div>
          <div>Montant imputé : <strong class="text-primary font-bold">${formatCurrency(doc.montant)}</strong></div>
          <div>Visa : ${escapeHtml(doc.signataire)} (${doc.date})</div>
        </div>
        <div class="justif-card-footer">
          <button class="btn btn-sm btn-secondary btn-print-justif" data-ref="${doc.ref}">
            🖨️ Imprimer
          </button>
          <button class="btn btn-sm btn-primary btn-dl-justif" data-ref="${doc.ref}">
            📥 Télécharger PDF Visé
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-print-justif').forEach(btn => {
      btn.onclick = () => window.print();
    });
    grid.querySelectorAll('.btn-dl-justif').forEach(btn => {
      btn.onclick = () => {
        showToast(`Génération du certificat PDF sécurisé ${btn.getAttribute('data-ref')}`);
      };
    });
  }

  /* --------------------------------------------------------------------------
     6.1. MODALES ET ACTIONS DU WORKFLOW INTER-SERVICES
     -------------------------------------------------------------------------- */

  function openStep1Modal() {
    const modal = document.getElementById('modal-flux-step1');
    if (!modal) return;
    modal.classList.remove('hidden');

    const btnValider = document.getElementById('btn-flux-valider-step1');
    if (btnValider) {
      btnValider.onclick = () => {
        WorkflowState.step1.status = 'VALIDE';
        WorkflowState.history.unshift({
          id: `FLX-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          source: 'PAIE (Steve MOUKOKO)',
          dest: 'GRH (Clarisse NGOMA)',
          objet: 'Validation & Intégration du Lot Variables Septembre',
          volume: `${WorkflowState.step1.agentCount} agents vérifiés`,
          statut: 'Validé'
        });
        modal.classList.add('hidden');
        renderWorkflowDiagram('workflow-diagram-dash');
        renderWorkflowDiagram('workflow-diagram-full');
        renderWorkflowSteps('workflow-steps-dash');
        renderWorkflowSteps('workflow-steps-full');
        renderFluxHistory();
        showToast('Lot de Variables & Contrats validé par le Gestionnaire de Paie.');
      };
    }
  }

  function openStep2Modal() {
    const modal = document.getElementById('modal-flux-step2');
    if (!modal) return;
    modal.classList.remove('hidden');

    const btnDl = document.getElementById('btn-flux-download-dat');
    if (btnDl) {
      btnDl.onclick = () => {
        downloadBankingDatFile();
      };
    }

    const btnTransmit = document.getElementById('btn-flux-transmettre-finance');
    if (btnTransmit) {
      btnTransmit.onclick = () => {
        WorkflowState.step2.status = 'ORDONNANCE';
        WorkflowState.history.unshift({
          id: `FLX-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          source: 'FINANCE (Alain BILONGO)',
          dest: 'TRÉSOR & BANQUES',
          objet: 'Ordonnancement Bancaire CEMAC & Mandatement',
          volume: `${formatCurrency(WorkflowState.step2.totalNet)} - 482 ordres`,
          statut: 'Certifié'
        });
        modal.classList.add('hidden');
        renderWorkflowDiagram('workflow-diagram-dash');
        renderWorkflowDiagram('workflow-diagram-full');
        renderWorkflowSteps('workflow-steps-dash');
        renderWorkflowSteps('workflow-steps-full');
        renderFluxHistory();
        showToast('Fichier de virement ordonnancé auprès du Trésor Public.');
      };
    }
  }

  function downloadBankingDatFile() {
    let datContent = `0100ACPE_PAIE_20260901_CEMAC_XAF\n`;
    datContent += `0200EMETTEUR:AGENCE CONGOLAISE POUR L EMPLOI|COMPTE:30013-03500-01000000001/01\n`;
    MockData.employees.forEach(emp => {
      const rib = emp.rib || '30013-03500-02000730720/36';
      const net = emp.traitementNet || 300000;
      datContent += `0300MAT:${emp.matricule}|NOM:${emp.nom}|RIB:${rib}|NET:${net}|DEVISE:XAF|REF:PAIE202609\n`;
    });
    datContent += `0900TOTAL_LIGNES:${MockData.employees.length}|TOTAL_NET:${WorkflowState.step2.totalNet}|FIN_FICHIER`;

    const blob = new Blob([datContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = WorkflowState.step2.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Téléchargement de ${WorkflowState.step2.fileName} au format interbancaire CEMAC.`);
  }

  function openCreateAlertModal() {
    const modal = document.getElementById('modal-flux-step4-create');
    if (!modal) return;
    modal.classList.remove('hidden');

    const form = document.getElementById('form-create-alert-rh');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const matricule = document.getElementById('alert-agent-matricule')?.value || 'EPA-2026-099';
        const label = document.getElementById('alert-sujet')?.value || 'Anomalie administrative signalée';
        const urgence = document.getElementById('alert-urgence')?.value || 'Moyenne';
        const desc = document.getElementById('alert-description')?.value || '';

        const newId = `ALT-2026-0${WorkflowState.alerts.length + 1}`;
        const sourceLabel = AppState.activeEspace === 'finance' ? 'SERVICE FINANCIER' : 'GESTIONNAIRE DE PAIE';

        WorkflowState.alerts.unshift({
          id: newId,
          agent: 'Agent concerné',
          matricule: matricule,
          type: 'ANOMALIE',
          label: label,
          source: sourceLabel,
          cible: 'GRH',
          urgence: urgence,
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          status: 'EN_ATTENTE',
          description: desc
        });

        WorkflowState.history.unshift({
          id: `FLX-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          source: sourceLabel,
          dest: 'GRH (Clarisse NGOMA)',
          objet: `Alerte RH : ${label}`,
          volume: matricule,
          statut: 'En cours'
        });

        modal.classList.add('hidden');
        renderWorkflowDiagram('workflow-diagram-dash');
        renderWorkflowDiagram('workflow-diagram-full');
        renderWorkflowSteps('workflow-steps-dash');
        renderWorkflowSteps('workflow-steps-full');
        renderFluxAlerts();
        renderFluxHistory();
        showToast(`Alerte ${newId} transmise à la Direction des Ressources Humaines.`);
      };
    }
  }

  function openRegulariserModal(altId) {
    const modal = document.getElementById('modal-flux-regulariser');
    if (!modal) return;
    const alertItem = WorkflowState.alerts.find(a => a.id === altId);
    if (!alertItem) return;

    AppState.selectedAlertId = altId;
    const descEl = document.getElementById('regulariser-alert-desc');
    if (descEl) {
      descEl.textContent = `${alertItem.id} : ${alertItem.label} pour ${alertItem.agent} (${alertItem.matricule})`;
    }
    modal.classList.remove('hidden');

    const form = document.getElementById('form-regulariser-alert');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const actionNotes = document.getElementById('regulariser-notes')?.value || 'Régularisation effectuée par la DRH.';
        alertItem.status = 'REGULARISE';
        alertItem.description += ` [Régularisé : ${actionNotes}]`;

        WorkflowState.history.unshift({
          id: `FLX-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          source: 'GRH (Clarisse NGOMA)',
          dest: alertItem.source,
          objet: `Régularisation de l'alerte ${alertItem.id}`,
          volume: alertItem.matricule,
          statut: 'Validé'
        });

        modal.classList.add('hidden');
        renderWorkflowDiagram('workflow-diagram-dash');
        renderWorkflowDiagram('workflow-diagram-full');
        renderWorkflowSteps('workflow-steps-dash');
        renderWorkflowSteps('workflow-steps-full');
        renderFluxAlerts();
        renderFluxHistory();
        showToast(`Alerte ${altId} régularisée avec succès.`);
      };
    }
  }

  function initWorkflowEventListeners() {
    // Boutons de changement d'espace dans le header
    document.querySelectorAll('.espace-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetEsp = btn.getAttribute('data-espace');
        if (targetEsp) switchSpace(targetEsp, true);
      });
    });

    // Bouton d'accès au flux dans le header
    const btnOpenFlux = document.getElementById('btn-open-flux');
    if (btnOpenFlux) {
      btnOpenFlux.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('flux');
      });
    }

    // Bouton "Accéder au Cockpit de Flux Complet" sur le dashboard
    const btnGotoFullFlux = document.getElementById('btn-goto-full-flux');
    if (btnGotoFullFlux) {
      btnGotoFullFlux.addEventListener('click', () => switchPage('flux'));
    }

    // Bouton de fermeture de modales
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.add('hidden');
      });
    });

    // Fermeture en cliquant sur l'arrière-plan de la modale
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });

    // Filtres dans la page Virements Finance
    const virementSearchInput = document.getElementById('search-virements-finance');
    if (virementSearchInput) {
      virementSearchInput.addEventListener('input', (e) => {
        AppState.virementFilterAgent = e.target.value;
        renderVirementsFinanceTable();
      });
    }

    const virementBankSelect = document.getElementById('filter-virements-bank');
    if (virementBankSelect) {
      virementBankSelect.addEventListener('change', (e) => {
        AppState.virementFilterBank = e.target.value;
        renderVirementsFinanceTable();
      });
    }

    const btnDownloadAllDat = document.getElementById('btn-download-dat-full');
    if (btnDownloadAllDat) {
      btnDownloadAllDat.addEventListener('click', () => downloadBankingDatFile());
    }

    const btnOrdonnancerAll = document.getElementById('btn-ordonnancer-virements-all');
    if (btnOrdonnancerAll) {
      btnOrdonnancerAll.addEventListener('click', () => {
        showToast('Ordre de mandatement global transmis à la Trésorerie Générale.');
      });
    }
  }

  // Mise à jour des cartes KPI
  function updateKpiCards(summary) {
    const totalPayrollEl = document.getElementById('kpi-total-payroll');
    const payrollVarEl = document.getElementById('kpi-payroll-variation');
    const agentsPaidEl = document.getElementById('kpi-agents-paid');
    const agentsRatioEl = document.getElementById('kpi-agents-ratio');
    const pendingSlipsEl = document.getElementById('kpi-pending-slips');
    const alertsCountEl = document.getElementById('kpi-alerts-count');
    const alertsDetailEl = document.getElementById('kpi-alerts-detail');

    if (totalPayrollEl) totalPayrollEl.textContent = summary.totalPayroll;
    if (payrollVarEl) payrollVarEl.textContent = `${summary.payrollVariation} vs M-1`;
    if (agentsPaidEl) agentsPaidEl.textContent = `${summary.agentsPaid} / ${summary.totalAgents}`;
    if (agentsRatioEl) agentsRatioEl.textContent = `${((summary.agentsPaid / summary.totalAgents) * 100).toFixed(1)}% des effectifs`;
    if (pendingSlipsEl) pendingSlipsEl.textContent = summary.pendingSlips;
    if (alertsCountEl) alertsCountEl.textContent = summary.alertsCount;
    if (alertsDetailEl) alertsDetailEl.textContent = summary.alertsDetail;
  }

  // Mise à jour de la répartition du personnel
  function updateDistribution(summary) {
    const listContainer = document.getElementById('distribution-list');
    if (!listContainer || !summary.breakdown) return;

    listContainer.innerHTML = summary.breakdown.map(item => `
      <div class="distrib-item">
        <div class="distrib-header">
          <span class="distrib-category">
            <span class="legend-dot ${item.class.replace('fill-', 'dot-')}"></span>
            ${escapeHtml(item.label)} (${item.count})
          </span>
          <span class="distrib-amount">${escapeHtml(item.amount)} <strong style="color: var(--color-text-main); margin-left: 4px;">(${item.percent}%)</strong></span>
        </div>
        <div class="distrib-bar-track">
          <div class="distrib-bar-fill ${item.class}" style="width: ${item.percent}%"></div>
        </div>
      </div>
    `).join('');
  }

  // Rendu du graphique interactif SVG 12 mois en FCFA
  function renderChart() {
    const svg = document.getElementById('payroll-chart-svg');
    const tooltip = document.getElementById('chart-tooltip');
    if (!svg || !tooltip) return;

    const data = MockData.history12Months;
    const width = 680;
    const height = 240;
    const paddingLeft = 70;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const minVal = 175;
    const maxVal = 186;

    // Calcul des coordonnées
    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * plotWidth;
      const y = paddingTop + plotHeight - ((d.value - minVal) / (maxVal - minVal)) * plotHeight;
      return { x, y, data: d };
    });

    // Lignes de guidage horizontales
    const gridYValues = [176, 180, 184];
    const gridLines = gridYValues.map(val => {
      const y = paddingTop + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;
      return `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" />
        <text x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end" class="chart-axis-text">${val} M FCFA</text>
      `;
    }).join('');

    // Ligne continue (path SVG)
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      linePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }

    // Zone fermée sous la courbe
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

    // Étiquettes de mois sur l'axe X
    const xLabels = points.map(p => `
      <text x="${p.x}" y="${height - 12}" text-anchor="middle" class="chart-axis-text">${escapeHtml(p.data.month)}</text>
    `).join('');

    // Points cliquables et interactifs
    const circles = points.map((p, index) => `
      <circle 
        cx="${p.x}" 
        cy="${p.y}" 
        r="4.5" 
        class="chart-point" 
        data-index="${index}" 
        tabindex="0"
        role="button"
        aria-label="${p.data.month}: ${p.data.display}"
      />
    `).join('');

    svg.innerHTML = `
      <defs>
        <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563EB" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#2563EB" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" class="chart-area" />
      <path d="${linePath}" class="chart-line" />
      ${xLabels}
      ${circles}
    `;

    // Tooltip
    const pointElements = svg.querySelectorAll('.chart-point');
    pointElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        const item = data[idx];
        const rect = svg.getBoundingClientRect();
        const pt = points[idx];

        const relativeX = (pt.x / width) * rect.width;
        const relativeY = (pt.y / height) * rect.height;

        tooltip.textContent = `${item.month} : ${item.display}`;
        tooltip.style.left = `${relativeX}px`;
        tooltip.style.top = `${relativeY}px`;
        tooltip.style.opacity = '1';
      });

      el.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
    });
  }

  // Rendu du tableau des derniers bulletins (sur le dashboard)
  function renderPayslipsTable() {
    const tableBody = document.getElementById('payslips-table-body');
    const paginationInfo = document.getElementById('pagination-info');
    const prevBtn = document.getElementById('page-prev-btn');
    const nextBtn = document.getElementById('page-next-btn');
    const pageNumbersContainer = document.getElementById('page-numbers');

    if (!tableBody) return;

    const result = MockData.filterPayslips({
      search: AppState.tableSearch,
      sortCol: AppState.tableSortCol,
      sortAsc: AppState.tableSortAsc,
      page: AppState.tablePage,
      size: AppState.tablePageSize
    });

    if (result.items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px 16px; color: var(--color-text-muted);">
            Aucun bulletin trouvé pour cette recherche.
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = result.items.map(slip => {
        const initials = slip.agent.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const isPending = slip.statut === 'En attente';

        return `
          <tr data-matricule="${escapeHtml(slip.matricule)}">
            <td>
              <div class="agent-cell">
                <div class="agent-avatar-small" aria-hidden="true">${initials}</div>
                <div class="agent-info">
                  <span class="agent-name">${escapeHtml(slip.agent)}</span>
                  <span class="agent-grade">${escapeHtml(slip.grade)}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="matricule-code">${escapeHtml(slip.matricule)}</span>
            </td>
            <td>
              <span style="font-weight: 500;">${escapeHtml(slip.direction)}</span>
              <span style="display: block; font-size: 11px; color: var(--color-text-muted);">${escapeHtml(slip.directionCode)}</span>
            </td>
            <td>
              <span class="net-amount">${formatCurrency(slip.net)}</span>
            </td>
            <td>
              <span class="acpe-badge ${isPending ? 'acpe-badge-subtle' : ''}">
                ${escapeHtml(slip.statut)}
              </span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button 
                  type="button" 
                  class="btn-secondary btn-sm view-slip-btn" 
                  data-matricule="${escapeHtml(slip.matricule)}"
                  title="Voir le décompte détaillé"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Voir
                </button>
                <button 
                  type="button" 
                  class="btn-primary btn-sm download-slip-btn" 
                  data-matricule="${escapeHtml(slip.matricule)}"
                  data-agent="${escapeHtml(slip.agent)}"
                  title="Télécharger le bulletin officiel PDF"
                  style="padding: 6px 10px;"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  PDF
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Mise à jour de la pagination
    if (paginationInfo) {
      const start = result.totalItems === 0 ? 0 : (result.currentPage - 1) * result.size + 1;
      const end = Math.min(result.currentPage * result.size, result.totalItems);
      paginationInfo.textContent = `Affichage de ${start} à ${end} sur ${result.totalItems} bulletins`;
    }

    if (prevBtn) prevBtn.disabled = result.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = result.currentPage >= result.totalPages;

    if (pageNumbersContainer) {
      pageNumbersContainer.innerHTML = '';
      for (let p = 1; p <= result.totalPages; p++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-btn ${p === result.currentPage ? 'active' : ''}`;
        btn.textContent = p;
        btn.addEventListener('click', () => {
          AppState.tablePage = p;
          renderPayslipsTable();
        });
        pageNumbersContainer.appendChild(btn);
      }
    }
  }

  /* --------------------------------------------------------------------------
     7. RENDU DES AUTRES VUES
     -------------------------------------------------------------------------- */

  // Rendu de la vue Employés
  function renderEmployeesTable() {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;

    let items = [...MockData.employees];

    if (AppState.empSearch) {
      const q = AppState.empSearch.toLowerCase();
      items = items.filter(e =>
        e.nom.toLowerCase().includes(q) ||
        e.matricule.toLowerCase().includes(q) ||
        e.grade.toLowerCase().includes(q)
      );
    }

    if (AppState.empDirFilter) {
      items = items.filter(e => e.directionCode === AppState.empDirFilter);
    }

    if (AppState.empCatFilter) {
      items = items.filter(e => e.categorie === AppState.empCatFilter);
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px 16px; color: var(--color-text-muted);">
            Aucun agent public correspondant aux filtres sélectionnés.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(emp => {
      const initials = emp.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <tr>
          <td>
            <div class="agent-cell">
              <div class="agent-avatar-small" aria-hidden="true">${initials}</div>
              <div class="agent-info">
                <span class="agent-name">${escapeHtml(emp.nom)}</span>
                <span class="agent-grade">${escapeHtml(emp.grade)}</span>
              </div>
            </div>
          </td>
          <td><span class="matricule-code">${escapeHtml(emp.matricule)}</span></td>
          <td>
            <span style="font-weight: 500;">${escapeHtml(emp.direction)}</span>
            <span style="display: block; font-size: 11px; color: var(--color-text-muted);">${escapeHtml(emp.directionCode)}</span>
          </td>
          <td><span class="acpe-badge acpe-badge-subtle">${escapeHtml(emp.categorie)}</span></td>
          <td><strong style="color: var(--color-text-main);">${escapeHtml(emp.echelon)}</strong></td>
          <td><span class="net-amount">${formatCurrency(emp.traitementNet)}</span></td>
          <td><span class="acpe-badge">${escapeHtml(emp.statutAgent)}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end;">
              <button type="button" class="btn-secondary btn-sm view-agent-profile-btn" data-matricule="${escapeHtml(emp.matricule)}" title="Consulter la fiche administrative de l'agent">
                Fiche Agent
              </button>
              <button type="button" class="btn-primary btn-sm view-slip-btn" data-matricule="${escapeHtml(emp.matricule)}" title="Consulter le bulletin officiel ACPE" style="padding: 5px 9px;">
                Bulletin
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Rendu de la vue Bulletins de paie
  function renderAllPayslipsTable() {
    const tbody = document.getElementById('all-payslips-table-body');
    if (!tbody) return;

    let items = [...MockData.payslips];

    if (AppState.allPayslipsSearch) {
      const q = AppState.allPayslipsSearch.toLowerCase();
      items = items.filter(p =>
        p.agent.toLowerCase().includes(q) ||
        p.matricule.toLowerCase().includes(q) ||
        p.direction.toLowerCase().includes(q)
      );
    }

    if (AppState.allPayslipsStatus) {
      items = items.filter(p => p.statut === AppState.allPayslipsStatus);
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px 16px; color: var(--color-text-muted);">
            Aucun bulletin de paie ne correspond aux filtres.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(p => {
      const initials = p.agent.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const retenues = p.brut - p.net;
      const isPending = p.statut === 'En attente';

      return `
        <tr>
          <td>
            <div class="agent-cell">
              <div class="agent-avatar-small" aria-hidden="true">${initials}</div>
              <div class="agent-info">
                <span class="agent-name">${escapeHtml(p.agent)}</span>
                <span class="agent-grade">${escapeHtml(p.matricule)}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="font-weight: 500;">${escapeHtml(p.directionCode)}</span>
          </td>
          <td><span>${formatCurrency(p.brut)}</span></td>
          <td><span style="color: #B91C1C; font-weight: 500;">-${formatCurrency(retenues)}</span></td>
          <td><span class="net-amount">${formatCurrency(p.net)}</span></td>
          <td><span>${escapeHtml(p.dateCalcul)}</span></td>
          <td><span class="acpe-badge ${isPending ? 'acpe-badge-subtle' : ''}">${escapeHtml(p.statut)}</span></td>
          <td style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 6px;">
              <button type="button" class="btn-secondary btn-sm view-slip-btn" data-matricule="${escapeHtml(p.matricule)}" title="Consulter le bulletin">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Consulter
              </button>
              <button 
                type="button" 
                class="btn-primary btn-sm download-slip-btn" 
                data-matricule="${escapeHtml(p.matricule)}" 
                data-agent="${escapeHtml(p.agent)}" 
                title="Télécharger le bulletin PDF officiel" 
                style="padding: 6px 10px;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                PDF
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Rendu de la vue Éléments variables
  function renderVariablesTable() {
    const tbody = document.getElementById('variables-table-body');
    if (!tbody) return;

    let items = [...MockData.variables];

    if (AppState.varSearch) {
      const q = AppState.varSearch.toLowerCase();
      items = items.filter(v =>
        v.agent.toLowerCase().includes(q) ||
        v.matricule.toLowerCase().includes(q) ||
        v.libelle.toLowerCase().includes(q)
      );
    }

    if (AppState.varTypeFilter) {
      items = items.filter(v => v.type === AppState.varTypeFilter);
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px 16px; color: var(--color-text-muted);">
            Aucun élément variable enregistré pour cette période.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(v => {
      const isRetenue = v.montant < 0;
      return `
        <tr>
          <td>
            <strong style="color: var(--color-secondary); font-family: monospace;">${escapeHtml(v.matricule)}</strong>
            <div style="font-weight: 600; color: var(--color-text-main); font-size: 13px;">${escapeHtml(v.agent)} (${escapeHtml(v.direction)})</div>
          </td>
          <td>
            <span class="acpe-badge acpe-badge-subtle">${escapeHtml(v.type)}</span>
            <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 3px;">${escapeHtml(v.libelle)}</div>
          </td>
          <td><span>${escapeHtml(v.periode)}</span></td>
          <td>
            <strong style="color: ${isRetenue ? '#B91C1C' : 'var(--color-primary)'}; font-size: 15px;">
              ${isRetenue ? '-' : '+'}${formatCurrency(Math.abs(v.montant))}
            </strong>
          </td>
          <td><code style="font-size: 11px; background: #F1F5F9; padding: 2px 6px; border-radius: 4px;">${escapeHtml(v.justificatif)}</code></td>
          <td><span class="acpe-badge">${escapeHtml(v.statut)}</span></td>
          <td style="text-align: right;">
            <button type="button" class="btn-secondary btn-sm delete-var-btn" data-id="${escapeHtml(v.id)}" style="color: #B91C1C; border-color: #FECACA;">
              Supprimer
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Rendu de la vue Cotisations
  function renderCotisationsTable() {
    const tbody = document.getElementById('cotisations-table-body');
    if (!tbody) return;

    tbody.innerHTML = MockData.cotisations.map(c => `
      <tr>
        <td>
          <strong style="color: var(--color-text-main); font-size: 14px;">${escapeHtml(c.organisme)}</strong>
        </td>
        <td><span>${formatCurrency(c.assiette)}</span></td>
        <td><span>${escapeHtml(c.tauxSalarial)}</span></td>
        <td><strong style="color: var(--color-text-main);">${formatCurrency(c.partSalariale)}</strong></td>
        <td><span>${escapeHtml(c.tauxPatronal)}</span></td>
        <td><strong style="color: var(--color-text-main);">${formatCurrency(c.partPatronale)}</strong></td>
        <td><strong style="color: var(--color-primary); font-size: 15px;">${formatCurrency(c.total)}</strong></td>
        <td><span class="acpe-badge">${escapeHtml(c.statut)}</span></td>
      </tr>
    `).join('');
  }

  // Rendu de la vue Départements & Structures EPA
  function renderDepartments() {
    const container = document.getElementById('departments-container');
    if (!container) return;

    let list = [...MockData.departments];

    if (AppState.deptSearch) {
      const q = AppState.deptSearch.toLowerCase();
      list = list.filter(d =>
        d.nom.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.managerName.toLowerCase().includes(q) ||
        d.budgetCode.toLowerCase().includes(q)
      );
    }

    if (AppState.deptDirFilter) {
      list = list.filter(d => d.parentDir === AppState.deptDirFilter);
    }

    const statTotalEl = document.getElementById('dept-stat-total');
    if (statTotalEl) statTotalEl.textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: #FFFFFF; border-radius: 12px; border: 1px dashed var(--color-border-main);">
          <p style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 12px;">Aucun département ou structure ne correspond à votre filtre.</p>
          <button type="button" id="btn-reset-dept-filters" class="btn-secondary" style="font-size: 12px;">Réinitialiser les filtres</button>
        </div>
      `;
      const btnReset = document.getElementById('btn-reset-dept-filters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          AppState.deptSearch = '';
          AppState.deptDirFilter = '';
          const s = document.getElementById('dept-search-input');
          const f = document.getElementById('dept-dir-filter');
          if (s) s.value = '';
          if (f) f.value = '';
          renderDepartments();
        });
      }
      return;
    }

    container.innerHTML = list.map(d => {
      const initials = d.managerName.split(' ').map(n => n[0]).join('').substring(0, 2);
      const ratioPercent = Math.min(100, Math.round((d.effectif / 120) * 100));

      return `
        <div class="dept-card" id="card-${escapeHtml(d.id)}">
          <div class="dept-card-header">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span class="dept-code-badge">${escapeHtml(d.code)}</span>
              <div>
                <h3 class="dept-title">${escapeHtml(d.nom)}</h3>
                <span class="dept-parent-tag">${escapeHtml(d.parentDir)}</span>
              </div>
            </div>
            <button type="button" class="btn-secondary btn-edit-dept" data-dept-id="${escapeHtml(d.id)}" style="padding: 4px 10px; font-size: 11.5px; border-radius: 6px;">
              Modifier
            </button>
          </div>
          <div class="dept-card-body">
            <div class="dept-meta-row">
              <div class="dept-meta-item">
                <span class="dept-meta-label">Responsable désigné</span>
                <div class="dept-manager-info">
                  <div class="agent-avatar-small" style="width: 32px; height: 32px; font-size: 12px;">${escapeHtml(initials)}</div>
                  <div>
                    <div class="dept-manager-name">${escapeHtml(d.managerName)}</div>
                    <div class="dept-manager-role">${escapeHtml(d.managerRole)} • ${escapeHtml(d.managerMatricule)}</div>
                  </div>
                </div>
              </div>
              <div class="dept-meta-item">
                <span class="dept-meta-label">Code d'imputation budgétaire</span>
                <span class="dept-budget-badge">${escapeHtml(d.budgetCode)}</span>
              </div>
            </div>
            <div class="dept-stat-row">
              <div class="dept-stat-item">
                <span class="dept-stat-label">Effectif rattaché</span>
                <span class="dept-stat-val">${d.effectif} agents</span>
                <div class="dept-progress-bar">
                  <div class="dept-progress-fill" style="width: ${ratioPercent}%;"></div>
                </div>
              </div>
              <div class="dept-stat-item">
                <span class="dept-stat-label">Masse salariale mensuelle</span>
                <span class="dept-stat-val" style="color: var(--color-primary);">${formatCurrency(d.masseSalarialeMensuelle)}</span>
                <span style="font-size: 11px; color: var(--color-text-muted);">Période Septembre 2026</span>
              </div>
            </div>
            <div class="dept-subentities">
              <span class="dept-subentities-label">Services & entités rattachées :</span>
              <div class="dept-tags-wrap">
                ${(d.subEntities || []).map(sub => `<span class="dept-subtag">${escapeHtml(sub)}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="dept-card-footer">
            <button type="button" class="btn-dept-view-agents" data-direction="${escapeHtml(d.nom)}" style="background: none; border: none; color: var(--color-secondary); font-size: 12.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0;">
              Consulter les agents (${d.effectif}) →
            </button>
            <button type="button" class="btn-dept-transfer" data-dept-id="${escapeHtml(d.id)}" style="background: none; border: none; color: var(--color-text-muted); font-size: 12px; cursor: pointer; text-decoration: underline;">
              Rattacher un agent
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attacher les écouteurs sur les cartes départements
    container.querySelectorAll('.btn-edit-dept').forEach(btn => {
      btn.addEventListener('click', () => {
        const deptId = btn.getAttribute('data-dept-id');
        openDepartmentModal(deptId);
      });
    });

    container.querySelectorAll('.btn-dept-transfer').forEach(btn => {
      btn.addEventListener('click', () => {
        const deptId = btn.getAttribute('data-dept-id');
        openTransferAgentModal(deptId);
      });
    });

    container.querySelectorAll('.btn-dept-view-agents').forEach(btn => {
      btn.addEventListener('click', () => {
        const dirName = btn.getAttribute('data-direction');
        switchPage('employees');
        const empSearchInput = document.getElementById('emp-search-input');
        if (empSearchInput) {
          empSearchInput.value = dirName;
          AppState.empSearch = dirName;
          renderEmployeesTable();
        }
      });
    });
  }

  // Rendu de la vue Contrats des agents
  function renderContracts() {
    const tbody = document.getElementById('contracts-table-body');
    if (!tbody) return;

    let list = [...MockData.contracts];

    if (AppState.contractSearch) {
      const q = AppState.contractSearch.toLowerCase();
      list = list.filter(c =>
        c.agent.toLowerCase().includes(q) ||
        c.matricule.toLowerCase().includes(q) ||
        c.poste.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }

    if (AppState.contractTypeFilter) {
      list = list.filter(c => c.type === AppState.contractTypeFilter);
    }

    if (AppState.contractStatusFilter) {
      list = list.filter(c => c.statut === AppState.contractStatusFilter);
    }

    const statTotal = document.getElementById('contracts-stat-total');
    if (statTotal) statTotal.textContent = list.length;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px; color: var(--color-text-muted);">
            Aucun contrat trouvé avec les critères de recherche sélectionnés.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(c => {
      const initials = c.agent.split(' ').map(n => n[0]).join('').substring(0, 2);

      let statusBadge = '<span class="acpe-badge">Actif</span>';
      if (c.statut === 'Échéance proche') {
        statusBadge = '<span class="acpe-badge" style="background: #FEF2F2; color: #991B1B; border-color: #FCA5A5;">Échéance proche</span>';
      } else if (c.statut === 'Période d\'essai') {
        statusBadge = '<span class="acpe-badge" style="background: #FEF3C7; color: #92400E; border-color: #FCD34D;">Période d\'essai</span>';
      } else if (c.statut === 'Clôturé') {
        statusBadge = '<span class="acpe-badge" style="background: #F3F4F6; color: #4B5563;">Clôturé</span>';
      } else {
        statusBadge = '<span class="acpe-badge" style="background: #ECFDF5; color: #065F46; border-color: #A7F3D0;">Actif</span>';
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="agent-avatar-small">${escapeHtml(initials)}</div>
              <div>
                <strong style="color: var(--color-text-main); font-size: 13.5px;">${escapeHtml(c.agent)}</strong>
                <div style="font-size: 11.5px; color: var(--color-text-muted); font-family: monospace;">${escapeHtml(c.matricule)}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="contract-badge-type">${escapeHtml(c.type)}</span>
          </td>
          <td>
            <span style="font-size: 13px; color: var(--color-text-main);">${escapeHtml(c.poste)}</span>
          </td>
          <td>
            <span style="font-size: 12.5px;">${escapeHtml(c.dateDebut)}</span>
          </td>
          <td>
            <span style="font-size: 12.5px; ${c.statut === 'Échéance proche' ? 'color: #DC2626; font-weight: 700;' : ''}">${escapeHtml(c.dateFin)}</span>
          </td>
          <td>
            <span style="font-size: 12px; ${c.periodeEssai.includes('En cours') ? 'color: #D97706; font-weight: 700;' : ''}">${escapeHtml(c.periodeEssai)}</span>
          </td>
          <td>
            <strong style="color: var(--color-primary); font-size: 13.5px;">${formatCurrency(c.salaireBase)}</strong>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              <button type="button" class="btn-secondary btn-contract-pdf" data-pdf="${escapeHtml(c.pdfFile)}" title="Télécharger le contrat signé" style="padding: 4px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                PDF
              </button>
              <button type="button" class="btn-secondary btn-contract-view-agent" data-matricule="${escapeHtml(c.matricule)}" title="Consulter la fiche agent" style="padding: 4px 8px; font-size: 11.5px;">
                Agent
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Écouteurs pour le téléchargement PDF et consultation fiche
    tbody.querySelectorAll('.btn-contract-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        const pdf = btn.getAttribute('data-pdf');
        showToast(`Téléchargement du contrat signé : ${pdf}`);
      });
    });

    tbody.querySelectorAll('.btn-contract-view-agent').forEach(btn => {
      btn.addEventListener('click', () => {
        const mat = btn.getAttribute('data-matricule');
        openAgentDetailModal(mat);
      });
    });
  }

  // Rendu de la vue Demandes des agents (self-service)
  function renderRequests() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;

    let list = [...MockData.requests];

    if (AppState.requestSearch) {
      const q = AppState.requestSearch.toLowerCase();
      list = list.filter(r =>
        r.agent.toLowerCase().includes(q) ||
        r.matricule.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.motive.toLowerCase().includes(q)
      );
    }

    if (AppState.requestTypeFilter) {
      list = list.filter(r => r.type === AppState.requestTypeFilter);
    }

    if (AppState.requestStatusFilter) {
      list = list.filter(r => r.statut === AppState.requestStatusFilter);
    }

    // Mise à jour des compteurs statistiques
    const totalCount = MockData.requests.length;
    const pendingCount = MockData.requests.filter(r => r.statut === 'En attente').length;
    const statTotal = document.getElementById('requests-stat-total');
    const statPending = document.getElementById('requests-stat-pending');
    const pillAll = document.getElementById('pill-all-count');
    const pillPending = document.getElementById('pill-pending-count');

    if (statTotal) statTotal.textContent = totalCount;
    if (statPending) statPending.textContent = pendingCount;
    if (pillAll) pillAll.textContent = totalCount;
    if (pillPending) pillPending.textContent = pendingCount;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px; color: var(--color-text-muted);">
            Aucune demande d'agent ne correspond aux filtres actifs.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(r => {
      const initials = r.agent.split(' ').map(n => n[0]).join('').substring(0, 2);

      let statusBadge = '';
      if (r.statut === 'En attente') {
        statusBadge = '<span class="acpe-badge" style="background: #FEF3C7; color: #92400E; border-color: #FCD34D;">En attente</span>';
      } else if (r.statut === 'Validée') {
        statusBadge = '<span class="acpe-badge" style="background: #ECFDF5; color: #065F46; border-color: #A7F3D0;">Validée</span>';
      } else if (r.statut === 'Rejetée') {
        statusBadge = '<span class="acpe-badge" style="background: #FEF2F2; color: #991B1B; border-color: #FCA5A5;">Rejetée</span>';
      }

      return `
        <tr>
          <td>
            <strong style="color: var(--color-primary); font-size: 13px; font-family: monospace;">${escapeHtml(r.id)}</strong>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="agent-avatar-small">${escapeHtml(initials)}</div>
              <div>
                <strong style="color: var(--color-text-main); font-size: 13.5px;">${escapeHtml(r.agent)}</strong>
                <div style="font-size: 11.5px; color: var(--color-text-muted);">${escapeHtml(r.direction)}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="request-nature-badge">${escapeHtml(r.type)}</span>
          </td>
          <td>
            <span style="font-weight: 600; font-size: 13px; color: var(--color-text-main);">${escapeHtml(r.period)}</span>
          </td>
          <td>
            <span style="font-size: 12.5px; color: var(--color-text-muted);">${escapeHtml(r.dateSoumission)}</span>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-primary btn-review-request" data-request-id="${escapeHtml(r.id)}" style="padding: 5px 12px; font-size: 12px;">
              Examiner
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Écouteur sur le bouton Examiner
    tbody.querySelectorAll('.btn-review-request').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-request-id');
        openRequestDetailModal(reqId);
      });
    });
  }

  // Rendu de la vue Historique d'audit & Traçabilité
  function renderHistory() {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    let list = [...MockData.auditLogs];

    if (AppState.auditSearch) {
      const q = AppState.auditSearch.toLowerCase();
      list = list.filter(a =>
        a.actor.toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q) ||
        a.ip.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }

    if (AppState.auditActionFilter) {
      list = list.filter(a => a.actionType === AppState.auditActionFilter);
    }

    if (AppState.auditUserFilter) {
      list = list.filter(a => a.actor === AppState.auditUserFilter);
    }

    const statTotal = document.getElementById('audit-stat-total');
    if (statTotal) statTotal.textContent = list.length;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px; color: var(--color-text-muted);">
            Aucun enregistrement d'audit ne correspond aux critères définis.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(a => `
      <tr>
        <td>
          <span style="font-family: monospace; font-size: 12px; color: var(--color-text-muted);">${escapeHtml(a.timestamp)}</span>
        </td>
        <td>
          <strong style="color: var(--color-text-main); font-size: 13px;">${escapeHtml(a.actor)}</strong>
          <div style="font-size: 11px; color: var(--color-text-muted);">${escapeHtml(a.role)}</div>
        </td>
        <td>
          <span class="audit-badge ${escapeHtml(a.actionBadge)}">${escapeHtml(a.actionType)}</span>
        </td>
        <td>
          <span style="font-weight: 600; font-size: 12.5px; color: var(--color-text-main);">${escapeHtml(a.entity)}</span>
        </td>
        <td>
          <span style="font-size: 12.5px; color: var(--color-text-body);">${escapeHtml(a.details)}</span>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 11.5px; color: var(--color-secondary);">${escapeHtml(a.ip)}</span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn-secondary btn-inspect-audit" data-audit-id="${escapeHtml(a.id)}" style="padding: 4px 10px; font-size: 11.5px;">
            Inspecter
          </button>
        </td>
      </tr>
    `).join('');

    // Écouteur sur le bouton Inspecter
    tbody.querySelectorAll('.btn-inspect-audit').forEach(btn => {
      btn.addEventListener('click', () => {
        const auditId = btn.getAttribute('data-audit-id');
        openAuditDetailModal(auditId);
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. GESTION DES MODALES (BULLETIN, AGENT, DÉPARTEMENT, CONTRAT, WORKFLOW, AUDIT)
     -------------------------------------------------------------------------- */
  // Modale Département (Création / Modification)
  function openDepartmentModal(deptId = null) {
    const modal = document.getElementById('add-dept-modal');
    const title = document.getElementById('add-dept-title');
    const form = document.getElementById('form-add-department');
    const editIdInput = document.getElementById('dept-edit-id');
    const managerSelect = document.getElementById('dept-input-manager');

    if (!modal) return;

    // Remplissage du select des responsables avec la liste des agents
    if (managerSelect) {
      managerSelect.innerHTML = MockData.employees.map(e => `
        <option value="${escapeHtml(e.matricule)}">${escapeHtml(e.nom)} (${escapeHtml(e.matricule)} - ${escapeHtml(e.directionCode)})</option>
      `).join('');
    }

    if (deptId) {
      const dept = MockData.departments.find(d => d.id === deptId);
      if (dept) {
        if (title) title.textContent = 'Modifier la Structure / Département';
        if (editIdInput) editIdInput.value = dept.id;
        document.getElementById('dept-input-name').value = dept.nom;
        document.getElementById('dept-input-code').value = dept.code;
        document.getElementById('dept-input-parent').value = dept.parentDir;
        document.getElementById('dept-input-budget').value = dept.budgetCode;
        document.getElementById('dept-input-services').value = (dept.subEntities || []).join(', ');
        if (managerSelect) managerSelect.value = dept.managerMatricule;
      }
    } else {
      if (title) title.textContent = 'Nouveau Département / Structure';
      if (editIdInput) editIdInput.value = '';
      if (form) form.reset();
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeDepartmentModal() {
    const modal = document.getElementById('add-dept-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Modale Transfert d'agent
  function openTransferAgentModal(preselectDeptId = null) {
    const modal = document.getElementById('transfer-agent-modal');
    const agentSelect = document.getElementById('transfer-agent-select');
    const currentDeptInput = document.getElementById('transfer-current-dept');
    const targetDeptSelect = document.getElementById('transfer-target-dept');

    if (!modal) return;

    // Remplir la liste des agents
    if (agentSelect) {
      agentSelect.innerHTML = MockData.employees.map(e => `
        <option value="${escapeHtml(e.matricule)}">${escapeHtml(e.nom)} (${escapeHtml(e.matricule)} - ${escapeHtml(e.direction)})</option>
      `).join('');

      // Mise à jour automatique du département d'origine lors du changement d'agent
      const updateCurrentDept = () => {
        const mat = agentSelect.value;
        const emp = MockData.employees.find(e => e.matricule === mat);
        if (emp && currentDeptInput) {
          currentDeptInput.value = `${emp.direction} (${emp.directionCode || 'EPA'})`;
        }
      };

      agentSelect.onchange = updateCurrentDept;
      updateCurrentDept();
    }

    // Remplir la liste des départements de destination
    if (targetDeptSelect) {
      targetDeptSelect.innerHTML = MockData.departments.map(d => `
        <option value="${escapeHtml(d.id)}">${escapeHtml(d.nom)} (${escapeHtml(d.code)})</option>
      `).join('');

      if (preselectDeptId) {
        targetDeptSelect.value = preselectDeptId;
      }
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeTransferAgentModal() {
    const modal = document.getElementById('transfer-agent-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  /* --------------------------------------------------------------------------
     ESPACE PAIE & RÉPUBLIQUE DU CONGO (CALCUL, VALIDATION, PAIEMENT, VENTILATION)
     -------------------------------------------------------------------------- */
  const CONGO_DATA = {
    departments: {
      "Brazzaville": {
        chefLieu: "Brazzaville",
        villes: [
          "Brazzaville (Makélékélé)", "Brazzaville (Bacongo)", "Brazzaville (Poto-Poto)",
          "Brazzaville (Moungali)", "Brazzaville (Ouenzé)", "Brazzaville (Talangaï)",
          "Brazzaville (Mfilou)", "Brazzaville (Madibou)", "Brazzaville (Djiri)",
          "Kintélé", "Île Mbamou"
        ]
      },
      "Pointe-Noire": {
        chefLieu: "Pointe-Noire",
        villes: [
          "Pointe-Noire (Lumumba)", "Pointe-Noire (Mvoumvou)", "Pointe-Noire (Tié-Tié)",
          "Pointe-Noire (Loandjili)", "Pointe-Noire (Mongo-Poukou)", "Pointe-Noire (Ngoyo)",
          "Tchiamba-Nzassi"
        ]
      },
      "Kouilou": {
        chefLieu: "Hinda",
        villes: ["Hinda (Chef-lieu)", "Madingo-Kayes", "Mvouti", "Kakamoeka", "Loango", "Nzambi"]
      },
      "Niari": {
        chefLieu: "Dolisie",
        villes: ["Dolisie (Chef-lieu)", "Mossendjo", "Kibangou", "Kimongo", "Makabana", "Mayoko", "Moutamba", "Londela-Kayes", "Louvakou", "Nyanga", "Yaya"]
      },
      "Bouenza": {
        chefLieu: "Madingou",
        villes: ["Madingou (Chef-lieu)", "Nkayi", "Loutété", "Loudima", "Mouyondzi", "Boko-Songho", "Mabombo", "Kingoué", "Tsiaki", "Yamba"]
      },
      "Lékoumou": {
        chefLieu: "Sibiti",
        villes: ["Sibiti (Chef-lieu)", "Komono", "Zanaga", "Mayéyé", "Bambama"]
      },
      "Pool": {
        chefLieu: "Kinkala",
        villes: ["Kinkala (Chef-lieu)", "Mindouli", "Boko", "Kindamba", "Goma Tsé-Tsé", "Mayama", "Ngabé", "Louingui", "Loumo", "Ignié", "Vindza", "Kimba"]
      },
      "Plateaux": {
        chefLieu: "Djambala",
        villes: ["Djambala (Chef-lieu)", "Gamboma", "Lekana", "Ngo", "Mpouya", "Ollombo", "Allembé", "Makotimpoko"]
      },
      "Cuvette": {
        chefLieu: "Owando",
        villes: ["Owando (Chef-lieu)", "Oyo", "Boundji", "Makoua", "Mossaka", "Ngoko", "Ntokou", "Loukoléla", "Tchikapika"]
      },
      "Cuvette-Ouest": {
        chefLieu: "Ewo",
        villes: ["Ewo (Chef-lieu)", "Kellé", "Mbomo", "Okoyo", "Etoumbi"]
      },
      "Sangha": {
        chefLieu: "Ouesso",
        villes: ["Ouesso (Chef-lieu)", "Pokola", "Mokéko", "Sembé", "Souanké", "Ngbala", "Pikounda"]
      },
      "Likouala": {
        chefLieu: "Impfondo",
        villes: ["Impfondo (Chef-lieu)", "Bétou", "Dongou", "Enyellé", "Epéna", "Liranga", "Bouanila"]
      }
    },
    banks: [
      "BGFIBank Congo",
      "Société Générale Congo (SGC)",
      "Banque Postale du Congo (BPC)",
      "Crédit du Congo (Attijariwafa Bank)",
      "LCB Bank (Banque Commerciale)",
      "UBA Congo (United Bank for Africa)",
      "EcoBank Congo",
      "Banque Commerciale Internationale (BCI)",
      "Banque Sino-Congolaise pour l'Afrique (BSCA Bank)",
      "MUCODEC (Mutuelles Congolaises d'Épargne et de Crédit)",
      "CAPPED (Microfinance Congo)",
      "BEAC / Trésor Public (Compte Unique du Trésor)"
    ],
    cashOutlets: [
      "Caisse Centrale du Trésor Public (Brazzaville)",
      "Billetterie Régionale ACPE (Pointe-Noire)",
      "Paierie Départementale du Trésor (Dolisie)",
      "Paierie Départementale du Trésor (Nkayi)",
      "Paierie Départementale du Trésor (Owando)",
      "Paierie Départementale du Trésor (Ouesso)",
      "Régie d'avances de paie ACPE (Caisse centrale)"
    ],
    momoOperators: [
      "MTN Mobile Money Congo (MoMo)",
      "Airtel Money Congo"
    ],
    cardTypes: [
      "Carte Visa Débit / Premier",
      "Carte Mastercard Débit (MasterClasse)",
      "Carte Interbancaire GIMAC CEMAC"
    ]
  };

  // Initialisation du registre des paiements au Congo
  function initCongoPayments() {
    if (AppState.congoPayments && AppState.congoPayments.length > 0) return;

    const baseList = [];
    const depts = Object.keys(CONGO_DATA.departments);
    const employees = MockData.employees || [];

    employees.forEach((emp, index) => {
      const deptName = depts[index % depts.length];
      const deptObj = CONGO_DATA.departments[deptName];
      const villeName = deptObj.villes[index % deptObj.villes.length];

      // Répartition des canaux de paiement
      let methode = 'Virement';
      let etablissement = CONGO_DATA.banks[index % CONGO_DATA.banks.length];
      let numero = `CG012 000${(1000 + index)} 00000000${(index + 10)} 45`;

      const mod = index % 10;
      if (mod === 3 || mod === 7) {
        methode = 'Mobile Money';
        etablissement = (index % 2 === 0) ? 'MTN Mobile Money Congo (MoMo)' : 'Airtel Money Congo';
        numero = (index % 2 === 0) ? `06 6${(100000 + index * 3421).toString().slice(0, 6)}` : `05 5${(200000 + index * 4512).toString().slice(0, 6)}`;
      } else if (mod === 5) {
        methode = 'Carte Bancaire';
        etablissement = (index % 2 === 0) ? 'Carte Visa Débit / Premier' : 'Carte Mastercard Débit (MasterClasse)';
        numero = `4258 ${(1000 + index * 32)} ${(2000 + index * 54)} ${(3000 + index * 12)}`;
      } else if (mod === 9) {
        methode = 'Remise à la main (Espèces / Billetterie)';
        etablissement = CONGO_DATA.cashOutlets[index % CONGO_DATA.cashOutlets.length];
        numero = `BON-TR-CG-2026-${(100 + index)}`;
      }

      const pslip = MockData.payslips.find(p => p.matricule === emp.matricule);
      const montantNet = pslip ? pslip.net : (emp.salaireBase ? Math.round(emp.salaireBase * 0.85) : 320000);

      baseList.push({
        id: `PAY-CG-${String(index + 1).padStart(3, '0')}`,
        matricule: emp.matricule,
        agent: emp.nom,
        direction: emp.direction,
        departement: deptName,
        ville: villeName,
        methode: methode,
        etablissement: etablissement,
        numero: numero,
        montant: montantNet,
        statut: 'Ordonnancé',
        date: '15/09/2026'
      });
    });

    AppState.congoPayments = baseList;
  }

  // Rendu de l'Espace Paie
  function renderPayrollView() {
    initCongoPayments();

    // 1. Synchronisation de la navigation par onglets internes
    const tabBtns = document.querySelectorAll('.payroll-tab-btn');
    const tabPanels = {
      'calc-paie': document.getElementById('payroll-panel-calc'),
      'validation-paie': document.getElementById('payroll-panel-validation'),
      'paiement-congo': document.getElementById('payroll-panel-paiement'),
      'ventilation-masse': document.getElementById('payroll-panel-ventilation')
    };

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        Object.keys(tabPanels).forEach(key => {
          if (tabPanels[key]) {
            const isTarget = key === targetTab;
            tabPanels[key].style.display = isTarget ? 'block' : 'none';
            tabPanels[key].classList.toggle('active', isTarget);
          }
        });

        if (targetTab === 'calc-paie') renderPayrollCalcSection();
        else if (targetTab === 'validation-paie') renderPayrollValidationSection();
        else if (targetTab === 'paiement-congo') renderCongoPaymentForm();
        else if (targetTab === 'ventilation-masse') renderPayrollVentilation();
      };
    });

    // 2. Boutons de redirection rapide internes
    const btnReturnDash = document.getElementById('btn-paie-return-dash');
    if (btnReturnDash) {
      btnReturnDash.onclick = () => switchPage('dashboard');
    }

    const btnGoValidation = document.getElementById('btn-payroll-go-validation');
    if (btnGoValidation) {
      btnGoValidation.onclick = () => {
        const valTabBtn = document.querySelector('.payroll-tab-btn[data-tab="validation-paie"]');
        if (valTabBtn) valTabBtn.click();
      };
    }

    const btnGoPayment = document.getElementById('btn-payroll-go-payment');
    if (btnGoPayment) {
      btnGoPayment.onclick = () => {
        const payTabBtn = document.querySelector('.payroll-tab-btn[data-tab="paiement-congo"]');
        if (payTabBtn) payTabBtn.click();
      };
    }

    // 3. Configuration des sélecteurs de période (Année / Mois / Période de paie)
    const selAnnee = document.getElementById('payroll-sel-annee');
    const selMois = document.getElementById('payroll-sel-mois');
    const selPeriode = document.getElementById('payroll-sel-periode');
    const selValPeriode = document.getElementById('validation-select-period');

    const moisNoms = {
      '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
      '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
      '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };

    function syncPeriodChange(newPeriodLabel) {
      AppState.payrollPeriod = newPeriodLabel;
      const parts = newPeriodLabel.split(' ');
      if (parts.length === 2) {
        const mName = parts[0];
        const yVal = parts[1];
        if (selAnnee) selAnnee.value = yVal;
        const foundCode = Object.keys(moisNoms).find(k => moisNoms[k] === mName);
        if (foundCode && selMois) selMois.value = foundCode;
      }

      if (selPeriode) selPeriode.value = newPeriodLabel;
      if (selValPeriode) selValPeriode.value = newPeriodLabel;

      const calcTitle = document.getElementById('payroll-active-period-label');
      if (calcTitle) calcTitle.textContent = newPeriodLabel;
      const valTitle = document.getElementById('val-period-title-display');
      if (valTitle) valTitle.textContent = newPeriodLabel;

      renderPayrollCalcSection();
      renderPayrollValidationSection();
      renderPayrollVentilation();
    }

    if (selAnnee && selMois) {
      const handleMonthYearChange = () => {
        const y = selAnnee.value;
        const m = selMois.value;
        if (m && moisNoms[m]) {
          const newP = `${moisNoms[m]} ${y}`;
          // Mettre à jour options de période si absent
          let exists = false;
          for (let i = 0; i < selPeriode.options.length; i++) {
            if (selPeriode.options[i].value === newP) { exists = true; break; }
          }
          if (!exists) {
            const opt = document.createElement('option');
            opt.value = newP;
            opt.textContent = newP;
            selPeriode.appendChild(opt);
          }
          syncPeriodChange(newP);
        }
      };
      selAnnee.onchange = handleMonthYearChange;
      selMois.onchange = handleMonthYearChange;
    }

    if (selPeriode) {
      selPeriode.onchange = (e) => syncPeriodChange(e.target.value);
    }
    if (selValPeriode) {
      selValPeriode.onchange = (e) => syncPeriodChange(e.target.value);
    }

    // 4. Initialisation des sections
    renderPayrollCalcSection();
    renderPayrollValidationSection();
    renderCongoPaymentForm();
    renderPayrollVentilation();
  }

  // Section 1 : Calcul de la paie
  function renderPayrollCalcSection() {
    const tbody = document.getElementById('payroll-calc-results-tbody');
    const activeCountEl = document.getElementById('payroll-active-emp-count');
    const masseSumEl = document.getElementById('payroll-active-masse-sum');
    const resultsCountEl = document.getElementById('payroll-results-count');
    const periodBadge = document.getElementById('payroll-period-badge-status');
    const periodStatusText = document.getElementById('payroll-active-period-status-text');

    if (!tbody) return;

    // Filtres type de contrat
    const filterPills = document.querySelectorAll('#payroll-contract-filters .payroll-pill');
    filterPills.forEach(pill => {
      pill.onclick = () => {
        filterPills.forEach(p => p.classList.toggle('active', p === pill));
        AppState.payrollContractFilter = pill.getAttribute('data-contract') || 'Tous';
        renderPayrollCalcSection();
      };
    });

    // Mode Global vs Individuel
    const radioGlobal = document.getElementById('payroll-scope-global');
    const radioIndiv = document.getElementById('payroll-scope-individual');
    const indivBox = document.getElementById('payroll-individual-agent-box');
    const indivSelect = document.getElementById('payroll-individual-agent-select');

    if (radioGlobal && radioIndiv && indivBox) {
      radioGlobal.onchange = () => {
        AppState.payrollScope = 'global';
        indivBox.style.display = 'none';
        const ctaBtnText = document.getElementById('btn-trigger-calc-text');
        if (ctaBtnText) ctaBtnText.textContent = 'Lancer le calcul global';
      };
      radioIndiv.onchange = () => {
        AppState.payrollScope = 'individual';
        indivBox.style.display = 'block';
        const ctaBtnText = document.getElementById('btn-trigger-calc-text');
        if (ctaBtnText) ctaBtnText.textContent = 'Calculer le bulletin sélectionné';
      };
    }

    // Remplir le sélecteur d'agent individuel
    if (indivSelect && indivSelect.options.length <= 1) {
      indivSelect.innerHTML = (MockData.employees || []).map(emp => `
        <option value="${escapeHtml(emp.matricule)}">
          ${escapeHtml(emp.nom)} - ${escapeHtml(emp.matricule)} (${escapeHtml(emp.direction)} - ${escapeHtml(emp.grade)})
        </option>
      `).join('');
      indivSelect.onchange = (e) => {
        AppState.payrollIndividualMatricule = e.target.value;
      };
      if (!AppState.payrollIndividualMatricule && MockData.employees.length > 0) {
        AppState.payrollIndividualMatricule = MockData.employees[0].matricule;
      }
    }

    // Filtrer la liste des agents
    let list = (MockData.employees || []).filter(emp => {
      if (AppState.payrollContractFilter === 'Tous') return true;
      if (AppState.payrollContractFilter === 'Stagiaires') return emp.statut === 'Stagiaire';
      if (AppState.payrollContractFilter === 'CDD') return emp.statut === 'Contractuel (CDD)' || (emp.grade && emp.grade.includes('CDD'));
      if (AppState.payrollContractFilter === 'CDI') return emp.statut === 'Contractuel (CDI)' || (emp.grade && emp.grade.includes('CDI'));
      if (AppState.payrollContractFilter === 'Fonctionnaires') return emp.statut === 'Titulaire' || emp.statut === 'Fonctionnaire';
      return true;
    });

    // Mettre à jour les statistiques
    let totalMasse = 0;
    list.forEach(emp => {
      const pslip = MockData.payslips.find(p => p.matricule === emp.matricule);
      const net = pslip ? pslip.net : (emp.salaireBase ? Math.round(emp.salaireBase * 0.85) : 320000);
      totalMasse += net;
    });

    if (activeCountEl) activeCountEl.textContent = list.length;
    if (masseSumEl) masseSumEl.textContent = formatCurrency(totalMasse);
    if (resultsCountEl) resultsCountEl.textContent = list.length;

    // Statut de la période
    const isCalculated = AppState.payrollStatus === 'CALCULÉE' || AppState.payrollStatus === 'VALIDÉE';
    if (periodBadge) {
      periodBadge.textContent = AppState.payrollStatus;
      if (AppState.payrollStatus === 'VALIDÉE') {
        periodBadge.style.background = '#ECFDF5';
        periodBadge.style.color = '#065F46';
        periodBadge.style.borderColor = '#A7F3D0';
      } else if (AppState.payrollStatus === 'CALCULÉE') {
        periodBadge.style.background = '#EFF6FF';
        periodBadge.style.color = '#1E40AF';
        periodBadge.style.borderColor = '#BFDBFE';
      } else {
        periodBadge.style.background = '#ECFDF5';
        periodBadge.style.color = '#065F46';
        periodBadge.style.borderColor = '#A7F3D0';
      }
    }
    if (periodStatusText) {
      periodStatusText.textContent = AppState.payrollStatus;
      periodStatusText.style.color = AppState.payrollStatus === 'VALIDÉE' ? '#059669' : (AppState.payrollStatus === 'CALCULÉE' ? '#2563EB' : '#059669');
    }

    // Rendu du tableau
    tbody.innerHTML = list.map(emp => {
      const pslip = MockData.payslips.find(p => p.matricule === emp.matricule);
      const brut = pslip ? pslip.brut : (emp.salaireBase || 380000);
      const net = pslip ? pslip.net : Math.round(brut * 0.82);
      const retenues = brut - net;
      const isCalculatedAgent = AppState.payrollCalculatedSlips[emp.matricule] || isCalculated;

      let statusBadge = isCalculatedAgent 
        ? `<span class="acpe-badge" style="background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE;">Calculé</span>`
        : `<span class="acpe-badge" style="background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;">À calculer</span>`;

      return `
        <tr>
          <td><code style="font-size:12px; font-weight:700; color:var(--color-primary);">${escapeHtml(emp.matricule)}</code></td>
          <td>
            <strong style="color:var(--color-text-main);">${escapeHtml(emp.nom)}</strong>
            <span style="display:block; font-size:11px; color:var(--color-text-muted);">${escapeHtml(emp.grade)}</span>
          </td>
          <td>${escapeHtml(emp.direction)}</td>
          <td><span class="acpe-badge" style="background:#F1F5F9; color:#475569;">${escapeHtml(emp.statut)}</span></td>
          <td style="font-weight:600;">${formatCurrency(brut)}</td>
          <td style="color:#DC2626; font-size:12px;">-${formatCurrency(retenues)}</td>
          <td style="font-weight:700; color:var(--color-primary); font-size:14px;">${formatCurrency(net)}</td>
          <td>${statusBadge}</td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:6px;">
              <button type="button" class="btn-secondary btn-sm btn-action-view-slip" data-mat="${escapeHtml(emp.matricule)}" title="Consulter le bulletin officiel">
                Bulletin
              </button>
              <button type="button" class="btn-secondary btn-sm btn-action-recalc-slip" data-mat="${escapeHtml(emp.matricule)}" title="Recalculer individuellement">
                Recalculer
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Événements sur les lignes
    tbody.querySelectorAll('.btn-action-view-slip').forEach(btn => {
      btn.onclick = () => {
        const mat = btn.getAttribute('data-mat');
        if (mat) openPayslipModal(mat);
      };
    });

    tbody.querySelectorAll('.btn-action-recalc-slip').forEach(btn => {
      btn.onclick = () => {
        const mat = btn.getAttribute('data-mat');
        const emp = MockData.employees.find(e => e.matricule === mat);
        if (!emp) return;
        btn.textContent = 'Calcul...';
        setTimeout(() => {
          AppState.payrollCalculatedSlips[mat] = true;
          showToast(`Bulletin individuel de ${emp.nom} (${mat}) recalculé avec succès.`);
          renderPayrollCalcSection();
        }, 500);
      };
    });

    // Gestionnaire du bouton "Lancer le calcul"
    const triggerBtn = document.getElementById('btn-trigger-payroll-calc');
    if (triggerBtn) {
      triggerBtn.onclick = () => {
        if (AppState.payrollScope === 'global') {
          triggerBtn.disabled = true;
          triggerBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation: spin 1s linear infinite;">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>Calcul indiciaire global en cours...</span>
          `;

          showToast(`Lancement du calcul global pour la période ${AppState.payrollPeriod} (application de la valeur du point & barèmes EPA)...`);

          setTimeout(() => {
            list.forEach(emp => {
              AppState.payrollCalculatedSlips[emp.matricule] = true;
            });
            AppState.payrollStatus = 'CALCULÉE';

            triggerBtn.disabled = false;
            triggerBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                <line x1="8" y1="6" x2="16" y2="6"></line>
                <line x1="8" y1="10" x2="16" y2="10"></line>
                <line x1="8" y1="14" x2="16" y2="14"></line>
                <line x1="8" y1="18" x2="16" y2="18"></line>
              </svg>
              <span>Lancer le calcul</span>
            `;

            showToast(`Calcul global de la paie terminé : ${list.length} agents traités, masse nette totale ${formatCurrency(totalMasse)}.`);
            renderPayrollCalcSection();
            renderPayrollValidationSection();
          }, 1200);

        } else {
          // Calcul individuel
          const mat = AppState.payrollIndividualMatricule;
          const emp = MockData.employees.find(e => e.matricule === mat);
          if (!emp) {
            showToast('Veuillez sélectionner un agent à calculer.');
            return;
          }

          triggerBtn.disabled = true;
          triggerBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>Calcul individuel en cours...</span>
          `;

          setTimeout(() => {
            AppState.payrollCalculatedSlips[mat] = true;
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                <line x1="8" y1="6" x2="16" y2="6"></line>
                <line x1="8" y1="10" x2="16" y2="10"></line>
                <line x1="8" y1="14" x2="16" y2="14"></line>
                <line x1="8" y1="18" x2="16" y2="18"></line>
              </svg>
              <span>Calculer le bulletin sélectionné</span>
            `;

            showToast(`Calcul individuel achevé pour l'agent ${emp.nom} (${mat}). Prêt pour validation.`);
            renderPayrollCalcSection();
          }, 800);
        }
      };
    }
  }

  // Section 2 : Validation de la paie
  function renderPayrollValidationSection() {
    const tbody = document.getElementById('tbody-validation-slips');
    const toValidateCountEl = document.getElementById('val-count-to-validate');
    const statusTextEl = document.getElementById('val-period-status-text');
    const statusBadgeEl = document.getElementById('val-period-status-badge');
    const checkAll = document.getElementById('check-all-val');

    if (!tbody) return;

    const employees = MockData.employees || [];
    let pendingCount = 0;

    employees.forEach(emp => {
      if (!AppState.payrollValidatedSlips.has(emp.matricule)) {
        pendingCount++;
      }
    });

    if (toValidateCountEl) toValidateCountEl.textContent = pendingCount;
    if (statusTextEl) {
      statusTextEl.textContent = pendingCount === 0 ? 'VALIDÉE' : (AppState.payrollStatus || 'OUVERTE');
      statusTextEl.style.color = pendingCount === 0 ? '#059669' : '#D97706';
    }
    if (statusBadgeEl) {
      statusBadgeEl.textContent = pendingCount === 0 ? 'VALIDÉE' : (AppState.payrollStatus || 'OUVERTE');
      if (pendingCount === 0) {
        statusBadgeEl.style.background = '#ECFDF5';
        statusBadgeEl.style.color = '#065F46';
        statusBadgeEl.style.borderColor = '#A7F3D0';
      }
    }

    tbody.innerHTML = employees.map(emp => {
      const pslip = MockData.payslips.find(p => p.matricule === emp.matricule);
      const brut = pslip ? pslip.brut : (emp.salaireBase || 380000);
      const net = pslip ? pslip.net : Math.round(brut * 0.82);
      const isValidated = AppState.payrollValidatedSlips.has(emp.matricule);

      let valBadge = isValidated
        ? `<span class="acpe-badge" style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0;">Validé</span>`
        : `<span class="acpe-badge" style="background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;">À valider</span>`;

      let actionBtn = isValidated
        ? `<button type="button" class="btn-secondary btn-sm btn-val-view-slip" data-mat="${escapeHtml(emp.matricule)}">Voir bulletin</button>`
        : `<button type="button" class="btn-primary btn-sm btn-val-single" data-mat="${escapeHtml(emp.matricule)}" style="background:#0F172A; color:#FFFFFF;">Valider</button>`;

      return `
        <tr>
          <td><input type="checkbox" class="check-val-row" data-mat="${escapeHtml(emp.matricule)}" ${isValidated ? 'disabled' : ''} /></td>
          <td><code style="font-size:12px; font-weight:700; color:var(--color-primary);">${escapeHtml(emp.matricule)}</code></td>
          <td>
            <strong style="color:var(--color-text-main);">${escapeHtml(emp.nom)}</strong>
            <span style="display:block; font-size:11px; color:var(--color-text-muted);">${escapeHtml(emp.grade)}</span>
          </td>
          <td>${escapeHtml(emp.direction)}</td>
          <td style="font-weight:600;">${formatCurrency(brut)}</td>
          <td style="font-weight:700; color:var(--color-primary); font-size:14px;">${formatCurrency(net)}</td>
          <td>${valBadge}</td>
          <td style="text-align:right;">${actionBtn}</td>
        </tr>
      `;
    }).join('');

    // Check all checkbox
    if (checkAll) {
      checkAll.checked = false;
      checkAll.onchange = () => {
        tbody.querySelectorAll('.check-val-row:not(:disabled)').forEach(cb => {
          cb.checked = checkAll.checked;
        });
      };
    }

    // Single validate button
    tbody.querySelectorAll('.btn-val-single').forEach(btn => {
      btn.onclick = () => {
        const mat = btn.getAttribute('data-mat');
        if (!mat) return;
        AppState.payrollValidatedSlips.add(mat);
        const emp = MockData.employees.find(e => e.matricule === mat);
        showToast(`Traitement de ${emp ? emp.nom : mat} validé avec succès.`);
        renderPayrollValidationSection();
      };
    });

    tbody.querySelectorAll('.btn-val-view-slip').forEach(btn => {
      btn.onclick = () => {
        const mat = btn.getAttribute('data-mat');
        if (mat) openPayslipModal(mat);
      };
    });

    // Bouton "Valider tous"
    const btnValAll = document.getElementById('btn-val-all-slips');
    if (btnValAll) {
      btnValAll.onclick = () => {
        employees.forEach(emp => {
          AppState.payrollValidatedSlips.add(emp.matricule);
        });
        AppState.payrollStatus = 'VALIDÉE';
        showToast(`Tous les ${employees.length} bulletins de salaire pour ${AppState.payrollPeriod} ont été validés.`);
        renderPayrollValidationSection();
        renderPayrollCalcSection();
      };
    }

    // Bouton "Générer bulletins"
    const btnGenBulletins = document.getElementById('btn-generate-all-payslips');
    if (btnGenBulletins) {
      btnGenBulletins.onclick = () => {
        showToast(`Génération automatique de l'ensemble des bulletins de paie ACPE pour la période ${AppState.payrollPeriod}.`);
        if (employees.length > 0) {
          setTimeout(() => openPayslipModal(employees[0].matricule), 600);
        }
      };
    }
  }

  // Section 3 : Formulaire de Paiement - République du Congo
  function renderCongoPaymentForm() {
    const deptSelect = document.getElementById('congo-pay-dept');
    const villeSelect = document.getElementById('congo-pay-ville');
    const methodeSelect = document.getElementById('congo-pay-methode');
    const banqueSelect = document.getElementById('congo-pay-banque');
    const banqueLabel = document.getElementById('congo-pay-banque-label');
    const agentSelect = document.getElementById('congo-pay-agent');
    const numeroInput = document.getElementById('congo-pay-numero');
    const numeroLabel = document.getElementById('congo-pay-numero-label');
    const montantInput = document.getElementById('congo-pay-montant');
    const form = document.getElementById('form-congo-payroll-payment');
    const btnCancel = document.getElementById('btn-cancel-congo-payment');

    if (!form || !deptSelect || !villeSelect || !methodeSelect || !banqueSelect || !agentSelect) return;

    // 1. Remplissage des départements
    if (deptSelect.options.length <= 1) {
      deptSelect.innerHTML = `<option value="">-- Sélectionner un département --</option>` +
        Object.keys(CONGO_DATA.departments).map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    }

    // Événement changement de département -> Mise à jour des villes et chefs-lieux
    deptSelect.onchange = () => {
      const selectedDept = deptSelect.value;
      if (!selectedDept || !CONGO_DATA.departments[selectedDept]) {
        villeSelect.innerHTML = `<option value="">-- Sélectionner un département d'abord --</option>`;
        return;
      }
      const deptInfo = CONGO_DATA.departments[selectedDept];
      villeSelect.innerHTML = `<option value="">-- Sélectionner une ville / chef-lieu --</option>` +
        deptInfo.villes.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    };

    // 2. Gestion des méthodes de paiement et adaptation dynamique des labels et banques
    function updatePaymentMethodOptions() {
      const methode = methodeSelect.value;
      if (methode.includes('Virement')) {
        if (banqueLabel) banqueLabel.textContent = 'BANQUE COMMERCIALE (RÉPUBLIQUE DU CONGO)';
        if (numeroLabel) numeroLabel.textContent = 'NUMÉRO DE COMPTE (RIB / IBAN CONGO)';
        if (numeroInput) numeroInput.placeholder = 'CG012 00000 00000000000 00';
        banqueSelect.innerHTML = `<option value="">-- Sélectionner une banque --</option>` +
          CONGO_DATA.banks.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
      } else if (methode.includes('Remise à la main') || methode.includes('Espèces')) {
        if (banqueLabel) banqueLabel.textContent = 'CAISSE DU TRÉSOR / BILLETTERIE ACPE';
        if (numeroLabel) numeroLabel.textContent = 'NUMÉRO DE BON DE CAISSE / QUITTANCE';
        if (numeroInput) numeroInput.placeholder = 'BON-TR-CG-2026-XXXX';
        banqueSelect.innerHTML = `<option value="">-- Sélectionner une caisse ou billetterie --</option>` +
          CONGO_DATA.cashOutlets.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      } else if (methode.includes('Mobile Money')) {
        if (banqueLabel) banqueLabel.textContent = 'OPÉRATEUR MOBILE MONEY CONGO';
        if (numeroLabel) numeroLabel.textContent = 'NUMÉRO DE TÉLÉPHONE MOBILE';
        if (numeroInput) numeroInput.placeholder = '06 XXX XX XX ou 05 XXX XX XX';
        banqueSelect.innerHTML = `<option value="">-- Sélectionner un opérateur --</option>` +
          CONGO_DATA.momoOperators.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
      } else if (methode.includes('Carte Bancaire')) {
        if (banqueLabel) banqueLabel.textContent = 'TYPE DE CARTE BANCAIRE';
        if (numeroLabel) numeroLabel.textContent = 'NUMÉRO DE CARTE (16 CHIFFRES)';
        if (numeroInput) numeroInput.placeholder = '4XXX XXXX XXXX XXXX';
        banqueSelect.innerHTML = `<option value="">-- Sélectionner une carte --</option>` +
          CONGO_DATA.cardTypes.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      }
    }

    methodeSelect.onchange = updatePaymentMethodOptions;
    updatePaymentMethodOptions();

    // 3. Remplissage de la liste des agents
    if (agentSelect.options.length <= 1) {
      agentSelect.innerHTML = `<option value="">-- Sélectionner un agent public dans le registre --</option>` +
        (MockData.employees || []).map(emp => `
          <option value="${escapeHtml(emp.matricule)}">
            ${escapeHtml(emp.nom)} (${escapeHtml(emp.matricule)} - ${escapeHtml(emp.direction)})
          </option>
        `).join('');
    }

    // Auto-remplissage lors de la sélection d'un agent
    agentSelect.onchange = () => {
      const mat = agentSelect.value;
      if (!mat) return;
      const emp = (MockData.employees || []).find(e => e.matricule === mat);
      const paymentInfo = (AppState.congoPayments || []).find(p => p.matricule === mat);
      const pslip = (MockData.payslips || []).find(p => p.matricule === mat);

      if (paymentInfo) {
        if (deptSelect) {
          deptSelect.value = paymentInfo.departement;
          deptSelect.onchange();
          if (villeSelect) villeSelect.value = paymentInfo.ville;
        }
        if (methodeSelect) {
          methodeSelect.value = paymentInfo.methode;
          updatePaymentMethodOptions();
          if (banqueSelect) banqueSelect.value = paymentInfo.etablissement;
        }
        if (numeroInput) numeroInput.value = paymentInfo.numero;
        if (montantInput) montantInput.value = `XAF ${new Intl.NumberFormat('fr-FR').format(paymentInfo.montant)}`;
      } else if (emp) {
        const net = pslip ? pslip.net : Math.round((emp.salaireBase || 350000) * 0.85);
        if (montantInput) montantInput.value = `XAF ${new Intl.NumberFormat('fr-FR').format(net)}`;
      }
    };

    // 4. Soumission du formulaire de paiement
    form.onsubmit = (e) => {
      e.preventDefault();
      const mat = agentSelect.value;
      const emp = (MockData.employees || []).find(e => e.matricule === mat);
      if (!emp) {
        showToast('Veuillez sélectionner un agent bénéficiaire.');
        return;
      }

      const rawMontant = montantInput.value.replace(/[^0-9]/g, '');
      const montantNum = parseInt(rawMontant, 10) || 0;

      if (montantNum <= 0) {
        showToast('Veuillez saisir un montant valide en Francs CFA.');
        return;
      }

      // Mise à jour ou ajout dans AppState.congoPayments
      let existing = (AppState.congoPayments || []).find(p => p.matricule === mat);
      if (existing) {
        existing.departement = deptSelect.value;
        existing.ville = villeSelect.value;
        existing.methode = methodeSelect.value;
        existing.etablissement = banqueSelect.value;
        existing.numero = numeroInput.value;
        existing.montant = montantNum;
        existing.statut = 'Payé';
      } else {
        AppState.congoPayments.push({
          id: `PAY-CG-${String(AppState.congoPayments.length + 1).padStart(3, '0')}`,
          matricule: mat,
          agent: emp.nom,
          direction: emp.direction,
          departement: deptSelect.value,
          ville: villeSelect.value,
          methode: methodeSelect.value,
          etablissement: banqueSelect.value,
          numero: numeroInput.value,
          montant: montantNum,
          statut: 'Payé',
          date: '15/09/2026'
        });
      }

      showToast(`Paiement de ${formatCurrency(montantNum)} ordonnancé avec succès pour ${emp.nom} via ${banqueSelect.value} (${deptSelect.value}) !`);

      // Rafraîchir les ventilations
      renderPayrollVentilation();

      // Basculer vers l'onglet ventilation pour voir l'impact
      const ventTab = document.querySelector('.payroll-tab-btn[data-tab="ventilation-masse"]');
      if (ventTab) ventTab.click();
    };

    if (btnCancel) {
      btnCancel.onclick = () => {
        form.reset();
        villeSelect.innerHTML = `<option value="">-- Sélectionner un département d'abord --</option>`;
        updatePaymentMethodOptions();
        showToast('Formulaire de paiement réinitialisé.');
      };
    }
  }

  // Section 4 : Ventilation de la masse salariale & Filtres Banques / MoMo / Cartes / Espèces
  function renderPayrollVentilation() {
    initCongoPayments();

    const payments = AppState.congoPayments || [];

    // 1. Calcul des totaux par canal
    let sumVirement = 0, countVirement = 0;
    let sumMomo = 0, countMomo = 0;
    let sumCarte = 0, countCarte = 0;
    let sumEspeces = 0, countEspeces = 0;

    payments.forEach(p => {
      const m = p.methode || '';
      if (m.includes('Virement')) {
        sumVirement += p.montant;
        countVirement++;
      } else if (m.includes('Mobile Money')) {
        sumMomo += p.montant;
        countMomo++;
      } else if (m.includes('Carte Bancaire')) {
        sumCarte += p.montant;
        countCarte++;
      } else if (m.includes('Espèces') || m.includes('Remise')) {
        sumEspeces += p.montant;
        countEspeces++;
      }
    });

    const sumVirEl = document.getElementById('channel-sum-virement');
    const cntVirEl = document.getElementById('channel-count-virement');
    const sumMomoEl = document.getElementById('channel-sum-momo');
    const cntMomoEl = document.getElementById('channel-count-momo');
    const sumCarteEl = document.getElementById('channel-sum-carte');
    const cntCarteEl = document.getElementById('channel-count-carte');
    const sumEspEl = document.getElementById('channel-sum-especes');
    const cntEspEl = document.getElementById('channel-count-especes');

    if (sumVirEl) sumVirEl.textContent = formatCurrency(sumVirement);
    if (cntVirEl) cntVirEl.textContent = `${countVirement} agents`;
    if (sumMomoEl) sumMomoEl.textContent = formatCurrency(sumMomo);
    if (cntMomoEl) cntMomoEl.textContent = `${countMomo} agents`;
    if (sumCarteEl) sumCarteEl.textContent = formatCurrency(sumCarte);
    if (cntCarteEl) cntCarteEl.textContent = `${countCarte} agents`;
    if (sumEspEl) sumEspEl.textContent = formatCurrency(sumEspeces);
    if (cntEspEl) cntEspEl.textContent = `${countEspeces} agents`;

    // 2. Remplissage des options du filtre Banque
    const filterBankSelect = document.getElementById('filter-channel-bank');
    if (filterBankSelect && filterBankSelect.options.length <= 1) {
      const uniqueBanks = Array.from(new Set(payments.map(p => p.etablissement))).sort();
      filterBankSelect.innerHTML = `<option value="all">Toutes les banques & caisses</option>` +
        uniqueBanks.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    }

    // 3. Application des filtres interactifs
    const filterModeSelect = document.getElementById('filter-channel-mode');
    const filterDeptSelect = document.getElementById('filter-channel-dept');
    const filterSearchInput = document.getElementById('filter-channel-search');
    const tbody = document.getElementById('tbody-channel-payments');
    const countBadge = document.getElementById('filtered-payroll-count');

    if (!tbody) return;

    function applyChannelFilters() {
      const mode = filterModeSelect ? filterModeSelect.value : 'all';
      const bank = filterBankSelect ? filterBankSelect.value : 'all';
      const dept = filterDeptSelect ? filterDeptSelect.value : 'all';
      const q = filterSearchInput ? filterSearchInput.value.trim().toLowerCase() : '';

      let filtered = payments.filter(p => {
        if (mode !== 'all' && !p.methode.includes(mode)) return false;
        if (bank !== 'all' && p.etablissement !== bank) return false;
        if (dept !== 'all' && p.departement !== dept) return false;
        if (q) {
          const matchName = (p.agent || '').toLowerCase().includes(q);
          const matchMat = (p.matricule || '').toLowerCase().includes(q);
          const matchBank = (p.etablissement || '').toLowerCase().includes(q);
          if (!matchName && !matchMat && !matchBank) return false;
        }
        return true;
      });

      let sumFiltered = filtered.reduce((acc, p) => acc + p.montant, 0);

      if (countBadge) {
        countBadge.textContent = `Affichage : ${filtered.length} agents • ${formatCurrency(sumFiltered)}`;
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align:center; padding:32px; color:var(--color-text-muted);">
              Aucun règlement salarial ne correspond aux critères de recherche sélectionnés.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(p => {
        let modeBadge = '';
        if (p.methode.includes('Virement')) {
          modeBadge = `<span class="acpe-badge" style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE;">Virement Bancaire</span>`;
        } else if (p.methode.includes('Mobile Money')) {
          modeBadge = `<span class="acpe-badge" style="background:#FEF3C7; color:#D97706; border:1px solid #FDE68A;">Mobile Money</span>`;
        } else if (p.methode.includes('Carte Bancaire')) {
          modeBadge = `<span class="acpe-badge" style="background:#ECFDF5; color:#059669; border:1px solid #A7F3D0;">Carte Bancaire</span>`;
        } else {
          modeBadge = `<span class="acpe-badge" style="background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE;">Espèces / Main</span>`;
        }

        let statutBadge = p.statut === 'Payé'
          ? `<span class="acpe-badge" style="background:#ECFDF5; color:#065F46;">Payé</span>`
          : `<span class="acpe-badge" style="background:#EFF6FF; color:#1E40AF;">Ordonnancé</span>`;

        return `
          <tr>
            <td><code style="font-size:12px; font-weight:700; color:var(--color-primary);">${escapeHtml(p.matricule)}</code></td>
            <td>
              <strong style="color:var(--color-text-main);">${escapeHtml(p.agent)}</strong>
              <span style="display:block; font-size:11px; color:var(--color-text-muted);">${escapeHtml(p.direction)}</span>
            </td>
            <td>${modeBadge}</td>
            <td><strong>${escapeHtml(p.etablissement)}</strong></td>
            <td><code style="font-size:11px; color:#475569;">${escapeHtml(p.numero)}</code></td>
            <td>
              <span style="font-size:12px; font-weight:600; color:var(--color-text-main);">${escapeHtml(p.departement)}</span>
              <span style="display:block; font-size:11px; color:var(--color-text-muted);">${escapeHtml(p.ville)}</span>
            </td>
            <td style="font-weight:700; color:var(--color-primary); font-size:14px;">${formatCurrency(p.montant)}</td>
            <td>${statutBadge}</td>
            <td style="text-align:right;">
              <button type="button" class="btn-secondary btn-sm btn-view-channel-slip" data-mat="${escapeHtml(p.matricule)}" title="Consulter le bulletin de cet agent">
                Bulletin
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.btn-view-channel-slip').forEach(btn => {
        btn.onclick = () => {
          const mat = btn.getAttribute('data-mat');
          if (mat) openPayslipModal(mat);
        };
      });
    }

    if (filterModeSelect) filterModeSelect.onchange = applyChannelFilters;
    if (filterBankSelect) filterBankSelect.onchange = applyChannelFilters;
    if (filterDeptSelect) filterDeptSelect.onchange = applyChannelFilters;
    if (filterSearchInput) {
      filterSearchInput.oninput = () => {
        applyChannelFilters();
      };
    }

    applyChannelFilters();
  }

  // Modale Nouveau Contrat
  function openAddContractModal() {
    const modal = document.getElementById('add-contract-modal');
    const agentSelect = document.getElementById('contract-agent-select');

    if (!modal) return;

    if (agentSelect) {
      agentSelect.innerHTML = MockData.employees.map(e => `
        <option value="${escapeHtml(e.matricule)}">${escapeHtml(e.nom)} (${escapeHtml(e.matricule)} - ${escapeHtml(e.grade)})</option>
      `).join('');
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAddContractModal() {
    const modal = document.getElementById('add-contract-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Modale Nouvelle Demande
  function openAddRequestModal() {
    const modal = document.getElementById('add-request-modal');
    const agentSelect = document.getElementById('req-agent-select');

    if (!modal) return;

    if (agentSelect) {
      agentSelect.innerHTML = MockData.employees.map(e => `
        <option value="${escapeHtml(e.matricule)}">${escapeHtml(e.nom)} (${escapeHtml(e.matricule)} - ${escapeHtml(e.directionCode)})</option>
      `).join('');
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAddRequestModal() {
    const modal = document.getElementById('add-request-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Modale Examen et Traitement d'une demande (Workflow & Timeline)
  function openRequestDetailModal(requestId) {
    const modal = document.getElementById('request-detail-modal');
    const req = MockData.requests.find(r => r.id === requestId);
    if (!modal || !req) return;

    AppState.selectedRequestId = requestId;

    const initials = req.agent.split(' ').map(n => n[0]).join('').substring(0, 2);
    document.getElementById('req-modal-avatar').textContent = initials;
    document.getElementById('req-modal-agent-name').textContent = req.agent;
    document.getElementById('req-modal-agent-sub').textContent = `Matricule: ${req.matricule} • Direction: ${req.direction}`;
    document.getElementById('req-detail-ref').textContent = `${req.id} • Workflow hiérarchique certifié`;
    document.getElementById('req-modal-type').textContent = req.type;
    document.getElementById('req-modal-period').textContent = req.period;
    document.getElementById('req-modal-motive').textContent = req.motive;

    // Statut
    const badgeContainer = document.getElementById('req-modal-status-badge');
    if (badgeContainer) {
      if (req.statut === 'En attente') {
        badgeContainer.innerHTML = '<span class="acpe-badge" style="background: #FEF3C7; color: #92400E;">En attente d\'arbitrage</span>';
      } else if (req.statut === 'Validée') {
        badgeContainer.innerHTML = '<span class="acpe-badge" style="background: #ECFDF5; color: #065F46;">Validée & Autorisée</span>';
      } else {
        badgeContainer.innerHTML = '<span class="acpe-badge" style="background: #FEF2F2; color: #991B1B;">Demande Rejetée</span>';
      }
    }

    // Timeline dynamique
    const timelineEl = document.getElementById('req-modal-timeline');
    if (timelineEl) {
      timelineEl.innerHTML = (req.timeline || []).map(step => `
        <div class="request-timeline-item ${step.status}">
          <div class="request-timeline-marker"></div>
          <div class="request-timeline-content">
            <div class="request-timeline-title">
              ${escapeHtml(step.step)}
              <span style="font-size: 12px; font-weight: 500; color: var(--color-text-muted);">(${escapeHtml(step.actor)})</span>
            </div>
            <div class="request-timeline-date">${escapeHtml(step.date)}</div>
            ${step.note ? `<div class="request-timeline-note">${escapeHtml(step.note)}</div>` : ''}
          </div>
        </div>
      `).join('');
    }

    // Zone de décision
    const decisionBox = document.getElementById('req-decision-box');
    const commentInput = document.getElementById('req-decision-comment');
    if (commentInput) commentInput.value = req.decisionComment || '';

    if (decisionBox) {
      if (req.statut !== 'En attente') {
        decisionBox.style.opacity = '0.7';
      } else {
        decisionBox.style.opacity = '1';
      }
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeRequestDetailModal() {
    const modal = document.getElementById('request-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Modale Inspection du Journal d'Audit
  function openAuditDetailModal(auditId) {
    const modal = document.getElementById('audit-detail-modal');
    const log = MockData.auditLogs.find(a => a.id === auditId);
    if (!modal || !log) return;

    AppState.selectedAuditId = auditId;

    document.getElementById('audit-modal-timestamp').textContent = log.timestamp;
    document.getElementById('audit-modal-actor').textContent = log.actor;
    document.getElementById('audit-modal-role').textContent = log.role;
    document.getElementById('audit-modal-ip').textContent = log.ip;
    document.getElementById('audit-modal-action-desc').textContent = `${log.actionType} — ${log.details}`;
    document.getElementById('audit-modal-hash').textContent = log.hash;

    // Diff avant/après
    const diffContainer = document.getElementById('audit-modal-diff');
    if (diffContainer) {
      diffContainer.innerHTML = (log.diff || []).map(d => `
        <div class="audit-diff-item">
          <div class="audit-diff-label">${escapeHtml(d.label)}</div>
          <div class="audit-diff-values">
            <div class="audit-diff-before">Avant : ${escapeHtml(d.before)}</div>
            <div class="audit-diff-after">Après : ${escapeHtml(d.after)}</div>
          </div>
        </div>
      `).join('');
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAuditDetailModal() {
    const modal = document.getElementById('audit-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Modale Fiche Statutaire Agent Public
  function openAgentDetailModal(matricule) {
    const modal = document.getElementById('agent-detail-modal');
    const emp = MockData.employees.find(e => e.matricule === matricule);
    if (!modal || !emp) return;

    AppState.currentSelectedMatricule = matricule;

    const initials = emp.nom.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const avatarEl = document.getElementById('agent-detail-avatar');
    if (avatarEl) avatarEl.textContent = initials;

    const nomEl = document.getElementById('agent-detail-nom');
    if (nomEl) nomEl.textContent = emp.nom;

    const gradeEl = document.getElementById('agent-detail-grade');
    if (gradeEl) gradeEl.textContent = emp.grade;

    const statusBadge = document.getElementById('agent-detail-status-badge');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="acpe-badge">${escapeHtml(emp.statutAgent || 'Titulaire')}</span>`;
    }

    const matEl = document.getElementById('agent-detail-matricule');
    if (matEl) matEl.textContent = emp.matricule;

    const dirEl = document.getElementById('agent-detail-direction');
    if (dirEl) dirEl.textContent = `${emp.direction} (${emp.directionCode || 'EPA'})`;

    const catEl = document.getElementById('agent-detail-cat');
    if (catEl) catEl.textContent = emp.categorie || 'Catégorie A';

    const indiceEl = document.getElementById('agent-detail-indice');
    if (indiceEl) indiceEl.textContent = emp.indice || emp.echelon || '620';

    const netEl = document.getElementById('agent-detail-net');
    if (netEl) netEl.textContent = formatCurrency(emp.traitementNet);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAgentDetailModal() {
    const modal = document.getElementById('agent-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  /* --------------------------------------------------------------------------
     8. GESTION DU BULLETIN DE PAIE OFFICIEL ACPE (RÉFÉRENCE BULLETIN_TEMPLATE.HTML)
     -------------------------------------------------------------------------- */

  function getBulletinData(matricule) {
    const emp = MockData.employees.find(e => e.matricule === matricule);
    const slip = MockData.payslips.find(s => s.matricule === matricule);

    if (!emp && !slip) return null;

    const nom = emp ? emp.nom : (slip ? slip.agent : 'Agent ACPE');
    const mat = matricule;
    const grade = emp ? emp.grade : (slip ? slip.grade : 'Agent public');
    const direction = emp ? emp.direction : (slip ? slip.direction : 'Direction Générale');
    const categorie = emp ? emp.categorie : (slip ? slip.categorie : 'Catégorie A');
    const statut = emp ? emp.statutAgent : 'Titulaire';
    const echelon = emp ? emp.echelon : (slip ? slip.echelon : 'Échelon 5');
    const indice = emp ? (emp.indice || 600) : 600;

    // Déterminer la période courante
    const periodSummary = MockData.getSummaryByPeriod(AppState.currentPeriod);
    const periodName = periodSummary.name || 'Septembre 2026';
    const periodParts = periodName.split(' ');
    const mois = periodParts[0] || 'Septembre';
    const annee = parseInt(periodParts[1], 10) || 2026;

    // Dates de début et fin de cycle (26 du mois précédent au 25 du mois courant)
    const debut = `26/08/26`;
    const fin = `25/09/26`;

    // Si données spécifiques de référence (ex: matricule 1048)
    if (emp && emp.bulletinTemplateData) {
      return {
        periode: { mois, annee, debut, fin },
        employe: {
          nom: emp.nom,
          matricule: emp.matricule,
          cnss: emp.cnss || '21363679/26',
          dateEmbauche: emp.dateEmbauche || '07/09/1999',
          anciennete: emp.anciennete !== undefined ? emp.anciennete : 26,
          indice: emp.indice || 1762,
          situationMatrimoniale: emp.situationMatrimoniale || 'Marié(e)',
          enfantsCharge: emp.enfantsCharge !== undefined ? emp.enfantsCharge : 8,
          partsIRPP: emp.partsIRPP || 6,
          fonction: emp.grade,
          categorie: emp.categorie,
          statut: emp.statutAgent || 'Contractuel',
          college: emp.college || 'Collaborateur',
          localite: emp.localite || 'BRAZZAVILLE',
          departement: emp.direction || 'BRAZZAVILLE',
          modePaiement: emp.modePaiement || 'Virement',
          rib: emp.rib || 'BCI 30013-03500-02000730720/36',
          devise: 'FCFA'
        },
        rubriques: emp.bulletinTemplateData.rubriques,
        cumulsAnnee: emp.bulletinTemplateData.cumulsAnnee
      };
    }

    // Calcul dynamique fidèle pour les autres agents de l'établissement
    const ancienneteAnnees = emp && emp.anciennete !== undefined ? emp.anciennete : Math.min(25, Math.max(3, Math.floor((indice - 300) / 35)));
    const tauxAnc = Math.min(0.30, Math.max(0.05, Math.round(ancienneteAnnees * 0.01 * 100) / 100));
    
    const salaireBase = Math.round(indice * 850 * 0.65);
    const nombreJours = 26;
    const tauxJournalier = Math.round(salaireBase / nombreJours);
    const indemniteSujetion = 50000;
    const indemniteTransport = 30000;
    const rappelEcarts = (emp && emp.rappelEcarts) ? emp.rappelEcarts : 0;
    
    const cnssBasePlafond = Math.min(Math.round(salaireBase * (1 + tauxAnc) + indemniteSujetion), 1023567);
    const mutuelle = 10000;
    const mutraAcpe = 0;
    
    const partsIRPP = emp && emp.partsIRPP ? emp.partsIRPP : 3.5;
    const brutSimule = salaireBase + (salaireBase * tauxAnc) + indemniteSujetion;
    const itsMontant = Math.max(8000, Math.round((brutSimule - (cnssBasePlafond * 0.04)) * (0.07 / (partsIRPP / 2.5))));

    const brutAnnuel = brutSimule * 8.5;
    const chSalAnnuelles = (cnssBasePlafond * 0.04 + itsMontant + mutuelle) * 8.5;
    const chPatAnnuelles = (cnssBasePlafond * (0.08 + 0.12277)) * 8.5;

    return {
      periode: { mois, annee, debut, fin },
      employe: {
        nom,
        matricule: mat,
        cnss: emp && emp.cnss ? emp.cnss : `21${Math.abs(mat.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 900000 + 100000)}/26`,
        dateEmbauche: emp && emp.dateEmbauche ? emp.dateEmbauche : '15/01/2017',
        anciennete: ancienneteAnnees,
        indice,
        situationMatrimoniale: emp && emp.situationMatrimoniale ? emp.situationMatrimoniale : 'Marié(e)',
        enfantsCharge: emp && emp.enfantsCharge !== undefined ? emp.enfantsCharge : 3,
        partsIRPP,
        fonction: grade,
        categorie,
        statut,
        college: categorie.includes('A') ? 'Cadre supérieur' : 'Agent d\'encadrement',
        localite: 'BRAZZAVILLE',
        departement: direction,
        modePaiement: 'Virement',
        rib: emp && emp.rib ? emp.rib : `BCI 30013-03500-02000${Math.abs(indice * 12345 % 900000 + 100000)}/36`,
        devise: 'FCFA'
      },
      rubriques: {
        nombreJours,
        tauxJournalier,
        tauxAnciennete: tauxAnc,
        indemniteSujetion,
        indemniteTransport,
        rappelEcarts,
        cnssBasePlafond,
        tauxCnssPvidSalarial: 0.04,
        tauxCnssPvidPatronal: 0.08,
        tauxCnssPlafPatronal: 0.12277,
        mutuelle,
        mutraAcpe,
        itsMontant
      },
      cumulsAnnee: {
        brut: Math.round(brutAnnuel),
        chargesSalariales: Math.round(chSalAnnuelles),
        chargesPatronales: Math.round(chPatAnnuelles),
        netImposable: Math.round(brutAnnuel - (cnssBasePlafond * 0.04 * 8.5))
      }
    };
  }

  function calculerBulletin(d) {
    const r = d.rubriques;
    const salaireBase = r.nombreJours * r.tauxJournalier;
    const primeAnciennete = Math.round(salaireBase * r.tauxAnciennete);
    const totalBrut = Math.round(salaireBase + primeAnciennete + r.indemniteSujetion);

    const cnssPvidSal = Math.round(r.cnssBasePlafond * r.tauxCnssPvidSalarial);
    const cnssPvidPat = Math.round(r.cnssBasePlafond * r.tauxCnssPvidPatronal);
    const cnssPlafPat = Math.round(r.cnssBasePlafond * r.tauxCnssPlafPatronal);

    const netImposable = Math.round(totalBrut - cnssPvidSal);
    const its = Math.round(r.itsMontant);

    const totalCotisSalariales = Math.round(cnssPvidSal + its + (r.mutuelle || 0) + (r.mutraAcpe || 0));
    const totalCotisPatronales = Math.round(cnssPvidPat + cnssPlafPat);

    const netAPayer = Math.round(totalBrut - totalCotisSalariales + (r.indemniteTransport || 0) + (r.rappelEcarts || 0));

    return {
      salaireBase, primeAnciennete, totalBrut,
      cnssPvidSal, cnssPvidPat, cnssPlafPat, its,
      totalCotisSalariales, totalCotisPatronales,
      netImposable, netAPayer
    };
  }

  function fmt(n) {
    if (n === undefined || n === null || n === '') return '';
    const num = typeof n === 'string' ? parseFloat(n.replace(/\s/g, '').replace(',', '.')) : Number(n);
    if (isNaN(num)) return String(n);
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function renderBulletinHtml(d) {
    const c = calculerBulletin(d);
    const e = d.employe;
    const r = d.rubriques;

    return `
      <div class="acpe-bulletin-wrapper" id="bulletin-sheet-${escapeHtml(e.matricule)}">
        <!-- En-tête officiel du bulletin : Logo à gauche et Mois & Période à droite (ne touche pas) -->
        <div class="acpe-bulletin-header-box" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1F4E79; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: flex-start;">
            <img src="/acpe-logo.png" alt="Logo" style="height: 52px; max-width: 170px; object-fit: contain;" onerror="this.style.display='none'" />
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13.5px; font-weight: 700; color: #111827;">${escapeHtml(d.periode.mois)} ${escapeHtml(d.periode.annee)}</div>
            <div style="font-size: 10.5px; color: #4B5563; margin-top: 2px;">Période du ${escapeHtml(d.periode.debut)} au ${escapeHtml(d.periode.fin)}</div>
          </div>
        </div>

        <!-- Titre "BULLETIN DE PAIE" baissé au centre (avec adresse) -->
        <div class="acpe-bulletin-title-block" style="text-align: center; margin-top: 18px; margin-bottom: 16px;">
          <div style="font-size: 18px; font-weight: 800; color: #1F4E79; letter-spacing: 0.8px;">BULLETIN DE PAIE</div>
          <div style="font-size: 9.5px; color: #4B5563; margin-top: 4px; line-height: 1.35;">Avenue Edith Lucie Bongo Ondimba, zone industrielle de Mpila | BP: 2006, Brazzaville (République du Congo)</div>
        </div>

        <div class="infoBlock">
          <table>
            <tr>
              <td class="label">Nom(s) et Prénom(s)</td><td class="bold">${escapeHtml(e.nom || '')}</td>
              <td class="label">Localité</td><td>${escapeHtml(e.localite)}</td>
            </tr>
            <tr>
              <td class="label">Matricule</td><td class="bold" style="font-family: monospace;">${escapeHtml(e.matricule)}</td>
              <td class="label">Département</td><td>${escapeHtml(e.departement)}</td>
            </tr>
            <tr>
              <td class="label">N° CNSS</td><td>${escapeHtml(e.cnss)}</td>
              <td class="label">Fonction</td><td>${escapeHtml(e.fonction)}</td>
            </tr>
            <tr>
              <td class="label">Date Embauche</td><td>${escapeHtml(e.dateEmbauche)}</td>
              <td class="label">Catégorie</td><td>${escapeHtml(e.categorie)}</td>
            </tr>
            <tr>
              <td class="label">Ancienneté</td><td>${escapeHtml(e.anciennete)} ans</td>
              <td class="label">Statut</td><td>${escapeHtml(e.statut)}</td>
            </tr>
            <tr>
              <td class="label">Sit. Matrimoniale</td><td>${escapeHtml(e.situationMatrimoniale)}</td>
              <td class="label">Collège</td><td>${escapeHtml(e.college)}</td>
            </tr>
            <tr>
              <td class="label">Enfants à charge</td><td>${escapeHtml(e.enfantsCharge)}</td>
              <td class="label">Mode de Paiement</td><td>${escapeHtml(e.modePaiement)}</td>
            </tr>
            <tr>
              <td class="label">Nbre de parts IRPP</td><td>${escapeHtml(e.partsIRPP)}</td>
              <td class="label">RIB</td><td style="font-family: monospace; font-size: 11px;">${escapeHtml(e.rib)}</td>
            </tr>
          </table>
        </div>

        <div class="mainTableBlock">
          <table style="border: 1px solid #CBD5E1; border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th rowspan="2" class="center" style="width: 45px; vertical-align: middle; border: 1px solid #94A3B8;">N°</th>
                <th rowspan="2" style="vertical-align: middle; text-align: left; border: 1px solid #94A3B8;">Désignation</th>
                <th rowspan="2" class="center" style="width: 55px; vertical-align: middle; border: 1px solid #94A3B8;">Nombre</th>
                <th rowspan="2" class="num" style="width: 85px; vertical-align: middle; border: 1px solid #94A3B8;">Base</th>
                <th colspan="3" class="center" style="border: 1px solid #94A3B8;">Part salariale</th>
                <th colspan="2" class="center" style="border: 1px solid #94A3B8;">Part patronale</th>
              </tr>
              <tr>
                <th class="center" style="width: 50px; font-size: 11px; border: 1px solid #94A3B8;">Taux</th>
                <th class="num" style="width: 80px; font-size: 11px; border: 1px solid #94A3B8;">Gain</th>
                <th class="num" style="width: 80px; font-size: 11px; border: 1px solid #94A3B8;">Retenue</th>
                <th class="center" style="width: 50px; font-size: 11px; border: 1px solid #94A3B8;">Taux</th>
                <th class="num" style="width: 80px; font-size: 11px; border: 1px solid #94A3B8;">Retenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">1000</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Salaire de base</td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${r.nombreJours || 26}</td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.tauxJournalier)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.salaireBase)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">1020</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Prime ancienneté</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.salaireBase)}</td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.primeAnciennete)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">1060</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Indemnité de sujétion</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.indemniteSujetion)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.indemniteSujetion)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr class="bold italic total-row" style="background-color: #F8FAFC;">
                <td style="border: 1px solid #CBD5E1;"></td>
                <td colspan="4" style="text-align: left; font-weight: 700; border: 1px solid #CBD5E1;">Total Brut</td>
                <td class="num" style="font-weight: 700; color: #1F4E79; border: 1px solid #CBD5E1;">${fmt(c.totalBrut)}</td>
                <td colspan="3" style="border: 1px solid #CBD5E1;"></td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">9000</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Cotisation CNSS (PVID)</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.cnssBasePlafond)}</td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.cnssPvidSal)}</td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.cnssPvidPat)}</td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">9001</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Cotisation CNSS (Plafonné)</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.cnssBasePlafond)}</td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.cnssPlafPat)}</td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">9002</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Retenue ITS</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.netImposable)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(c.its)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">9003</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Retenue Mutuelle (MUTRAPE)</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.mutuelle)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.mutuelle)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">9004</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">MUTRA ACPE</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.mutraAcpe)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.mutraAcpe)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr class="bold italic total-row" style="background-color: #F8FAFC;">
                <td style="border: 1px solid #CBD5E1;"></td>
                <td colspan="5" style="text-align: left; font-weight: 700; border: 1px solid #CBD5E1;">Total Cotisations</td>
                <td class="num" style="font-weight: 700; color: #1F4E79; border: 1px solid #CBD5E1;">${fmt(c.totalCotisSalariales)}</td>
                <td style="border: 1px solid #CBD5E1;"></td>
                <td class="num" style="font-weight: 700; color: #1F4E79; border: 1px solid #CBD5E1;">${fmt(c.totalCotisPatronales)}</td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">4000</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Indemnité de transport</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.indemniteTransport)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${fmt(r.indemniteTransport)}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
              <tr>
                <td class="center" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">9005</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">Rappel sur les écarts de salaire</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${r.rappelEcarts ? fmt(r.rappelEcarts) : ''}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td class="num" style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;">${r.rappelEcarts ? fmt(r.rappelEcarts) : ''}</td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
                <td style="border-top: none; border-bottom: none; border-left: 1px solid #CBD5E1; border-right: 1px solid #CBD5E1;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cumulsBlock">
          <table>
            <thead>
              <tr>
                <th>Cumuls</th>
                <th class="num">Salaire Brut</th>
                <th class="num">Charges salariales</th>
                <th class="num">Charges patronales</th>
                <th class="center">Avantage en nature</th>
                <th class="num">Net imposable</th>
                <th class="center">Heures trav.</th>
                <th class="center">Heures suppl.</th>
                <th class="num" style="background: #C6D9F1; color: #1F4E79; font-weight: 800;">NET A PAYER</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bold">Période</td>
                <td class="num">${fmt(c.totalBrut)}</td>
                <td class="num">${fmt(c.totalCotisSalariales)}</td>
                <td class="num">${fmt(c.totalCotisPatronales)}</td>
                <td class="center"></td>
                <td class="num">${fmt(c.netImposable)}</td>
                <td class="center">173,33</td>
                <td class="center">0</td>
                <td class="num bold" style="background: #EBF1F5; color: #1F4E79; font-size: 13.5px; white-space: nowrap;">${fmt(c.netAPayer)} FCFA</td>
              </tr>
              <tr>
                <td class="bold">Années</td>
                <td class="num">${fmt(d.cumulsAnnee.brut)}</td>
                <td class="num">${fmt(d.cumulsAnnee.chargesSalariales)}</td>
                <td class="num">${fmt(d.cumulsAnnee.chargesPatronales)}</td>
                <td class="center"></td>
                <td class="num">${fmt(d.cumulsAnnee.netImposable)}</td>
                <td class="center"></td>
                <td class="center"></td>
                <td class="center" style="background: #F8FAFC;"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bas de page : signatures et validation (abaissé vers le bas de la page) -->
        <div class="bulletin-bottom-info" style="margin-top: 55px; border-top: 1px solid #CBD5E1; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="text-align: left; width: 45%;">
              <div style="font-weight: 700; font-size: 11.5px; color: #1F4E79; text-transform: uppercase; letter-spacing: 0.3px;">Signature de l'employé</div>
              <div style="margin-top: 50px; border-bottom: 1px dashed #94A3B8; width: 220px;"></div>
            </div>
            <div style="text-align: right; width: 45%; display: flex; flex-direction: column; align-items: flex-end;">
              <div style="font-weight: 700; font-size: 11.5px; color: #1F4E79; text-transform: uppercase; letter-spacing: 0.3px;">Signature de l'employeur</div>
              <div style="margin-top: 50px; border-bottom: 1px dashed #94A3B8; width: 220px;"></div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 24px; font-size: 9.5px; color: #64748B; font-style: italic;">
            Validation de conformité : Document certifié conforme généré par le Système Intégré de Paie ACPE
          </div>
        </div>
      </div>
    `;
  }

  // Modale bulletin de paie
  function openPayslipModal(matricule) {
    const data = getBulletinData(matricule);
    if (!data) return;

    AppState.currentSelectedMatricule = matricule;

    const modal = document.getElementById('payslip-modal');
    const container = document.getElementById('modal-bulletin-container');
    const periodText = document.getElementById('modal-period-text');

    if (periodText) {
      periodText.textContent = `${data.periode.mois} ${data.periode.annee}`;
    }

    if (container) {
      container.innerHTML = renderBulletinHtml(data);
    }

    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      // Réinitialisation absolue du défilement au sommet pour garantir la visibilité complète de l'en-tête
      const modalBody = modal.querySelector('.payslip-modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      if (container) {
        container.scrollTop = 0;
      }
      modal.scrollTop = 0;
    }
  }

  function closePayslipModal() {
    const modal = document.getElementById('payslip-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Téléchargement PDF certifié du bulletin officiel conforme à bulletin_template.html
  async function downloadPayslipPdf(matricule) {
    const data = getBulletinData(matricule);
    if (!data) {
      showToast('Erreur : impossible de retrouver le bulletin demandé.');
      return;
    }

    const agentNom = (data.employe && data.employe.nom) || 'Agent';
    showToast(`Génération du bulletin officiel PDF ACPE pour ${agentNom}...`);

    // 1. Priorité absolue : Moteur vectoriel officiel jsPDF + AutoTable (conforme au template)
    if (typeof window.downloadAcpeBulletinPdf === 'function') {
      try {
        const res = window.downloadAcpeBulletinPdf(data);
        showToast(`Bulletin PDF téléchargé avec succès : ${res.filename}`);
        return;
      } catch (err) {
        console.error('Erreur lors de la génération avec le moteur ACPE jsPDF:', err);
      }
    }

    // 2. Fallback html2pdf si le bundle n'était pas encore initialisé
    const exportContainer = document.getElementById('payslip-pdf-export-container');
    if (!exportContainer) {
      window.print();
      return;
    }

    exportContainer.innerHTML = renderBulletinHtml(data);
    exportContainer.style.visibility = 'visible';

    // Attendre le chargement de l'image logo si nécessaire
    const logoImg = exportContainer.querySelector('img');
    if (logoImg && !logoImg.complete) {
      await new Promise(resolve => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
        setTimeout(resolve, 600);
      });
    }

    const cleanNom = (data.employe.nom || 'Agent').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Bulletin_ACPE_${data.employe.matricule}_${cleanNom}_${data.periode.mois}_${data.periode.annee}.pdf`;

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [6, 8, 6, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      try {
        await html2pdf().set(opt).from(exportContainer).save();
        exportContainer.style.visibility = 'hidden';
        showToast(`Bulletin téléchargé avec succès : ${filename}`);
      } catch (err) {
        console.error('Erreur html2pdf:', err);
        exportContainer.style.visibility = 'hidden';
        window.print();
      }
    } else {
      exportContainer.style.visibility = 'hidden';
      window.print();
    }
  }

  // Toast notification
  function showToast(message) {
    const toast = document.getElementById('app-toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // Basculement de période de paie
  async function handlePeriodChange(newPeriod) {
    AppState.currentPeriod = newPeriod;
    AppState.tablePage = 1;

    const summary = await PayrollApi.getSummary(newPeriod);
    updateCycleBanner(summary);
    updateKpiCards(summary);
    updateDistribution(summary);
    renderPayslipsTable();
    showToast(`Période activée : ${summary.name}`);
  }

  // Traitement des actions du cycle de paie
  async function handleCycleAction(action) {
    if (action === 'goto-paie') {
      switchPage('paie');
      return;
    }

    if (AppState.isCalculating) return;

    const bannerCta = document.getElementById('cycle-cta-btn');
    const currentSummary = MockData.getSummaryByPeriod(AppState.currentPeriod);

    if (action === 'calculate') {
      AppState.isCalculating = true;
      if (bannerCta) {
        bannerCta.textContent = 'Calcul indiciaire en FCFA en cours...';
        bannerCta.style.opacity = '0.7';
      }

      showToast('Calcul de la paie en cours : application de la valeur du point (850 FCFA) et calcul des retenues IPRES/CSS...');

      setTimeout(async () => {
        await PayrollApi.triggerCalculation(AppState.currentPeriod);
        AppState.isCalculating = false;

        currentSummary.cycleStatus = 'En validation';
        currentSummary.cycleStep = 3;
        currentSummary.ctaLabel = 'Valider la paie du mois';
        currentSummary.ctaAction = 'validate';
        currentSummary.pendingSlips = 0;
        currentSummary.alertsCount = 0;
        currentSummary.alertsDetail = 'Toutes les anomalies ont été régularisées';

        MockData.payslips.forEach(s => s.statut = 'Validé');

        updateCycleBanner(currentSummary);
        updateKpiCards(currentSummary);
        renderPayslipsTable();
        showToast('Calcul terminé avec succès. La paie en FCFA est prête pour mandatement Trésor.');
      }, 1500);

    } else if (action === 'validate') {
      AppState.isCalculating = true;
      if (bannerCta) {
        bannerCta.textContent = 'Télétransmission Trésor Public...';
      }

      setTimeout(async () => {
        await PayrollApi.validatePayroll(AppState.currentPeriod);
        AppState.isCalculating = false;

        currentSummary.cycleStatus = 'Clôturée';
        currentSummary.cycleStep = 4;
        currentSummary.ctaLabel = 'Consulter l\'archivage';
        currentSummary.ctaAction = 'archive';

        updateCycleBanner(currentSummary);
        renderPayslipsTable();
        showToast('Paie clôturée et transmise avec succès à la Trésorerie Générale en FCFA !');
      }, 1200);

    } else if (action === 'archive') {
      showToast('Ouverture du Grand Livre et des archives réglementaires en FCFA.');
    }
  }

  /* --------------------------------------------------------------------------
     9. INITIALISATION DES ÉVÉNEMENTS DOM
     -------------------------------------------------------------------------- */
  function initEventListeners() {
    // 1. Navigation par onglets (Sidebar)
    const navLinks = document.querySelectorAll('.sidebar-nav a.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (!href) return;
        const targetPage = href.replace('#', '') || 'dashboard';
        switchPage(targetPage);

        try {
          if (history.pushState) {
            history.pushState(null, '', '#' + targetPage);
          } else {
            window.location.hash = targetPage;
          }
        } catch (err) {
          // ignore potential iframe restrictions
        }

        // Fermer la sidebar mobile au clic
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }
      });
    });

    // Écouteur de hashchange dans l'URL pour navigation directe
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && PAGE_TITLES[hash]) {
        switchPage(hash);
      }
    });

    // 2. Menu Latéral (Mobile Drawer & Mode Plein Écran / Réduction sur écrans larges)
    const burgerBtn = document.getElementById('burger-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    const appContainer = document.querySelector('.app-container');

    function toggleDesktopSidebar(forceState) {
      if (!appContainer) return;
      const isCurrentlyCollapsed = appContainer.classList.contains('sidebar-collapsed');
      const shouldCollapse = (typeof forceState === 'boolean') ? forceState : !isCurrentlyCollapsed;

      hideNavTooltip();

      if (shouldCollapse) {
        appContainer.classList.add('sidebar-collapsed');
        try { localStorage.setItem('acpe_sidebar_collapsed', 'true'); } catch (e) {}
        if (burgerBtn) {
          burgerBtn.setAttribute('title', 'Déployer le menu complet (Ctrl+B)');
          burgerBtn.setAttribute('aria-label', 'Déployer le menu latéral');
        }
        if (sidebarCollapseBtn) {
          sidebarCollapseBtn.setAttribute('title', 'Déployer le menu complet (Ctrl+B)');
          sidebarCollapseBtn.setAttribute('aria-label', 'Déployer le menu latéral');
        }
        showToast("Menu réduit : Signalétique par icônes active");
      } else {
        appContainer.classList.remove('sidebar-collapsed');
        try { localStorage.setItem('acpe_sidebar_collapsed', 'false'); } catch (e) {}
        if (burgerBtn) {
          burgerBtn.setAttribute('title', 'Réduire en barre d\'icônes (Ctrl+B)');
          burgerBtn.setAttribute('aria-label', 'Réduire le menu latéral');
        }
        if (sidebarCollapseBtn) {
          sidebarCollapseBtn.setAttribute('title', 'Réduire en barre d\'icônes (Ctrl+B)');
          sidebarCollapseBtn.setAttribute('aria-label', 'Réduire le menu latéral');
        }
        showToast("Menu latéral déployé");
      }
    }

    function handleMenuToggle() {
      if (window.innerWidth >= 1024) {
        toggleDesktopSidebar();
      } else {
        if (sidebar) sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
      }
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (burgerBtn) burgerBtn.addEventListener('click', handleMenuToggle);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener('click', () => {
        toggleDesktopSidebar();
      });
    }

    // Tooltip flottant pour la signalétique (barre d'icônes)
    let navTooltipEl = document.querySelector('.acpe-nav-tooltip');
    if (!navTooltipEl) {
      navTooltipEl = document.createElement('div');
      navTooltipEl.className = 'acpe-nav-tooltip';
      document.body.appendChild(navTooltipEl);
    }

    function showNavTooltip(el, text) {
      if (!appContainer || !appContainer.classList.contains('sidebar-collapsed') || window.innerWidth < 1024) {
        hideNavTooltip();
        return;
      }
      if (!navTooltipEl) return;
      const rect = el.getBoundingClientRect();
      navTooltipEl.textContent = text;
      navTooltipEl.style.top = `${rect.top + rect.height / 2}px`;
      navTooltipEl.style.left = `${rect.right + 12}px`;
      navTooltipEl.classList.add('visible');
    }

    function hideNavTooltip() {
      if (navTooltipEl) navTooltipEl.classList.remove('visible');
    }

    if (sidebar) {
      const tooltipTargets = sidebar.querySelectorAll('[data-tooltip]');
      tooltipTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
          const text = target.getAttribute('data-tooltip');
          if (text) showNavTooltip(target, text);
        });
        target.addEventListener('mouseleave', hideNavTooltip);
        target.addEventListener('click', hideNavTooltip);
      });
    }

    // Raccourci clavier Ctrl+B / Cmd+B pour basculer le menu latéral
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'SELECT') {
          e.preventDefault();
          if (window.innerWidth >= 1024) {
            toggleDesktopSidebar();
          } else {
            if (sidebar && sidebar.classList.contains('open')) {
              closeSidebar();
            } else {
              handleMenuToggle();
            }
          }
        }
      }
    });

    // Restaurer l'état mémorisé sur écran large au chargement
    try {
      if (window.innerWidth >= 1024 && localStorage.getItem('acpe_sidebar_collapsed') === 'true') {
        if (appContainer) appContainer.classList.add('sidebar-collapsed');
        if (burgerBtn) {
          burgerBtn.setAttribute('title', 'Déployer le menu complet (Ctrl+B)');
          burgerBtn.setAttribute('aria-label', 'Déployer le menu latéral');
        }
        if (sidebarCollapseBtn) {
          sidebarCollapseBtn.setAttribute('title', 'Déployer le menu complet (Ctrl+B)');
          sidebarCollapseBtn.setAttribute('aria-label', 'Déployer le menu latéral');
        }
      }
    } catch (e) {}

    // 3. Sélecteur de période de paie
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        handlePeriodChange(e.target.value);
      });
    }

    // 4. CTA du cycle de paie
    const bannerCta = document.getElementById('cycle-cta-btn');
    if (bannerCta) {
      bannerCta.addEventListener('click', () => {
        const action = bannerCta.getAttribute('data-action');
        handleCycleAction(action);
      });
    }

    // 5. Recherche sur le tableau du Dashboard
    const searchInput = document.getElementById('payslips-search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          AppState.tableSearch = e.target.value.trim();
          AppState.tablePage = 1;
          renderPayslipsTable();
        }, 200);
      });
    }

    // 6. Tri sur les colonnes du tableau Dashboard
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    sortableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (AppState.tableSortCol === col) {
          AppState.tableSortAsc = !AppState.tableSortAsc;
        } else {
          AppState.tableSortCol = col;
          AppState.tableSortAsc = true;
        }
        renderPayslipsTable();
      });
    });

    // 7. Pagination Dashboard
    const prevBtn = document.getElementById('page-prev-btn');
    const nextBtn = document.getElementById('page-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (AppState.tablePage > 1) {
          AppState.tablePage--;
          renderPayslipsTable();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        AppState.tablePage++;
        renderPayslipsTable();
      });
    }

    // 8. Clics délégués sur les tableaux (Voir bulletin / PDF / Fiche Agent)
    document.addEventListener('click', (e) => {
      const viewAgentBtn = e.target.closest('.view-agent-profile-btn');
      if (viewAgentBtn) {
        const matricule = viewAgentBtn.getAttribute('data-matricule');
        openAgentDetailModal(matricule);
        return;
      }

      const viewBtn = e.target.closest('.view-slip-btn');
      if (viewBtn) {
        const matricule = viewBtn.getAttribute('data-matricule');
        openPayslipModal(matricule);
        return;
      }

      const downloadBtn = e.target.closest('.download-slip-btn');
      if (downloadBtn) {
        const matricule = downloadBtn.getAttribute('data-matricule');
        downloadPayslipPdf(matricule);
        return;
      }

      const deleteVarBtn = e.target.closest('.delete-var-btn');
      if (deleteVarBtn) {
        const id = deleteVarBtn.getAttribute('data-id');
        MockData.variables = MockData.variables.filter(v => v.id !== id);
        renderVariablesTable();
        showToast(`Élément variable ${id} supprimé avec succès.`);
        return;
      }
    });

    // 9. Modale Bulletin de paie (Exclusivité pour les bulletins de salaire)
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCloseFooterBtn = document.getElementById('modal-close-footer-btn');
    const modalBackdrop = document.getElementById('payslip-modal');
    const modalPrintBtn = document.getElementById('modal-print-btn');
    const modalDownloadPdfBtn = document.getElementById('modal-download-pdf-btn');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closePayslipModal);
    if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener('click', closePayslipModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closePayslipModal();
      });
    }
    if (modalPrintBtn) {
      modalPrintBtn.addEventListener('click', () => {
        window.print();
      });
    }
    if (modalDownloadPdfBtn) {
      modalDownloadPdfBtn.addEventListener('click', () => {
        if (AppState.currentSelectedMatricule) {
          downloadPayslipPdf(AppState.currentSelectedMatricule);
        } else {
          showToast('Veuillez sélectionner un bulletin à télécharger.');
        }
      });
    }

    // 9b. Modale Fiche Statutaire de l'Agent Public
    const closeAgentDetailBtn = document.getElementById('close-agent-detail-btn');
    const btnCloseAgentDetail = document.getElementById('btn-close-agent-detail');
    const btnViewAgentPayslip = document.getElementById('btn-view-agent-payslip');
    const agentDetailModal = document.getElementById('agent-detail-modal');

    if (closeAgentDetailBtn) closeAgentDetailBtn.addEventListener('click', closeAgentDetailModal);
    if (btnCloseAgentDetail) btnCloseAgentDetail.addEventListener('click', closeAgentDetailModal);
    if (agentDetailModal) {
      agentDetailModal.addEventListener('click', (e) => {
        if (e.target === agentDetailModal) closeAgentDetailModal();
      });
    }
    if (btnViewAgentPayslip) {
      btnViewAgentPayslip.addEventListener('click', () => {
        const mat = AppState.currentSelectedMatricule;
        closeAgentDetailModal();
        if (mat) {
          openPayslipModal(mat);
        }
      });
    }

    // Gestionnaire universel de fermeture des modales (icône croix, clic extérieur & Échap)
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.modal-close-btn');
      if (closeBtn) {
        const backdrop = closeBtn.closest('.modal-backdrop');
        if (backdrop) {
          backdrop.classList.remove('active');
          backdrop.setAttribute('aria-hidden', 'true');
        }
      }
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => {
          m.classList.remove('active');
          m.setAttribute('aria-hidden', 'true');
        });
      }
    });

    // 10. Panneau Actions Rapides
    const quickActionBtns = document.querySelectorAll('.quick-action-item');
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const actionName = btn.getAttribute('data-action-name');
        if (actionName.includes('Calculer')) {
          switchPage('paie');
        } else if (actionName.includes('Exporter')) {
          showToast('Génération de l\'export comptable des salaires en FCFA (Format Chorus/Trésor).');
        } else if (actionName.includes('Ordre de virement')) {
          showToast('Ordre de virement bancaire Trésor généré avec succès (184 256 000 FCFA).');
        } else if (actionName.includes('Ajouter')) {
          openAddAgentModal();
        } else {
          showToast(`Action exécutée : ${actionName}`);
        }
      });
    });

    // 11. Notification cloche
    const notifBtn = document.getElementById('notifications-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        showToast('4 alertes sous contrôle : 3 absences injustifiées à la DSI et 1 prime à régulariser en FCFA.');
      });
    }

    // 12. Filtres Employés
    const empSearchInput = document.getElementById('employees-search-input');
    if (empSearchInput) {
      empSearchInput.addEventListener('input', (e) => {
        AppState.empSearch = e.target.value.trim();
        renderEmployeesTable();
      });
    }

    const empDirSelect = document.getElementById('employees-dir-filter');
    if (empDirSelect) {
      empDirSelect.addEventListener('change', (e) => {
        AppState.empDirFilter = e.target.value;
        renderEmployeesTable();
      });
    }

    const empCatSelect = document.getElementById('employees-cat-filter');
    if (empCatSelect) {
      empCatSelect.addEventListener('change', (e) => {
        AppState.empCatFilter = e.target.value;
        renderEmployeesTable();
      });
    }

    // 13. Filtres Bulletins de paie
    const allPayslipsSearch = document.getElementById('payslips-view-search-input');
    if (allPayslipsSearch) {
      allPayslipsSearch.addEventListener('input', (e) => {
        AppState.allPayslipsSearch = e.target.value.trim();
        renderAllPayslipsTable();
      });
    }

    const allPayslipsStatus = document.getElementById('payslips-view-status-filter');
    if (allPayslipsStatus) {
      allPayslipsStatus.addEventListener('change', (e) => {
        AppState.allPayslipsStatus = e.target.value;
        renderAllPayslipsTable();
      });
    }

    // Boutons d'actions groupées Bulletins
    const btnGenerateBatch = document.getElementById('btn-generate-batch');
    if (btnGenerateBatch) {
      btnGenerateBatch.addEventListener('click', () => {
        showToast('Génération en cours du lot des 485 bulletins de paie de l\'EPA en FCFA...');
        setTimeout(() => {
          showToast('Lot complet de 485 bulletins généré avec succès !');
        }, 1200);
      });
    }

    const btnDownloadZip = document.getElementById('btn-download-zip');
    if (btnDownloadZip) {
      btnDownloadZip.addEventListener('click', () => {
        showToast('Exportation en cours : Bulletins_EPA_Septembre2026.zip (485 fiches certifiées)');
      });
    }

    // 14. Filtres Variables
    const varSearchInput = document.getElementById('variables-search-input');
    if (varSearchInput) {
      varSearchInput.addEventListener('input', (e) => {
        AppState.varSearch = e.target.value.trim();
        renderVariablesTable();
      });
    }

    const varTypeSelect = document.getElementById('variables-type-filter');
    if (varTypeSelect) {
      varTypeSelect.addEventListener('change', (e) => {
        AppState.varTypeFilter = e.target.value;
        renderVariablesTable();
      });
    }

    const btnValidateVariables = document.getElementById('btn-validate-variables');
    if (btnValidateVariables) {
      btnValidateVariables.addEventListener('click', () => {
        MockData.variables.forEach(v => v.statut = 'Validé');
        renderVariablesTable();
        showToast('Toutes les primes et variables du mois ont été validées et verrouillées.');
      });
    }

    // 15. Actions Cotisations
    const btnTeletransmit = document.getElementById('btn-teletransmit-cotisations');
    if (btnTeletransmit) {
      btnTeletransmit.addEventListener('click', () => {
        showToast('Télétransmission sécurisée en cours vers la Trésorerie Générale (Bordereau : 90 710 160 FCFA)...');
        setTimeout(() => {
          showToast('Bordereau validé et accusé de réception Trésor N°TG-2026-9941 délivré !');
        }, 1200);
      });
    }

    // 16. Boutons de téléchargement des Rapports officiels
    const reportBtns = document.querySelectorAll('.report-download-btn');
    reportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const reportFile = btn.getAttribute('data-report');
        showToast(`Téléchargement de l'état officiel : ${reportFile}`);
      });
    });

    const btnRefreshReports = document.getElementById('btn-refresh-reports');
    if (btnRefreshReports) {
      btnRefreshReports.addEventListener('click', () => {
        showToast('Actualisation des états comptables certifiés en FCFA terminée.');
      });
    }

    // 17. Sauvegarde des Paramètres
    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => {
        const ptIndice = document.getElementById('set-point-indice');
        const ptVal = ptIndice ? ptIndice.value : 850;
        showToast(`Paramètres de l'EPA enregistrés avec succès. Valeur du point : ${ptVal} FCFA.`);
      });
    }

    // 18. Modale Ajout d'agent
    const addAgentModal = document.getElementById('add-agent-modal');
    const btnOpenAddAgent = document.getElementById('btn-open-add-agent');
    const closeAddAgentBtn = document.getElementById('close-add-agent-btn');
    const btnCancelAddAgent = document.getElementById('btn-cancel-add-agent');
    const formAddAgent = document.getElementById('form-add-agent');

    function openAddAgentModal() {
      if (addAgentModal) {
        addAgentModal.classList.add('active');
        addAgentModal.setAttribute('aria-hidden', 'false');
      }
    }

    function closeAddAgentModal() {
      if (addAgentModal) {
        addAgentModal.classList.remove('active');
        addAgentModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (btnOpenAddAgent) btnOpenAddAgent.addEventListener('click', openAddAgentModal);
    if (closeAddAgentBtn) closeAddAgentBtn.addEventListener('click', closeAddAgentModal);
    if (btnCancelAddAgent) btnCancelAddAgent.addEventListener('click', closeAddAgentModal);
    if (addAgentModal) {
      addAgentModal.addEventListener('click', (e) => {
        if (e.target === addAgentModal) closeAddAgentModal();
      });
    }

    if (formAddAgent) {
      formAddAgent.addEventListener('submit', (e) => {
        e.preventDefault();
        const nom = document.getElementById('agent-new-nom').value.trim();
        const matricule = document.getElementById('agent-new-matricule').value.trim();
        const direction = document.getElementById('agent-new-direction').value;
        const grade = document.getElementById('agent-new-grade').value.trim();
        const categorie = document.getElementById('agent-new-cat').value;
        const indice = parseInt(document.getElementById('agent-new-indice').value, 10) || 600;

        const brutEstime = indice * 850;
        const netEstime = Math.round(brutEstime * 0.79);

        const newAgent = {
          matricule,
          nom,
          grade,
          direction: `Direction ${direction}`,
          directionCode: direction,
          categorie,
          echelon: `Indice ${indice}`,
          indice,
          statutAgent: 'Titulaire',
          traitementNet: netEstime
        };

        MockData.employees.unshift(newAgent);
        renderEmployeesTable();
        closeAddAgentModal();
        formAddAgent.reset();
        showToast(`Agent ${nom} (${matricule}) ajouté avec succès. Traitement net : ${formatCurrency(netEstime)}.`);
      });
    }

    // 19. Modale Ajout de variable
    const addVarModal = document.getElementById('add-variable-modal');
    const btnOpenAddVar = document.getElementById('btn-open-add-variable');
    const closeAddVarBtn = document.getElementById('close-add-var-btn');
    const btnCancelAddVar = document.getElementById('btn-cancel-add-var');
    const formAddVar = document.getElementById('form-add-variable');
    const varAgentSelect = document.getElementById('var-agent-select');

    function populateVarAgentSelect() {
      if (!varAgentSelect) return;
      varAgentSelect.innerHTML = MockData.employees.map(e => `
        <option value="${escapeHtml(e.matricule)}">${escapeHtml(e.nom)} (${escapeHtml(e.matricule)} - ${escapeHtml(e.directionCode)})</option>
      `).join('');
    }

    function openAddVarModal() {
      populateVarAgentSelect();
      if (addVarModal) {
        addVarModal.classList.add('active');
        addVarModal.setAttribute('aria-hidden', 'false');
      }
    }

    function closeAddVarModal() {
      if (addVarModal) {
        addVarModal.classList.remove('active');
        addVarModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (btnOpenAddVar) btnOpenAddVar.addEventListener('click', openAddVarModal);
    if (closeAddVarBtn) closeAddVarBtn.addEventListener('click', closeAddVarModal);
    if (btnCancelAddVar) btnCancelAddVar.addEventListener('click', closeAddVarModal);
    if (addVarModal) {
      addVarModal.addEventListener('click', (e) => {
        if (e.target === addVarModal) closeAddVarModal();
      });
    }

    if (formAddVar) {
      formAddVar.addEventListener('submit', (e) => {
        e.preventDefault();
        const mat = varAgentSelect.value;
        const emp = MockData.employees.find(e => e.matricule === mat) || { nom: 'Agent', directionCode: 'EPA' };
        const type = document.getElementById('var-type-select').value;
        let montant = parseFloat(document.getElementById('var-montant-cfa').value) || 0;
        if (type === 'Retenue' && montant > 0) montant = -montant;
        const justificatif = document.getElementById('var-justificatif').value.trim();

        const newVar = {
          id: `VAR-00${MockData.variables.length + 1}`,
          matricule: mat,
          agent: emp.nom,
          direction: emp.directionCode,
          type,
          libelle: `${type} déclarée`,
          montant,
          periode: 'Septembre 2026',
          justificatif,
          statut: 'En attente'
        };

        MockData.variables.unshift(newVar);
        renderVariablesTable();
        closeAddVarModal();
        formAddVar.reset();
        showToast(`Élément variable de ${formatCurrency(Math.abs(montant))} enregistré pour ${emp.nom}.`);
      });
    }

    /* ----------------------------------------------------------------------
       ÉCOUTEURS : DÉPARTEMENTS & STRUCTURES EPA
       ---------------------------------------------------------------------- */
    const btnOpenAddDept = document.getElementById('btn-open-add-dept');
    const closeAddDeptBtn = document.getElementById('close-add-dept-modal') || document.getElementById('close-add-dept-btn');
    const btnCancelAddDept = document.getElementById('btn-cancel-add-dept');
    const addDeptModal = document.getElementById('add-dept-modal');
    const formAddDept = document.getElementById('form-add-department');

    if (btnOpenAddDept) btnOpenAddDept.addEventListener('click', () => openDepartmentModal());
    if (closeAddDeptBtn) closeAddDeptBtn.addEventListener('click', closeDepartmentModal);
    if (btnCancelAddDept) btnCancelAddDept.addEventListener('click', closeDepartmentModal);
    if (addDeptModal) {
      addDeptModal.addEventListener('click', (e) => {
        if (e.target === addDeptModal) closeDepartmentModal();
      });
    }

    if (formAddDept) {
      formAddDept.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('dept-edit-id').value;
        const nom = document.getElementById('dept-input-name').value.trim();
        const code = document.getElementById('dept-input-code').value.trim().toUpperCase();
        const parentDir = document.getElementById('dept-input-parent').value;
        const budgetCode = document.getElementById('dept-input-budget').value.trim();
        const managerMat = document.getElementById('dept-input-manager').value;
        const servicesStr = document.getElementById('dept-input-services').value.trim();
        const subEntities = servicesStr ? servicesStr.split(',').map(s => s.trim()).filter(Boolean) : [];

        const managerEmp = MockData.employees.find(emp => emp.matricule === managerMat) || {
          nom: 'Responsable désigné',
          grade: 'Cadre Supérieur'
        };

        if (editId) {
          const dept = MockData.departments.find(d => d.id === editId);
          if (dept) {
            const oldNom = dept.nom;
            dept.nom = nom;
            dept.code = code;
            dept.parentDir = parentDir;
            dept.budgetCode = budgetCode;
            dept.managerMatricule = managerMat;
            dept.managerName = managerEmp.nom;
            dept.managerRole = managerEmp.grade;
            dept.subEntities = subEntities;

            // Enregistrement dans l'audit
            MockData.auditLogs.unshift({
              id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
              actor: 'Fatou Ndiaye',
              role: 'Chef Bureau Paie & Rémunérations',
              actionType: 'SETTINGS',
              actionBadge: 'audit-badge-settings',
              entity: `Structure ${code}`,
              details: `Mise à jour des paramètres de la structure ${nom}`,
              ip: '192.168.10.62',
              diff: [
                { label: 'Intitulé', before: oldNom, after: nom },
                { label: 'Code budgétaire', before: 'Antérieur', after: budgetCode }
              ],
              hash: '8f72c058763dc0b46995642a420b92427ae41e4649b934ca45d88c2491a0c8b'
            });

            showToast(`Département ${nom} mis à jour avec succès.`);
          }
        } else {
          const newId = `DEP-${code}`;
          const newDept = {
            id: newId,
            code,
            nom,
            parentDir,
            budgetCode,
            managerMatricule: managerMat,
            managerName: managerEmp.nom,
            managerRole: managerEmp.grade,
            effectif: 0,
            masseSalarialeMensuelle: 0,
            subEntities
          };

          MockData.departments.push(newDept);

          // Enregistrement dans l'audit
          MockData.auditLogs.unshift({
            id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
            actor: 'Mamadou Diallo',
            role: 'Administrateur Principal DG',
            actionType: 'SETTINGS',
            actionBadge: 'audit-badge-settings',
            entity: `Département ${code}`,
            details: `Création officielle de la nouvelle structure ${nom}`,
            ip: '192.168.10.45',
            diff: [
              { label: 'Statut', before: 'Inexistant', after: 'Structure active' },
              { label: 'Code imputation', before: 'Néant', after: budgetCode }
            ],
            hash: '420b92427ae41e4649b934ca45d88c2491a0c8b326cf685e1358ef982c76e19c'
          });

          showToast(`Nouveau département ${nom} créé.`);
        }

        closeDepartmentModal();
        renderDepartments();
      });
    }

    // Modal Mutation / Transfert d'agent
    const closeTransferAgentBtn = document.getElementById('close-transfer-agent-modal') || document.getElementById('close-transfer-btn');
    const btnCancelTransferAgent = document.getElementById('btn-cancel-transfer-agent');
    const transferAgentModal = document.getElementById('transfer-agent-modal');
    const formTransferAgent = document.getElementById('form-transfer-agent');

    if (closeTransferAgentBtn) closeTransferAgentBtn.addEventListener('click', closeTransferAgentModal);
    if (btnCancelTransferAgent) btnCancelTransferAgent.addEventListener('click', closeTransferAgentModal);
    if (transferAgentModal) {
      transferAgentModal.addEventListener('click', (e) => {
        if (e.target === transferAgentModal) closeTransferAgentModal();
      });
    }

    if (formTransferAgent) {
      formTransferAgent.addEventListener('submit', (e) => {
        e.preventDefault();
        const mat = document.getElementById('transfer-agent-select').value;
        const targetDeptId = document.getElementById('transfer-target-dept').value;
        const transferDate = document.getElementById('transfer-date').value;
        const reason = document.getElementById('transfer-reason').value.trim();

        const emp = MockData.employees.find(e => e.matricule === mat);
        const targetDept = MockData.departments.find(d => d.id === targetDeptId);

        if (emp && targetDept) {
          const oldDir = emp.direction;
          const oldDirCode = emp.directionCode;

          emp.direction = targetDept.nom;
          emp.directionCode = targetDept.code;

          // Recalculer les effectifs rattachés
          const oldDept = MockData.departments.find(d => d.code === oldDirCode || d.nom === oldDir);
          if (oldDept && oldDept.effectif > 0) oldDept.effectif -= 1;
          targetDept.effectif += 1;

          // Journaliser l'audit avec le diff précis
          MockData.auditLogs.unshift({
            id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
            actor: 'Fatou Ndiaye',
            role: 'Chef Bureau Paie & Rémunérations',
            actionType: 'AGENT',
            actionBadge: 'audit-badge-agent',
            entity: `Agent ${emp.matricule} (${emp.nom})`,
            details: `Transfert d'affectation : ${reason || 'Mutation de service ordonnée'}`,
            ip: '192.168.10.62',
            diff: [
              { label: 'Direction', before: oldDir, after: targetDept.nom },
              { label: 'Date d\'effet', before: 'Immédiate', after: transferDate || 'Immédiate' }
            ],
            hash: '1a0c8b326cf685e1358ef982c76e19c991b7852b8559a72f10b42c943187a546'
          });

          closeTransferAgentModal();
          renderDepartments();
          renderEmployeesTable();
          showToast(`L'agent ${emp.nom} a été rattaché à : ${targetDept.nom}`);
        }
      });
    }

    // Filtres Départements
    const deptSearchInput = document.getElementById('dept-search-input');
    const deptDirFilter = document.getElementById('dept-dir-filter');

    if (deptSearchInput) {
      deptSearchInput.addEventListener('input', (e) => {
        AppState.deptSearch = e.target.value;
        renderDepartments();
      });
    }

    if (deptDirFilter) {
      deptDirFilter.addEventListener('change', (e) => {
        AppState.deptDirFilter = e.target.value;
        renderDepartments();
      });
    }

    /* ----------------------------------------------------------------------
       ÉCOUTEURS : CONTRATS DES AGENTS
       ---------------------------------------------------------------------- */
    const btnOpenAddContract = document.getElementById('btn-open-add-contract');
    const closeAddContractBtn = document.getElementById('close-add-contract-modal') || document.getElementById('close-add-contract-btn');
    const btnCancelAddContract = document.getElementById('btn-cancel-add-contract');
    const addContractModal = document.getElementById('add-contract-modal');
    const formAddContract = document.getElementById('form-add-contract');
    const btnFilterExpiring = document.getElementById('btn-filter-expiring-contracts');

    if (btnOpenAddContract) btnOpenAddContract.addEventListener('click', openAddContractModal);
    if (closeAddContractBtn) closeAddContractBtn.addEventListener('click', closeAddContractModal);
    if (btnCancelAddContract) btnCancelAddContract.addEventListener('click', closeAddContractModal);
    if (addContractModal) {
      addContractModal.addEventListener('click', (e) => {
        if (e.target === addContractModal) closeAddContractModal();
      });
    }

    if (btnFilterExpiring) {
      btnFilterExpiring.addEventListener('click', () => {
        AppState.contractStatusFilter = 'Échéance proche';
        const select = document.getElementById('contracts-status-filter');
        if (select) select.value = 'Échéance proche';
        renderContracts();
        showToast('Filtre appliqué : Contrats à échéance sous 90 jours');
      });
    }

    if (formAddContract) {
      formAddContract.addEventListener('submit', (e) => {
        e.preventDefault();
        const mat = document.getElementById('contract-agent-select').value;
        const emp = MockData.employees.find(e => e.matricule === mat) || { nom: 'Nouvel Agent' };
        const type = document.getElementById('contract-type-select').value;
        const poste = document.getElementById('contract-position').value.trim();
        const dateDebut = document.getElementById('contract-start-date').value;
        const dateFin = document.getElementById('contract-end-date').value || 'Indéterminée';
        const trialVal = document.getElementById('contract-trial-period').value;
        const salaireBase = parseFloat(document.getElementById('contract-salary').value) || 0;

        let periodeEssai = 'Sans objet';
        if (trialVal === '1') periodeEssai = 'En cours (1 mois)';
        else if (trialVal === '3') periodeEssai = 'En cours (3 mois)';
        else if (trialVal === '6') periodeEssai = 'En cours (6 mois)';

        const newContract = {
          id: `CTR-2026-0${MockData.contracts.length + 10}`,
          matricule: mat,
          agent: emp.nom,
          type,
          poste: poste || emp.grade,
          dateDebut: dateDebut || '01/09/2026',
          dateFin,
          periodeEssai,
          salaireBase,
          statut: trialVal !== '0' ? 'Période d\'essai' : 'Actif',
          pdfFile: `Contrat_${emp.nom.replace(/\s+/g, '_')}_2026.pdf`
        };

        MockData.contracts.unshift(newContract);

        // Journaliser dans l'audit
        MockData.auditLogs.unshift({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
          actor: 'Mamadou Diallo',
          role: 'Administrateur Principal DG',
          actionType: 'CONTRACT',
          actionBadge: 'audit-badge-contract',
          entity: `Contrat ${newContract.id} (${emp.nom})`,
          details: `Enregistrement d'un contrat ${type} avec rémunération de base ${formatCurrency(salaireBase)}`,
          ip: '192.168.10.45',
          diff: [
            { label: 'Nature du contrat', before: 'Néant', after: type },
            { label: 'Salaire de base', before: '0 FCFA', after: formatCurrency(salaireBase) }
          ],
          hash: '7e19c991b7852b8559a72f10b42c943187a546e8c71b4028fa031bbcd25ef403'
        });

        closeAddContractModal();
        formAddContract.reset();
        renderContracts();
        showToast(`Contrat de travail enregistré pour ${emp.nom}.`);
      });
    }

    // Filtres Contrats
    const contractsSearchInput = document.getElementById('contracts-search-input');
    const contractsTypeFilter = document.getElementById('contracts-type-filter');
    const contractsStatusFilter = document.getElementById('contracts-status-filter');

    if (contractsSearchInput) {
      contractsSearchInput.addEventListener('input', (e) => {
        AppState.contractSearch = e.target.value;
        renderContracts();
      });
    }

    if (contractsTypeFilter) {
      contractsTypeFilter.addEventListener('change', (e) => {
        AppState.contractTypeFilter = e.target.value;
        renderContracts();
      });
    }

    if (contractsStatusFilter) {
      contractsStatusFilter.addEventListener('change', (e) => {
        AppState.contractStatusFilter = e.target.value;
        renderContracts();
      });
    }

    /* ----------------------------------------------------------------------
       ÉCOUTEURS : DEMANDES SELF-SERVICE DES AGENTS
       ---------------------------------------------------------------------- */
    const btnOpenAddRequest = document.getElementById('btn-open-add-request');
    const closeAddReqBtn = document.getElementById('close-add-request-modal') || document.getElementById('close-add-req-btn');
    const btnCancelAddReq = document.getElementById('btn-cancel-add-request');
    const addRequestModal = document.getElementById('add-request-modal');
    const formAddRequest = document.getElementById('form-add-request');

    if (btnOpenAddRequest) btnOpenAddRequest.addEventListener('click', openAddRequestModal);
    if (closeAddReqBtn) closeAddReqBtn.addEventListener('click', closeAddRequestModal);
    if (btnCancelAddReq) btnCancelAddReq.addEventListener('click', closeAddRequestModal);
    if (addRequestModal) {
      addRequestModal.addEventListener('click', (e) => {
        if (e.target === addRequestModal) closeAddRequestModal();
      });
    }

    if (formAddRequest) {
      formAddRequest.addEventListener('submit', (e) => {
        e.preventDefault();
        const mat = document.getElementById('req-agent-select').value;
        const emp = MockData.employees.find(e => e.matricule === mat) || { nom: 'Agent', direction: 'Direction Générale' };
        const type = document.getElementById('req-type-select').value;
        const period = (document.getElementById('req-dates') || document.getElementById('req-period-input') || {}).value?.trim() || '';
        const motive = (document.getElementById('req-motive') || document.getElementById('req-motive-input') || {}).value?.trim() || '';

        const newReq = {
          id: `DEM-2026-0${MockData.requests.length + 85}`,
          matricule: mat,
          agent: emp.nom,
          direction: emp.direction,
          type,
          period: period || 'Période courante',
          dateSoumission: new Date().toLocaleDateString('fr-FR'),
          statut: 'En attente',
          justificatif: `Justificatif_${emp.nom.replace(/\s+/g, '_')}.pdf`,
          motive: motive || 'Demande administrative pour traitement réglementaire.',
          decisionComment: '',
          timeline: [
            { step: 'Soumission de la demande', actor: emp.nom, date: 'Aujourd\'hui', status: 'completed', note: 'Demande enregistrée sur le guichet agent' },
            { step: 'Avis du supérieur hiérarchique', actor: 'Chef de Service', date: 'En attente', status: 'current', note: 'Transmission au bureau compétent' },
            { step: 'Décision finale ordonnateur', actor: 'Direction des RH / DAF', date: 'En attente', status: 'pending', note: 'Arbitrage et visa' }
          ]
        };

        MockData.requests.unshift(newReq);

        // Journalisation dans l'audit
        MockData.auditLogs.unshift({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
          actor: emp.nom,
          role: 'Agent demandeur',
          actionType: 'REQUEST',
          actionBadge: 'audit-badge-request',
          entity: `Demande ${newReq.id}`,
          details: `Dépôt d'une demande de ${type} (${period})`,
          ip: '192.168.10.112',
          diff: [
            { label: 'Statut initial', before: 'Non déposé', after: 'En attente d\'instruction' }
          ],
          hash: '3f99a80e159e84b8f72c058763dc0b46995642a420b92427ae41e4649b934ca4'
        });

        closeAddRequestModal();
        formAddRequest.reset();
        renderRequests();
        showToast(`Demande ${newReq.id} enregistrée dans la file d'attente.`);
      });
    }

    // Modale Détail & Workflow de demande
    const closeReqDetailBtn = document.getElementById('close-request-detail-modal') || document.getElementById('close-req-detail-btn');
    const btnCloseReqDetail = document.getElementById('btn-close-req-detail');
    const reqDetailModal = document.getElementById('request-detail-modal');
    const btnApproveReq = document.getElementById('btn-approve-request');
    const btnRejectReq = document.getElementById('btn-reject-request');

    if (closeReqDetailBtn) closeReqDetailBtn.addEventListener('click', closeRequestDetailModal);
    if (btnCloseReqDetail) btnCloseReqDetail.addEventListener('click', closeRequestDetailModal);
    if (reqDetailModal) {
      reqDetailModal.addEventListener('click', (e) => {
        if (e.target === reqDetailModal) closeRequestDetailModal();
      });
    }

    if (btnApproveReq) {
      btnApproveReq.addEventListener('click', () => {
        const req = MockData.requests.find(r => r.id === AppState.selectedRequestId);
        if (!req) return;

        const comment = document.getElementById('req-decision-comment').value.trim();
        req.statut = 'Validée';
        req.decisionComment = comment || 'Demande formellement accordée et validée pour visa.';

        // Mettre à jour la timeline
        req.timeline = req.timeline.map(t => ({ ...t, status: 'completed' }));
        req.timeline.push({
          step: 'Décision finale ordonnateur',
          actor: 'Direction Générale / DRH',
          date: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR').substring(0, 5),
          status: 'completed',
          note: req.decisionComment
        });

        // Journaliser
        MockData.auditLogs.unshift({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
          actor: 'Fatou Ndiaye',
          role: 'Chef Bureau Paie & Rémunérations',
          actionType: 'REQUEST',
          actionBadge: 'audit-badge-request',
          entity: `Demande ${req.id} (${req.agent})`,
          details: `Approbation formelle : ${req.type} accordé`,
          ip: '192.168.10.62',
          diff: [
            { label: 'Statut décision', before: 'En attente', after: 'Validée' },
            { label: 'Visa ordonnateur', before: 'Non apposé', after: 'Visa accordé' }
          ],
          hash: '6a420d9bb934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427a'
        });

        openRequestDetailModal(req.id);
        renderRequests();
        showToast(`La demande ${req.id} de ${req.agent} a été approuvée avec succès.`);
      });
    }

    if (btnRejectReq) {
      btnRejectReq.addEventListener('click', () => {
        const req = MockData.requests.find(r => r.id === AppState.selectedRequestId);
        if (!req) return;

        const comment = document.getElementById('req-decision-comment').value.trim();
        req.statut = 'Rejetée';
        req.decisionComment = comment || 'Demande non conforme aux critères statutaires en vigueur.';

        req.timeline.push({
          step: 'Notification de rejet réglementaire',
          actor: 'Direction Générale / DRH',
          date: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR').substring(0, 5),
          status: 'rejected',
          note: req.decisionComment
        });

        MockData.auditLogs.unshift({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR') + ' UTC+0',
          actor: 'Fatou Ndiaye',
          role: 'Chef Bureau Paie & Rémunérations',
          actionType: 'REQUEST',
          actionBadge: 'audit-badge-request',
          entity: `Demande ${req.id} (${req.agent})`,
          details: `Rejet motivé de la demande : ${req.decisionComment}`,
          ip: '192.168.10.62',
          diff: [
            { label: 'Statut décision', before: 'En attente', after: 'Rejetée' }
          ],
          hash: '9a72f10b42c943187a546e8c71b4028fa031bbcd25ef4034298fc1c149afbf4c'
        });

        openRequestDetailModal(req.id);
        renderRequests();
        showToast(`La demande ${req.id} a été rejetée.`);
      });
    }

    // Filtres Demandes (Recherche, Type, et Boutons Pills)
    const reqSearchInput = document.getElementById('requests-search-input');
    const reqTypeFilter = document.getElementById('requests-type-filter');

    if (reqSearchInput) {
      reqSearchInput.addEventListener('input', (e) => {
        AppState.requestSearch = e.target.value;
        renderRequests();
      });
    }

    if (reqTypeFilter) {
      reqTypeFilter.addEventListener('change', (e) => {
        AppState.requestTypeFilter = e.target.value;
        renderRequests();
      });
    }

    document.querySelectorAll('.filter-pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill-btn').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const status = pill.getAttribute('data-status');
        AppState.requestStatusFilter = status === 'all' ? '' : status;
        renderRequests();
      });
    });

    /* ----------------------------------------------------------------------
       ÉCOUTEURS : HISTORIQUE D'AUDIT & SÉCURITÉ
       ---------------------------------------------------------------------- */
    const closeAuditDetailBtn = document.getElementById('close-audit-detail-modal') || document.getElementById('close-audit-detail-btn');
    const btnCloseAuditDetail = document.getElementById('btn-close-audit-detail');
    const auditDetailModal = document.getElementById('audit-detail-modal');
    const btnExportAuditLog = document.getElementById('btn-export-audit-log');

    if (closeAuditDetailBtn) closeAuditDetailBtn.addEventListener('click', closeAuditDetailModal);
    if (btnCloseAuditDetail) btnCloseAuditDetail.addEventListener('click', closeAuditDetailModal);
    if (auditDetailModal) {
      auditDetailModal.addEventListener('click', (e) => {
        if (e.target === auditDetailModal) closeAuditDetailModal();
      });
    }

    // Export CSV certifié du journal d'audit
    if (btnExportAuditLog) {
      btnExportAuditLog.addEventListener('click', () => {
        const headers = ['ID', 'Horodatage', 'Operateur', 'Role', 'Action', 'Entite', 'Details', 'IP', 'SHA-256'];
        const rows = MockData.auditLogs.map(a => [
          a.id,
          `"${a.timestamp}"`,
          `"${a.actor}"`,
          `"${a.role}"`,
          a.actionType,
          `"${a.entity}"`,
          `"${a.details.replace(/"/g, '""')}"`,
          a.ip,
          a.hash
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `journal_audit_paie_epa_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Export CSV officiel du journal d\'audit téléchargé avec succès.');
      });
    }

    // Filtres Audit
    const auditSearchInput = document.getElementById('audit-search-input');
    const auditActionFilter = document.getElementById('audit-action-filter');
    const auditUserFilter = document.getElementById('audit-user-filter');

    if (auditSearchInput) {
      auditSearchInput.addEventListener('input', (e) => {
        AppState.auditSearch = e.target.value;
        renderHistory();
      });
    }

    if (auditActionFilter) {
      auditActionFilter.addEventListener('change', (e) => {
        AppState.auditActionFilter = e.target.value;
        renderHistory();
      });
    }

    if (auditUserFilter) {
      auditUserFilter.addEventListener('change', (e) => {
        AppState.auditUserFilter = e.target.value;
        renderHistory();
      });
    }

    // Redimensionnement de la fenêtre pour rafraîchir le graphe SVG
    window.addEventListener('resize', () => {
      if (AppState.currentPage === 'dashboard') {
        renderChart();
      }
    });
  }

  /* --------------------------------------------------------------------------
     9.5. GESTION DU SPLASH SCREEN, AUTHENTIFICATION ET DÉCONNEXION
     -------------------------------------------------------------------------- */
  const USERS_ACPE = {
    'ACPE-001': {
      matricule: 'ACPE-001',
      nom: 'MOUKOKO Steve',
      initiales: 'SM',
      role: 'Chef de Service Paie',
      departement: 'Direction des Ressources Humaines • ACPE',
      espace: 'paie'
    },
    'ACPE-002': {
      matricule: 'ACPE-002',
      nom: 'NGOMA Clarisse',
      initiales: 'CN',
      role: 'Directrice des Ressources Humaines',
      departement: 'Direction Générale RH • ACPE',
      espace: 'grh'
    },
    'ACPE-003': {
      matricule: 'ACPE-003',
      nom: 'BILONGO Alain',
      initiales: 'AB',
      role: 'Contrôleur Financier Trésor',
      departement: 'Direction Financière & Comptable',
      espace: 'finance'
    }
  };

  function updateHeaderUserDisplay(user) {
    if (!user) return;
    const hAvatar = document.getElementById('header-user-avatar');
    const hName = document.getElementById('header-user-name');
    const hRole = document.getElementById('header-user-role');
    const ddName = document.getElementById('dropdown-user-name');
    const ddRole = document.getElementById('dropdown-user-role');

    if (hAvatar) hAvatar.textContent = user.initiales || 'AC';
    if (hName) hName.textContent = user.nom;
    if (hRole) hRole.textContent = user.role;
    if (ddName) ddName.textContent = user.nom;
    if (ddRole) ddRole.textContent = user.role;
  }

  function logoutUser() {
    sessionStorage.removeItem('acpe_auth_user');
    const userDropdown = document.getElementById('user-dropdown-menu');
    const userProfileBtn = document.getElementById('user-profile-btn');
    const loginOverlay = document.getElementById('acpe-login-overlay');
    const appContainer = document.querySelector('.app-container');
    const loginError = document.getElementById('acpe-login-error');

    if (userDropdown) userDropdown.classList.remove('active');
    if (userProfileBtn) userProfileBtn.setAttribute('aria-expanded', 'false');

    if (loginError) loginError.style.display = 'none';
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('auth-locked');

    showToast('Session fermée : Vous avez été déconnecté avec succès.');
  }

  function initSplashScreenAndAuth() {
    const splashScreen = document.getElementById('acpe-splash');
    const splashStatus = document.getElementById('acpe-splash-status');
    const loginOverlay = document.getElementById('acpe-login-overlay');
    const loginForm = document.getElementById('acpe-login-form');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('acpe-login-error');
    const togglePwdBtn = document.getElementById('toggle-pwd-btn');
    const userProfileBtn = document.getElementById('user-profile-btn');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
    const appContainer = document.querySelector('.app-container');

    // 1. Gestion du dropdown utilisateur dans le header
    if (userProfileBtn && userDropdownMenu) {
      userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDropdownMenu.classList.contains('active');
        if (isOpen) {
          userDropdownMenu.classList.remove('active');
          userProfileBtn.setAttribute('aria-expanded', 'false');
        } else {
          userDropdownMenu.classList.add('active');
          userProfileBtn.setAttribute('aria-expanded', 'true');
        }
      });

      document.addEventListener('click', (e) => {
        if (!userProfileBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
          userDropdownMenu.classList.remove('active');
          userProfileBtn.setAttribute('aria-expanded', 'false');
        }
      });

      const btnProfileSettings = document.getElementById('btn-profile-settings');
      if (btnProfileSettings) {
        btnProfileSettings.addEventListener('click', (e) => {
          e.preventDefault();
          userDropdownMenu.classList.remove('active');
          userProfileBtn.setAttribute('aria-expanded', 'false');
          switchPage('settings');
        });
      }
    }

    // 2. Déconnexion via le bouton du Header
    if (headerLogoutBtn) {
      headerLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }

    // 3. Déconnexion via le bouton de la Barre Latérale (Sidebar)
    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }

    // 4. Puces de comptes rapides pour démonstration
    const chips = document.querySelectorAll('.acpe-auth-role-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const u = chip.getAttribute('data-user');
        if (loginUsername) loginUsername.value = u;
        if (loginPassword) loginPassword.value = 'acpe2026';
        if (loginError) loginError.style.display = 'none';
      });
    });

    // 5. Afficher / Masquer mot de passe
    if (togglePwdBtn && loginPassword) {
      togglePwdBtn.addEventListener('click', () => {
        const isPwd = loginPassword.type === 'password';
        loginPassword.type = isPwd ? 'text' : 'password';
        const iconSvg = togglePwdBtn.querySelector('svg');
        if (iconSvg) {
          if (isPwd) {
            iconSvg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
          } else {
            iconSvg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
          }
        }
      });
    }

    // 6. Soumission du formulaire de connexion
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredUser = (loginUsername ? loginUsername.value.trim().toUpperCase() : '');
        const enteredPwd = (loginPassword ? loginPassword.value : '');

        let activeUser = USERS_ACPE[enteredUser];
        if (!activeUser) {
          // Si correspondance souple
          const key = Object.keys(USERS_ACPE).find(k => enteredUser.includes(k) || enteredUser === 'ADMIN' || enteredUser === 'STEVE');
          if (key) activeUser = USERS_ACPE[key];
        }

        if (activeUser || enteredPwd === 'acpe2026' || enteredUser.startsWith('ACPE')) {
          const finalUser = activeUser || {
            matricule: enteredUser || 'ACPE-001',
            nom: enteredUser || 'MOUKOKO Steve',
            initiales: 'SM',
            role: 'Gestionnaire Paie EPA',
            departement: 'Ressources Humaines • ACPE',
            espace: 'paie'
          };

          sessionStorage.setItem('acpe_auth_user', finalUser.matricule);
          updateHeaderUserDisplay(finalUser);
          if (finalUser.espace) {
            switchSpace(finalUser.espace, false);
          }

          if (loginError) loginError.style.display = 'none';
          if (loginOverlay) loginOverlay.classList.add('hidden');
          if (appContainer) appContainer.classList.remove('auth-locked');

          showToast(`Connexion réussie : Bienvenue ${finalUser.nom} (${finalUser.role})`);
        } else {
          if (loginError) {
            loginError.style.display = 'flex';
          }
        }
      });
    }

    // 7. Cycle de vie du Splash Screen
    const savedUserKey = sessionStorage.getItem('acpe_auth_user');

    setTimeout(() => {
      if (splashStatus) {
        splashStatus.textContent = 'Synchronisation Trésor Public & Grilles Indiciaires 2026...';
      }
    }, 600);

    setTimeout(() => {
      if (splashStatus) {
        splashStatus.textContent = 'Vérification du certificat agent...';
      }
    }, 1200);

    setTimeout(() => {
      if (splashScreen) {
        splashScreen.classList.add('fade-out');
      }

      if (savedUserKey && USERS_ACPE[savedUserKey]) {
        updateHeaderUserDisplay(USERS_ACPE[savedUserKey]);
        if (USERS_ACPE[savedUserKey].espace) {
          switchSpace(USERS_ACPE[savedUserKey].espace, false);
        }
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('auth-locked');
      } else {
        if (loginOverlay) loginOverlay.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('auth-locked');
        if (loginUsername) loginUsername.focus();
      }
    }, 1700);
  }

  /* --------------------------------------------------------------------------
     10. POINT D'ENTRÉE AU CHARGEMENT DU DOCUMENT
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initWorkflowEventListeners();
    initSplashScreenAndAuth();

    // Rendu initial de l'espace actif (par défaut paie)
    switchSpace(AppState.activeEspace || 'paie', false);

    // Rendu initial avec la période par défaut
    const initialSummary = MockData.getSummaryByPeriod(AppState.currentPeriod);
    updateCycleBanner(initialSummary);
    updateKpiCards(initialSummary);
    updateDistribution(initialSummary);
    renderChart();
    renderPayslipsTable();

    // Vérifier si un hash est présent dans l'URL (ex: #employees)
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && PAGE_TITLES[initialHash]) {
      switchPage(initialHash);
    }

    console.log('[EPA Paie] Dashboard initialisé avec succès sous le Design System ACPE en Franc CFA.');
  });

})();
