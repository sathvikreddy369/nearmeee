/**
 * One-time script to backfill the `_searchKeywords` field for existing vendors.
 * To run: `node src/scripts/backfillKeywords.js` from the backend root directory.
 */
const { db } = require('../config/firebaseAdmin');
const { generateSearchKeywords } = require('../utils/searchUtils');

const VENDOR_COLLECTION = 'vendors';

async function backfillVendorKeywords() {
  console.log('🚀 Starting backfill process for vendor search keywords...');
  const vendorsRef = db.collection(VENDOR_COLLECTION);
  const snapshot = await vendorsRef.get();

  if (snapshot.empty) {
    console.log('No vendors found. Nothing to backfill.');
    return;
  }

  const batch = db.batch();
  let updatedCount = 0;

  snapshot.forEach(doc => {
    const vendorData = doc.data();
    const keywords = generateSearchKeywords(vendorData);
    
    console.log(`- Processing vendor: ${vendorData.businessName || doc.id}`);
    batch.update(doc.ref, { _searchKeywords: keywords });
    updatedCount++;
  });

  await batch.commit();
  console.log(`\n✅ Successfully updated ${updatedCount} vendors with search keywords.`);
}

backfillVendorKeywords().then(() => process.exit(0)).catch(err => {
  console.error('❌ An error occurred during the backfill process:', err);
  process.exit(1);
});