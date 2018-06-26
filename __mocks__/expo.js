jest.mock('expo', () => {
  const expo = require.requireActual('expo');

  const positionMock = {
    latitude: 1,
    longitude: 1,
  };
  // Mock the expo library
  return {
    Location: {
      setApiKey: jest.fn(),
      getCurrentPositionAsync:
        options =>
          new Promise(
            resolve => resolve(options ? {
              coords: positionMock,
            } : null)
            , null,
          )
      ,
    },
    Constants: {
      manifest: {
        extra: { google: { maps: 'Your-API-KEY-HERE' } },
      },
    },
    Permissions: {
      LOCATION: 'location',
      askAsync: type => new Promise(resolve =>
        resolve(type === 'location' ?
          { status: 'granted' }
          : null)),
    },
    DangerZone: {
      Lottie: () => {},
    },
    AppLoading: () => {},
    Font: {
      loadAsync: () => new Promise(resolve => resolve(true)),
    },
    ...expo,
  };
});
