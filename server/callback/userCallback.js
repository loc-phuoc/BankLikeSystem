import axios from 'axios';
import env from '../config/env.js';

// Log responses from external API calls
const logApiResponse = (action, response) => {
  console.log(`External API ${action} response:`, {
    status: response.status,
    statusText: response.statusText,
    data: response.data
  });
};

/**
 * Callback that notifies an external payment processor when deposits occur
 * @param {Error|null} error - Error object if operation failed
 * @param {Object} result - Result data from the deposit operation
 */
export async function updateUserAllowPayment(error, result) {
  if (error) {
    console.error('Original operation failed, skipping callback:', error);
    return;
  }

  try {
    const response = await axios.post(
      `${env.accountService}/api/v1/account/allowPayment`, 
      {
        username: result.username,
        address: result.address,
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    logApiResponse('payment notification', response);
  } catch (error) {
    console.error('Failed to notify payment processor:', error.message);
    
    // Optional: Implement retry logic or add to a queue for later retry
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from payment processor');
    }
  }
}

