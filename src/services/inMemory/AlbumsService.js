const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
    constructor() {
        this._albums = [];
    }

    addAlbum({
        name, year
    }) {
        const id = nanoid(16);

        const newAlbums = {
            id,
            name,
            year
        };

        this._albums.push(newAlbums);

        const isSuccess = this._albums.filter((album) => album.id === id).length > 0;

        if (!isSuccess) {
            throw new InvariantError("Lagu gagal ditambahkan");
        }

        return id;
    }

    getAlbumById(id) {
        const album = this._albums.filter((n) => n.id === id)[0];
        if (!album) {
            throw new NotFoundError("Lagu tidak ditemukan");
        }
        return album;
    }

    editAlbumById(id, {
        name, year
    }) {
        const index = this._albums.findIndex((album) => album.id === id);

        if (index === -1) {
            throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
        }

        this._albums[index] = {
            ...this._albums[index],
            name,
            year
        };
    }

    deleteAlbumById(id) {
        const index = this._albums.findIndex((album) => album.id === id);
        if (index === -1) {
            throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
        }
        this._songs.splice(index, 1);
    }
}

module.exports = SongsService;
