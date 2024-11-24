export const generateRandomNumber = (digit) => {
    if (digit <= 0 || isNaN(digit) || !Number.isInteger(digit)) {
        throw new Error('Please provide a valid positive integer for numDigits');
    }
    
    const min = Math.pow(10, digit - 1);
    const max = Math.pow(10, digit) - 1;

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}