import { Express } from "express";
import { DatabaseManager } from "src/Database/Database";

export class GetModsRoutes {
    private app: Express;

    constructor(app: any) {
        this.app = app;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.get(`/api/mods`, async (req: any, res: any) => {
            let mods = await DatabaseManager.instance.mods.findAll(); // fuck it wii ball (for now)
            return res.status(200).send(mods);
        });
    }
}