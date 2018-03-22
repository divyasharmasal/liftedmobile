import Cookies from "js-cookie";

const authFetch = function(url){
  return fetch(url, {
    method: "GET",
    cache: "no-cache",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache': 'no-cache'
    },
    credentials: 'include'
  });
}

const authPost = function(url, data){
  return fetch(url, {
    method: "POST",
    cache: "no-cache",
    body: JSON.stringify(data),
    headers: {
      "X-CSRFToken": Cookies.get("csrftoken"),
      'Cache': 'no-cache'
    },
    credentials: 'include'
  });
}
export { authFetch, authPost };
