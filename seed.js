const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Property = require('./models/Property');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedProperties = async () => {
  try {
    const sampleImages = [
      'https://footballplans.blob.core.windows.net/images/photo-1.jpg',
      'https://footballplans.blob.core.windows.net/images/photo-2.jpg',
      'https://footballplans.blob.core.windows.net/images/photo-3.jpg',
    ];

    const properties = [];

  const BATCH_SIZE = 100;

  const deleteInChunks = async () => {
    let deletedCount = 0;
    while (true) {
      const result = await Property.deleteMany({ "images.1": { $exists: false } }).limit(BATCH_SIZE);
      if (result.deletedCount === 0) break;
      deletedCount += result.deletedCount;
      console.log(`Deleted ${deletedCount} so far...`);
    }
  };

  deleteInChunks()

    console.log('Starting to seed properties...');
    for (let i = 0; i < 1000; i++) {
      const price = faker.number.int({ min: 1000, max: 10000 });
      const rating = parseFloat(faker.number.float({ min: 1, max: 5, precision: 0.1 }).toFixed(1));

      properties.push({
        title: faker.lorem.words(2),
        rating: rating,
        address: faker.location.streetAddress(),
        rooms: faker.number.int({ min: 1, max: 6 }),
        bathrooms: faker.number.int({ min: 1, max: 4 }),
        area: faker.number.int({ min: 600, max: 5000 }),
        price: price,
        images: [sampleImages[Math.floor(Math.random() * sampleImages.length)]],
        video: null
      });
    }

    await Property.insertMany(properties);
    console.log('✅ 1000 properties seeded!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedProperties();