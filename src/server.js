// Import dependencies
const Hapi = require("@hapi/hapi");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/albumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songsService');
const SongsValidator = require('./validator/songs');


// Create a function to initialize the server
const init = async () => {
  // Create an instance of SongsService
  const songsService = new SongsService();

  // Create an instance of AlbumsService
  const albumsService = new AlbumsService();

  // Create a Hapi server instance
  const server = Hapi.server({
      port: process.env.PORT,
      host: process.env.HOST,
      routes: {
          cors: {
              origin: ["*"],
          },
      },
  });

  await server.register([
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        }
      }
    ]);

  // Start the server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

// Call the init function to start the server
init();