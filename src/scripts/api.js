/* global process */
// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return { msg: err.message };
  }
}

/**
 * Posts a new fragment for the authenticated user.
 * 
 * @param {Object} user - The authenticated user.
 * @param {Object} text - The fragment text to be posted.
 * @returns {string} - The response data from the API.
 */
export async function postFragment(user, text) {
  console.log('Posting fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      method: 'POST',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': text.type,
      },
      body: text.value,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.text();
    console.log('Got the Response.', { data });
    return data;
  } catch (err) {
    console.error('Unable to call Post /v1/fragment', { err });
    return JSON.stringify({ msg: err.message });
  }
}

/**
 * Posts a new fragment image for the authenticated user.
 * 
 * @param {Object} user - The authenticated user.
 * @param {Object} imageFile - The fragment image file to be posted.
 * @returns {string} - The response data from the API.
 */
export async function postFragmentImage(user, imageFile) {
  console.log('Posting fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      method: 'POST',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': imageFile.type,
      },
      body: imageFile,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.text();
    console.log('Got the Response.', { data });
    return data;
  } catch (err) {
    console.error('Unable to call Post /v1/fragment', { err });
    return JSON.stringify({ msg: err.message });
  }
}

/**
 * Sends a health check request to the API.
 * 
 * @returns {string} - The response data from the API.
 */
export async function getHealthCheck() {
  console.log('Posting fragments data...');
  try {
    const res = await fetch(`${apiUrl}`);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.text();
    console.log('Got the Response.', data);
    return data;
  } catch (err) {
    console.error('Unable to call GET /', { err });
    return JSON.stringify({ msg: err.message });
  }
}

/**
 * Retrieves a specific fragment by its ID for the authenticated user.
 * 
 * @param {Object} user - The authenticated user.
 * @param {string} id - The ID of the fragment to retrieve.
 * @returns {Blob|string} - The fragment data (either blob for image or string for text) from the API.
 */
export async function getFragmentByIdReq(user, id) {
  console.log('Requesting to get fragment data..');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    if (res.headers.get('content-type').includes('image')) {
      const data = await res.blob();
      console.log('Got user fragment', { data });
      return data;
    } else {
      const data = await res.text();
      console.log('Got user fragment', { data });
      return data;
    }
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return err.message;
  }
}

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally) with expanded data.
 * We expect a user to have an `idToken` attached, so we can send that along
 * with the request.
 */
export async function getUserFragmentsExp(user) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return { msg: err.message };
  }
}
