import { Express } from "express";
import { matchedData, param, validationResult } from "express-validator";
import { DatabaseManager, User } from "src/Database/Database";

export class GetModsRoutes {
    private app: Express;

    constructor(app: any) {
        this.app = app;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.get(`/api/mods`, async (req, res) => {
            let mods = await DatabaseManager.instance.mods.findAll(); // fuck it wii ball (for now)
            return res.status(200).send(mods);
        });

        this.app.get('/api/mod/:id', param('id').isInt({min: 1}), async (req, res) => {
            const vResult = validationResult(req);
            if (!vResult.isEmpty()) {
                return res.status(400).send(vResult.array());
            }
            const data = matchedData(req);
            let id = data['id'] as string;

            let sessionId = req.session.id;
            let user = await User.getUserById(sessionId);

            let mod = await DatabaseManager.instance.mods.findByPk(id);

            if (!mod) {
                return res.status(404).send(`Mod not found.`)
            }

            let modVersions = await DatabaseManager.instance.modVersions.findAll({where: { modID: id }})

            return res.send({
                name: mod.title,
                description: mod.description,
                versions: modVersions //todo: parse dependancies of mod versions
            })
        })
    }
}