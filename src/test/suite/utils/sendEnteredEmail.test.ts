import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import axios from 'axios';

import sendEnteredEmail from '../../../utils/sendEnteredEmail';
import { EMAIL_ENDPOINT } from '../../../constants';

mocha.afterEach(() => {
  sinon.restore();
});

suite('sendEnteredEmail', () => {
  test('only email', () => {
    const email = 'a@example.com';

    const spy = sinon.spy();
    sinon.stub(axios, 'post').value(spy);

    sendEnteredEmail(email);
    assert(
      spy.calledOnceWith(EMAIL_ENDPOINT, {
        form_id: 5,
        '1': undefined,
        '3': email,
        '4.1': undefined,
        '4.2': undefined,
      })
    );
  });

  test('all fields', () => {
    const email = 'a@example.com';
    const name = 'Jane';
    const optedIn = true;

    const spy = sinon.spy();
    sinon.stub(axios, 'post').value(spy);

    sendEnteredEmail(email, name, optedIn);
    assert(
      spy.calledOnceWith(EMAIL_ENDPOINT, {
        form_id: 5,
        '1': name,
        '3': email,
        '4.1': '1',
        '4.2': 'yes',
      })
    );
  });
});
