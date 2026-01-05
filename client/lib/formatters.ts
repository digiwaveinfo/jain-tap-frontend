/**
 * Shared Formatting Utilities (Issue #18 fix)
 * Centralizes duplicate formatting functions
 */

const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Convert number to Gujarati numerals
 */
export const toGujaratiNumeral = (num: number | string): string => {
  return String(num).split('').map(d => {
    const digit = parseInt(d);
    return isNaN(digit) ? d : gujaratiDigits[digit];
  }).join('');
};

/**
 * Convert number to Hindi numerals
 */
export const toHindiNumeral = (num: number | string): string => {
  return String(num).split('').map(d => {
    const digit = parseInt(d);
    return isNaN(digit) ? d : hindiDigits[digit];
  }).join('');
};

/**
 * Format date based on language
 */
export const formatDateByLanguage = (
  dateStr: string, 
  language: string,
  months?: string[]
): string => {
  if (!dateStr) return "-";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    if (language === 'gu') {
      return `${toGujaratiNumeral(dd)}/${toGujaratiNumeral(mm)}/${toGujaratiNumeral(yyyy)}`;
    }

    if (language === 'hi') {
      return `${toHindiNumeral(dd)}/${toHindiNumeral(mm)}/${toHindiNumeral(yyyy)}`;
    }

    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
};

/**
 * Format date with month name
 */
export const formatDateWithMonth = (
  dateStr: string,
  language: string,
  months: string[]
): string => {
  if (!dateStr) return "-";
  
  try {
    const [dd, mm, yyyy] = dateStr.split('/');
    const monthIndex = parseInt(mm) - 1;
    
    if (language === 'gu') {
      return `${toGujaratiNumeral(parseInt(dd))} ${months[monthIndex]} ${toGujaratiNumeral(parseInt(yyyy))}`;
    }
    
    if (language === 'hi') {
      return `${toHindiNumeral(parseInt(dd))} ${months[monthIndex]} ${toHindiNumeral(parseInt(yyyy))}`;
    }
    
    return `${dd} ${months[monthIndex]} ${yyyy}`;
  } catch {
    return dateStr;
  }
};

/**
 * Sanitize text for display (basic XSS prevention)
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
