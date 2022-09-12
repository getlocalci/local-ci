import Email from 'license/Email';
import { EMAIL_ENDPOINT } from 'constant';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeHttpGateway from 'gateway/FakeHttpGateway';

let testHarness: AppTestHarness;
let email: Email;
let httpGateway: FakeHttpGateway;

describe('Email', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    email = testHarness.container.get(Email);
    httpGateway = testHarness.httpGateway;
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
