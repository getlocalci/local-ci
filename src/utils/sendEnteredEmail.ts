import axios from 'axios';
import { EMAIL_ENDPOINT } from '../constants';

export default function sendEnteredEmail(
  email: string,
  name?: string,
  optedIntoNewsletter?: boolean
): void {
  axios.post(
    EMAIL_ENDPOINT,
    {
      form_id: 5,
      '1': name,
      '3': email,
      '4.1': optedIntoNewsletter ? '1' : undefined,
      '4.2': optedIntoNewsletter ? 'yes' : undefined,
    },
    {
      headers: {
        Authorization: `Basic`,
      },
    }
  );
}
