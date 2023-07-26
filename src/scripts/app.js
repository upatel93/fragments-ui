// src/app.js

import { Auth, getUser } from './auth';
import {
  getUserFragments,
  getFragmentById_API,
  getFragmentInfoById_API,
  getHealthCheck_API,
  getFragmentsExp_API,
  postFragment_API,
  postFragmentImage,
  putFragment_API,
  deleteFragmentById_API,
} from './api';

async function init() {
  // User UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // Get Routes UI Elements
  const getHealth = document.querySelector('#getHealth');
  const getFragmentById = document.querySelector('#getFragmentById');
  const getFragments = document.querySelector('#getFragments');
  const getFragmentsExp = document.querySelector('#getFragmentsExp');
  // Get Container
  const getContainer = document.querySelector('#getContainer');

  // Post Routes UI Element
  const postFragmentTxt = document.querySelector('#postFragmentTxt');
  const postFragmentImg = document.querySelector('#postFragmentImg');
  // Post Container
  const postContainer = document.querySelector('#postContainer');

  //Put Routes UI Element
  const putFragmentById = document.querySelector('#putFragmentById');
  // Putt Container
  const putContainer = document.querySelector('#putContainer');

  // Delete Routes UI Element
  const deleteFragmentById = document.querySelector('#deleteFragmentById');
  // Delete Container
  const deleteContainer = document.querySelector('#deleteContainer');

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

  // GET Routes............................................................................
  getHealth.onclick = async () => {
    let data = await getHealthCheck_API();
    if (data) {
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  getFragmentById.onsubmit = async (event) => {
    event.preventDefault();
    const clickedButtonName = event.submitter.getAttribute('name');
    console.log(clickedButtonName);
    let data = null;
    if (clickedButtonName === 'withInfo') {
      data = await getFragmentInfoById_API(user, event.target.elements[0].value);
    } else {
      data = await getFragmentById_API(user, event.target.elements[0].value);
    }
    if (data && data.type == 'image') {
      try {
        // Try to create an image URL from the data
        const imageUrl = URL.createObjectURL(data.data);
        // Create an <img> element and set its source to the image URL
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        // Clear the content of getContainer and append the image element
        getContainer.innerText = '';
        getContainer.appendChild(imgElement);
      } catch (err) {
        getContainer.innerText = err.message;
      }
    } else if (data.type === 'md') {
      getContainer.innerHTML = data.data;
    } else if (data.type === 'html') {
      getContainer.innerHTML = data.data;
    } else {
      if (data.type === 'json') {
        getContainer.innerText = JSON.stringify(data.data, null, 2);
      } else {
        getContainer.innerText = data;
      }
    }
  };

  getFragments.onclick = async () => {
    let data = await getUserFragments(user);
    if (data) {
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  getFragmentsExp.onclick = async () => {
    let data = await getFragmentsExp_API(user);
    if (data) {
      getContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  // Post Routes...........................................................................
  postFragmentTxt.onsubmit = async (event) => {
    event.preventDefault();
    const to_send = { value: event.target.elements[0].value, type: event.target.elements[1].value };
    // For Debug
    console.log(to_send);
    let data = await postFragment_API(user, to_send);
    if (data) {
      postContainer.innerText = JSON.stringify(data.data, null, 2);
    }
  };

  postFragmentImg.onsubmit = async (event) => {
    event.preventDefault();
    let data = await postFragmentImage(user, event.target.elements[0].files[0]);
    if (data) {
      postContainer.innerText = JSON.stringify(data.data, null, 2);
    }
  };

  // Put Routes............................................................................

  putFragmentById.onsubmit = async (event) => {
    event.preventDefault();
    const id = event.target.elements[0].value;
    const text = event.target.elements[1].value;
    const contentType = event.target.elements[2].value;
    const image = event.target.elements[3].value;

    if (!text.trim() && !image.trim()) {
      alert('Please provide either the Text content or select an Image.');
      event.target.elements[1].value = '';
      event.target.elements[3].value = '';
      return;
    }

    if (text && !image.trim()) {
      const to_send = { value: text, type: contentType, id: id };
      let data = await putFragment_API(user, to_send);
      if (data) {
        putContainer.innerText = JSON.stringify(data.data, null, 2);
      }
    } else if (image.trim() && !text.trim()) {
      const to_send = {
        value: event.target.elements[3].files[0],
        type: event.target.elements[3].files[0].type,
        id: id,
      };
      let data = await putFragment_API(user, to_send);
      if (data) {
        putContainer.innerText = JSON.stringify(data.data, null, 2);
      }
    } else {
      alert('Please provide either the Text content or select an Image. "NOT BOTH"');
      event.target.elements[1].value = '';
      event.target.elements[3].value = '';
    }
  };

  // Delete Routes.........................................................................
  deleteFragmentById.onsubmit = async (event) => {
    event.preventDefault();
    let data = await deleteFragmentById_API(user, event.target.elements[0].value);
    if (data) {
      console.log(data);
      deleteContainer.innerText = JSON.stringify(data, null, 2);
    }
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    postFragmentTxt.querySelector('button').disabled = true;
    getFragments.disabled = true;
    getFragmentById.querySelector('button').disabled = true;
    getFragmentsExp.disabled = true;
    postFragmentImg.querySelector('button').disabled = true;
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
  getFragmentById.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
