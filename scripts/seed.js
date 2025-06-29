const { User, Contact, SpamReport } = require('../models');
const bcrypt = require('bcryptjs');

// Sample data arrays
const sampleNames = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Lisa Anderson', 'James Taylor', 'Jennifer Martinez', 'Robert Garcia', 'Amanda Rodriguez',
  'William Lopez', 'Jessica White', 'Christopher Lee', 'Ashley Thompson', 'Daniel Clark',
  'Nicole Lewis', 'Matthew Hall', 'Stephanie Young', 'Andrew Allen', 'Rachel King',
  'Joshua Wright', 'Megan Green', 'Ryan Baker', 'Lauren Adams', 'Kevin Nelson',
  'Amber Carter', 'Brian Mitchell', 'Samantha Perez', 'Jason Roberts', 'Heather Turner',
  'Eric Phillips', 'Melissa Campbell', 'Steven Parker', 'Rebecca Evans', 'Timothy Edwards',
  'Laura Collins', 'Jeffrey Stewart', 'Michelle Morris', 'Ronald Rogers', 'Kimberly Reed',
  'Donald Cook', 'Deborah Morgan', 'George Bell', 'Sharon Murphy', 'Kenneth Bailey',
  'Carol Rivera', 'Edward Cooper', 'Janet Richardson', 'Brian Cox', 'Catherine Howard'
];

const sampleEmails = [
  'john.smith@email.com', 'sarah.johnson@email.com', 'michael.brown@email.com',
  'emily.davis@email.com', 'david.wilson@email.com', 'lisa.anderson@email.com',
  'james.taylor@email.com', 'jennifer.martinez@email.com', 'robert.garcia@email.com',
  'amanda.rodriguez@email.com', 'william.lopez@email.com', 'jessica.white@email.com',
  'christopher.lee@email.com', 'ashley.thompson@email.com', 'daniel.clark@email.com',
  'nicole.lewis@email.com', 'matthew.hall@email.com', 'stephanie.young@email.com',
  'andrew.allen@email.com', 'rachel.king@email.com', 'joshua.wright@email.com',
  'megan.green@email.com', 'ryan.baker@email.com', 'lauren.adams@email.com',
  'kevin.nelson@email.com', 'amber.carter@email.com', 'brian.mitchell@email.com',
  'samantha.perez@email.com', 'jason.roberts@email.com', 'heather.turner@email.com',
  'eric.phillips@email.com', 'melissa.campbell@email.com', 'steven.parker@email.com',
  'rebecca.evans@email.com', 'timothy.edwards@email.com', 'laura.collins@email.com',
  'jeffrey.stewart@email.com', 'michelle.morris@email.com', 'ronald.rogers@email.com',
  'kimberly.reed@email.com', 'donald.cook@email.com', 'deborah.morgan@email.com',
  'george.bell@email.com', 'sharon.murphy@email.com', 'kenneth.bailey@email.com',
  'carol.rivera@email.com', 'edward.cooper@email.com', 'janet.richardson@email.com',
  'brian.cox@email.com', 'catherine.howard@email.com'
];

const samplePhoneNumbers = [
  '+12345678901', '+12345678902', '+12345678903', '+12345678904', '+12345678905',
  '+12345678906', '+12345678907', '+12345678908', '+12345678909', '+12345678910',
  '+12345678911', '+12345678912', '+12345678913', '+12345678914', '+12345678915',
  '+12345678916', '+12345678917', '+12345678918', '+12345678919', '+12345678920',
  '+12345678921', '+12345678922', '+12345678923', '+12345678924', '+12345678925',
  '+12345678926', '+12345678927', '+12345678928', '+12345678929', '+12345678930',
  '+12345678931', '+12345678932', '+12345678933', '+12345678934', '+12345678935',
  '+12345678936', '+12345678937', '+12345678938', '+12345678939', '+12345678940',
  '+12345678941', '+12345678942', '+12345678943', '+12345678944', '+12345678945',
  '+12345678946', '+12345678947', '+12345678948', '+12345678949', '+12345678950'
];

const spamReasons = ['robocall', 'scam', 'telemarketing', 'harassment', 'other'];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to generate random phone number
const generateRandomPhoneNumber = () => {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${prefix}${lineNumber}`;
};

// Helper function to generate random name
const generateRandomName = () => {
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Blake', 'Cameron'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await SpamReport.destroy({ where: {} });
    await Contact.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('✅ Cleared existing data');

    // Create users
    const users = [];
    const password = await bcrypt.hash('Password123', 12);

    for (let i = 0; i < 50; i++) {
      const user = await User.create({
        name: sampleNames[i],
        phoneNumber: samplePhoneNumbers[i],
        email: sampleEmails[i],
        password: password,
        isActive: true
      });
      users.push(user);
    }

    console.log(`✅ Created ${users.length} users`);

    // Create contacts for each user
    const contacts = [];
    for (const user of users) {
      // Each user gets 5-15 random contacts
      const contactCount = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < contactCount; i++) {
        const isRegisteredUser = Math.random() > 0.7; // 30% chance of being a registered user
        
        let contactPhoneNumber, contactName, contactEmail;
        
        if (isRegisteredUser) {
          // Pick a random registered user
          const randomUser = getRandomItem(users.filter(u => u.id !== user.id));
          contactPhoneNumber = randomUser.phoneNumber;
          contactName = randomUser.name;
          contactEmail = randomUser.email;
        } else {
          // Generate random contact
          contactPhoneNumber = generateRandomPhoneNumber();
          contactName = generateRandomName();
          contactEmail = null;
        }

        const contact = await Contact.create({
          userId: user.id,
          name: contactName,
          phoneNumber: contactPhoneNumber,
          email: contactEmail,
          isRegisteredUser,
          registeredUserId: isRegisteredUser ? 
            users.find(u => u.phoneNumber === contactPhoneNumber)?.id : null
        });
        
        contacts.push(contact);
      }
    }

    console.log(`✅ Created ${contacts.length} contacts`);

    // Create spam reports
    const spamReports = [];
    const spamPhoneNumbers = [
      '+18005551234', '+18005555678', '+18005559012', '+18005553456', '+18005557890',
      '+18005552345', '+18005556789', '+18005550123', '+18005554567', '+18005558901'
    ];

    for (const phoneNumber of spamPhoneNumbers) {
      // Each spam number gets 3-8 reports from different users
      const reportCount = Math.floor(Math.random() * 6) + 3;
      const reportingUsers = getRandomItems(users, reportCount);
      
      for (const user of reportingUsers) {
        const report = await SpamReport.create({
          phoneNumber,
          reportedBy: user.id,
          reason: getRandomItem(spamReasons),
          description: `Reported by ${user.name} - ${getRandomItem([
            'Received multiple unwanted calls',
            'Suspicious activity detected',
            'Automated voice message',
            'Requested personal information',
            'Aggressive sales tactics'
          ])}`
        });
        
        spamReports.push(report);
      }
    }

    // Add some random spam reports for regular phone numbers
    for (let i = 0; i < 20; i++) {
      const randomUser = getRandomItem(users);
      const randomPhoneNumber = getRandomItem(samplePhoneNumbers);
      
      const report = await SpamReport.create({
        phoneNumber: randomPhoneNumber,
        reportedBy: randomUser.id,
        reason: getRandomItem(spamReasons),
        description: `Random spam report from ${randomUser.name}`
      });
      
      spamReports.push(report);
    }

    console.log(`✅ Created ${spamReports.length} spam reports`);

    // Create some additional random contacts with spam reports
    for (let i = 0; i < 30; i++) {
      const randomUser = getRandomItem(users);
      const randomPhoneNumber = generateRandomPhoneNumber();
      
      await Contact.create({
        userId: randomUser.id,
        name: generateRandomName(),
        phoneNumber: randomPhoneNumber,
        email: null,
        isRegisteredUser: false
      });

      // Add some spam reports to these numbers
      if (Math.random() > 0.7) {
        const reportCount = Math.floor(Math.random() * 3) + 1;
        const reportingUsers = getRandomItems(users, reportCount);
        
        for (const user of reportingUsers) {
          await SpamReport.create({
            phoneNumber: randomPhoneNumber,
            reportedBy: user.id,
            reason: getRandomItem(spamReasons),
            description: `Additional spam report`
          });
        }
      }
    }

    console.log('✅ Created additional random contacts and spam reports');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Contacts: ${contacts.length}`);
    console.log(`   - Spam Reports: ${spamReports.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Phone: +12345678901');
    console.log('   Password: Password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  const { sequelize } = require('../models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established');
      return seedDatabase();
    })
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 