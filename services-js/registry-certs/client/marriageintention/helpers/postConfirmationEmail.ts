import axios from 'axios';
import qs from 'qs';

async function PostConfirmationEmail(data: {
  email: string;
  from: string;
  subject: string;
  message: string;
  fullName: string;
}) {
  const { email, from, subject, message, fullName } = data;

  try {
    let dataObj = qs.stringify({
      'email[to_address]': email,
      'email[from_address]': from,
      'email[subject]': subject,
      'email[message]': message,
      'email[name]': fullName,
      'email[sender]': 'City of Boston Registry',
      // 'email[template_id]': 20439969,
      'email[template_id]': 20558627,
    });

    let config: any = {
      method: 'post',
      url: '/marriageintention/fetchGraphql',
      data: dataObj,
    };

    return await axios(config)
      .then(response => {
        // eslint-disable-next-line no-console
        // console.error(JSON.stringify(response.data));
        return response.data;
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('RESPONSE 200 >', e);
    return e;
  }
}

export default PostConfirmationEmail;
