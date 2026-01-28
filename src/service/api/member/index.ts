import { type HttpClient, httpClient } from "@/service";

export interface Member {
	userId: string;
	nickName: string;
	realName?: string;
	userMail?: string;
	userMobile?: string;
	sex?: string; // M:男 F:女
	birthDate?: string;
	pic?: string;
	status: number; // 1:正常 0:无效
	score?: number;
	userRegtime?: string;
	userRegip?: string;
	userLasttime?: string;
	userLastip?: string;
	userMemo?: string;
	modifyTime?: string;
}

export interface FetchMemberPageRequest {
	current: number;
	size: number;
	nickName?: string;
	status?: number;
}

export interface FetchMemberPageResponse {
	current: number;
	pages: number;
	records: Member[];
	size: number;
	total: number;
}

const MEMBER_BASE_PATH = "/admin/user";

export function createMemberApi(client: HttpClient = httpClient) {
	return {
		// 分页获取会员列表
		fetchPage(params: FetchMemberPageRequest): Promise<FetchMemberPageResponse> {
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
				? `${MEMBER_BASE_PATH}/page?${urlParams}`
				: `${MEMBER_BASE_PATH}/page`;
			return client.get<FetchMemberPageResponse, FetchMemberPageResponse>(url);
		},
		// 获取会员详情
		getById(userId: string): Promise<Member> {
			return client.get<Member, Member>(`${MEMBER_BASE_PATH}/info/${userId}`);
		},
		// 更新会员
		update(data: Partial<Member>): Promise<void> {
			return client.put(MEMBER_BASE_PATH, data);
		},
		// 删除会员（批量）
		delete(userIds: string[]): Promise<void> {
			return client.delete(MEMBER_BASE_PATH, { data: userIds });
		},
	};
}

export const memberApi = createMemberApi();

// 性别映射
export const SEX_MAP: Record<string, string> = {
	M: "男",
	F: "女",
};
