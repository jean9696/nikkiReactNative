const FB = require('fb');
const GeoFire = require('geofire');
const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.eventsScrapperCron = functions.pubsub.topic('facebookEventsScrapper').onPublish(() => {
  FB.api('oauth/access_token', {
    client_id: '882770281812876',
    client_secret: '574016f3ba64af4d44ef2cc91558799b',
    grant_type: 'client_credentials',
  }, (res) => {
    if (!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    const accessToken = res.access_token;
    FB.setAccessToken(accessToken);
    const firebase = admin.database();
    firebase.ref('/pages').once('value')
      .then((PageSnapshot) => {
        const pages = PageSnapshot.val();
        Object.keys(pages).map(id => pages[id] && FB.api(
          `/${id}/events?time_filter=upcoming`,
          (response) => {
            if (response && !response.error) {
              const geoFireEventsRef = firebase.ref('/geoFireEvents');
              const geoFire = new GeoFire(geoFireEventsRef);
              Object.keys(response.data).map((key) => {
                const event = response.data[key];
                FB.api(
                  `/${event.id}?fields=interested_count,timezone,ticket_uri,ticketing_terms_uri,cover`,
                  (response2) => {
                    if (response2 && !response2.error) {
                      firebase.ref(`/events/${event.id}`).update(Object.assign(event, response2));
                    }
                  }
                );
                if (event.place && event.place.location) {
                  geoFire.set(
                    event.id, [event.place.location.latitude, event.place.location.longitude]
                  );
                }
              });
            }
          }
        ));
      });
  });
});


exports.pageScrapper = functions.database.ref('/pages/{pageId}').onWrite((event) => {
  const page = event.data.val();
  if (page.location) {
    const firebase = admin.database();
    const geoFireEventsRef = firebase.ref('/geoFirePages');
    const geoFire = new GeoFire(geoFireEventsRef);
    geoFire.set(page.id, [page.location.latitude, page.location.longitude]);
  }
});
