// src/app.js

import { Auth, getUser } from './auth';
import {
  getUserFragments,
  postFragment,
  postFragmentImage,
  getHealthCheck,
  getFragmentByIdReq,
  getUserFragmentsExp,
} from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const postFragmentRoute = document.querySelector('#postFragment');
  const postFragmentimage = document.querySelector('#imageForm');
  const getContainer = document.querySelector('#getContainer');
  const postContainer = document.querySelector('#postContainer');
  const getHealth = document.querySelector('#getHealth');
  const getFragmentsById = document.querySelector('#getFragmentsId');
  const getUserFrag = document.querySelector('#getUserFragments');
  const getUserFragExpanded = document.querySelector('#getUserFragmentsExpanded');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  postFragmentRoute.onsubmit = async (event) => {
    event.preventDefault();
    const to_send = { value: event.target.elements[0].value, type: event.target.elements[1].value };
    console.log(to_send);
    let data = await postFragment(user, to_send);
    if (data) {
      // Parse the JSON string
      var jsonData = JSON.parse(data);
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(jsonData, null, 2);
      postContainer.innerText = formattedJson;
    }
  };

  postFragmentimage.onsubmit = async (event) => {
    event.preventDefault();
    var imageFile = event.target.elements[0].files[0];
    let data = await postFragmentImage(user, imageFile);
    if (data) {
      // Parse the JSON string
      var jsonData = JSON.parse(data);
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(jsonData, null, 2);
      postContainer.innerText = formattedJson;
    }
  };

  getHealth.onclick = async () => {
    let data = await getHealthCheck();
    if (data) {
      // Parse the JSON string
      var jsonData = JSON.parse(data);
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(jsonData, null, 2);
      getContainer.innerText = formattedJson;
    }
  };

  getFragmentsById.onsubmit = async (event) => {
    event.preventDefault();
    let data = await getFragmentByIdReq(user, event.target.elements[0].value);
    if (data) {
      try {
        // Try to create an image URL from the data
        const imageUrl = URL.createObjectURL(data);
        // Create an <img> element and set its source to the image URL
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        // Clear the content of getContainer and append the image element
        getContainer.innerText = '';
        getContainer.appendChild(imgElement);
      } catch {
        // If creating the image element fails, display the data as text
        getContainer.innerText = data;
      }
    }
  };

  getUserFrag.onclick = async () => {
    let data = await getUserFragments(user);
    if (data) {
      var formattedJson = JSON.stringify(data, null, 2);
      getContainer.innerText = formattedJson;
    }
  };

  getUserFragExpanded.onclick = async () => {
    let data = await getUserFragmentsExp(user);
    if (data) {
      var formattedJson = JSON.stringify(data, null, 2);
      getContainer.innerText = formattedJson;
    }
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    postFragmentRoute.querySelector('button').disabled = true;
    getUserFrag.disabled = true;
    getFragmentsById.querySelector('button').disabled = true;
    getUserFragExpanded.disabled = true;
    postFragmentimage.querySelector('button').disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText =
    user.username.charAt(0).toUpperCase() + user.username.slice(1);

  // Disable the Login button
  loginBtn.disabled = true;

  // Disabling getFragmentsById till user post it and we get id.
  getFragmentsById.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);

