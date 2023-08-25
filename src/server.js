// Import dependencies
const Hapi = require("@hapi/hapi");
const dotenv = require("dotenv");
const Jwt = require("@hapi/jwt");

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

// users
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersValidator = require("./validator/users");

// authentications
const authentications = require("./api/authentication");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

// collaborations
const collaborations = require("./api/collaborations");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

// playlists
const playlists = require("./api/playlist");
const PlaylistsService = require("./services/postgres/PlaylistsService");
const PlaylistsValidator = require("./validator/playlists");

// playlistsongs
const playlistsongs = require("./api/playlistsong");
const PlaylistsongsService = require("./services/postgres/PlaylistsongsService");
const PlaylistsongsValidator = require("./validator/playlistsSongs");

// Create a function to initialize the server
const init = async () => {
  // Create an instance of SongsService
  const songsService = new SongsService();

  // Create an instance of AlbumsService
  const albumsService = new AlbumsService();
  
  // Create an instance of CollaborationsService
  const collaborationsService = new CollaborationsService();

  // Create an instance of AuthenticationsService
  const authenticationsService = new AuthenticationsService();

  // Create an instance of UsersService
  const usersService = new UsersService();

  // Create an instance of PlaylistsService
  const playlistsService = new PlaylistsService(collaborationsService);

  // Create an instance of playlistsSongService
  const playlistsongsService = new PlaylistsongsService();

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

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy otentikasi jwt
  server.auth.strategy("playlistsapp_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: collaborations,
        options: {
          collaborationsService,
          playlistsService,
          usersService,
          validator: CollaborationsValidator,
        },
      },
      {
        plugin: playlists,
        options: {
          playlistsService,
          usersService,
          validator: PlaylistsValidator,
        },
      },
      {
        plugin: playlistsongs,
        options: {
          playlistsongsService,
          playlistsService,
          songsService,
          validator: PlaylistsongsValidator,
        },
      },
    ]);

  // Start the server
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

// Call the init function to start the server
init();