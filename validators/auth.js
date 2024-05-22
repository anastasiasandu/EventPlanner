const Validator = require('Validator');
const bcrypt = require('bcrypt');
const { prisma } = require('../prisma/connection');
const { isEmail } = require('../utils');

const signupValidator = async (data) => {
  let { username, email, password, confirm } = data;
  let errors = {};

  const rules = {
    username: ['required', 'max:20'],
    email: ['required'],
    password: ['min:6']
  };

  const messages = {
    required: ':attr field is required',
    email: 'Invalid email address',
    regex: 'Invalid username',
    max: 'Maximum 20 characters are allowed',
    min: 'Minimum 8 characters are required'
  };

  let v = Validator.make(data, rules, messages);
  v.passes();
  let otherErrors = v.getErrors();
  errors = { ...errors, ...otherErrors };

  return errors;
};

const loginValidator = async (data) => {
  const { email, password } = data;
  let errors = {};
  console.log("/////////");
  console.log(data);

  let user = await prisma.user.findUnique({ where: {email: email} });
  if (!user) {
    errors['credentials'] = 'No active account found with the provided credentials';
  } else {
    let isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      errors['password'] = 'Incorrect password';
    }
  }

  const rules = {
    email: 'required',
    password: 'required'
  };
  const messages = {
    required: ':attr field is required'
  };

  const v = Validator.make(data, rules, messages);
  v.passes();
  let otherErrors = v.getErrors();
  errors = { ...errors, ...otherErrors };

  return { errors, user };
};

module.exports = { signupValidator, loginValidator };
