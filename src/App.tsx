import Router from "@/router";
import { buildRoutesFromMenu } from "@/router/utils/buildDynamicRoutes";
import AntdConfig from "@/theme/antd";
import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import useRouteStore from "./store/routerStore";
// codex resume 019af7e2-f454-7781-a048-921d40e43712
// codex resume 019b084f-96c8-7ab0-92a9-b64d88d1baca backend
function App() {
	const menuList = useRouteStore((state) => state.menuList);
	const routes = useMemo(() => buildRoutesFromMenu(menuList), [menuList]);
	return (
		<>
			<AntdConfig>
				<ErrorBoundary fallback={<div>Something went wrong</div>}>
					<Suspense fallback={<div>Loading...</div>}>
						<Router dynamicRoutes={routes} />
					</Suspense>
				</ErrorBoundary>
			</AntdConfig>
		</>
	);
}

export default App;
