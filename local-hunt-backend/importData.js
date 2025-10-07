// importData.js
const { admin, db } = require('./src/config/firebaseAdmin');
const fs = require('fs');
const path = require('path');
const ngeohash = require('ngeohash');

const VENDOR_COLLECTION = 'vendors';

async function importVendors() {
  try {
    const filePath = path.join(__dirname, 'src', 'dev', 'dummyVendors.json');
    const vendorsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!vendorsData || vendorsData.length === 0) {
      console.log('No vendor data found to import.');
      return;
    }

    console.log(`Found ${vendorsData.length} vendors to import...`);

    const batch = db.batch();

    for (const vendor of vendorsData) {
      // Generate a new document reference for each vendor
      const vendorRef = db.collection(VENDOR_COLLECTION).doc();

      // Add geohash and search keywords, similar to your model
      const geohash = ngeohash.encode(vendor.location.latitude, vendor.location.longitude);
      const searchKeywords = [
        ...vendor.businessName.toLowerCase().split(' '),
        ...vendor.category.toLowerCase().split(' '),
        ...vendor.address.city.toLowerCase().split(' '),
        ...vendor.address.colony.toLowerCase().split(' ')
      ].filter(Boolean);

      const finalVendorData = {
        ...vendor,
        id: vendorRef.id, // Add the auto-generated ID to the document data
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        location: {
          ...vendor.location,
          geohash: geohash
        },
        searchKeywords: Array.from(new Set(searchKeywords)),
        profileViews: Math.floor(Math.random() * 500),
        searchImpressions: Math.floor(Math.random() * 2000),
        averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        totalReviews: Math.floor(Math.random() * 50)
      };

      batch.set(vendorRef, finalVendorData);
      console.log(`- Staged vendor: ${vendor.businessName}`);
    }

    await batch.commit();
    console.log(`\n✅ Successfully imported ${vendorsData.length} vendors into the '${VENDOR_COLLECTION}' collection.`);

  } catch (error) {
    console.error('❌ Error importing vendor data:', error);
  }
}

importVendors().then(() => {
  console.log('Import script finished.');
  process.exit(0);
});
