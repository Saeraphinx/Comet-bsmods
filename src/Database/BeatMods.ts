import { IBeatModsHash, Mod, ModVersion } from "./Database";

export class BeatMods {
    public static async getModById(id: string) {
        let tokenRequest = await fetch(`https://beatmods.com/api/v1/mod/${id}`,
            {
                method: `GET`,
                body: null,
                headers:
                {
                    'Content-Type': `application/json`,
                }
            });

        const json: any = await tokenRequest.json();
        if (!json.access_token) {
            return null;
        } else {
            let jsonArr = json as IBeatModsData[];
            return jsonArr.find((mod) => mod._id === id);
        }
    }

    public static async createModInDB(id: string) {
        let modData = await this.getModById(id);
        if (!modData) {
            return null;
        }
        
        let bestDownload = modData.downloads.find((download) => download.type === `universal`);
        let url = `https://beatmods.com${bestDownload.url}`;
        let fileName = bestDownload.url.split(`/`).pop();
        let hashes:IBeatModsHash[] = [];
        for (let hash of bestDownload.hashMd5) {
            hashes.push({
                file: hash.file,
                hash: hash.hash
            });
        }

        let mod = await Mod.findOne({ where: { title: modData.name } });
        if (!mod) {
            mod = await Mod.create({
                title: modData.name,
                author: modData.author.username,
                description: modData.description,
                gitUrl: modData.link,
            });
        }

        // need to figure out how to download the zip so that I know the hash
        let modVersion = await ModVersion.create({
            modID: mod.id,
            version: modData.version,
            supportedVersions: [modData.gameVersion],
            fileHash: null,
            originalFileName: fileName,
            dependencies: null,
            downloadUrl: url,
            beatmodsData: {
                category: modData.category,
                approvalStatus: modData.status
            },
            beatModsHash: hashes
        });
        return mod;
    }
}



export interface IBeatModsData {
    name: string;
    version: string;
    gameVersion: string;
    authorId: string;
    uploadDate: string;
    updatedDate: string;
    author: {
        _id: string;
        username: string;
        lastLogin: string;
    };
    status: `approved` | `pending` | `declined` | `inactive`;
    description: string;
    link: string;
    category: string;
    downloads: {
        type: string;
        url: string;
        hashMd5: {
            hash: string;
            file: string;
        }[];
    }[];
    required: boolean;
    dependencies: IBeatModsData[]|string[];
    _id: string;
}