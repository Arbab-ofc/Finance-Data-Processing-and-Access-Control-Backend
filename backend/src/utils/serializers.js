export const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};
