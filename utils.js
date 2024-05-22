const Validator = require('Validator');

function isEmail(data) {
  const rules = {
    email: 'email',
  };

  const messages = {
    email: 'should be an email',
  };

  let v = Validator.make(data, rules, messages);
  v.passes();
  let errors = v.getErrors();
  return !errors.email;
}

module.exports = { isEmail };
