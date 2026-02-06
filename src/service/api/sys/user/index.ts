import { type HttpClient, httpClient } from "@/service";

export interface SysUser {
	userId?: number;
	username: string;
	password?: string;
	email?: string;
	mobile?: string;
	status?: number; // 0:禁用 1:正常
	createTime?: string;
	roleIdList?: number[];
}

export interface FetchSysUserPageRequest {
	current: number;
	size: number;
	username?: string;
}

export interface FetchSysUserPageResponse {
	current: number;
	pages: number;
	records: SysUser[];
	size: number;
	total: number;
}

const SYS_USER_BASE_PATH = "/sys/user";

export function createSysUserApi(client: HttpClient = httpClient) {
	return {
		// 分页获取管理员列表
		fetchPage(
			params: FetchSysUserPageRequest,
		): Promise<FetchSysUserPageResponse> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams
				? `${SYS_USER_BASE_PATH}/page?${urlParams}`
				: `${SYS_USER_BASE_PATH}/page`;
			return client.get<FetchSysUserPageResponse, FetchSysUserPageResponse>(
				url,
			);
		},
		// 获取管理员详情
		getById(userId: number): Promise<SysUser> {
			return client.get<SysUser, SysUser>(
				`${SYS_USER_BASE_PATH}/info/${userId}`,
			);
		},
		// 新增管理员
		add(data: SysUser): Promise<void> {
			return client.post(SYS_USER_BASE_PATH, data);
		},
		// 更新管理员
		update(data: SysUser): Promise<void> {
			return client.put(SYS_USER_BASE_PATH, data);
		},
		// 删除管理员（批量）
		delete(userIds: number[]): Promise<void> {
			return client.delete(SYS_USER_BASE_PATH, { data: userIds });
		},
	};
}

export const sysUserApi = createSysUserApi();
