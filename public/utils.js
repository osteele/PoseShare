function getHashParameter(name) {
  const url = new URL(window.location.href);
  // If the URL has contains contains a substring of the form 'name=value' or 'name',
  // separated by a '&' character, then return the value of the 'name' parameter
  // if it has the form 'name=value' else return true. If it does not contain such
  // a substring, return null.
  const regex = new RegExp(`${name}(=([^&]*))?`);
  const match = url.hash.match(regex);
  if (match) {
    return match[2] || true;
  }
  return null;
}

function setHashParameter(url, name, value) {
  // Replace the value of the 'name' parameter in the URL with the given value.
  // If the URL does not contain such a substring, add it.
  const regex = new RegExp(`${name}(=([^&]*))?`);
  const match = url.hash.match(regex);
  if (match) {
    url.hash = url.hash.replace(regex, `${name}=${value}`);
  } else {
    url.hash = `${url.hash}&${name}=${value}`.replace(/^&/, '');
  }
}

function getQueryParameter(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// TODO: Replace by getQueryParameter
function getQueryString(key) {
  const entry = window.location.search.substring(1)
    .split('&')
    .find(pair => pair.split('=')[0] === key);
  return entry ? entry.split('=')[1] : null;
}
