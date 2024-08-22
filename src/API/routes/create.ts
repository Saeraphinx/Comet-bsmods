import { UploadedFile } from 'express-fileupload';
import { Express } from 'express';
import path from 'node:path';
import { body, matchedData, param, validationResult } from 'express-validator';
import { AuthorIdType, DatabaseManager, User } from 'src/Database/Database';
import { ModTools } from 'src/ModTools';

export class CreatModRoutes {
    private app: Express;

    constructor(app: Express) {
        this.app = app;
    }

    private async loadRoutes() {
        this.app.post('/api/mod/:id/upload', param('id').isInt(), body('version').isString(), body('supportedVersions').isArray({min: 1}), body('dependancies').isArray(), body('pluginorlibrary').optional().isBoolean(), async (req, res) => {
            const vResult = validationResult(req);
            if (!vResult.isEmpty()) {
                return res.status(400).send(vResult.array());
            }
            const data = matchedData(req);
            let id = data['id'] as string;
            let version = data['version'] as string;
            let supportedVersions = data['supportedVersions'] as string[];
            let dependancies = data['dependancies'] as string[];
            let pluginOrLibrary = data['pluginorlibrary'] as boolean; //double check this is validated correctly. cant remember wether or not the optional goes before or after the isBoolean
            let sessionId = req.session.id;
            let user = await User.getUserById(sessionId);

            supportedVersions.forEach((version) => {
                if (typeof version !== `string` || !version.match(/\d+\.\d+\.\d+/)) {
                    return res.status(400).send({ error: `Invalid version format.` });
                }
            });

            let file = req.files.file as UploadedFile;

            if (!file) {
                return res.status(400).send({ error: `No file uploaded.` });
            }

            if (file.size > 50 * 1024 * 1024) {
                return res.status(413).send({ error: `File too large.` });
            }

            let mod = await DatabaseManager.instance.mods.findByPk(id);
            if (!mod) {
                return res.status(404).send({ error: `Mod not found.` });
            }

            let isZip = file.mimetype !== `application/zip`
            if (!isZip) {
                // dependancies = ModTools.getDependencies(file);
            } else {
                dependancies.forEach((dependancy) => {
                    if (typeof dependancy !== `string` || !dependancy.match(/.+@.+/)) { // TODO: update regex
                        return res.status(400).send({ error: `Invalid version format.` });
                    }
                });
            }

            let modVersion = await DatabaseManager.instance.modVersions.create({
                modID: mod.id,
                authorIdType: AuthorIdType.Comet,
                authorServiceId: user.id,
                version: version,
                supportedVersions: supportedVersions,
                // probably change this
                beatModsHash: ModTools.CreateBeatModsHashData(file.tempFilePath),
                zipHash: file.md5,
                originalFileName: file.name,
                dependencies: dependancies,
                downloadUrl: null,
                beatmodsData: null
            });

            file.mv(`${path.resolve(storagePaths.uploadDir)}/${file.md5}${path.extname(file.name)}`);
        });
    }
}