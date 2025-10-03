// src/services/GstinService.js
const axios = require('axios');

const GST_API_ENDPOINT_BASE = 'http://sheet.gstincheck.co.in/check/'; 
const GST_API_KEY = process.env.GST_CHECK_API_KEY; 

class GstinService {
    /**
     * Verifies a GSTIN and fetches registration details.
     * @param {string} gstin - The 15-digit GSTIN to verify.
     * @returns {Promise<object>} { isValid, businessName, ownerName, principalAddress }
     */
    static async verify(gstin) {
        if (!GST_API_KEY) {
            console.error("GST_CHECK_API_KEY environment variable is missing.");
            throw new Error("Configuration Error: GST API Key is not set.");
        }
        
        const trimmedGstin = gstin.trim();
        
        // Basic GSTIN format validation
        if (!trimmedGstin || trimmedGstin.length !== 15) {
            return { 
                isValid: false, 
                businessName: null, 
                ownerName: null, 
                principalAddress: null,
                error: 'Invalid GSTIN format. Must be 15 characters.'
            };
        }
        
        const url = `${GST_API_ENDPOINT_BASE}${GST_API_KEY}/${trimmedGstin}`;

        try {
            const response = await axios.get(url, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'User-Agent': 'LocalHunt/1.0.0'
                }
            });
            
            const data = response.data;
            
            console.log('GST API Raw Response:', JSON.stringify(data, null, 2));
            
            // Check if API returned success flag
            if (!data.flag) {
                return { 
                    isValid: false, 
                    businessName: null, 
                    ownerName: null, 
                    principalAddress: null,
                    error: data.message || 'GSTIN not found or invalid'
                };
            }
            
            // Check if we have data and the status is Active
            if (!data.data || data.data.sts !== 'Active') {
                return { 
                    isValid: false, 
                    businessName: null, 
                    ownerName: null, 
                    principalAddress: null,
                    error: 'GSTIN is not active or data unavailable'
                };
            }

            const apiData = data.data;
            const addressData = apiData.pradr?.addr || {};
            
            // Extract names - use tradeNam for business name, lgnm for legal/owner name
            const fetchedBusinessName = apiData.tradeNam || apiData.lgnm || 'Unknown Business';
            const fetchedOwnerName = apiData.lgnm || apiData.tradeNam || 'Unknown Owner';
            
            // Build address from available components
            const streetParts = [
                addressData.bno,
                addressData.bnm, 
                addressData.st,
                addressData.flno
            ].filter(Boolean);
            
            const principalAddress = {
                street: streetParts.join(', ') || 'Address not specified',
                colony: addressData.loc || null,
                city: addressData.dst || addressData.city || 'City not specified',
                state: addressData.stcd || 'State not specified',
                zipCode: addressData.pncd || null,
                country: 'India'
            };

            return {
                isValid: true,
                businessName: fetchedBusinessName, 
                ownerName: fetchedOwnerName, 
                principalAddress: principalAddress,
                additionalData: {
                    registrationDate: apiData.rgdt,
                    businessType: apiData.ctb,
                    status: apiData.sts,
                    lastUpdated: apiData.lstupdt
                }
            };

        } catch (error) {
            console.error('External GST API request failed:', error.message);
            
            // Handle specific error types
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error('GST verification service is currently unavailable. Please try again later.');
            } else if (error.response) {
                // API returned error status code
                throw new Error(`GST verification service error: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                // Request was made but no response received
                throw new Error('No response from GST verification service. Please check your connection and try again.');
            } else {
                throw new Error('GST verification service temporarily unavailable. Please proceed with manual registration.');
            }
        }
    }
}

module.exports = GstinService;