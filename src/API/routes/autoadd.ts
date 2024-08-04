import { Express } from 'express';
import { matchedData, param, validationResult } from 'express-validator';
import { User, UserPermission } from 'src/Database/Database';

export class AutoAdd {
    private app: Express;

    constructor(app: any) {
        this.app = app;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.get(`/api/manual/beatmods/:id`, param('id').isInt(), async (req: any, res: any) => {
            const vResult = validationResult(req);
            if (!vResult.isEmpty()) {
                return res.status(400).send(vResult.array());
            }
            const data = matchedData(req);
            let id = data['id'] as string;
            let sessionId = req.session.id;
            let user = await User.getUserById(sessionId);

            if (!user && !user.isPermitted(UserPermission.OPERATOR)) {
                return res.status(401).send({ message: `Unauthorized` });
            }

            // Do stuff - need to finish BeatMods.ts

        });
    }
}