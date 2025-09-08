import { signInWithEmailAndPassword, signOut } from "firebase/auth"

export const useAdminAuth = () => {
  const { $auth } = useNuxtApp()
  const user = useState<import("firebase/auth").User | null>("adminUser", () => null)

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword($auth, email, password)
      user.value = res.user;
      return { success: true, user: res.user }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const logout = async () => {
    await signOut($auth)
    user.value = null
  }

  return { user, login, logout }
}
