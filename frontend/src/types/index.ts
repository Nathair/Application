export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    date: string;
    location: string;
    capacity?: number;
    visibility: 'PUBLIC' | 'PRIVATE';
    organizerId: number;
    organizer: {
        id: number;
        name: string;
    };
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
