import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.validation.deleteMany();
  await prisma.license.deleteMany();
  await prisma.document.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 12);

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

  await prisma.user.create({
    data: {
      email: 'dna.senegal@aerocheck.com',
      password,
      firstName: 'Amadou',
      lastName: 'Diallo',
      role: 'DNA',
      pays: 'SENEGAL',
      matricule: 'DNA-SN-001',
      phone: '+221772345678'
    }
  });

  await prisma.user.create({
    data: {
      email: 'dna.ci@aerocheck.com',
      password,
      firstName: 'Kouamé',
      lastName: 'Bakayoko',
      role: 'DNA',
      pays: 'COTE_D_IVOIRE',
      matricule: 'DNA-CI-001',
      phone: '+22501234567'
    }
  });

  await prisma.user.create({
    data: {
      email: 'dlaa.dakar@aerocheck.com',
      password,
      firstName: 'Moussa',
      lastName: 'Ndiaye',
      role: 'DLAA',
      pays: 'SENEGAL',
      aeroport: 'DAKAR_BLAISE_DIAGNE',
      matricule: 'DLAA-DKR-001',
      phone: '+221773456789'
    }
  });

  await prisma.user.create({
    data: {
      email: 'dlaa.abidjan@aerocheck.com',
      password,
      firstName: 'Marie',
      lastName: 'Kouassi',
      role: 'DLAA',
      pays: 'COTE_D_IVOIRE',
      aeroport: 'ABIDJAN_FHB',
      matricule: 'DLAA-ABJ-001',
      phone: '+22502345678'
    }
  });

  await prisma.user.create({
    data: {
      email: 'qip.senegal@aerocheck.com',
      password,
      firstName: 'Fatou',
      lastName: 'Sow',
      role: 'QIP',
      pays: 'SENEGAL',
      matricule: 'QIP-SN-001',
      phone: '+221774567890'
    }
  });

  await prisma.user.create({
    data: {
      email: 'qip.ci@aerocheck.com',
      password,
      firstName: 'Jean',
      lastName: 'Yao',
      role: 'QIP',
      pays: 'COTE_D_IVOIRE',
      matricule: 'QIP-CI-001',
      phone: '+22503456789'
    }
  });

  const agentUser1 = await prisma.user.create({
    data: {
      email: 'agent1@aerocheck.com',
      password,
      firstName: 'Ousmane',
      lastName: 'Fall',
      role: 'AGENT',
      phone: '+221775678901'
    }
  });

  await prisma.agent.create({
    data: {
      userId: agentUser1.id,
      matricule: 'AGT-DKR-001',
      dateNaissance: new Date('1990-05-15'),
      lieuNaissance: 'Dakar',
      nationalite: 'Sénégalaise',
      adresse: '123 Avenue Blaise Diagne, Dakar',
      fonction: 'Agent de piste',
      employeur: 'Aéroport Dakar',
      aeroport: 'DAKAR_BLAISE_DIAGNE',
      zoneAcces: JSON.stringify(['PISTE', 'TERMINAL', 'CARGO']),
      status: 'EN_ATTENTE'
    }
  });

  const agentUser2 = await prisma.user.create({
    data: {
      email: 'agent2@aerocheck.com',
      password,
      firstName: 'Aminata',
      lastName: 'Koné',
      role: 'AGENT',
      phone: '+22504567890'
    }
  });

  await prisma.agent.create({
    data: {
      userId: agentUser2.id,
      matricule: 'AGT-ABJ-001',
      dateNaissance: new Date('1988-11-22'),
      lieuNaissance: 'Abidjan',
      nationalite: 'Ivoirienne',
      adresse: '456 Boulevard FHB, Abidjan',
      fonction: 'Agent de sécurité',
      employeur: 'Aéroport Abidjan',
      aeroport: 'ABIDJAN_FHB',
      zoneAcces: JSON.stringify(['TERMINAL', 'SECURITE']),
      status: 'EN_ATTENTE'
    }
  });

  console.log('✅ Database seeded!');
  console.log('\n📋 Test Accounts (password: password123):');
  console.log('  AGENT: agent1@aerocheck.com (Sénégal/Dakar)');
  console.log('  AGENT: agent2@aerocheck.com (Côte d\'Ivoire/Abidjan)');
  console.log('  QIP: qip.senegal@aerocheck.com (Sénégal)');
  console.log('  QIP: qip.ci@aerocheck.com (Côte d\'Ivoire)');
  console.log('  DLAA: dlaa.dakar@aerocheck.com (Dakar)');
  console.log('  DLAA: dlaa.abidjan@aerocheck.com (Abidjan)');
  console.log('  DNA: dna.senegal@aerocheck.com (Sénégal)');
  console.log('  DNA: dna.ci@aerocheck.com (Côte d\'Ivoire)');
  console.log('  SUPER_ADMIN: admin@aerocheck.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
