import { EMAIL_ENDPOINT } from 'constant';
import getContainer from 'test-tool/TestRoot';

describe('Email', () => {
  test('only email', async () => {
    const { email, httpGateway } = getContainer();
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
    const { email, httpGateway } = getContainer();
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
