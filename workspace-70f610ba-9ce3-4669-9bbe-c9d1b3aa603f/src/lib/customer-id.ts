export function generateCustomerId(lastCustomerId?: string): string {
  // Pattern: A-000a01 to ZZZ-999z99
  
  // If no last customer ID provided, start with A-000a01
  if (!lastCustomerId) {
    return 'A-000a01'
  }
  
  // Define the character sets
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lettersLower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  
  // Parse the last customer ID
  const parts = lastCustomerId.split('-')
  const prefix = parts[0]
  const numberPart = parts[1].substring(0, 3)
  const letterSuffix = parts[1][3]
  const numberSuffix = parts[1].substring(4)
  
  // Increment number suffix (01-99)
  let newNumberSuffix = parseInt(numberSuffix) + 1
  let newLetterSuffix = letterSuffix
  let newNumberPart = numberPart
  let newPrefix = prefix
  
  if (newNumberSuffix > 99) {
    newNumberSuffix = 1
    
    // Increment letter suffix (a-z)
    const currentLetterIndex = lettersLower.indexOf(letterSuffix)
    if (currentLetterIndex < lettersLower.length - 1) {
      newLetterSuffix = lettersLower[currentLetterIndex + 1]
    } else {
      newLetterSuffix = 'a'
      
      // Increment number part (000-999)
      let newNumber = parseInt(numberPart) + 1
      if (newNumber > 999) {
        newNumber = 0
        
        // Increment prefix
        newPrefix = incrementPrefix(prefix)
      }
      newNumberPart = String(newNumber).padStart(3, '0')
    }
  }
  
  return `${newPrefix}-${newNumberPart}${newLetterSuffix}${String(newNumberSuffix).padStart(2, '0')}`
}

export function validateCustomerId(customerId: string): boolean {
  // Validate the customer ID format
  const pattern = /^[A-Z]{1,3}-\d{3}[a-z]\d{2}$/
  return pattern.test(customerId)
}

function incrementPrefix(prefix: string): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  if (prefix.length === 1) {
    const currentIndex = letters.indexOf(prefix)
    if (currentIndex < letters.length - 1) {
      return letters[currentIndex + 1]
    } else {
      return 'AA'
    }
  } else if (prefix.length === 2) {
    const firstChar = prefix[0]
    const secondChar = prefix[1]
    
    if (secondChar < 'Z') {
      return firstChar + letters[letters.indexOf(secondChar) + 1]
    } else {
      if (firstChar < 'Z') {
        return letters[letters.indexOf(firstChar) + 1] + 'A'
      } else {
        return 'AAA'
      }
    }
  } else if (prefix.length === 3) {
    const firstChar = prefix[0]
    const secondChar = prefix[1]
    const thirdChar = prefix[2]
    
    if (thirdChar < 'Z') {
      return firstChar + secondChar + letters[letters.indexOf(thirdChar) + 1]
    } else if (secondChar < 'Z') {
      return firstChar + letters[letters.indexOf(secondChar) + 1] + 'A'
    } else if (firstChar < 'Z') {
      return letters[letters.indexOf(firstChar) + 1] + 'AA'
    } else {
      return 'AAA' // Reset or handle overflow
    }
  }
  
  return prefix
}