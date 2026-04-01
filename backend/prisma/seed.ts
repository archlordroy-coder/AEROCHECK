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

  // Seed Pays Africains
  const pays = [
    { code: 'SN', nom: 'Senegal', nomFr: 'Sénégal' },
    { code: 'CI', nom: 'Ivory Coast', nomFr: 'Côte d\'Ivoire' },
    { code: 'ML', nom: 'Mali', nomFr: 'Mali' },
    { code: 'BF', nom: 'Burkina Faso', nomFr: 'Burkina Faso' },
    { code: 'NE', nom: 'Niger', nomFr: 'Niger' },
    { code: 'BJ', nom: 'Benin', nomFr: 'Bénin' },
    { code: 'TG', nom: 'Togo', nomFr: 'Togo' },
    { code: 'GH', nom: 'Ghana', nomFr: 'Ghana' },
    { code: 'GN', nom: 'Guinea', nomFr: 'Guinée' },
    { code: 'GM', nom: 'Gambia', nomFr: 'Gambie' },
    { code: 'GW', nom: 'Guinea-Bissau', nomFr: 'Guinée-Bissau' },
    { code: 'MR', nom: 'Mauritania', nomFr: 'Mauritanie' },
    { code: 'MA', nom: 'Morocco', nomFr: 'Maroc' },
    { code: 'TN', nom: 'Tunisia', nomFr: 'Tunisie' },
    { code: 'DZ', nom: 'Algeria', nomFr: 'Algérie' },
    { code: 'EG', nom: 'Egypt', nomFr: 'Égypte' },
    { code: 'NG', nom: 'Nigeria', nomFr: 'Nigeria' },
    { code: 'CM', nom: 'Cameroon', nomFr: 'Cameroun' },
    { code: 'GA', nom: 'Gabon', nomFr: 'Gabon' },
    { code: 'CG', nom: 'Congo', nomFr: 'Congo' },
    { code: 'CD', nom: 'DR Congo', nomFr: 'Congo (RDC)' },
    { code: 'CF', nom: 'Central African Republic', nomFr: 'République Centrafricaine' },
    { code: 'TD', nom: 'Chad', nomFr: 'Tchad' },
    { code: 'ET', nom: 'Ethiopia', nomFr: 'Éthiopie' },
    { code: 'KE', nom: 'Kenya', nomFr: 'Kenya' },
    { code: 'TZ', nom: 'Tanzania', nomFr: 'Tanzanie' },
    { code: 'UG', nom: 'Uganda', nomFr: 'Ouganda' },
    { code: 'RW', nom: 'Rwanda', nomFr: 'Rwanda' },
    { code: 'BI', nom: 'Burundi', nomFr: 'Burundi' },
    { code: 'ZA', nom: 'South Africa', nomFr: 'Afrique du Sud' },
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

  // Seed Aéroports par pays
  const aeroportsData = [
    // Sénégal
    { code: 'DKR', nom: 'Aéroport International Blaise Diagne', ville: 'Dakar', paysCode: 'SN' },
    { code: 'XLS', nom: 'Aéroport Léopold Sédar Senghor', ville: 'Dakar', paysCode: 'SN' },
    { code: 'ZIG', nom: 'Aéroport de Ziguinchor', ville: 'Ziguinchor', paysCode: 'SN' },
    { code: 'KLC', nom: 'Aéroport de Kaolack', ville: 'Kaolack', paysCode: 'SN' },
    { code: 'CSK', nom: 'Aéroport de Cap Skirring', ville: 'Cap Skirring', paysCode: 'SN' },
    { code: 'KDA', nom: 'Aéroport de Kolda', ville: 'Kolda', paysCode: 'SN' },
    { code: 'TUD', nom: 'Aéroport de Tambacounda', ville: 'Tambacounda', paysCode: 'SN' },
    { code: 'POD', nom: 'Aéroport de Podor', ville: 'Podor', paysCode: 'SN' },
    { code: 'RDT', nom: 'Aéroport de Richard-Toll', ville: 'Richard-Toll', paysCode: 'SN' },
    { code: 'SMY', nom: 'Aéroport de Simenti', ville: 'Simenti', paysCode: 'SN' },
    
    // Côte d'Ivoire
    { code: 'ABJ', nom: 'Aéroport Félix Houphouët-Boigny', ville: 'Abidjan', paysCode: 'CI' },
    { code: 'BYK', nom: 'Aéroport de Bouaké', ville: 'Bouaké', paysCode: 'CI' },
    { code: 'HGO', nom: 'Aéroport de Korhogo', ville: 'Korhogo', paysCode: 'CI' },
    { code: 'SPY', nom: 'Aéroport de San-Pédro', ville: 'San-Pédro', paysCode: 'CI' },
    { code: 'MJC', nom: 'Aéroport de Man', ville: 'Man', paysCode: 'CI' },
    { code: 'OGO', nom: 'Aéroport d\'Abengourou', ville: 'Abengourou', paysCode: 'CI' },
    { code: 'GGN', nom: 'Aéroport de Gagnoa', ville: 'Gagnoa', paysCode: 'CI' },
    { code: 'KEO', nom: 'Aéroport d\'Odienne', ville: 'Odienne', paysCode: 'CI' },
    { code: 'DIV', nom: 'Aéroport de Divo', ville: 'Divo', paysCode: 'CI' },
    { code: 'BBV', nom: 'Aéroport de Grand-Béréby', ville: 'Grand-Béréby', paysCode: 'CI' },
    
    // Mali
    { code: 'BKO', nom: 'Aéroport International Modibo Keita', ville: 'Bamako', paysCode: 'ML' },
    { code: 'GOU', nom: 'Aéroport de Gao', ville: 'Gao', paysCode: 'ML' },
    { code: 'MZI', nom: 'Aéroport de Mopti', ville: 'Mopti', paysCode: 'ML' },
    { code: 'TOM', nom: 'Aéroport de Tombouctou', ville: 'Tombouctou', paysCode: 'ML' },
    { code: 'KYS', nom: 'Aéroport de Kayes', ville: 'Kayes', paysCode: 'ML' },
    { code: 'NRM', nom: 'Aéroport de Nioro', ville: 'Nioro', paysCode: 'ML' },
    { code: 'SZG', nom: 'Aéroport de Sikasso', ville: 'Sikasso', paysCode: 'ML' },
    { code: 'KTX', nom: 'Aéroport de Koutiala', ville: 'Koutiala', paysCode: 'ML' },
    
    // Burkina Faso
    { code: 'OUA', nom: 'Aéroport International de Ouagadougou', ville: 'Ouagadougou', paysCode: 'BF' },
    { code: 'BOY', nom: 'Aéroport de Bobo-Dioulasso', ville: 'Bobo-Dioulasso', paysCode: 'BF' },
    { code: 'XGG', nom: 'Aéroport de Gorom-Gorom', ville: 'Gorom-Gorom', paysCode: 'BF' },
    { code: 'XPA', nom: 'Aéroport de Pama', ville: 'Pama', paysCode: 'BF' },
    { code: 'DGU', nom: 'Aéroport de Dédougou', ville: 'Dédougou', paysCode: 'BF' },
    { code: 'XAR', nom: 'Aéroport d\'Arly', ville: 'Arly', paysCode: 'BF' },
    { code: 'TEG', nom: 'Aéroport de Tenkodogo', ville: 'Tenkodogo', paysCode: 'BF' },
    { code: 'XSE', nom: 'Aéroport de Sebba', ville: 'Sebba', paysCode: 'BF' },
    { code: 'XNU', nom: 'Aéroport de Nouna', ville: 'Nouna', paysCode: 'BF' },
    { code: 'XDE', nom: 'Aéroport de Dori', ville: 'Dori', paysCode: 'BF' },
    
    // Niger
    { code: 'NIM', nom: 'Aéroport International Diori Hamani', ville: 'Niamey', paysCode: 'NE' },
    { code: 'AJY', nom: 'Aéroport de Mano Dayak', ville: 'Agadez', paysCode: 'NE' },
    { code: 'MFQ', nom: 'Aéroport de Maradi', ville: 'Maradi', paysCode: 'NE' },
    { code: 'ZND', nom: 'Aéroport de Zinder', ville: 'Zinder', paysCode: 'NE' },
    { code: 'THZ', nom: 'Aéroport de Tahoua', ville: 'Tahoua', paysCode: 'NE' },
    { code: 'DOD', nom: 'Aéroport de Dirkou', ville: 'Dirkou', paysCode: 'NE' },
    { code: 'AQC', nom: 'Aéroport d\'Arlit', ville: 'Arlit', paysCode: 'NE' },
    
    // Bénin
    { code: 'COO', nom: 'Aéroport International de Cotonou', ville: 'Cotonou', paysCode: 'BJ' },
    { code: 'NAE', nom: 'Aéroport de Natitingou', ville: 'Natitingou', paysCode: 'BJ' },
    { code: 'PKO', nom: 'Aéroport de Parakou', ville: 'Parakou', paysCode: 'BJ' },
    { code: 'KDC', nom: 'Aéroport de Kandi', ville: 'Kandi', paysCode: 'BJ' },
    { code: 'DJA', nom: 'Aéroport de Djougou', ville: 'Djougou', paysCode: 'BJ' },
    { code: 'SVF', nom: 'Aéroport de Savé', ville: 'Savé', paysCode: 'BJ' },
    { code: 'BKK', nom: 'Aéroport de Bembéréké', ville: 'Bembéréké', paysCode: 'BJ' },
    
    // Togo
    { code: 'LFW', nom: 'Aéroport International Gnassingbé Eyadéma', ville: 'Lomé', paysCode: 'TG' },
    { code: 'KDX', nom: 'Aéroport de Niamtougou', ville: 'Niamtougou', paysCode: 'TG' },
    { code: 'ANI', nom: 'Aéroport d\'Anié', ville: 'Anié', paysCode: 'TG' },
    { code: 'SOK', nom: 'Aéroport de Sokodé', ville: 'Sokodé', paysCode: 'TG' },
    { code: 'MPL', nom: 'Aéroport de Mango', ville: 'Mango', paysCode: 'TG' },
    
    // Ghana
    { code: 'ACC', nom: 'Aéroport International Kotoka', ville: 'Accra', paysCode: 'GH' },
    { code: 'KMS', nom: 'Aéroport de Kumasi', ville: 'Kumasi', paysCode: 'GH' },
    { code: 'TML', nom: 'Aéroport de Tamale', ville: 'Tamale', paysCode: 'GH' },
    { code: 'NYI', nom: 'Aéroport de Sunyani', ville: 'Sunyani', paysCode: 'GH' },
    { code: 'TKD', nom: 'Aéroport de Takoradi', ville: 'Takoradi', paysCode: 'GH' },
    { code: 'DWD', nom: 'Aéroport de Wa', ville: 'Wa', paysCode: 'GH' },
    { code: 'HLX', nom: 'Aéroport de Ho', ville: 'Ho', paysCode: 'GH' },
    
    // Guinée
    { code: 'CKY', nom: 'Aéroport International Ahmed Sékou Touré', ville: 'Conakry', paysCode: 'GN' },
    { code: 'KNN', nom: 'Aéroport de Kankan', ville: 'Kankan', paysCode: 'GN' },
    { code: 'LEK', nom: 'Aéroport de Labé', ville: 'Labé', paysCode: 'GN' },
    { code: 'FIG', nom: 'Aéroport de Fria', ville: 'Fria', paysCode: 'GN' },
    { code: 'NZE', nom: 'Aéroport de Nzérékoré', ville: 'Nzérékoré', paysCode: 'GN' },
    { code: 'KSI', nom: 'Aéroport de Kissidougou', ville: 'Kissidougou', paysCode: 'GN' },
    
    // Gambie
    { code: 'BJL', nom: 'Aéroport International de Banjul', ville: 'Banjul', paysCode: 'GM' },
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
      'PIECE_IDENTITE',
      'PHOTO_IDENTITE', 
      'CASIER_JUDICIAIRE',
      'CERTIFICAT_MEDICAL',
      'ATTESTATION_FORMATION',
      'CONTRAT_TRAVAIL'
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
