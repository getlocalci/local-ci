import Email from 'license/Email';
import HttpGateway from 'gateway/HttpGateway';
import { EMAIL_ENDPOINT } from 'constant';
import getContainer from 'test-tool/TestRoot';

let email: Email;
let httpGateway: HttpGateway;

describe('Email', () => {
  beforeEach(() => {
    const container = getContainer();
    email = container.email;
    httpGateway = container.httpGateway;
  });

  test('only email', async () => {
    const emailAddress = 'a@example.com';

    const postSpy = jest.fn();
    httpGateway.post = postSpy;

    await email.sendEnteredEmail(emailAddress);
    expect(postSpy).toHaveBeenCalledWith(EMAIL_ENDPOINT, {
      name: undefined,
      email: emailAddress,
      optedIn: undefined,
    });
  });

  test('all fields', async () => {
    const emailAddress = 'a@example.com';
    const name = 'Jane';
    const optedIn = true;

    const postSpy = jest.fn();
    httpGateway.post = postSpy;

    await email.sendEnteredEmail(emailAddress, name, optedIn);
    expect(postSpy).toHaveBeenCalledWith(EMAIL_ENDPOINT, {
      name,
      email: emailAddress,
      optedIn,
    });
  });
});
