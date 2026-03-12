export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    date: string;
    endDate?: string | null;
    location: string;
    capacity?: number;
    visibility: 'PUBLIC' | 'PRIVATE';
    organizerId: number;
    organizer: {
        id: number;
        name: string;
    };
    tags: Tag[];
    _count?: {
        participants: number;
    };
    participants?: Participant[];
    createdAt: string;
}

export interface Participant {
    user: {
        id: number;
        name: string;
    };
}
