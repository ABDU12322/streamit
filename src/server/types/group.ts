export interface Group {
    groupID: string;
    name: string;
    description: string;
    thumbnail: string;
    createdBy: string;
    createdDate: Date;
    videoCount: number;
}

export type group = Group;
