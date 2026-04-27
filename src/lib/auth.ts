// for server callings, /hooks is for client calling
import { auth } from "@/auth";

export const currentUser = async () => {
const session = await auth();
return session?.user
}
export const currentRole = async () => {
    const session = await auth();
    return session?.user?.role;
    }