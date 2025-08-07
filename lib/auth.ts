import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

export async function auth() {
  return await getServerSession(authOptions)
}
