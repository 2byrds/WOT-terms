import { Octokit, App } from 'octokit';
/**
 * Client-Side Upvote Script for Search Results
 * Author: Kor Dwarshuis
 * Created: 2023-09-17
 * Updated: -
 *
 * Description: This script adds upvote functionality to KERISSE search results.
 * It listens for clicks on elements with the class "upvote" and captures
 * relevant search result data. 
 *
 * The script also prompts users for a simple anti spam check.
 * Once the user's answer is verified by a remote PHP script, an upvote is sent to another
 * remote PHP script. A token is stored in a cookie for future upvotes without requiring
 * the user to answer the prompt again.
 *
 * Dependencies:
 * - Octokit, App from 'octokit'
 * - Awesome-Notifications (AWN) for user notifications
 *
 * Configuration variables are specified under the CONFIG section. 
 * They include the URLs for the remote PHP scripts for upvoting and answer-checking, 
 * as well as messages displayed to the user.
 * 
 * https://f3oall.github.io/awesome-notifications/docs/why-such-awesome
 * https://www.npmjs.com/package/awesome-notifications
 * https://github.com/f3oall/awesome-notifications#readme
 */

// import AWN from 'awesome-notifications';
import AWN from './libs/awesome-notifications.js';

// Initialize instance of AWN, awesome notifications
let notifier = new AWN({
  maxNotifications: 6,
  durations: {
    alert: 0,
    success: 4000,
  },
  icons: {
    enabled: false,
  },
});

const upvoteSearchResult = () => {
  // CONFIG
  const remoteUpvoteScript = 'https://dwarshuis.com/various/kerisse/php_scripts/upvotes.php';
  const remoteCheckAnswerScript = 'https://dwarshuis.com/various/kerisse/php_scripts/checkAnswer.php';
  const promptText = '- - - - - - - - -\nCheck: What is the four letter word (in lowercase) for the identity system based secure overlay for the Internet?\n\nSet the cookie. Go!!!';
  const upvoteSentText = 'Your upvote has been sent. This is a test and currently we are manually checking and processing the results.';
  const upvoteNotSentText = `Not the answer we expected. Your upvote has NOT been sent.`;
  const continueText = 'You are upvoting a search result.';
  // END CONFIG

  let activeButton = null;
  let upvoteData = {};

  // Add event listener to the upvote buttons. 
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('upvote')) {
      // Take the url from the href in the previous element
      let searchHitUrl = event.target.previousElementSibling.getAttribute('href');

      // Take the search term from the search box
      let searchTerm = document.querySelector(".ais-SearchBox-input").value;

      // Create the upvote data object
      upvoteData.name = searchTerm.replace(/ /g, '-') + "-" + Math.floor(Date.now() / 1000); // Replace spaces with dashes, unix timestamp to make unique
      upvoteData.url = searchHitUrl;
      upvoteData.query = searchTerm;
      upvoteData.position = "1";
      upvoteData.match = "exact";
      activeButton = event.target;
      submitAnswer();
    }
  });

  function submitAnswer() {
    // First, check if there is any cookie set at all.
    if (document.cookie.indexOf("upvoteAnswer=") !== -1) {
      // Read the stored token from the cookie
      let cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('upvoteAnswer='))
        .split('=')[1];

      // Here we could validate the token against the server, but this is a basic check, we will leave it for now.
      // For now, we skip the question.
      // sendContent(upvoteData, cookieValue);
      const userResponse = confirm(continueText);
      if (userResponse) {
        // Code to execute if the user clicks "OK"
        console.log("You chose to continue!");
        sendContent(upvoteData, cookieValue);
        console.log("sendContent");
        // Disable the upvote button
        activeButton.disabled = true;
      } else {
        // Code to execute if the user clicks "Cancel"
        console.log("You chose to cancel.");
        return
      }
    } else {
      // User has not yet answered the question
      const userAnswer = prompt(promptText, "");
      fetch(remoteCheckAnswerScript, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `user_answer=${userAnswer}`
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log("Correct answer!");
            document.cookie = `upvoteAnswer=${data.token}; max-age=31536000`; // Expires after 1 year

            const userResponse = confirm(continueText);
            if (userResponse) {
              // Code to execute if the user clicks "OK"
              console.log("You chose to continue!");
              sendContent(upvoteData, data.token);
              console.log("sendContent");
              // Disable the upvote button
              activeButton.disabled = true;
            } else {
              // Code to execute if the user clicks "Cancel"
              console.log("You chose to cancel.");
              return
            }
          } else {
            console.log("Incorrect answer!");
            notifier.confirm(
              upvoteNotSentText,
              onOk,
              false,
              {
                labels: {
                  confirm: 'Info',
                },
              }
            );
          }
        });
    }
  }

  let onOk = () => {
    // notifier.info('You pressed OK');
  };


  function sendContent(data, token) {
    var formData = new FormData();

    formData.append('content', JSON.stringify(data));
    formData.append('token', token); // Add the token

    // Send the data to the remote script
    fetch(remoteUpvoteScript, { method: 'POST', body: formData });

    notifier.confirm(
      upvoteSentText,
      onOk,
      false,
      {
        labels: {
          confirm: 'Info',
        },
      }
    );
  }
};

export function onRouteDidUpdate({ location, previousLocation }) {
  // Don't execute if we are still on the same page; the lifecycle may be fired
  // because the hash changes (e.g. when navigating between headings)
  // if (location.pathname === previousLocation?.pathname) return;
  upvoteSearchResult();
}
