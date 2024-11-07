module.exports = class UserDto {
  email;
  password;
  isActivated;
  activatorLink;
  name;
  role;
  plan;
  constructor(user) {
    this.email = user.email;
    this.password = user.password;
    this.isActivated = user.isActivated;
    this.activatorLink = user.activatorLink;
    this.name = user.name;
    this.role = user.role;
    this.plan = user.plan;
  }
};
