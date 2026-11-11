import { DataSource } from 'typeorm';
import { University } from './libs/universities/src/entities/university.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123GodAll', 
  database: 'Students-Loans-Bonding-System',  
  entities: [University],
  synchronize: false,
});

const defaultFee = 1000000;
const standardFee = 1300000;
const healthSciencesFee = 2000000;
const educationFee = 700000; 

const universitiesData = [
  { name: "Africa University of Guidance, Counselling and Youth Development", fee: defaultFee },
  { name: "African Bible College", fee: defaultFee },
  { name: "Blantyre International University", fee: defaultFee },
  { name: "Catholic University of Malawi", fee: defaultFee },
  { name: "Chancellor College", fee: defaultFee },
  { name: "College of Medicine", fee: defaultFee },
  { name: "Daeyang University", fee: defaultFee },
  { name: "DMI-St John The Baptist", fee: defaultFee },
  { name: "Domasi College of Education", fee: educationFee }, // 700,000
  { name: "Emmanuel University", fee: defaultFee },
  { name: "Exploits University", fee: defaultFee },
  { name: "Higher Education Loans and Grants Test University", fee: defaultFee },
  { name: "Jubilee University", fee: defaultFee },
  { name: "Kamuzu College of Nursing", fee: defaultFee },
  { name: "Kamuzu University of Health Sciences", fee: healthSciencesFee }, // 2,000,000
  { name: "Lake Malawi Anglican University", fee: defaultFee },
  { name: "Lilongwe University of Agriculture and Natural Resources", fee: standardFee }, // 1,300,000
  { name: "Malawi Adventist University", fee: defaultFee },
  { name: "Malawi Assemblies of God University", fee: defaultFee },
  { name: "Malawi College of Accountancy", fee: defaultFee },
  { name: "Malawi Institute Of Journalism", fee: defaultFee },
  { name: "Malawi School of Government", fee: defaultFee },
  { name: "Malawi University of Business and Applied Sciences", fee: defaultFee },
  { name: "Malawi University of Science and Technology", fee: standardFee }, // 1,300,000
  { name: "Marble Hill University", fee: defaultFee },
  { name: "Millenium University", fee: defaultFee },
  { name: "Mzuzu University", fee: standardFee }, // 1,300,000
  { name: "Nalikule College of Education", fee: educationFee }, // 700,000
  { name: "Nkhoma University", fee: defaultFee },
  { name: "Pentecostal Life University", fee: defaultFee },
  { name: "Share World Open University", fee: defaultFee },
  { name: "Skyway University", fee: defaultFee },
  { name: "St John of God University", fee: defaultFee },
  { name: "The Polytechnic", fee: defaultFee },
  { name: "University of Blantyre Synod", fee: defaultFee },
  { name: "University Of Hebron", fee: defaultFee },
  { name: "University of Lilongwe", fee: defaultFee },
  { name: "University of Livingstonia", fee: defaultFee },
  { name: "University of Malawi", fee: standardFee } // 1,300,000
];

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(University);

  for (const data of universitiesData) {
    const existing = await repo.findOne({ where: { name: data.name } });
    
    if (existing) {
      existing.tuitionFee = data.fee;
      await repo.save(existing);
      console.log(`Updated: ${data.name} -> MWK ${data.fee}`);
    } else {
      await repo.save(repo.create({ name: data.name, tuitionFee: data.fee }));
      console.log(`Added: ${data.name} -> MWK ${data.fee}`);
    }
  }
  
  console.log('All universities seeded and updated successfully!');
  process.exit(0);
}

seed();