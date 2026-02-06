import { type HttpClient, httpClient } from "@/service";

export interface SysRole {
	roleId: number;
	roleName: string;
	remark?: string;
	createTime?: string;
}

const SYS_ROLE_BASE_PATH = "/sys/role";

export function createSysRoleApi(client: HttpClient = httpClient) {
	return {
		// 获取全部角色列表（用于下拉选择）
		listAll(): Promise<SysRole[]> {
			return client.get<SysRole[], SysRole[]>(`${SYS_ROLE_BASE_PATH}/list`);
		},
	};
}

export const sysRoleApi = createSysRoleApi();
