import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.validation.deleteMany();
  await prisma.license.deleteMany();
  await prisma.document.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aerocheck.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Jean',
      lastName: 'Administrateur',
      phone: '+221 77 123 4567'
    }
  });

  // Create Superviseur
  const superviseur = await prisma.user.create({
    data: {
      email: 'superviseur@aerocheck.com',
      password: hashedPassword,
      role: 'SUPERVISEUR',
      firstName: 'Marie',
      lastName: 'Superviseur',
      phone: '+221 77 234 5678'
    }
  });

  // Create QIP agents
  const qip1 = await prisma.user.create({
    data: {
      email: 'qip1@aerocheck.com',
      password: hashedPassword,
      role: 'QIP',
      firstName: 'Amadou',
      lastName: 'Verificateur',
      phone: '+221 77 345 6789'
    }
  });

  const qip2 = await prisma.user.create({
    data: {
      email: 'qip2@aerocheck.com',
      password: hashedPassword,
      role: 'QIP',
      firstName: 'Fatou',
      lastName: 'Controleuse',
      phone: '+221 77 456 7890'
    }
  });

  // Create DLAA agents
  const dlaa1 = await prisma.user.create({
    data: {
      email: 'dlaa1@aerocheck.com',
      password: hashedPassword,
      role: 'DLAA',
      firstName: 'Moussa',
      lastName: 'Emetteur',
      phone: '+221 77 567 8901'
    }
  });

  const dlaa2 = await prisma.user.create({
    data: {
      email: 'dlaa2@aerocheck.com',
      password: hashedPassword,
      role: 'DLAA',
      firstName: 'Aissatou',
      lastName: 'Licence',
      phone: '+221 77 678 9012'
    }
  });

  // Create Agents with different statuses
  const agentUsers = [
    { email: 'agent1@test.com', firstName: 'Ibrahima', lastName: 'Diallo', status: 'LICENCE_ACTIVE' },
    { email: 'agent2@test.com', firstName: 'Oumar', lastName: 'Sow', status: 'QIP_VALIDE' },
    { email: 'agent3@test.com', firstName: 'Mariama', lastName: 'Ba', status: 'DOCUMENTS_SOUMIS' },
    { email: 'agent4@test.com', firstName: 'Abdoulaye', lastName: 'Ndiaye', status: 'EN_ATTENTE' },
    { email: 'agent5@test.com', firstName: 'Khady', lastName: 'Fall', status: 'QIP_REJETE' },
    { email: 'agent6@test.com', firstName: 'Mamadou', lastName: 'Diop', status: 'LICENCE_EXPIREE' },
    { email: 'agent7@test.com', firstName: 'Awa', lastName: 'Gueye', status: 'DOCUMENTS_SOUMIS' },
    { email: 'agent8@test.com', firstName: 'Cheikh', lastName: 'Mbaye', status: 'QIP_VALIDE' },
    { email: 'agent9@test.com', firstName: 'Ndèye', lastName: 'Sarr', status: 'EN_ATTENTE' },
    { email: 'agent10@test.com', firstName: 'Pape', lastName: 'Thiam', status: 'LICENCE_ACTIVE' }
  ];

  const airports = [
    'Aeroport Blaise Diagne (DSS)',
    'Aeroport Leopold Sedar Senghor (DKR)',
    'Aeroport de Saint-Louis',
    'Aeroport de Ziguinchor'
  ];

  const fonctions = [
    'Agent de piste',
    'Agent de surete',
    'Agent de handling',
    'Technicien aeronautique',
    'Controleur acces'
  ];

  const employeurs = [
    'Air Senegal',
    'AIBD SA',
    'LAS Handling',
    'Senegal Airlines',
    'AHS Senegal'
  ];

  for (let i = 0; i < agentUsers.length; i++) {
    const agentData = agentUsers[i];
    
    const user = await prisma.user.create({
      data: {
        email: agentData.email,
        password: hashedPassword,
        role: 'AGENT',
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        phone: `+221 78 ${String(i + 100).padStart(3, '0')} ${String(i * 111).padStart(4, '0')}`
      }
    });

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        matricule: `AG24${String(i + 1).padStart(5, '0')}`,
        dateNaissance: new Date(1985 + i, i % 12, (i + 1) * 2),
        lieuNaissance: ['Dakar', 'Thies', 'Saint-Louis', 'Ziguinchor', 'Kaolack'][i % 5],
        nationalite: 'Senegalaise',
        adresse: `${i + 10} Rue ${i + 1}, Dakar`,
        fonction: fonctions[i % fonctions.length],
        employeur: employeurs[i % employeurs.length],
        aeroport: airports[i % airports.length],
        zoneAcces: JSON.stringify(['Zone publique', 'Zone reservee']),
        status: agentData.status
      }
    });

    // Create documents for agents with status beyond EN_ATTENTE
    if (agentData.status !== 'EN_ATTENTE') {
      const docTypes = [
        'PIECE_IDENTITE',
        'PHOTO_IDENTITE',
        'CASIER_JUDICIAIRE',
        'CERTIFICAT_MEDICAL',
        'ATTESTATION_FORMATION',
        'CONTRAT_TRAVAIL'
      ];

      for (const docType of docTypes) {
        const docStatus = ['QIP_VALIDE', 'LICENCE_ACTIVE', 'LICENCE_EXPIREE'].includes(agentData.status)
          ? 'VALIDE'
          : agentData.status === 'QIP_REJETE'
          ? 'REJETE'
          : 'EN_ATTENTE';

        const doc = await prisma.document.create({
          data: {
            agentId: agent.id,
            type: docType,
            fileName: `${docType.toLowerCase()}_${agent.matricule}.pdf`,
            filePath: `/uploads/mock/${agent.id}/${docType}_${Date.now()}.pdf`,
            status: docStatus
          }
        });

        // Add validation for validated/rejected documents
        if (docStatus !== 'EN_ATTENTE') {
          await prisma.validation.create({
            data: {
              documentId: doc.id,
              validatorId: qip1.id,
              status: docStatus,
              comment: docStatus === 'VALIDE' 
                ? 'Document conforme' 
                : 'Document non conforme - veuillez resoumettre'
            }
          });
        }
      }
    }

    // Create license for agents with active/expired license
    if (agentData.status === 'LICENCE_ACTIVE' || agentData.status === 'LICENCE_EXPIREE') {
      const dateEmission = new Date();
      dateEmission.setFullYear(dateEmission.getFullYear() - 1);
      
      const dateExpiration = new Date(dateEmission);
      dateExpiration.setFullYear(dateExpiration.getFullYear() + 2);

      if (agentData.status === 'LICENCE_EXPIREE') {
        dateExpiration.setFullYear(dateExpiration.getFullYear() - 3);
      }

      await prisma.license.create({
        data: {
          agentId: agent.id,
          numero: `DLAA-2024-${String(i + 1).padStart(6, '0')}`,
          dateEmission,
          dateExpiration,
          status: agentData.status === 'LICENCE_ACTIVE' ? 'ACTIVE' : 'EXPIREE',
          qrCode: 'data:image/png;base64,mockQRCode'
        }
      });
    }
  }

  console.log('Database seeded successfully!');
  console.log('\nTest accounts (password: password123):');
  console.log('- Admin: admin@aerocheck.com');
  console.log('- Superviseur: superviseur@aerocheck.com');
  console.log('- QIP: qip1@aerocheck.com, qip2@aerocheck.com');
  console.log('- DLAA: dlaa1@aerocheck.com, dlaa2@aerocheck.com');
  console.log('- Agents: agent1@test.com to agent10@test.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
