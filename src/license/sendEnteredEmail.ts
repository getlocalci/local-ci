import axios from 'axios';
import { EMAIL_ENDPOINT } from 'constants/';

export default async function sendEnteredEmail(
  email: string,
  name?: string,
  optedIn?: boolean
): Promise<void> {
  await axios.post(EMAIL_ENDPOINT, {
    name,
    email,
    optedIn,
  });
}
