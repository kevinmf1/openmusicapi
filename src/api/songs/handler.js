const ClientError = require("../../exceptions/ClientError");
const autoBind = require("auto-bind");

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods to the instance
        autoBind(this);
    }

    async _handleError(error, h) {
        if (error instanceof ClientError) {
            const response = h.response({
                status: "fail",
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        // Server ERROR!
        const response = h.response({
            status: "error",
            message: "Terjadi kesalahan pada server kami.",
        });
        response.code(500);
        console.error(error);
        return response;
    }

    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const {
                title = "untitled",
                year,
                performer,
                genre,
                duration,
                albumId
            } = request.payload;

            const songId = await this._service.addSong({
                title,
                year,
                performer,
                genre,
                duration,
                albumId
            });

            const response = h.response({
                status: "success",
                message: "Lagu berhasil ditambahkan",
                data: {
                    songId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getSongsHandler(_request, h) {
        try {
            const songs = await this._service.getSongs();
            const songsProps = songs.map((song) => ({
                id: song.id,
                title: song.title,
                performer: song.performer,
            }));
            return {
                status: "success",
                data: {
                    songs: songsProps,
                },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getSongById(id);
            return {
                status: "success",
                data: {
                    song,
                },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async putSongByIdHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;

            await this._service.editSongById(id, request.payload);

            return {
                status: "success",
                message: "Lagu berhasil diperbarui",
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteSongById(id);
            return {
                status: "success",
                message: "Lagu berhasil dihapus",
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }
}

module.exports = SongsHandler;
