addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  let url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  let response = await fetch(url);
  if (response.ok) {
    let json = await response.json();
    let urls = json.variants;

    let max = urls.length;
    let random = Math.floor(Math.random() * Math.floor(max));
    console.log(random);
    return Response.redirect(urls[random]);
  }
  else {
    return new Response('Some error occured', {
      headers: { 'content-type': 'text/plain' },
    })
  }
}
