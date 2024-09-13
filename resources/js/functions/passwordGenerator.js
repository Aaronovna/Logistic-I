export const generatePassword = (employee) => {
  const firstPart = employee.fname.slice(0, 2).toUpperCase();
  const secondPart = employee.sname.slice(0, 2).toUpperCase();
  const lastFourDigits = employee.employeeId.toString().slice(-4);

  const password = `#${firstPart}${secondPart}${lastFourDigits}`;
  return password;
}