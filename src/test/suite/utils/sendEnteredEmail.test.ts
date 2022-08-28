import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import axios from 'axios';

import sendEnteredEmail from '../../../utils/license/sendEnteredEmail';
import { EMAIL_ENDPOINT } from '../../../constants';

mocha.afterEach(() => {
  sinon.restore();
});

suite('sendEnteredEmail', () => {
  test('only email', async () => {
    const email = 'a@example.com';

    const spy = sinon.spy();
    sinon.stub(axios, 'post').value(spy);

    await sendEnteredEmail(email);
    assert(
      spy.calledOnceWith(EMAIL_ENDPOINT, {
        name: undefined,
        email,
        optedIn: undefined,
      })
    );
  });

  test('all fields', async () => {
    const email = 'a@example.com';
    const name = 'Jane';
    const optedIn = true;

    const spy = sinon.spy();
    sinon.stub(axios, 'post').value(spy);

    await sendEnteredEmail(email, name, optedIn);
    assert(
      spy.calledOnceWith(EMAIL_ENDPOINT, {
        name,
        email,
        optedIn,
      })
    );
  });
});
