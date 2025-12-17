import { Layout, theme } from "antd";
import { lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router-dom";

const PageError = lazy(() => import("@/pages/error/404"));

export default function Content() {
	const { token } = theme.useToken();
	const location = useLocation();

	return (
		<Layout.Content className="p-2" style={{ background: token.colorBgLayout }}>
			<div className="h-full w-full overflow-x-hidden overflow-y-auto rounded-sm bg-[color:var(--ant-color-bg-container)]">
				<ErrorBoundary FallbackComponent={PageError} resetKeys={[location.pathname]}>
					<Outlet />
				</ErrorBoundary>
			</div>
		</Layout.Content>
	);
}
