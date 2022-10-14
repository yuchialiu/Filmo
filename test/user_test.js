const { expect } = require('chai');
const validator = require('validator');
const { validateSignUpInfo, validateSignInInfo } = require('../server/controllers/user_controller');

describe('validate sign up info', () => {
  it('should return true', () => {
    const expectedResult = true;
    const username = 'test_user_name';
    const email = 'test@test.com';
    const password = 'test_user_pwd';
    expect(validateSignUpInfo(username, email, password)).to.equal(expectedResult);
  });

  it('should return false', () => {
    const expectedResult = false;
    const userName = 'test_user_name';
    const email = 'test@test.com';
    const password = '';
    expect(validateSignUpInfo(userName, email, password)).to.equal(expectedResult);
  });
});

describe('validate sign in info', () => {
  it('should return true', () => {
    const expectedResult = true;
    const email = 'test@test.com';
    const password = 'test_user_pwd';
    expect(validateSignInInfo(email, password)).to.equal(expectedResult);
  });

  it('should return false', () => {
    const expectedResult = false;
    const email = 'test@test.com';
    const password = '';
    expect(validateSignInInfo(email, password)).to.equal(expectedResult);
  });
});

describe('validate email format', () => {
  it('should return true', () => {
    const expectedResult = true;
    const email = 'test@test.com';
    expect(validator.isEmail(email)).to.equal(expectedResult);
  });

  it('should return false', () => {
    const expectedResult = false;
    const email = 'test_email';
    expect(validator.isEmail(email)).to.equal(expectedResult);
  });
});
