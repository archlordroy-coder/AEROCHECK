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
  await prisma.user.create({
    data: {
      email: 'qip1@aerocheck.com',
      password,
      firstName: 'Amadou',
      lastName: 'Verificateur',
      role: 'QIP',
      pays: 'SENEGAL',
      matricule: 'QIP-SN-001',
      phone: '+221772345678'
    }
  });
  console.log('✅ QIP: qip1@aerocheck.com');

  // DLAA: dlaa1@aerocheck.com
  await prisma.user.create({
    data: {
      email: 'dlaa1@aerocheck.com',
      password,
      firstName: 'Moussa',
      lastName: 'Emetteur',
      role: 'DLAA',
      pays: 'SENEGAL',
      aeroport: 'DAKAR_BLAISE_DIAGNE',
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

  const agent = await prisma.agent.create({
    data: {
      userId: agentUser.id,
      matricule: 'AGT-DKR-001',
      dateNaissance: new Date('1990-05-15'),
      lieuNaissance: 'Dakar',
      nationalite: 'Senegalaise',
      adresse: '123 Avenue Blaise Diagne, Dakar',
      fonction: 'Agent de piste',
      employeur: 'Aeroport Dakar',
      aeroport: 'DAKAR_BLAISE_DIAGNE',
      zoneAcces: JSON.stringify(['PISTE', 'TERMINAL', 'CARGO']),
      status: 'EN_ATTENTE'
    }
  });
  console.log('✅ AGENT: agent1@test.com');

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
