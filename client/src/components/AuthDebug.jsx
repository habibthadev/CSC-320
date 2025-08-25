import { useAuth } from "../hooks/useAuth";
import useAuthStore from "../stores/authStore";

const AuthDebug = () => {
  const { user, token, isAuthenticated } = useAuth();
  const storeState = useAuthStore.getState();

  return (
    <div className="fixed top-0 left-0 bg-gray-800 text-white p-4 text-xs z-50 max-w-sm">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>Hook isAuthenticated: {isAuthenticated ? "✅" : "❌"}</div>
      <div>Hook hasToken: {token ? "✅" : "❌"}</div>
      <div>Hook user: {user?.email || "None"}</div>
      <div>
        Store isAuthenticated: {storeState.isAuthenticated ? "✅" : "❌"}
      </div>
      <div>Store hasToken: {storeState.token ? "✅" : "❌"}</div>
      <div>Store user: {storeState.user?.email || "None"}</div>
      {token && <div>Token length: {token.length}</div>}
    </div>
  );
};

export default AuthDebug;
