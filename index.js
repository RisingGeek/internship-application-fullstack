addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const cookie = getCookie(request, 'urlvariant');
  // If cookie is already present, fetch the stored url
  if (cookie) {
    const url = cookie;
    const variant = await fetch(url);
    if (variant.ok) {
      // 1. Customize values inside variant
      class ElementHandler {
        element(element) {
          if (element.tagName == 'title') {
            element.setInnerContent('Title Changed');
          }
          else if (element.tagName == 'h1') {
            element.setInnerContent('This heading has been changed');
          }
          else if (element.tagName == 'p') {
            element.setInnerContent('This is changed variant of paragraph');
          }
          else if (element.tagName == 'a') {
            element.setAttribute('href', 'https://github.com/RisingGeek');
            element.setInnerContent('Return to my GitHub profile');
          }
        }
      }
      return new HTMLRewriter().on('*', new ElementHandler()).transform(variant);
    }
    return new Response('Some error occurred', {
      headers: { 'content-type': 'text/plain' },
    });
  }

  // 1. Request the URLs from the API
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  const response = await fetch(url);
  if (response.ok) {
    const json = await response.json();
    const urls = json.variants;

    // 2. Request a random variant to distribute requests between variants
    let max = urls.length;
    let random = Math.floor(Math.random() * Math.floor(max));

    //Store variant in cookie
    let d = new Date();
    d = new Date(d.getTime() + 1000 * 60 * 60 * 24 * 365);
    const urlvariant = `urlvariant=${urls[random]}; Expires=${d.toGMTString()} GMT; Path='/';`

    let variant = await fetch(urls[random]);

    if (variant.ok) {
      const html = await variant.text();
      return new Response(html, {
        headers: {
          'content-type': 'text/html',
          'Set-Cookie': urlvariant
        }
      });
    }
    return new Response('Some Error occurred', {
      headers: { 'content-type': 'text/plain' }
    });


  }
  else {
    return new Response('Some error occurred', {
      headers: { 'content-type': 'text/plain' },
    });
  }
}

function getCookie(request, name) {
  let cookieStr = request.headers.get('Cookie');
  let value = null;
  if (cookieStr) {
    let cookies = cookieStr.split(';');
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim();
      if (cookieName == name) {
        value = cookie.split('=')[1];
      }
    })
  }
  return value;
}
