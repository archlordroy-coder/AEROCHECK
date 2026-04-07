import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Checking database...');

  // Check if users already exist - if so, skip seeding
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('✅ Database already seeded (' + existingUsers + ' users found). Skipping...');
    return;
  }

  console.log('🌱 Seeding database for the first time...');

  // Seed Nationalités (Africaines principalement)
  const nationalites = [
    { code: 'SEN', nom: 'Sénégalaise' },
    { code: 'CIV', nom: 'Ivoirienne' },
    { code: 'MLI', nom: 'Malienne' },
    { code: 'BFA', nom: 'Burkinabè' },
    { code: 'NER', nom: 'Nigérienne' },
    { code: 'BEN', nom: 'Béninoise' },
    { code: 'TGO', nom: 'Togolaise' },
    { code: 'GHA', nom: 'Ghanéenne' },
    { code: 'GIN', nom: 'Guinéenne' },
    { code: 'GMB', nom: 'Gambienne' },
    { code: 'GNB', nom: 'Guinéenne-Bissau' },
    { code: 'MRT', nom: 'Mauritanienne' },
    { code: 'MAR', nom: 'Marocaine' },
    { code: 'TUN', nom: 'Tunisienne' },
    { code: 'DZA', nom: 'Algérienne' },
    { code: 'EGY', nom: 'Egyptienne' },
    { code: 'NGA', nom: 'Nigériane' },
    { code: 'CMR', nom: 'Camerounaise' },
    { code: 'GAB', nom: 'Gabonaise' },
    { code: 'COG', nom: 'Congolaise' },
    { code: 'COD', nom: 'Congolaise (RDC)' },
    { code: 'CAF', nom: 'Centrafricaine' },
    { code: 'TCD', nom: 'Tchadienne' },
    { code: 'ETH', nom: 'Ethiopienne' },
    { code: 'KEN', nom: 'Kenyane' },
    { code: 'TZA', nom: 'Tanzanienne' },
    { code: 'UGA', nom: 'Ougandaise' },
    { code: 'RWA', nom: 'Rwandaise' },
    { code: 'BDI', nom: 'Burundaise' },
    { code: 'ZAF', nom: 'Sud-Africaine' },
  ];

  for (const nat of nationalites) {
    await prisma.nationalite.upsert({
      where: { code: nat.code },
      update: {},
      create: nat
    });
  }
  console.log(`✅ Seeded ${nationalites.length} nationalités`);

  // Seed Employeurs
  const employeurs = [
    { nom: 'Aéroport International Blaise Diagne (AIBD)' },
    { nom: 'Aéroport Léopold Sédar Senghor (ALSS)' },
    { nom: 'ASECNA - Sénégal' },
    { nom: 'ASECNA - Côte d\'Ivoire' },
    { nom: 'ASECNA - Mali' },
    { nom: 'ASECNA - Burkina Faso' },
    { nom: 'ASECNA - Niger' },
    { nom: 'ASECNA - Bénin' },
    { nom: 'ASECNA - Togo' },
    { nom: 'Société Aéroportuaire de Dakar (SAD)' },
    { nom: 'Air Sénégal' },
    { nom: 'Air Côte d\'Ivoire' },
    { nom: 'Ground Handling Services' },
    { nom: 'Aviance Ghana' },
    { nom: 'Swissport Afrique' },
    { nom: 'Menzies Aviation' },
    { nom: 'DHL Aviation' },
    { nom: 'FedEx Express' },
    { nom: 'UPS Airlines' },
    { nom: 'Ground Force' },
    { nom: 'Handling Partners' },
    { nom: 'Aeria' },
    { nom: 'Fret Sénégal' },
    { nom: 'Société de Transit' },
    { nom: 'Douane Sénégal' },
    { nom: 'Police de l\'Air' },
    { nom: 'Gendarmerie des Transports Aériens' },
    { nom: 'Pompiers Aéroportuaires' },
    { nom: 'Sûreté Aéroportuaire' },
  ];

  for (const emp of employeurs) {
    await prisma.employeur.upsert({
      where: { nom: emp.nom },
      update: {},
      create: emp
    });
  }
  console.log(`✅ Seeded ${employeurs.length} employeurs`);

  // Seed Pays ASECNA (17 pays africains membres)
  const pays = [
    { code: 'BJ', nom: 'Benin', nomFr: 'Bénin' },
    { code: 'BF', nom: 'Burkina Faso', nomFr: 'Burkina Faso' },
    { code: 'CM', nom: 'Cameroon', nomFr: 'Cameroun' },
    { code: 'CF', nom: 'Central African Republic', nomFr: 'République Centrafricaine' },
    { code: 'KM', nom: 'Comoros', nomFr: 'Comores' },
    { code: 'CG', nom: 'Congo', nomFr: 'Congo' },
    { code: 'CI', nom: 'Ivory Coast', nomFr: "Côte d'Ivoire" },
    { code: 'GA', nom: 'Gabon', nomFr: 'Gabon' },
    { code: 'GN', nom: 'Guinea', nomFr: 'Guinée' },
    { code: 'GW', nom: 'Guinea-Bissau', nomFr: 'Guinée-Bissau' },
    { code: 'GQ', nom: 'Equatorial Guinea', nomFr: 'Guinée Équatoriale' },
    { code: 'MG', nom: 'Madagascar', nomFr: 'Madagascar' },
    { code: 'ML', nom: 'Mali', nomFr: 'Mali' },
    { code: 'MR', nom: 'Mauritania', nomFr: 'Mauritanie' },
    { code: 'NE', nom: 'Niger', nomFr: 'Niger' },
    { code: 'SN', nom: 'Senegal', nomFr: 'Sénégal' },
    { code: 'TD', nom: 'Chad', nomFr: 'Tchad' },
    { code: 'TG', nom: 'Togo', nomFr: 'Togo' },
  ];

  const paysCreated = [];
  for (const p of pays) {
    const paysRecord = await prisma.pays.upsert({
      where: { code: p.code },
      update: {},
      create: p
    });
    paysCreated.push(paysRecord);
  }
  console.log(`✅ Seeded ${pays.length} pays africains`);

  // Seed Aéroports ASECNA par pays
  const aeroportsData = [
    // Sénégal
    { code: 'DKR', nom: 'Aéroport International Blaise Diagne', ville: 'Dakar', paysCode: 'SN' },
    { code: 'XLS', nom: 'Aéroport Léopold Sédar Senghor', ville: 'Dakar', paysCode: 'SN' },
    { code: 'ZIG', nom: 'Aéroport de Ziguinchor', ville: 'Ziguinchor', paysCode: 'SN' },
    { code: 'KLC', nom: 'Aéroport de Kaolack', ville: 'Kaolack', paysCode: 'SN' },
    { code: 'CSK', nom: 'Aéroport de Cap Skirring', ville: 'Cap Skirring', paysCode: 'SN' },
    
    // Côte d'Ivoire
    { code: 'ABJ', nom: 'Aéroport Félix Houphouët-Boigny', ville: 'Abidjan', paysCode: 'CI' },
    { code: 'BYK', nom: 'Aéroport de Bouaké', ville: 'Bouaké', paysCode: 'CI' },
    { code: 'HGO', nom: 'Aéroport de Korhogo', ville: 'Korhogo', paysCode: 'CI' },
    { code: 'SPY', nom: 'Aéroport de San-Pédro', ville: 'San-Pédro', paysCode: 'CI' },
    { code: 'MJC', nom: 'Aéroport de Man', ville: 'Man', paysCode: 'CI' },
    
    // Mali
    { code: 'BKO', nom: 'Aéroport International Modibo Keita', ville: 'Bamako', paysCode: 'ML' },
    { code: 'GOU', nom: 'Aéroport de Gao', ville: 'Gao', paysCode: 'ML' },
    { code: 'MZI', nom: 'Aéroport de Mopti', ville: 'Mopti', paysCode: 'ML' },
    { code: 'TOM', nom: 'Aéroport de Tombouctou', ville: 'Tombouctou', paysCode: 'ML' },
    { code: 'KYS', nom: 'Aéroport de Kayes', ville: 'Kayes', paysCode: 'ML' },
    
    // Burkina Faso
    { code: 'OUA', nom: 'Aéroport International de Ouagadougou', ville: 'Ouagadougou', paysCode: 'BF' },
    { code: 'BOY', nom: 'Aéroport de Bobo-Dioulasso', ville: 'Bobo-Dioulasso', paysCode: 'BF' },
    { code: 'XGG', nom: 'Aéroport de Gorom-Gorom', ville: 'Gorom-Gorom', paysCode: 'BF' },
    { code: 'XPA', nom: 'Aéroport de Pama', ville: 'Pama', paysCode: 'BF' },
    
    // Niger
    { code: 'NIM', nom: 'Aéroport International Diori Hamani', ville: 'Niamey', paysCode: 'NE' },
    { code: 'AJY', nom: 'Aéroport de Mano Dayak', ville: 'Agadez', paysCode: 'NE' },
    { code: 'MFQ', nom: 'Aéroport de Maradi', ville: 'Maradi', paysCode: 'NE' },
    { code: 'ZND', nom: 'Aéroport de Zinder', ville: 'Zinder', paysCode: 'NE' },
    { code: 'THZ', nom: 'Aéroport de Tahoua', ville: 'Tahoua', paysCode: 'NE' },
    
    // Bénin
    { code: 'COO', nom: 'Aéroport International de Cotonou', ville: 'Cotonou', paysCode: 'BJ' },
    { code: 'NAE', nom: 'Aéroport de Natitingou', ville: 'Natitingou', paysCode: 'BJ' },
    { code: 'PKO', nom: 'Aéroport de Parakou', ville: 'Parakou', paysCode: 'BJ' },
    { code: 'KDC', nom: 'Aéroport de Kandi', ville: 'Kandi', paysCode: 'BJ' },
    
    // Togo
    { code: 'LFW', nom: 'Aéroport International Gnassingbé Eyadéma', ville: 'Lomé', paysCode: 'TG' },
    { code: 'KDX', nom: 'Aéroport de Niamtougou', ville: 'Niamtougou', paysCode: 'TG' },
    { code: 'ANI', nom: 'Aéroport d\'Anié', ville: 'Anié', paysCode: 'TG' },
    { code: 'SOK', nom: 'Aéroport de Sokodé', ville: 'Sokodé', paysCode: 'TG' },
    
    // Guinée
    { code: 'CKY', nom: 'Aéroport International Ahmed Sékou Touré', ville: 'Conakry', paysCode: 'GN' },
    { code: 'KNN', nom: 'Aéroport de Kankan', ville: 'Kankan', paysCode: 'GN' },
    { code: 'LEK', nom: 'Aéroport de Labé', ville: 'Labé', paysCode: 'GN' },
    { code: 'FIG', nom: 'Aéroport de Fria', ville: 'Fria', paysCode: 'GN' },
    { code: 'NZE', nom: 'Aéroport de Nzérékoré', ville: 'Nzérékoré', paysCode: 'GN' },
    
    // Guinée-Bissau
    { code: 'OXB', nom: 'Aéroport International Osvaldo Vieira', ville: 'Bissau', paysCode: 'GW' },
    { code: 'BQE', nom: 'Aéroport de Bubaque', ville: 'Bubaque', paysCode: 'GW' },
    
    // Gabon
    { code: 'LBV', nom: 'Aéroport International Léon Mba', ville: 'Libreville', paysCode: 'GA' },
    { code: 'POG', nom: 'Aéroport International Port-Gentil', ville: 'Port-Gentil', paysCode: 'GA' },
    { code: 'MVB', nom: 'Aéroport de Mouilla Ville', ville: 'Mouila', paysCode: 'GA' },
    { code: 'MKU', nom: 'Aéroport de Makokou', ville: 'Makokou', paysCode: 'GA' },
    { code: 'LBQ', nom: 'Aéroport de Lambaréné', ville: 'Lambaréné', paysCode: 'GA' },
    
    // Congo
    { code: 'BZV', nom: 'Aéroport International Maya-Maya', ville: 'Brazzaville', paysCode: 'CG' },
    { code: 'PNR', nom: 'Aéroport International Agostinho-Neto', ville: 'Pointe-Noire', paysCode: 'CG' },
    { code: 'DIS', nom: 'Aéroport de Dolisie', ville: 'Dolisie', paysCode: 'CG' },
    { code: 'OUE', nom: 'Aéroport de Ouesso', ville: 'Ouesso', paysCode: 'CG' },
    
    // Cameroun
    { code: 'DLA', nom: 'Aéroport International de Douala', ville: 'Douala', paysCode: 'CM' },
    { code: 'NSI', nom: 'Aéroport International de Yaoundé-Nsimalen', ville: 'Yaoundé', paysCode: 'CM' },
    { code: 'GOU', nom: 'Aéroport de Garoua', ville: 'Garoua', paysCode: 'CM' },
    { code: 'BPC', nom: 'Aéroport de Bamenda', ville: 'Bamenda', paysCode: 'CM' },
    { code: 'NKS', nom: 'Aéroport de Nkongsamba', ville: 'Nkongsamba', paysCode: 'CM' },
    
    // République Centrafricaine
    { code: 'BGF', nom: 'Aéroport International Bangui M\'Poko', ville: 'Bangui', paysCode: 'CF' },
    { code: 'BBY', nom: 'Aéroport de Bambari', ville: 'Bambari', paysCode: 'CF' },
    { code: 'BSN', nom: 'Aéroport de Bossangoa', ville: 'Bossangoa', paysCode: 'CF' },
    
    // Tchad
    { code: 'NDJ', nom: 'Aéroport International de N\'Djamena', ville: 'N\'Djamena', paysCode: 'TD' },
    { code: 'MQQ', nom: 'Aéroport de Moundou', ville: 'Moundou', paysCode: 'TD' },
    { code: 'SRH', nom: 'Aéroport de Sarh', ville: 'Sarh', paysCode: 'TD' },
    { code: 'AEH', nom: 'Aéroport d\'Abéché', ville: 'Abéché', paysCode: 'TD' },
    
    // Comores
    { code: 'HAH', nom: 'Aéroport International Prince Said Ibrahim', ville: 'Moroni', paysCode: 'KM' },
    { code: 'NWA', nom: 'Aéroport de Mohéli', ville: 'Mohéli', paysCode: 'KM' },
    { code: 'AJN', nom: 'Aéroport d\'Anjouan', ville: 'Anjouan', paysCode: 'KM' },
    
    // Guinée Équatoriale
    { code: 'SSG', nom: 'Aéroport International de Malabo', ville: 'Malabo', paysCode: 'GQ' },
    { code: 'BSG', nom: 'Aéroport de Bata', ville: 'Bata', paysCode: 'GQ' },
    { code: 'MIC', nom: 'Aéroport de Mongomo', ville: 'Mongomo', paysCode: 'GQ' },
    
    // Madagascar
    { code: 'TNR', nom: 'Aéroport International Ivato', ville: 'Antananarivo', paysCode: 'MG' },
    { code: 'NOS', nom: 'Aéroport International de Nosy-Be', ville: 'Nosy Be', paysCode: 'MG' },
    { code: 'TLE', nom: 'Aéroport de Tuléar', ville: 'Tuléar', paysCode: 'MG' },
    { code: 'MJN', nom: 'Aéroport de Majunga', ville: 'Mahajanga', paysCode: 'MG' },
    { code: 'DIE', nom: 'Aéroport d\'Antsiranana', ville: 'Antsiranana (Diego-Suarez)', paysCode: 'MG' },
    
    // Mauritanie
    { code: 'NKC', nom: 'Aéroport International de Nouakchott-Oumtounsy', ville: 'Nouakchott', paysCode: 'MR' },
    { code: 'NDB', nom: 'Aéroport de Nouadhibou', ville: 'Nouadhibou', paysCode: 'MR' },
    { code: 'AJJ', nom: 'Aéroport d\'Atar', ville: 'Atar', paysCode: 'MR' },
    { code: 'KFA', nom: 'Aéroport de Kiffa', ville: 'Kiffa', paysCode: 'MR' },
  ];

  // Créer les aéroports avec les IDs de pays
  for (const aer of aeroportsData) {
    const paysRecord = paysCreated.find(p => p.code === aer.paysCode);
    if (paysRecord) {
      await prisma.aeroport.upsert({
        where: { code: aer.code },
        update: {},
        create: {
          code: aer.code,
          nom: aer.nom,
          ville: aer.ville,
          paysId: paysRecord.id
        }
      });
    }
  }
  console.log(`✅ Seeded ${aeroportsData.length} aéroports`);

  // Create demo users with password
  const password = await bcrypt.hash('password123', 12);

  // Admin: admin@aerocheck.com
  await prisma.user.create({
    data: {
      email: 'admin@aerocheck.com',
      password,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      phone: '+221771234567'
    }
  });
  console.log('✅ SUPER_ADMIN: admin@aerocheck.com');

  // DNA: dna@aerocheck.com
  await prisma.user.create({
    data: {
      email: 'dna@aerocheck.com',
      password,
      firstName: 'Directeur',
      lastName: 'National',
      role: 'DNA',
      phone: '+221770000000'
    }
  });
  console.log('✅ DNA: dna@aerocheck.com');

  // QIP: qip1@aerocheck.com
  const senegalPays = paysCreated.find(p => p.code === 'SN');
  await prisma.user.create({
    data: {
      email: 'qip1@aerocheck.com',
      password,
      firstName: 'Amadou',
      lastName: 'Verificateur',
      role: 'QIP',
      paysId: senegalPays?.id,
      matricule: 'QIP-SN-001',
      phone: '+221772345678'
    }
  });
  console.log('✅ QIP: qip1@aerocheck.com');

  // DLAA: dlaa1@aerocheck.com
  const dkrAirport = await prisma.aeroport.findFirst({ where: { code: 'DKR' } });
  await prisma.user.create({
    data: {
      email: 'dlaa1@aerocheck.com',
      password,
      firstName: 'Moussa',
      lastName: 'Emetteur',
      role: 'DLAA',
      paysId: senegalPays?.id,
      aeroportId: dkrAirport?.id,
      matricule: 'DLAA-DKR-001',
      phone: '+221773456789'
    }
  });
  console.log('✅ DLAA: dlaa1@aerocheck.com');

  // Agent: agent1@test.com
  const agentUser = await prisma.user.create({
    data: {
      email: 'agent1@test.com',
      password,
      firstName: 'Ibrahima',
      lastName: 'Diallo',
      role: 'AGENT',
      phone: '+221774567890'
    }
  });

  // Get reference IDs for Senegal and related entities
  // senegalPays and dkrAirport already declared above
  const senegalNat = await prisma.nationalite.findFirst({ where: { code: 'SEN' } });
  const aibdEmployer = await prisma.employeur.findFirst({ where: { nom: 'Aéroport International Blaise Diagne (AIBD)' } });

  if (senegalNat && aibdEmployer && senegalPays && dkrAirport) {
    const agent = await prisma.agent.create({
      data: {
        userId: agentUser.id,
        matricule: 'AGT-DKR-001',
        dateNaissance: new Date('1990-05-15'),
        lieuNaissance: 'Dakar',
        nationaliteId: senegalNat.id,
        adresse: '123 Avenue Blaise Diagne, Dakar',
        fonction: 'Agent de piste',
        employeurId: aibdEmployer.id,
        paysId: senegalPays.id,
        aeroportId: dkrAirport.id,
        zoneAcces: JSON.stringify(['PISTE', 'TERMINAL', 'CARGO']),
        status: 'EN_ATTENTE'
      }
    });
    console.log('✅ AGENT: agent1@test.com with proper relations');

    // Create sample documents for the agent
    const docTypes = [
      'CERTIFICAT_MEDICAL',
      'CONTROLE_COMPETENCE',
      'NIVEAU_ANGLAIS'
    ];

    for (const docType of docTypes) {
      await prisma.document.create({
        data: {
          agentId: agent.id,
          type: docType,
          fileName: `${docType.toLowerCase()}_AGT-DKR-001.pdf`,
          filePath: `/uploads/documents/${agent.id}/${docType.toLowerCase()}_AGT-DKR-001.pdf`,
          status: 'EN_ATTENTE'
        }
      });
    }
    console.log(`✅ Created ${docTypes.length} documents for agent`);
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Accounts (password: password123):');
  console.log('  SUPER_ADMIN: admin@aerocheck.com');
  console.log('  QIP: qip1@aerocheck.com');
  console.log('  DLAA: dlaa1@aerocheck.com');
  console.log('  AGENT: agent1@test.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
