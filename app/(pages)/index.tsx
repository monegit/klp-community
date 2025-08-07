import { useAuth } from "@/contexts/AuthContext";
import HomeScreen from "./home";
import LoginScreen from "./login";

export default function PageIndex() {
  const auth = useAuth();

  return <>{auth.user?.getIdToken() ? <HomeScreen /> : <LoginScreen />}</>;
}
