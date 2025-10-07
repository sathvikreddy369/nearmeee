/**
 * Generates an array of search keywords from vendor data.
 * @param {object} data - The vendor data object.
 * @returns {string[]} An array of unique, lowercased keywords.
 */
const generateSearchKeywords = (data) => {
  const keywords = new Set();
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'get', 'if', 
    'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'our', 'such', 
    'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 
    'us', 'was', 'we', 'will', 'with', 'you', 'your', '&', 'per', 'more', 'age'
  ]);

  const addWords = (text) => {
    if (typeof text === 'string' && text.trim()) {
      // Split by spaces and common punctuation, then filter out empty strings
      const words = text.toLowerCase().split(/[\s,./&]+/);
      words.forEach(word => {
        if (word && !stopWords.has(word)) {
          keywords.add(word);
        }
      });
    }
  };

  addWords(data.businessName);
  addWords(data.category);
  addWords(data.description);
  if (data.address) addWords(data.address.city);
  if (data.address) addWords(data.address.colony);

  // Also include keywords from services
  if (data.services && Array.isArray(data.services)) {
    data.services.forEach(service => {
      addWords(service.name);
      addWords(service.description);
    });
  }

  return Array.from(keywords);
};

module.exports = { generateSearchKeywords };