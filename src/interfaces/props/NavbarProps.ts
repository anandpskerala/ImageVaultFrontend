import type { UserDTO } from "@/interfaces/entities/IUser";

export interface NavbarProps {
    user?: UserDTO | null;
    className?: string;
    page?: string;
}

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
}