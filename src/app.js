// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, postFragment, getHealthCheck, getFragmentByIdReq, getUserFragmentsExp } from './api';

let fragmentId = null;

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const postFragmentBtn = document.querySelector('#postFragment');
  const jsonContainer = document.querySelector('#json-container');
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

  postFragmentBtn.onclick = async () => {
    let data = await postFragment(user);
    if (data) {
      // Parse the JSON string
      var jsonData = JSON.parse(data);
      fragmentId = jsonData.fragment.id;
      getFragmentsById.disabled = false;
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(jsonData, null, 2);
      jsonContainer.innerText = formattedJson;
      jsonContainer.hidden = false;
    }
  };

  getHealth.onclick = async () => {
    let data = await getHealthCheck();
    if (data) {
      // Parse the JSON string
      var jsonData = JSON.parse(data);
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(jsonData, null, 2);
      jsonContainer.innerText = formattedJson;
      jsonContainer.hidden = false;
    }
  };

  getFragmentsById.onclick = async () => {
    let data = await getFragmentByIdReq(user,fragmentId);
    if (data) {
      jsonContainer.innerText = data
    }
  };

  getUserFrag.onclick = async () =>{
    let data = await getUserFragments(user);
    if (data) {
      // Parse the JSON string
      //var jsonData = JSON.parse(data);
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(data, null, 2);
      userSection.hidden = false;
      jsonContainer.innerText = formattedJson;
      jsonContainer.hidden = false;
    }
  }

  getUserFragExpanded.onclick = async () =>{
    let data = await getUserFragmentsExp(user);
    if (data) {
      // Parse the JSON string
      //var jsonData = JSON.parse(data);
      // Convert JSON to a formatted string
      var formattedJson = JSON.stringify(data, null, 2);
      userSection.hidden = false;
      jsonContainer.innerText = formattedJson;
      jsonContainer.hidden = false;
    }
  };


  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    postFragmentBtn.disabled = true;
    getUserFrag.disabled = true;
    getFragmentsById.disabled = true;
    getUserFragExpanded.disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
  
  // Disabling getFragmentsById till user post it and we get id.
  getFragmentsById.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
