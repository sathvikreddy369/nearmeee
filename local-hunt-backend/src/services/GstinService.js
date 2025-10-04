// src/services/GstinService.js
const axios = require('axios');

class GstinService {
  static async verify(gstin) {
    try {
      const apiKey = process.env.GST_CHECK_API_KEY; // Fixed typo in variable name
      const response = await axios.get(`http://sheet.gstincheck.co.in/check/${apiKey}/${gstin}`);
      
      console.log('📊 GST API Raw Response:', JSON.stringify(response.data, null, 2)); // Debug log
      
      // Check if the API response indicates success
      if (response.data.flag === true && response.data.message === 'GSTIN  found.') {
        const gstData = response.data.data;
        
        return {
          success: true,
          isValid: true,
          businessName: gstData.tradeNam || 'N/A',
          ownerName: gstData.lgnm || 'N/A',
          principalAddress: gstData.pradr ? this.formatAddress(gstData.pradr) : 'N/A',
          status: gstData.sts || 'N/A',
          registrationDate: gstData.rgdt || 'N/A',
          businessType: gstData.ctb || 'N/A',
          additionalData: {
            natureOfBusiness: gstData.nba || [],
            stateJurisdiction: gstData.stj || 'N/A',
            centerJurisdiction: gstData.ctj || 'N/A',
            complianceRating: gstData.cmpRt || 'N/A',
            eInvoiceStatus: gstData.einvoiceStatus || 'N/A'
          }
        };
      } else {
        return {
          success: true,
          isValid: false,
          error: response.data.message || 'GSTIN not found or inactive'
        };
      }
      
    } catch (error) {
      console.error('GSTIN verification API error:', error);
      return {
        success: false,
        isValid: false,
        error: error.response?.data?.message || 'GSTIN verification service unavailable'
      };
    }
  }

  // Helper method to format address from the API response
  static formatAddress(pradr) {
    if (!pradr) return 'N/A';
    
    if (typeof pradr === 'string') {
      return pradr;
    }
    
    if (pradr.addr) {
      const addr = pradr.addr;
      const parts = [
        addr.bnm,
        addr.st,
        addr.loc,
        addr.city,
        addr.dst,
        addr.stcd,
        addr.pncd
      ].filter(part => part && part.trim() !== '');
      
      return parts.join(', ');
    }
    
    return pradr.adr || 'N/A';
  }
}

module.exports = GstinService;