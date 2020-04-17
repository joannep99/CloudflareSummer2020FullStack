/**
 * Global constants and variables. 
 */
const uri_path = "https://cfw-takehome.developers.workers.dev/api/variants"; // the URI to the API to fetch data from 
const newURL = "https://www.youtube.com/watch?v=2JLeumhsZFM"; // the new link on my website 
var versionNumber = ""; // which one of the two URI's I used. 

/**
 * Helps rewrite the HTML in our website. Uses the Cloudflare HTMLRewriter. 
 * Takes an incoming element, and parses it by the tag. Then updates the content or attribute of the tag 
 * depending on what I wanted to change in the HTML. 
 */
class ElementHandler {
  element(element) {
    // An incoming element, such as `div`
    var tag = element.tagName; 
    if (tag == "title" || tag == "h1") {
      element.setInnerContent("Joanne's Cloudflare Project!");
    } else if (tag == "p") {
      const bio = ". Thank you so much for giving me the opportunity to take " + 
                   "the Cloudflare Summer 2020 full-stack internship challenge. " +
                   "It was a very fun and rewarding experience. " +
                   "I hope you have a great day. Click the link below for a Youtube " +
                   "video to brighten your day!";
      element.setInnerContent("This is VARIANT" + versionNumber + bio);
    } else if (tag == "a") {
      if (element.hasAttribute("href")) {
        element.setAttribute("href", newURL);
      }
      element.setInnerContent("Happy Video");
    }
  }
}

/**
 * Event listener to listen for any fetch requests and direct the request to the correct function, 
 * which in this case is the handleRequest(request) function. 
 */
addEventListener('fetch', async event => {
  await event.respondWith(handleRequest(event.request));
})


/** 
 * A helper function to help choose one of the 2 URI's from the original API. This will return either URI 
 * approximately 50% of the time in a random manner. 
 * @param variants A list of size 2, containing the two URI's from the API.
 * @return A string value of the URI chosen. 
 */
function chooseUri(variants) {
  let randomNum = Math.round(Math.random());
  let chosenUri = variants[randomNum];
  versionNumber = (randomNum + 1).toString(10);
  return chosenUri; 
}

/** 
 * Rewrites the HTML after fetching HTML from one of the 2 URI's. 
 * Modified: the title of the page (what displays in the tab bar), the header displayed on the page,
 * the description in the description box, and the URI that is linked on the page.
 * Calls to the ElementHandler() function to deal with different HTML requests specific to this website.
 */
const rewriter = new HTMLRewriter().on("title", new ElementHandler())
                                   .on("h1#title", new ElementHandler())
                                   .on("p#description", new ElementHandler())
                                   .on("a#url", new ElementHandler());
/**
 * Fetches two URI links from the API above (uri_path), and displays the HTML from one of the 
 * two links onto our website. Made calls to HTML Rewriter in this function as well.
 * Right now, each URI will display approximately 50% of the time in random order for each user. 
 * @param {Request} request
 * @return a response to the request. 
 */
async function handleRequest(request) {
  let chosenUri, responseChosenUri; 
  if (request.method == "GET") {
    try { // fetching data from API and displaying it. Also handles customization of HTML.
      var response = await fetch(uri_path);
      const {variants} = await response.json(); 
      chosenUri = chooseUri(variants);
      responseChosenUri = await fetch(chosenUri);
      response = rewriter.transform(responseChosenUri);
      return response;
    } catch(e) { // error handling 
      console.log(e);
      return new Response('Error in fetching data from API: ' + e);
    }
  } else {
    return new Response('Expected GET request', {status: 500});
  }
}
