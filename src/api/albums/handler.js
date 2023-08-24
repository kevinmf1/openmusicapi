const ClientError = require("../../exceptions/ClientError");
const autoBind = require("auto-bind");

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

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

    async postAlbumHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const {
                name,
                year
            } = request.payload;

            const albumId = await this._service.addAlbum({
                name,
                year
            });

            const response = h.response({
                status: "success",
                message: "album berhasil ditambahkan",
                data: {
                    albumId,
                },
            });

            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const getAlbum = await this._service.getAlbumById(id);
  
            const response = h.response({
                status: "success",
                data: {
                    album: getAlbum,
                },
            });

            return response;
        } catch(error) {
            return this._handleError(error, h);
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;

            await this._service.editAlbumById(id, request.payload);

            return {
                status: "success",
                message: "Album berhasil diperbarui",
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;

            await this._service.deleteAlbumById(id);

            return {
                status: "success",
                message: "Album berhasil dihapus",
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }
}

module.exports = AlbumsHandler;