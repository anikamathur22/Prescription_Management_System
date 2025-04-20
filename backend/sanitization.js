/**
 * Converts a string to its hex-encoded unicode representation
 * @param {string} input - The input string to be sanitized
 * @returns {string} Hex-encoded unicode representation of the input
 */
function sanitizeToHex(input) {
    if (input === null || input === undefined) return '';
    
    return Array.from(input)
      .map(char => {
        // Get the unicode code point of the character
        const codePoint = char.codePointAt(0);
        
        // Convert to hex, padding to ensure 4-digit representation
        return '\\u' + codePoint.toString(16).padStart(4, '0');
      })
      .join('');
  }
  
  /**
   * Converts a hex-encoded unicode string back to its original form
   * @param {string} hexInput - The hex-encoded unicode string
   * @returns {string} Decoded original string
   */
  function decodeFromHex(hexInput) {
    // Use a regular expression to find all \uXXXX patterns
    return hexInput.replace(/\\u([0-9a-fA-F]{4})/g, (match, hexCode) => {
      // Convert hex code point back to character
      return String.fromCodePoint(parseInt(hexCode, 16));
    });
  }
  
  /**
   * Comprehensive input sanitization function
   * @param {*} input - The input to be sanitized
   * @param {Object} options - Optional configuration for sanitization
   * @returns {Object} Sanitization result with hex-encoded and original inputs
   */
  function sanitizeInput(input, options = {}) {
    const {
      trimWhitespace = true,
      removeSpecialChars = false,
      maxLength = null,
      allowNumeric = false,
      allowAlphabetic = true,
      allowSpaces = true
    } = options;
  
    // Handle null or undefined
    if (input === null || input === undefined) {
      return {
        original: input,
        sanitized: '',
        hexEncoded: ''
      };
    }
  
    // Convert to string
    let processedInput = String(input);
  
    // Optional trim
    if (trimWhitespace) {
      processedInput = processedInput.trim();
    }
  
    // Special character removal with advanced filtering
    if (removeSpecialChars) {
      let pattern = '^';
      
      if (allowNumeric) pattern += '0-9';
      if (allowAlphabetic) pattern += 'a-zA-Z';
      if (allowSpaces) pattern += '\\s';
      
      processedInput = processedInput.replace(new RegExp(`[^${pattern}]`, 'gi'), '');
    }
  
    // Optional length restriction
    if (maxLength && processedInput.length > maxLength) {
      processedInput = processedInput.slice(0, maxLength);
    }
  
    // Escape HTML to prevent XSS
    processedInput = processedInput
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  
    // Hex encode
    const hexEncoded = sanitizeToHex(processedInput);
  
    return {
      original: input,
      sanitized: processedInput,
      hexEncoded: hexEncoded
    };
  }
  
  /**
   * Validate and sanitize email addresses
   * @param {string} email - Email address to validate
   * @returns {Object} Validation and sanitization result
   */
  function sanitizeEmail(email) {
    const sanitizedEmail = sanitizeInput(email, { 
      trimWhitespace: true,
      removeSpecialChars: false,
      maxLength: 100
    });
  
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(sanitizedEmail.sanitized);
  
    return {
      ...sanitizedEmail,
      isValid: isValid
    };
  }
  
  /**
   * Validate and sanitize phone numbers
   * @param {string} phone - Phone number to validate
   * @returns {Object} Validation and sanitization result
   */
  function sanitizePhone(phone) {
    const sanitizedPhone = sanitizeInput(phone, { 
      trimWhitespace: true,
      removeSpecialChars: true,
      allowNumeric: true
    });
  
    // Remove any non-numeric characters and validate
    const cleanedPhone = sanitizedPhone.sanitized.replace(/\D/g, '');
    const isValid = cleanedPhone.length >= 10 && cleanedPhone.length <= 15;
  
    return {
      ...sanitizedPhone,
      sanitized: cleanedPhone,
      isValid: isValid
    };
  }
  
  /**
   * Validate and sanitize SSN
   * @param {string} ssn - Social Security Number to validate
   * @returns {Object} Validation and sanitization result
   */
  function sanitizeSSN(ssn) {
    const sanitizedSSN = sanitizeInput(ssn, { 
      trimWhitespace: true,
      removeSpecialChars: true,
      allowNumeric: true
    });
  
    // SSN validation regex (XXX-XX-XXXX format)
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    const isValid = ssnRegex.test(
      `${sanitizedSSN.sanitized.slice(0,3)}-${sanitizedSSN.sanitized.slice(3,5)}-${sanitizedSSN.sanitized.slice(5)}`
    );
  
    return {
      ...sanitizedSSN,
      sanitized: isValid 
        ? `${sanitizedSSN.sanitized.slice(0,3)}-${sanitizedSSN.sanitized.slice(3,5)}-${sanitizedSSN.sanitized.slice(5)}` 
        : '',
      isValid: isValid
    };
  }
  
  export { 
    sanitizeToHex, 
    decodeFromHex, 
    sanitizeInput,
    sanitizeEmail,
    sanitizePhone,
    sanitizeSSN
  };