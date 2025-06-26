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
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    ];

    const properties = [];

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

    await Property.deleteMany(); // optional: clean before seeding
    await Property.insertMany(properties);
    console.log('✅ 100 properties seeded!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedProperties();
