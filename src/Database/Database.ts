import { DataTypes, InferAttributes, InferCreationAttributes, Model, ModelStatic, Sequelize } from "sequelize";

export class DatabaseManager {
    private _instance: DatabaseManager;
    private sequelize: Sequelize;
    public users: ModelStatic<User>;
    public mods: ModelStatic<Mod>;
    public modVersions: ModelStatic<ModVersion>;

    constructor() {
        this.sequelize = new Sequelize({
            dialect: `sqlite`,
            storage: `./storage/database.sqlite`,
            timezone: `America/Chicago`
        });
        this.initializeTables();
        console.log(`DatabaseManager initialized.`);
    }

    public get instance(): DatabaseManager {
        if (!this._instance) {
            this._instance = new DatabaseManager();
        }
        return this._instance;
    }

    public async initializeTables() {
        this.users = User.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            beatLeaderID: {
                type: DataTypes.STRING,
                allowNull: false
            },
            discordID: {
                type: DataTypes.STRING,
                allowNull: false
            },
            permissions: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: UserPermission.USER,
                get() {
                    // @ts-expect-error
                    return this.getDataValue(`permissions`).split(`,`);
                },
                set(value: string[]) {
                    // @ts-expect-error
                    this.setDataValue(`permissions`, value.join(`,`));
                }
            }
        }, {
            sequelize: this.sequelize,
            modelName: `users`,
        });

        this.mods = Mod.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            author: {
                type: DataTypes.STRING,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            gitUrl: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize: this.sequelize,
            modelName: `mods`
        });

        this.modVersions = ModVersion.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            modID: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            authorServiceId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            authorIdType:{
                type: DataTypes.STRING,
                allowNull: false
            },
            version: {
                type: DataTypes.STRING,
                allowNull: false
            },
            supportedVersions: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    // @ts-expect-error
                    return this.getDataValue(`supportedVersions`).split(`,`);
                },
                set(value: string[]) {
                    // @ts-expect-error
                    this.setDataValue(`supportedVersions`, value.join(`,`));
                }
            },
            zipHash: {
                type: DataTypes.STRING,
                allowNull: false
            },
            beatModsHash: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    // @ts-expect-error
                    return JSON.parse(this.getDataValue(`beatModsHash`));
                },
                set(value: IBeatModsData) {
                    // @ts-expect-error
                    this.setDataValue(`beatModsHash`, JSON.stringify(value));
                }
            },
            originalFileName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            dependencies: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    // @ts-expect-error
                    return this.getDataValue(`dependencies`).split(`,`);
                },
                set(value: string[]) {
                    // @ts-expect-error
                    this.setDataValue(`dependencies`, value.join(`,`));
                }
            },
            downloadUrl: {
                type: DataTypes.STRING,
                allowNull: false
            },
            beatmodsData: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    // @ts-expect-error
                    return JSON.parse(this.getDataValue(`beatmodsData`));
                },
                set(value: IBeatModsData) {
                    // @ts-expect-error
                    this.setDataValue(`beatmodsData`, JSON.stringify(value));
                }
            }
        }, {
            sequelize: this.sequelize,
            modelName: `modVersions`
        });
    }
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    public id: number;
    public username: string;
    public beatLeaderID: string;
    public discordID: string;
    public permissions: string[];

    public static async getUserById(id: string): Promise<User> {
        return User.findOne({ where: { id } });
    }

    public async isPermitted(permission: UserPermission): Promise<boolean> {
        return this.permissions.includes(permission);
    }
}

export enum UserPermission {
    OPERATOR = `operator`,
    ADMIN = `admin`,
    MODERATOR = `moderator`,
    USER = `user`
}

export class Mod extends Model<InferAttributes<Mod>, InferCreationAttributes<Mod>> {
    public id: number;
    public author: string;
    public title: string;
    public description: string;
    public gitUrl: string;
}

export class ModVersion extends Model<InferAttributes<ModVersion>, InferCreationAttributes<ModVersion>> {
    public id: number;
    public modID: number;
    public authorServiceId: number;
    public authorIdType: AuthorIdType;
    public version: string;
    public supportedVersions: string[];
    public zipHash: string;
    public beatModsHash: IBeatModsHash[];
    public originalFileName: string;
    public dependencies: string[]; // "BSIPA@^4.3.4,SongCore@^2.0.0" (basically semver seperated by commas)
    public downloadUrl: string;
    public beatmodsData: IBeatModsData;
}

export interface IBeatModsData {
    category: string;
    approvalStatus: BeatModsApprovalStatus|string;
}

export interface IBeatModsHash {
    hash: string;
    file: string;
}

export enum BeatModsApprovalStatus {
    PENDING = `pending`,
    OUTDATED = `outdated`,
    APPROVED = `approved`,
    REJECTED = `rejected`
}

export enum AuthorIdType {
    Discord = `discord`,
    BeatMods = `beatmods`,
    Manifest = `manifest`,
    Unknown = `unknown`
}