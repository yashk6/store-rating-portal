const validateEmail = (email) => {
  if (!email) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please provide a valid email address.';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return 'Password must contain at least one uppercase letter.';
  }
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasSpecial) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

const validateName = (name) => {
  if (!name) return 'Name is required.';
  if (name.length < 20 || name.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
};

const validateAddress = (address) => {
  if (!address) return 'Address is required.';
  if (address.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
};

const validateRegistration = ({ name, email, password, address }) => {
  const nameErr = validateName(name);
  if (nameErr) return nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) return passwordErr;

  const addressErr = validateAddress(address);
  if (addressErr) return addressErr;

  return null;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateRegistration,
};
