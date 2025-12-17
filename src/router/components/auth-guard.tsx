import useUserStoreHydrated from "@/hooks/useUserStoreHydrated";
import useRouteStore from "@/store/routerStore";
import useUserStore from "@/store/userStore";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

type Props = {
	children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
	const { value: accessToken, isHydrated } = useUserStoreHydrated(
		(state) => state.userToken.accessToken,
	);
	const { actions } = useUserStore();

	const routeStore = useRouteStore();

	useEffect(() => {
		if (!isHydrated) return;
		if (!Cookies.get("Authorization") && accessToken) {
			actions.clearUserToken();
			actions.clearUserInfo();
			routeStore.actions.reset();
		}
	}, [isHydrated, accessToken, actions, routeStore]);

	if (!isHydrated) {
		return null; // 或者返回一个 loading spinner
	}

	if (!accessToken) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}
