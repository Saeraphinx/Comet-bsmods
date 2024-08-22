import { IBeatModsHash } from "./Database/Database";

export class ModTools {
    public static getDependencies(path: string): string[] {
        return [];
    }

    public static getModName(path: string): string {
        return ``;
    }

    public static getModVersion(path: string): string {
        return ``;
    }

    public static getSupportedVersions(path: string): string[] {
        return [];
    }

    public static CreateBeatModsHashData(path: string): IBeatModsHash[] {
        return [];
    }
}